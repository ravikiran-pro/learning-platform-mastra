import { createTool } from "@mastra/core";
import { z } from "zod";
import { connectDB } from "../config/mongo";

export const storeExtractedDocumentTool = createTool({
  id: "store-extracted-document-tool",
  description: "Stores (or updates) extracted JSON content into extract_documents for a given document_id.",
  inputSchema: z.object({
    trackId: z.string(),
    sectionId: z.string(),
    contentDocumentId: z.string(),
    extractedJson: z.string(), // JSON stringified
    sourceDocumentIds: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    stored: z.boolean(),
    documentId: z.string().nullable(),
    updated: z.boolean(), // 🔥 NEW — tells if it was update instead of insert
  }),
  execute: async ({ context }) => {
    const { trackId, sectionId, contentDocumentId, extractedJson, sourceDocumentIds } = context;

    try {
      const db = await connectDB();
      const jsonContent = JSON.parse(extractedJson);

      // Check if document already exists
      const existing = await db.collection("extract_documents").findOne({
        document_id: contentDocumentId,
      });

      if (existing) {
        // 🔄 Update existing
        const updateResult = await db.collection("extract_documents").updateOne(
          { document_id: contentDocumentId },
          {
            $set: {
              track_id: trackId,
              section_id: sectionId,
              content: jsonContent,
              source_document_ids: sourceDocumentIds || [],
              updatedAt: new Date().toISOString(),
            },
          }
        );

        return {
          stored: updateResult.modifiedCount > 0,
          documentId: existing._id.toString(),
          updated: true,
        };
      } else {
        // 🆕 Insert new
        const insertResult = await db.collection("extract_documents").insertOne({
          track_id: trackId,
          section_id: sectionId,
          document_id: contentDocumentId,
          content: jsonContent,
          source_document_ids: sourceDocumentIds || [],
          createdAt: new Date().toISOString(),
        });

        return {
          stored: true,
          documentId: insertResult.insertedId.toString(),
          updated: false,
        };
      }
    } catch (error) {
      console.error("❌ Error storing extracted document:", error);
      return {
        stored: false,
        documentId: null,
        updated: false,
      };
    }
  },
});
