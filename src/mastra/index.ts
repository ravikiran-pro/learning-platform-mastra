
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
import { fetchTrackDetailsTool } from './tools/fetchTrackDetails';
import { contentWriterAgent } from './agents/contentWritterAgent';
import { contentReviewerAgent } from './agents/contentReviewAgent';
import ContentWriterAgentInstance from './class/ContentWritterAgentInstance';


export const mastra = new Mastra({
  workflows: { weatherWorkflow, extractorWorkflow, wf_content_extraction_for_section },
  agents: {
    weatherAgent, searchAgent, extractorAgent, writerAgent, webSearchKeywordAgent,
    webSearchAgent, contentExtractorAgent, contentWriterAgent, contentReviewerAgent
  },
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
//   ],
//   "dump": "# What is JavaScript?\n\n## Introduction to JavaScript\n\n### What is JavaScript?\nJavaScript is a cross-platform, object-oriented scripting language used to make webpages interactive (e.g., having complex animations, clickable buttons, popup menus, etc.). There are also more advanced server-side versions of JavaScript such as Node.js, which allow you to add more functionality to a website than downloading files (such as real-time collaboration between multiple computers). Inside a host environment (for example, a web browser), JavaScript can be connected to the objects of its environment to provide programmatic control over them. JavaScript contains a standard library of objects, such as Array, Map, and Math, and a core set of language elements such as operators, control structures, and statements. Core JavaScript can be extended for a variety of purposes by supplementing it with additional objects; for example:\n\n- Client-side JavaScript extends the core language by supplying objects to control a browser and its Document Object Model (DOM). For example, client-side extensions allow an application to place elements on an HTML form and respond to user events such as mouse clicks, form input, and page navigation.\n- Server-side JavaScript extends the core language by supplying objects relevant to running JavaScript on a server. For example, server-side extensions allow an application to communicate with a database, provide continuity of information from one invocation to another of the application, or perform file manipulations on a server.\n\nThis means that in the browser, JavaScript can change the way the webpage (DOM) looks. And, likewise, Node.js JavaScript on the server can respond to custom requests sent by code executed in the browser.\n\n### JavaScript and Java\nJavaScript and Java are similar in some ways but fundamentally different in others. The JavaScript language resembles Java but does not have Java's static typing and strong type checking. JavaScript follows most Java expression syntax, naming conventions, and basic control-flow constructs which was the reason why it was renamed from LiveScript to JavaScript. In contrast to Java's compile-time system of classes built by declarations, JavaScript supports a runtime system based on a small number of data types representing numeric, Boolean, and string values. JavaScript has a prototype-based object model instead of the more common class-based object model. The prototype-based model provides dynamic inheritance; that is, what is inherited can vary for individual objects. JavaScript also supports functions without any special declarative requirements. Functions can be properties of objects, executing as loosely typed methods. JavaScript is a very free-form language compared to Java. You do not have to declare all variables, classes, and methods. You do not have to be concerned with whether methods are public, private, or protected, and you do not have to implement interfaces. Variables, parameters, and function return types are not explicitly typed.\n\nJava is a class-based programming language designed for fast execution and type safety. Type safety means, for instance, that you can't cast a Java integer into an object reference or access private memory by corrupting the Java bytecode. Java's class-based model means that programs consist exclusively of classes and their methods. Java's class inheritance and strong typing generally require tightly coupled object hierarchies. These requirements make Java programming more complex than JavaScript programming.\n\n### JavaScript and the ECMAScript specification\nJavaScript is standardized at Ecma International — the European association for standardizing information and communication systems (ECMA was formerly an acronym for the European Computer Manufacturers Association) to deliver a standardized, international programming language based on JavaScript. This standardized version of JavaScript, called ECMAScript, behaves the same way in all applications that support the standard. Companies can use the open standard language to develop their implementation of JavaScript. The ECMAScript standard is documented in the ECMA-262 specification. The ECMA-262 standard is also approved by the ISO (International Organization for Standardization) as ISO-16262. You can also find the specification on the Ecma International website. The ECMAScript specification does not describe the Document Object Model (DOM), which is standardized by the World Wide Web Consortium (W3C) and/or WHATWG (Web Hypertext Application Technology Working Group). The DOM defines the way in which HTML document objects are exposed to your script.\n\n### Getting started with JavaScript\nTo get started with JavaScript, all you need is a modern web browser. Recent versions of Firefox, Chrome, Microsoft Edge, and Safari all support the features discussed in this guide. A very useful tool for exploring JavaScript is the JavaScript Console (sometimes called the Web Console, or just the console): this is a tool which enables you to enter JavaScript and run it in the current page.\n\n### What can in-browser JavaScript do?\nModern JavaScript is a “safe” programming language. It does not provide low-level access to memory or the CPU, because it was initially created for browsers which do not require it. JavaScript’s capabilities greatly depend on the environment it’s running in. For instance, Node.js supports functions that allow JavaScript to read/write arbitrary files, perform network requests, etc. In-browser JavaScript can do everything related to webpage manipulation, interaction with the user, and the webserver. For instance, in-browser JavaScript is able to:\n\n- Add new HTML to the page, change the existing content, modify styles.\n- React to user actions, run on mouse clicks, pointer movements, key presses.\n- Send requests over the network to remote servers, download and upload files (so-called AJAX and COMET technologies).\n- Get and set cookies, ask questions to the visitor, show messages.\n- Remember the data on the client-side (“local storage”).\n\n### What CAN’T in-browser JavaScript do?\nJavaScript’s abilities in the browser are limited to protect the user’s safety. The aim is to prevent an evil webpage from accessing private information or harming the user’s data. Examples of such restrictions include:\n\n- JavaScript on a webpage may not read/write arbitrary files on the hard disk, copy them or execute programs.\n- It has no direct access to OS functions. Modern browsers allow it to work with files, but the access is limited and only provided if the user does certain actions, like “dropping” a file into a browser window or selecting it via an <input> tag.\n- There are ways to interact with the camera/microphone and other devices, but they require a user’s explicit permission.\n\n### What makes JavaScript unique?\nThere are at least three great things about JavaScript:\n\n- Full integration with HTML/CSS.\n- Simple things are done simply.\n- Supported by all major browsers and enabled by default.\n\nJavaScript is the only browser technology that combines these three things. That’s what makes JavaScript unique. That’s why it’s the most widespread tool for creating browser interfaces. That said, JavaScript can be used to create servers, mobile applications, etc.\n\n### Languages “over” JavaScript\nThe syntax of JavaScript does not suit everyone’s needs. Different people want different features. That’s to be expected, because projects and requirements are different for everyone. So, recently a plethora of new languages appeared, which are transpiled (converted) to JavaScript before they run in the browser. Modern tools make the transpilation very fast and transparent, actually allowing developers to code in another language and auto-converting it “under the hood”. Examples of such languages include:\n\n- CoffeeScript\n- TypeScript\n- Flow\n- Dart\n- Brython\n- Kotlin\n\n### Summary\nJavaScript was initially created as a browser-only language, but it is now used in many other environments as well. Today, JavaScript has a unique position as the most widely-adopted browser language, fully integrated with HTML/CSS. There are many languages that get “transpiled” to JavaScript and provide certain features. It is recommended to take a look at them, at least briefly, after mastering JavaScript.\n\n📎 Resource Reference:\n- Title: What is JavaScript?\n- URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction\n- Extracted Content: [Full content extracted from MDN]\n\n- Title: What is JavaScript?\n- URL: https://javascript.info/intro\n- Extracted Content: [Full content extracted from JavaScript.info]"
// } as any;


// // const extractorInstance = new ContentExtractorAgentInstance();
// // const extractionDump = await extractorInstance.execute({
// //   sectionContext: data.sectionContext,
// //   resources: data.resources,
// // });

// // console.log("📝 Extracted Content Dump:", extractionDump);

// const writerAgentTest: any = new ContentWriterAgentInstance()
// const reviewerAgentTest = mastra.getAgent("contentReviewerAgent");

// let approved = true, count = 0;
// let reviewFeedback: string | null = null, previousOutput = null;

// while (approved && count < 1) {
//   console.log(`Review Iteration ${count++}`)

//   const syntheses = await writerAgentTest.execute({
//     sectionContext: data.sectionContext,
//     extractedDump: data.dump,
//     rev

//   })

//   console.log(syntheses.text)
//   const reviewResult = await reviewerAgentTest.generate(
//     [
//       {
//         role: "system",
//         content: `Review and improve the following content: ${syntheses.text}`,
//       },
//       {
//         role: "assistant",
//         content: `Proceed Evaluating`,
//       },
//     ]
//   )

//   let review = JSON.parse(reviewResult.text)

//   console.log(review)
//   if (!review.approved) {
//     reviewFeedback = `
//     🛑 Reviewer Issues:
//     ${review.issues.join("\n")}

//     🛑 Reviewer Feedback:
//     ${review.recommendations}
// `.trim();

//   } else {
//     approved = review.approved
//   }


//   previousOutput = syntheses.text;

// }

// console.log('final-output', previousOutput);