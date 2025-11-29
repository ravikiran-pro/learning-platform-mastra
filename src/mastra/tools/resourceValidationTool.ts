import { createTool } from "@mastra/core";
import axios from "axios";
import * as cheerio from "cheerio";
import { z } from "zod";
import { connectDB } from "../config/mongo";

export const resourceValidationTool = createTool({
  id: "resource-validation-tool",
  description: "Scrapes and validates content from a URL. Returns validation status and a scrape_content_id.",
  inputSchema: z.object({
    trackId: z.string("id of the track"),
    sectionId: z.string("id of the section"),
    contentDocumentId: z.string("id of the content document"),
    title: z.string(),
    url: z.string().url(),
    summary: z.string(),
    relevance: z.enum(["high", "medium", "low"]),
  }),
  outputSchema: z.object({
    title: z.string(),
    url: z.string().url(),
    summary: z.string(),
    validate: z.boolean(),
    scrap_content_id: z.string().nullable(),
    exists: z.boolean(), // 🔥 NEW
  }),
  execute: async ({ context }) => {
    const { title, url, summary, trackId, sectionId, contentDocumentId } = context;

    try {
      const response = await axios.get(url, { timeout: 8000 });
      const $ = cheerio.load(response.data);
      const scrapped = $("body").text().replace(/\s+/g, " ").trim();

      // Basic validation
      const isLongEnough = scrapped && scrapped.length > 1000;
      let validate = !!trackId && !!sectionId && !!contentDocumentId && isLongEnough;

      console.log("🔍 Validation Check:", {
        title,
        url,
        validate,
        sectionId,
        contentDocumentId,
        trackId,
        contentLength: scrapped.length
      });

      const db = await connectDB();
      let scrap_content_id = null;
      let exists = false; // 👈 track if already in DB

      if (validate) {
        // Check if already stored
        const existingDoc = await db.collection("scraped_documents").findOne({
          url,
          section_id: sectionId,
        });

        if (existingDoc) {
          exists = true; // 👈 now explicitly returning this
          scrap_content_id = existingDoc._id.toString();
          console.log("♻️ Reusing existing scraped document:", scrap_content_id);
        } else {
          // Insert new document
          const insertResult = await db.collection("scraped_documents").insertOne({
            track_id: trackId,
            section_id: sectionId,
            document_id: contentDocumentId,
            title,
            url,
            scrapped,
            createdAt: new Date().toISOString(),
          });

          scrap_content_id = insertResult.insertedId.toString();
          console.log("📦 New Mongo insert ID →", scrap_content_id);
        }
      }

      return {
        title,
        url,
        summary,
        validate: !!scrap_content_id,
        scrap_content_id,
        exists, // 👈 return whether reused
      };

    } catch (error) {
      console.error(`❌ Scrape failed for ${url}`, error);
      return {
        title,
        url,
        summary,
        validate: false,
        scrap_content_id: null,
        exists: false,
      };
    }
  },
});
