import { createTool } from "@mastra/core";
import z from "zod";
import { fetcAllTrackDetails } from "../query/fetAllTrackDetails";

export const fetchTrackDetailsTool = createTool({
    id: "tool_query_construction",
    description: "Clean and validate AI-generated search keywords.",
    inputSchema: z.object({
       trackId: z.string(),
    }).strict(),
    outputSchema: z.object({
        trackData: z.object(),
    }),
    execute: async ({ context }) => {
        const result:any = await fetcAllTrackDetails({ trackId: context.trackId })

        return { trackData: result };
    },
});
