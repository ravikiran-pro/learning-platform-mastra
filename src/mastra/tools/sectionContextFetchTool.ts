import { createTool } from "@mastra/core";
import z from 'zod';
import { fetchSection } from "../query/fetchSection";

export const sectionContextFetchTool = createTool({
  id: 'tool_section_context_fetch',
  description: 'Fetch section metadata for contextual enrichment.',
  inputSchema: z.object({
    trackId: z.string().describe('Track ID Of the selected tutorial (Ex: js, python,  node, mysql , ruby , etc ..'),
    moduleId: z.string().describe('Module ID Of the module in the respective track'),
    chapterId: z.string().describe('Chapter ID Of the selected chapter in the respective module'),
    sectionId: z.string().describe('Section ID Of the selected section in the respective section'),
  }),
  outputSchema: z.object({
    track: z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      description: z.string().nullable().optional(),
    }),

    module: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable().optional(),
      order: z.number().nullable().optional(),
    }),

    chapter: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable().optional(),
      order: z.number().nullable().optional(),
    }),

    section: z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      description: z.string().nullable().optional(),
      order: z.number().nullable().optional(),
      difficulty: z.string().nullable().optional(),
      tags: z.array(z.string()).nullable().optional(),
      contentDocumentId: z.string(),
    }),
  }),
  execute: async ({ context }) => {
    let result = await fetchSection(context);
    if (!result) {
      throw new Error("Section metadata not found");
    }
    return result;
  },
});

// let context:{trackId: string, moduleId: string, chapterId: string, sectionId: string} = {
//     trackId: 'd4414b20-6c1a-43e9-9ee8-716d2b3d8de2',
//     moduleId: 'e1f91ec6-4d10-4af6-9c44-b91ac5a7de01',
//     chapterId: 'c101-intro-js',
//     sectionId: 's101-1',
// }

// let result = await sectionContextFetchTool.execute({context})

// console.log(result)