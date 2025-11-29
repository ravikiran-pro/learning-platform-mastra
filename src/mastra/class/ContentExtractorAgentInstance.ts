import { mastra } from "..";

class ContentExtractorAgentInstance {
  agent: any;

  constructor() {
    this.agent = mastra.getAgent("contentExtractorAgent"); // 👈 Correct agent ID
  }

  async execute({ sectionContext, resources }: any) {
    const systemMessage = `
You are ContentExtractionAgent.

Your task:
- Extract ONLY raw relevant content from validated resources using tools (getScrapedContentTool & optional webSearch if needed).
- Do NOT summarize, paraphrase, rephrase, or infer.
- Do NOT add any content that is not found in the scraped documents or retrieved via tool-driven web search.
- Strictly follow tool outputs.
- Use weighting: Section > Chapter > Module.
- No fluff, no assumptions, no additional explanations.

Output requirement:
- Provide a clean RAW content dump.
- Must only include content extracted from tools.
- Maintain structure based on Section > Chapter > Module.
- Include resource reference mapping.
- If a tool returns no content, explicitly state: "[NO EXTRACTABLE CONTENT FOUND]".
`.trim();

    const userMessage = `
📌 CONTEXT
Track: ${sectionContext.track.title}
Module: ${sectionContext.module.title}
Chapter: ${sectionContext.chapter.title}
Section: ${sectionContext.section.title}
Difficulty: ${sectionContext.section.difficulty}

🧩 RESOURCES TO PROCESS (validated = true)
${resources
  .map((r: any, i: number) => `
${i + 1}. Title: ${r.title}
   URL: ${r.url}
   Summary: ${r.summary}
   scrap_content_id: ${r.scrap_content_id}
`).join("")}

⚠ IMPORTANT
- Extraction must be derived strictly from scraped content via tools.
- Optional web search ONLY for complementing missing parts.
- No external context allowed beyond tools.
- Final result should be complete and faithfully extracted.

Begin extraction using tools now.
`.trim();

    console.log(systemMessage, userMessage);
    const response = await this.agent.generate([
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage }
    ]);

    console.log(response.text, 'extracted content');

    return response.text; // or JSON.parse(response.text) if structured output expected
  }
}

export default ContentExtractorAgentInstance;
