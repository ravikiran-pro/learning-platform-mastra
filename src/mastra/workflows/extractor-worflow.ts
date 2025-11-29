import axios from "axios";
import * as cheerio from "cheerio";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import z from 'zod'
import { mastra } from "..";
import sampleScrapJson from '../sampleScrap.json'

export const scrapResults = createStep({
    id: "scrap-search-results",
    inputSchema: z.object({
        references: z.array(
            z.object({
                title: z.string(),
                topic: z.string(),
                summary: z.string(),
                url: z.string(),
                relevance: z.string(),
            })
        ),
    }),
    outputSchema: z.object({}),
    execute: async ({ inputData, runCount }) => {
        try {
            // if(runCount > 0) return {} 
            const response = await axios.get(inputData?.url, { timeout: 8000 });
            const $ = cheerio.load(response.data);
            const mainContent = $("body").text().replace(/\s+/g, " ").trim();

            if (!mainContent || mainContent.length < 100) {
                return {
                    topic: inputData?.topic,
                    title: inputData?.title,
                    url: inputData?.url,
                    scraped: "No usable content extracted",
                    status: false,
                    error: "Insufficient content",
                };
            }

            console.log("📝 Web scraped successfully. Calling extractorAgent...");

            // GET AGENT
            const writer: any = mastra.getAgent("extractorAgent");

            // CALL EXTRACTION AGENT
            const scrapRes: any = await writer.generate(
                [
                    {
                        role: "system",
                        content: `You are an expert JavaScript technical content extractor. Help write content for ${inputData?.topic}`,
                    },
                    {
                        role: "user",
                        content: `Title: ${inputData?.title} \nSummary: ${inputData?.summary}`,
                    },
                    {
                        role: "user",
                        content: `Here is the raw scraped content from the webpage:\n\n${mainContent}`,
                    },
                ],
                {
                    structuredOutput: {
                        schema: z.object({
                            topic: z.string().optional(),
                            concept: z.string().optional(),
                            title: z.string().optional(),
                            details: z.string().optional(),
                            layered_explanation: z.object({
                                core_concept: z.string(),
                                runtime_behavior: z.string(),
                                real_world_use_cases: z.string(),
                                edge_cases: z.string(),
                                optimization: z.string(),
                            }).optional(),
                            examples: z
                                .array(
                                    z.object({
                                        description: z.string(),
                                        code: z.string(),
                                    })
                                )
                                .optional(),
                            interview_questions: z.array(z.string()).optional(),
                            references: z
                                .array(
                                    z.object({
                                        title: z.string().optional(),
                                        url: z.string().optional(),
                                        quoted: z.string(),
                                    })
                                )
                                .optional(),
                            status: z.boolean().default(true).optional(),
                        }),
                        jsonPromptInjection: true,
                    },
                    modelSettings: {
                        temperature: 0.2,
                        maxOutputTokens: 8192,
                    },
                }
            );

            console.log("🎯 Extractor completed successfully");
            return scrapRes.object;
        } catch (error: any) {
            console.error("❌ ERROR in scraping/extraction step:", error?.message || error);

            return {
                topic: inputData?.topic,
                title: inputData?.title,
                url: inputData?.url,
                scraped: null,
                status: false,
                error: error?.message || "Unknown error during scraping/extraction",
            };
        }
    },
});


export const writterStep = createStep({
    id: "write-step",
    description: "Step 1: Search authoritative JavaScript resources using AI search agent.",
    inputSchema: z.object({
        topic: z.string(),
        module: z.string(),
        chapter: z.string(),
        references: z.array(
            z.object({
                title: z.string(),
                topic: z.string(),
                summary: z.string(),
                url: z.string(),
                relevance: z.string(),
            })
        ),
    }),
    execute: async ({ inputData, getInitData }) => {
        debugger
        let {topic, module, chapter} = getInitData();
        
        let messages = [
          {
            role: "system",
            content: `Write Content for the ${topic} in markdown.`,
          },
          {
            role: "system",
            content: `All References and content adding from scrapped is Agent is given as input.`,
          },
          {
            role: "system",
            content: `
             The Topic belongs to module - ${module}
             The Topic belongs to chapter - ${chapter}
        
             Next Section - ${'Understanding Prototype Chain'}
        
             Make sure the generated content doesn't affect other chapter modules, system unless they are connected through internals
        
             Understand the module , chapter and organize the current session ${topic} effectively
        
            `
          }
        ]
        
        for(let i =0 ; i< inputData.length; i++){
          let data = inputData[i];
        
          let references = data.references[0];
        
        
          messages.push({
            role: "user",
            content: `
              references: ${JSON.stringify(references)}
              topic: ${data.topic}
              layered_explanation: ${JSON.stringify(data.layered_explanation)}
              examples: ${JSON.stringify(data.examples)}
              interview_questions: ${JSON.stringify(data.interview_questions)}
            `,
          });
        }
        
        
        const writer: any = mastra.getAgent("writerAgent");
        const stream: any = await writer.generate(messages);
        
    
        return stream.text
    },
});

export const searchStep = createStep({
    id: "search-step",
    description: "Step 1: Search authoritative JavaScript resources using AI search agent.",
    inputSchema: z.object({
        topic: z.string()
    }),
    outputSchema: z.array(
        z.object({
            title: z.string(),
            url: z.string().url(),
            relevance: z.string(),
        })
    ),
    execute: async ({ inputData, state, setState }) => {
        const { topic } = inputData;

        const searchAgent = mastra.getAgent("searchAgent");

        // Call with structured output
        const searchRes = await searchAgent.generate(
            [
                {
                    role: "system",
                    content: `You are an advanced JavaScript research assistant that searches authoritative resources only. Return clean JSON.`,
                },
                {
                    role: "user",
                    content: `Find the best resources (max 10) for the topic: "${topic}".`,
                }
            ],
            {
                structuredOutput: {
                    schema: z.object({
                        references: z.array(
                            z.object({
                                topic: z.string().describe("Orignal Topic").optional(),
                                summary: z.string().optional(),
                                title: z.string().optional(),
                                url: z.string().url().optional(),
                                relevance: z.string().optional(),
                            }).optional()
                        ).optional()
                    }).optional(),
                    jsonPromptInjection: true
                },
                modelSettings: {
                    temperature: 0.2,
                    maxOutputTokens: 4096
                }
            }
        );

        // Return URLs for next step (scrape step)
        return searchRes.object.references;
    },
});


export const extractorWorkflow = createWorkflow({
    id: "extractor-workflow",
    inputSchema: z.object({
        topic: z.string(),
        module: z.string(),
        chapter: z.string(),
    }),
    outputSchema: z.object({
        topic: z.string(),
        markdown: z.string(),
        references: z.array(
            z.object({
                url: z.string().url(),
                topic: z.string(),
            })
        )
    }),
})
    .then(searchStep)
    .foreach(scrapResults, { concurrency: 4 })

    .then(writterStep)
    .commit();