import { createTool } from "@mastra/core/tools";
import axios from "axios";
import * as cheerio from "cheerio";
import { z } from "zod";
import { mastra } from "..";

export const scrapeTool = createTool({
  id: "scrape-webpage",
  description: "Scrapes full webpage text and passes to extraction agent for topic relevance.",
  inputSchema: z.object({
    url: z.string().url(),
    topic: z.string(),
  }),
  outputSchema: z.object({
    url: z.string(),
    scraped: z.string(),
    final: z.any(), // AI structured output
  }),
  execute: async ({ context }) => {
    try {
      // SCRAPE CONTENT
      const response = await axios.get(context.url, { timeout: 8000 });
      const $ = cheerio.load(response.data);
      const mainContent = $("body").text().replace(/\s+/g, " ").trim();

      if (!mainContent || mainContent.length < 100) {
        return { url: context.url, scraped: "No usable content extracted" };
      }

      // GET AGENT
      const writer: any = mastra.getAgent("extractorAgent");

      // CALL USING PROPER MESSAGES + STRUCTURED OUTPUT
      const final: any = await writer.generate(
        [
          {
            role: "system",
            content: `You are an expert JavaScript technical content extractor.`,
          },
          {
            role: "user",
            content: `Topic: ${context.topic}`,
          },
          {
            role: "user",
            content: `Here is the raw scraped content from the webpage:\n\n${mainContent}`,
          },
        ],
        {
          structuredOutput: {
            schema: z.object({
              topic: z.string(),
              concept: z.string(),
              details: z.string().optional(),  // 👈 FIX HERE
              layered_explanation: z.object({
                core_concept: z.string(),
                runtime_behavior: z.string(),
                real_world_use_cases: z.string(),
                edge_cases: z.string(),
                optimization: z.string(),
              }).optional(),
              examples: z.array(
                z.object({
                  description: z.string(),
                  code: z.string(),
                })
              ).optional(),
              interview_questions: z.array(z.string()).optional(),
              references: z.array(
                z.object({
                  title: z.string(),
                  url: z.string().optional(),
                  quoted: z.string(),
                })
              ).optional(),
            }),
            jsonPromptInjection: true,
          },
          modelSettings: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          },
        }
      );

      return {
        url: context.url,
        scraped: mainContent,
        final: final.object, // structured JSON
      };
    } catch (error) {
      console.error("❌ scrapeTool Error:", error);
      return {
        url: context.url,
        scraped: "Scraping or extraction failed",
        final: null,
      };
    }
  },
});
