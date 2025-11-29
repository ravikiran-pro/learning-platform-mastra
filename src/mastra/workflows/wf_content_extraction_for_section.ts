import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";
import { mastra } from "..";
import ResourceDiscoveryAgentInstance from "../class/ResourceDiscoveryAgentInstance";
import WebSearchAgentInstance from "../class/WebSearchAgentInstance";
import ContentExtractorAgentInstance from "../class/ContentExtractorAgentInstance";
import ContentWriterAgentInstance from "../class/ContentWritterAgentInstance";
import { connectDB } from "../config/mongo";


const ResourceSearchValidator = createStep({
    id: "resource-search-validator",
    description: "Search authoritative JavaScript resources using AI search agent.",
    inputSchema: z.object({
        sectionContext: z.object(),
        queryConstructed: z.object(),
    }).strict(),
    outputSchema: z.object({
        sectionContext: z.object(),
        resources: z.array(
            z.object({
                title: z.string(),
                url: z.string().url(),
                summary: z.string(),
                validate: z.boolean(),
                scrap_content_id: z.string().nullable(),
            })
        )
    }),
    execute: async ({ inputData }) => {

        const { sectionContext, queryConstructed } = inputData;

        const webSearchAgent = new WebSearchAgentInstance();

        const consolidatedResult = await webSearchAgent.execute({
            sectionContext,
            queryConstructed,
        });

        return { sectionContext, resources: consolidatedResult.resources }
    }
});

const ContentExtractor = createStep({
    id: "content-extractor",
    description: "Extract content from scrapped and web searched resources.",
    inputSchema: z.object({
        sectionContext: z.object(),
        resources: z.array(
            z.object({
                title: z.string(),
                url: z.string().url(),
                summary: z.string(),
                validate: z.boolean(),
                scrap_content_id: z.string().nullable(),
            })
        )
    }).strict(),
    outputSchema: z.object({
        sectionContext: z.object(),
        resources: z.array(
            z.object({
                title: z.string(),
                url: z.string().url(),
                summary: z.string(),
                validate: z.boolean(),
                scrap_content_id: z.string().nullable(),
            })
        ),
        dump: z.string(),
    }),
    execute: async ({ inputData }) => {

        const { sectionContext, resources } = inputData;

        const extractorInstance = new ContentExtractorAgentInstance();

        const extractionDump = await extractorInstance.execute({
            sectionContext: sectionContext,
            resources: resources,
        });


        return { sectionContext, resources: extractionDump.resources, dump: extractionDump }
    }
});

const finalize = createStep({
    id: "finalize-content",
    description: "Write and review blog for our section.",
    inputSchema: z.object({
        sectionContext: z.object(),
        resources: z.array(
            z.object({
                title: z.string(),
                url: z.string().url(),
                summary: z.string(),
                validate: z.boolean(),
                scrap_content_id: z.string().nullable(),
            })
        ),
        dump: z.string()
    }).strict(),
    outputSchema: z.object({
        syntheses: z.string()
    }),
    execute: async ({ inputData }) => {

        const { sectionContext, dump } = inputData;

        const writerAgentTest: any = new ContentWriterAgentInstance()
        const reviewerAgentTest = mastra.getAgent("contentReviewerAgent");

        let approved = true, count = 0;
        let reviewFeedback: string | null = null, previousOutput = null;

        while (approved || count < 3) {
            console.log(`Review Iteration ${count++}`)

            const syntheses = await writerAgentTest.execute({
                sectionContext: sectionContext,
                extractedDump: dump,
                reviewFeedback

            })

            console.log(syntheses)
            const reviewResult = await reviewerAgentTest.generate(
                [
                    {
                        role: "system",
                        content: `Review and improve the following content: ${syntheses}`,
                    },
                    {
                        role: "assistant",
                        content: `Proceed Evaluating`,
                    },
                ]
            )

            let review = JSON.parse(reviewResult.text)

            console.log(review)
            if (!review.approved) {
                reviewFeedback = `
            🛑 Reviewer Issues:
            ${review.issues.join("\n")}
        
            🛑 Reviewer Feedback:
            ${review.recommendations}
        `.trim();

            } else {
                approved = review.approved
            }


            previousOutput = syntheses;

        }


        return previousOutput
    }
});

const synthesis = createStep({
    id: "synthesis-content",
    description: "Search authoritative JavaScript resources using AI search agent.",
    inputSchema: z.object({
        sectionContext: z.object(),
        resources: z.array(
            z.object({
                title: z.string(),
                url: z.string().url(),
                summary: z.string(),
                validate: z.boolean(),
                scrap_content_id: z.string().nullable(),
            })
        ),
        dump: z.string()
    }).strict(),
    outputSchema: z.object({
        syntheses: z.string()
    }),
    execute: async ({ inputData }) => {

        const { sectionContext, dump }: any = inputData;

        const writerAgentTest: any = new ContentWriterAgentInstance()
        const reviewerAgentTest = mastra.getAgent("contentReviewerAgent");

        let approved = false, count = 0;
        let reviewFeedback: string | null = null, previousOutput = null;

        const db = await connectDB();

        while (!approved && count < 3) {
            console.log(`Review Iteration ${count++}`)
            const timestamp = new Date().toISOString();

            const syntheses = await writerAgentTest.execute({
                sectionContext: sectionContext,
                extractedDump: dump,
                reviewFeedback

            })

            console.log(syntheses)
            const reviewResult = await reviewerAgentTest.generate(
                [
                    {
                        role: "system",
                        content: `Review and improve the following content: ${syntheses}`,
                    },
                    {
                        role: "assistant",
                        content: `Proceed Evaluating`,
                    },
                ]
            )

            let review = JSON.parse(reviewResult.text)

            await db.collection("reviewer_documents").insertOne({
                section_id: sectionContext.section.id,
                document_id: sectionContext.section.contentDocumentId,
                version: count + 1,
                content: syntheses,
                approved: review.approved,
                issues: review.approved ? null : review.issues,
                recommendations: review.recommendations || null,
                createdAt: timestamp,
            });



            console.log(review)
            if (!review.approved) {
                reviewFeedback = `
            🛑 Reviewer Issues:
            ${review.issues.join("\n")}
        
            🛑 Reviewer Feedback:
            ${review.recommendations}
        `.trim();

            } else {
                approved = review.approved
            }


            previousOutput = syntheses;

        }

        if (approved) {
            const timestamp = new Date().toISOString();
            const trackCollection = `${sectionContext.track.id}-documents`;

            await db.collection(trackCollection).insertOne({
                document_id: sectionContext.section.contentDocumentId,
                content: previousOutput,
                createdAt: timestamp,
            });

            console.log("🔥 Final content approved and stored:", trackCollection);
        } else {
            console.log("❌ Max iterations reached. Content not approved.");
        }


        return previousOutput
    }
});



export const keywordExtract = createStep({
    id: "search-keyword-extractor",
    description: "Extract keywords to web search section content.",
    inputSchema: z.object({
        trackId: z.string().describe('Track ID Of the selected tutorial (Ex: js, python,  node, mysql , ruby , etc ..'),
        moduleId: z.string().describe('Module ID Of the module in the respective track'),
        chapterId: z.string().describe('Chapter ID Of the selected chapter in the respective module'),
        sectionId: z.string().describe('Section ID Of the selected section in the respective section'),
    }),
    outputSchema: z.object({
        sectionContext: z.object(),
        queryConstructed: z.object(),
    }),
    execute: async ({ inputData }) => {
        const { trackId, moduleId, chapterId, sectionId } = inputData;

        const resourceDiscoveryAgent = new ResourceDiscoveryAgentInstance();
        const { sectionContext, queryConstructed } = await resourceDiscoveryAgent.execute({
            trackId,
            moduleId,
            chapterId,
            sectionId,
        });

        // Return URLs for next step (scrape step)
        return { sectionContext, queryConstructed }
    },
});

export const wf_content_extraction_for_section = createWorkflow({
    id: "wf_content_extraction_for_section",
    inputSchema: z.object({
        trackId: z.string().describe('Track ID Of the selected tutorial (Ex: js, python,  node, mysql , ruby , etc ..'),
        moduleId: z.string().describe('Module ID Of the module in the respective track'),
        chapterId: z.string().describe('Chapter ID Of the selected chapter in the respective module'),
        sectionId: z.string().describe('Section ID Of the selected section in the respective section'),
    }),
    outputSchema: z.object({
        sectionContext: z.object(),
        queryConstructed: z.object(),
        resources: z.array(
            z.object({
                title: z.string(),
                url: z.string().url(),
                summary: z.string(),
                validate: z.boolean(),
                scrap_content_id: z.string().nullable(),
            })
        ),
        dump: z.string(),
        synthesis: z.string(),
    }),
})
    .then(keywordExtract)
    .then(ResourceSearchValidator)
    .then(ContentExtractor)
    .then(synthesis)
    // .then(finalize)
    .commit();
