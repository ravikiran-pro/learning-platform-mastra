import { createTool } from "@mastra/core";
import z from "zod";

export const queryConstructionTool = createTool({
    id: "tool_query_construction",
    description: "Clean and validate AI-generated search keywords.",
    inputSchema: z.object({
        keywords: z.array(z.string()).nonempty(),
        sectionTitle: z.string(),
        chapterTitle: z.string().nullable().optional(),
        moduleTitle: z.string().nullable().optional(),
        trackTitle: z.string().nullable().optional(),
    }).strict(),

    outputSchema: z.object({
        keywords: z.array(z.string()),
    }),
    execute: async ({ context }) => {
        const cleaned = context.keywords
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 3)
            .filter((v, i, arr) => arr.indexOf(v) === i); // remove duplicates

        return { keywords: cleaned };
    },
});
