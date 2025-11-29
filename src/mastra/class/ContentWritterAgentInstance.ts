import { mastra } from "..";

class ContentWriterAgentInstance {
  agent: any;

  constructor() {
    this.agent = mastra.getAgent("contentWriterAgent"); // 👈 correct agent ID
  }

  async execute({
    sectionContext,
    extractedDump,
    previousWriterOutput = null, // latest draft if revision
    reviewFeedback = null        // if revision from reviewer
  }: {
    sectionContext: any;
    extractedDump: string;
    previousWriterOutput?: string | null;
    reviewFeedback?: string | null;
  }) {
    // 🧍 Common system prompt: stays same in all cycles
    const systemMessage = `
You are ContentSynthesisAgent.

Your role:
- Generate or update structured learning content for the section.
- Use ONLY:
  - Extracted raw dump
  - Section > Chapter > Module context
  - Previous version (only if feedback is provided)
  - Reviewer feedback (if available)

Rules:
- Strictly avoid adding new or external knowledge.
- Follow hierarchy relevance: Section > Chapter > Module.
- Maintain clean Markdown formatting (no extra styling at this step).
- Avoid duplication with prior sections (embedding handled externally).
- If extraction lacks clarity → write "[NEEDS REVIEW]".

🎓 LEARNING FLOW GUIDELINES (MANDATORY)

When writing the content:
1. Assume the learner understands previous sections but NOT this one yet.
2. Start by briefly connecting to previously learned concepts ONLY if they enhance understanding.
3. Use a “problem → solution → explanation” flow when relevant.
4. Highlight real developer motivations (e.g., “You’ll typically use this when…”).
5. Maintain momentum. Each section should feel like it builds towards something.
6. If the concept connects to a future section, hint subtly (without teaching future content).

Example Narrative Style:
"In earlier sections, you learned how JavaScript executes line by line. Building on that, variable scope defines _where_ those values are accessible."

DO NOT:
- Repeat full content from previous sections
- Introduce future topics prematurely
- Write generic or abstract statements

🎭 ENGAGEMENT TECHNIQUES
- Use occasional contextual cues like “In real-world applications…”
- Use comparisons (“Unlike global variables…”)
- Show purpose (“Scope helps prevent accidental data overwrites.”)

📌 Final output must still follow technical structure — only improve instructional quality within the allowed content.

🛑 Reviewer Feedback
When feedback is provided:
- Only update relevant sections.
- Do NOT change unrelated parts.
`.trim();

    // 🧠 First attempt (no feedback yet)
    const initialWriteMessage = `
📌 CONTEXT
Track: ${sectionContext.track.title}
Module: ${sectionContext.module.title}
Chapter: ${sectionContext.chapter.title}
Section: ${sectionContext.section.title}
Difficulty: ${sectionContext.section.difficulty}

📝 Extracted Content Dump:
${extractedDump}

Task:
- Create structured Markdown content.
- Do NOT add anything outside the dump.
- Keep it educational, clear, and technically correct.
`.trim();

    // 🔁 Revision mode (review feedback given)
    const revisionMessage = `
Here is the previous version of content:

${previousWriterOutput}

🛑 Reviewer Feedback:
${reviewFeedback}

Instructions:
- Update the content ONLY where necessary to address feedback.
- Do NOT regenerate the entire document.
- Preserve original structure unless feedback mandates change.
- Final output should be a complete updated version, ready for re-review.
`.trim();

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: reviewFeedback ? revisionMessage : initialWriteMessage }
    ];

    const response = await this.agent.generate(messages);
    return response.text;
  }
}

export default ContentWriterAgentInstance;
