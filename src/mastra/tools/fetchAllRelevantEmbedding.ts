import { createTool } from "@mastra/core";
import z from "zod";
import { connectDB } from "../config/mongo";
import { ObjectId } from "mongodb";

export const fetchAllRelevantEmbeddings = createTool({
    id: "get-relevant-embeddings-documents",
    description: "Get Scraped Content",
    inputSchema: z.object({
        trackId: z.string(),
        sectionId: z.string(),
        sectionTitle: z.string(),
        contentDocumentId: z.string()
    }).strict(),

    outputSchema: z.object({
        title: z.string(),
        url: z.string(),
        summary: z.string(),
        validate: z.boolean(),
        scrapped: z.string(),
    }),
    execute: async ({ context }) => {
        try {
            const {sectionId, contentDocumentId, sectionTitle, trackId} = context

            console.log(`Extracting Embedding for ${sectionId}:${sectionTitle} of document ${contentDocumentId} →`);

            if (contentDocumentId && sectionId && trackId) {
                const db = await connectDB();

                const documentName:string = `${trackId}-documents`

                const document = await db.collection(documentName).findOne({
                    document_id: contentDocumentId
                });

                if (!document) {
                    console.warn("⚠ scrap_content_id not found:", contentDocumentId);
                    return "No Embedding Found"
                }

                return document.embedding;
                
            }else{
                return "Invalid Input Schema"
            }

        } catch (error) {
            console.error("❌ Error fetching scraped content:", error);
            return "No Embedding Found"
        }
    },
});
