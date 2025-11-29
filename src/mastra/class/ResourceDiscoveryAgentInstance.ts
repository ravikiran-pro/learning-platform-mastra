import { mastra } from "..";

class ResourceDiscoveryAgentInstance {
  agent: any;

  constructor() {
    this.agent = mastra.getAgent("webSearchKeywordAgent");
  }

  async execute({ trackId, moduleId, chapterId, sectionId } : {trackId: string, moduleId: string, chapterId: string, sectionId: string}) {
    const response = await this.agent.generate([
      { role: "system", content: "Provide a summary and keywords for the following text:" },
      {
        role: "user",
        content: `
          trackId: ${trackId}
          moduleId: ${moduleId}
          chapterId: ${chapterId}
          sectionId: ${sectionId}
        `,
      },
    ]);

    const toolResults = response.toolResults ?? [];

    const sectionContext = this.getToolResult(toolResults, "sectionContextFetchTool");
    const queryConstructed = this.getToolResult(toolResults, "queryConstructionTool");

    return { sectionContext, queryConstructed };
  }

  private getToolResult(toolResults: any[], name: string) {
    return toolResults.find(
      (r: any) => r.payload.toolName === name
    )?.payload.result;
  }
}

export default ResourceDiscoveryAgentInstance
