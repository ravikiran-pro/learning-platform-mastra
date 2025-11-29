
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/weather-scorer';
import { searchAgent } from './agents/searchAgent';
import { extractorAgent } from './agents/extractorAgents';
import { extractorWorkflow } from './workflows/extractor-worflow';
import { writerAgent } from './agents/writterAgents';
import sampleScrapJson from './sampleScrap.json';
import { webSearchKeywordAgent } from './agents/webSearchKeywordAgent';
import { wf_content_extraction_for_section } from './workflows/wf_content_extraction_for_section';
import { webSearchAgent } from './agents/webSearchAgent';
import { getScrapedContentTool } from './tools/gatherScrappedResources';
import { contentExtractorAgent } from './agents/contentExtractorAgent';
import ContentExtractorAgentInstance from './class/ContentExtractorAgentInstance';


export const mastra = new Mastra({
  workflows: { weatherWorkflow, extractorWorkflow, wf_content_extraction_for_section },
  agents: { weatherAgent, searchAgent, extractorAgent, writerAgent, webSearchKeywordAgent, webSearchAgent, contentExtractorAgent },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false,
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
});


// const run = await extractorWorkflow.createRunAsync();

// const result = await run.start({
//   inputData: {
//     topic: "Prototype Inheritance in JavaScript",
//     module: "Objects, Prototypes & OOP",
//     chapter: "Prototype & Delegation",
//   }
// });

// console.log(result);


// const writer: any = mastra.getAgent("writerAgent");

// // CALL USING PROPER MESSAGES + STRUCTURED OUTPUT
// const final: any = await writer.generate();

// let topic = "Prototypal inheritance"
// let module = "Objects, Prototypes & OOP"
// let chapter = "Prototype & Delegation"

// let messages = [
//   {
//     role: "system",
//     content: `Write Content for the ${topic} in markdown.`,
//   },
//   {
//     role: "system",
//     content: `All References and content adding from scrapped is Agent is given as input.`,
//   },
//   {
//     role: "system",
//     content: `
//      The Topic belongs to module - ${module}
//      The Topic belongs to chapter - ${chapter}

//      Next Section - ${'Understanding Prototype Chain'}

//      Make sure the generated content doesn't affect other chapter modules, system unless they are connected through internals

//      Understand the module , chapter and organize the current session ${topic} effectively

//     `
//   }
// ]

// for(let i =0 ; i< sampleScrapJson.length; i++){
//   let data = sampleScrapJson[i];

//   let references = data.references[0];


//   messages.push({
//     role: "user",
//     content: `
//       references: ${JSON.stringify(references)}
//       topic: ${data.topic}
//       layered_explanation: ${JSON.stringify(data.layered_explanation)}
//       examples: ${JSON.stringify(data.examples)}
//       interview_questions: ${JSON.stringify(data.interview_questions)}
//     `,
//   });
// }


// const writer: any = mastra.getAgent("writerAgent");
// const stream: any = await writer.stream(messages);


// for await (const chunk of stream.textStream) {
//   process.stdout.write(chunk);
// }


// const run = await wf_content_extraction_for_section.createRunAsync();

// const result = await run.start({
//   inputData: {
//     trackId: "d4414b20-6c1a-43e9-9ee8-716d2b3d8de2",
//     moduleId: "e1f91ec6-4d10-4af6-9c44-b91ac5a7de01",
//     chapterId: "c101-intro-js",
//     sectionId: "s101-1"
//   }
// });

// console.log(result), 'final-resul';


// let getScraped = await getScrapedContentTool.execute({
//   context: {
//       title: 'What is JavaScript?',
//       url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction',
//       summary: 'An introduction to JavaScript, covering its purpose, features, and how it works in web development.',
//       validate: true,
//       scrap_content_id: '6929f86cc1633b61b543317b'
//     }
// })

// console.log(getScraped)


// let data = {
//   sectionContext: {
//     track: {
//       id: 'd4414b20-6c1a-43e9-9ee8-716d2b3d8de2',
//       title: 'JavaScript Core Language',
//       slug: 'javascript-core-language',
//       description: null
//     },
//     module: {
//       id: 'e1f91ec6-4d10-4af6-9c44-b91ac5a7de01',
//       title: 'Introduction & Fundamentals',
//       description: 'History, execution model, syntax, strict mode',
//       order: 1
//     },
//     chapter: {
//       id: 'c101-intro-js',
//       title: 'Introduction to JavaScript',
//       description: null,
//       order: 1
//     },
//     section: {
//       id: 's101-1',
//       title: 'What is JavaScript?',
//       slug: 'what-is-javascript',
//       description: null,
//       order: 1,
//       difficulty: 'EASY',
//       tags: [],
//       contentDocumentId: 'doc-s101-1'
//     }
//   },
//   resources: [
//     {
//       title: 'What is JavaScript?',
//       url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction',
//       summary: 'An introduction to JavaScript, covering its purpose, features, and how it works in web development.',
//       validate: true,
//       scrap_content_id: '6929f86cc1633b61b543317b'
//     },
//     {
//       title: 'What is JavaScript?',
//       url: 'https://javascript.info/intro',
//       summary: 'A comprehensive introduction to JavaScript, explaining its role in web development and basic concepts.',
//       validate: true,
//       scrap_content_id: '6929f86fc1633b61b543317c'
//     }
//   ]
// } as any;


// const extractorInstance = new ContentExtractorAgentInstance();
// const extractionDump = await extractorInstance.execute({
//   sectionContext: data.sectionContext,
//   resources: data.resources,
// });

// console.log("📝 Extracted Content Dump:", extractionDump);

