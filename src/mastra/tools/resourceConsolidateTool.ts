import { createTool } from "@mastra/core";
import z from "zod";

export const resourceConsolidateTool = createTool({
    id: "result-consolidation-tool",
    description: "Validate search results with scrape validation data",
    inputSchema: z.object({
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

    execute: async ({ context }) => {
        return {resources : context.resources.filter((item:any) => item.validate === true)};
    },
});
