import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";
import { mastra } from "..";
import ResourceDiscoveryAgentInstance from "../class/ResourceDiscoveryAgentInstance";
import WebSearchAgentInstance from "../class/WebSearchAgentInstance";
import ContentExtractorAgentInstance from "../class/ContentExtractorAgentInstance";


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

        console.log(inputData , 'inputData step3');

        return {syntheses : 'syntheses'}
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
        const {sectionContext, queryConstructed} = await resourceDiscoveryAgent.execute({
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
    .commit();
