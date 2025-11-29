import { createTool } from "@mastra/core";
import z from "zod";
import { connectDB } from "../config/mongo";
import { ObjectId } from "mongodb";

export const getScrapedContentTool = createTool({
    id: "get-scrapped-content",
    description: "Get Scraped Content",
    inputSchema: z.object({
        title: z.string(),
        url: z.string().url(),
        summary: z.string(),
        validate: z.boolean(),
        scrap_content_id: z.string().nullable(),
    }).strict(),

    outputSchema: z.object({
        title: z.string(),
        url: z.string().url(),
        summary: z.string(),
        validate: z.boolean(),
        scrapped: z.string(),
    }),
    execute: async ({ context }) => {
        try {

            console.log("Extracting content from scrap_content_id →", context.scrap_content_id);
            if (context.scrap_content_id) {
                const db = await connectDB();

                const document = await db.collection("scraped_documents").findOne({
                    _id: new ObjectId(context.scrap_content_id)
                });

                if (!document) {
                    console.warn("⚠ scrap_content_id not found:", context.scrap_content_id);
                    return null;
                }

                return document.scrapped;
            }
            return ''
        } catch (error) {
            console.error("❌ Error fetching scraped content:", error);
            return '';
        }
    },
});
