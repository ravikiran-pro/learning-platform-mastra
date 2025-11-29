import { mastra } from "..";

class WebSearchAgentInstance {
    agent: any;

    constructor() {
        this.agent = mastra.getAgent("webSearchAgent"); // 👈 Use correct ID
    }

    async execute({ sectionContext, queryConstructed }: any) {

        let content = `
Context:

TrackId: ${sectionContext.track.id}
ModuleId: ${sectionContext.module.id}
ChapterId: ${sectionContext.chapter.id}
Sectionid: ${sectionContext.section.id}
contentDocumentId: ${sectionContext.section.contentDocumentId}
Track: ${sectionContext.track.title}
Module: ${sectionContext.module.title}
Chapter: ${sectionContext.chapter.title}
Section: ${sectionContext.section.title}

Keywords (use ALL):
${queryConstructed.keywords.join(", ")}

Proceed using the required workflow:
1. webSearch - call once
2. resourceValidationTool - validate each URL
3. resourceConsolidateTool - final output only

Return ONLY the result from resourceConsolidateTool.
`.trim();



        let messages = [
            {
                role: "system",
                content: `You are the WebSearch & Resource Validation Agent. Follow tool usage instructions exactly. Only call tools as instructed. Never return any response except tool output.`
            },
            {
                role: "user",
                content: JSON.stringify(content),

            }
        ];

        const response = await this.agent.generate(messages);

        return JSON.parse(response.text)
    }

    private getToolResult(toolResults: any[], toolName: string) {
        return toolResults.find(
            (r: any) => r.payload.toolName === toolName
        )?.payload.result;
    }
}

export default WebSearchAgentInstance;
