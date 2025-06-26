// import { CreateWebWorkerMLCEngine } from "./lib/web-llm.js";

// const SELECTED_MODEL = "TinyLlama-1.1B-Chat-v0.4-q4f16_1";
// const API_BASE_URL = "http://localhost:8000";

// let engine;
// let initPromise;

// // Initialize the engine once and reuse it.
// function initializeMLCEngine() {
//   if (!initPromise) {
//     initPromise = (async () => {
//       console.log("Initializing WebLLM Engine...");
//       engine = await CreateWebWorkerMLCEngine(
//         new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
//         SELECTED_MODEL,
//         {
//           initProgressCallback: (progress) => {
//             console.log("Init Progress:", progress.text);
//             chrome.runtime.sendMessage({ type: "progress", data: progress.text });
//           }
//         }
//       );
//       console.log("Engine Initialized!");
//       return engine;
//     })();
//   }
//   return initPromise;
// }

// // Listen for messages from the popup
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === "summarize") {
//     // Ensure engine is ready, then process
//     initializeMLCEngine().then(async (engine) => {
//         const { tab, contentType } = request.payload;

//         // 1. Get page content
//         const [injectionResult] = await chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             function: () => document.body.innerText, // Keep this simple for now
//         });
//         const pageText = injectionResult.result.substring(0, 4000); // Limit context

//         // 2. Generate summary
//         const prompt = `You are an expert summarizer. Provide a concise, two-sentence summary of the following ${contentType}: \n\n${pageText}`;
//         const summaryResponse = await engine.chat.completions.create({
//             messages: [{ "role": "user", "content": prompt }],
//         });
//         const summary = summaryResponse.choices[0].message.content;

//         // 3. Send to backend
//         try {
//             const token = (await chrome.storage.local.get("token")).token;
//             const response = await fetch(`${API_BASE_URL}/content`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     url: tab.url,
//                     title: tab.title,
//                     summary: summary,
//                     content_type: contentType
//                 })
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || 'Failed to save.');
//             }
//             sendResponse({ success: true, summary });
//         } catch (error) {
//             console.error("API Error:", error);
//             sendResponse({ success: false, error: error.message });
//         }
//     }).catch(err => {
//         console.error("Engine Init Error:", err);
//         sendResponse({ success: false, error: "Model engine failed to start." });
//     });

//     return true; // Indicates we will send a response asynchronously
//   }
// });

// This import is directly from the official documentation CDN.
import { CreateWebWorkerMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm";

// --- Configuration ---
const SELECTED_MODEL = "TinyLlama-1.1B-Chat-v0.4-q4f16_1";
const API_BASE_URL = "http://localhost:8000";

// --- Global variables to hold the engine instance ---
let engine;
let initPromise;

/**
 * Initializes the WebLLM engine.
 * This function ensures the engine is only initialized once.
 * The library now handles the worker creation internally.
 */
function initializeMLCEngine() {
  if (!initPromise) {
    initPromise = (async () => {
      console.log("Initializing WebLLM Engine...");
      
      engine = await CreateWebWorkerMLCEngine(
        SELECTED_MODEL,
        {
          // This callback reports the model loading progress to the popup.
          initProgressCallback: (progress) => {
            console.log("Init Progress:", progress.text);
            chrome.runtime.sendMessage({ type: "progress", data: progress.text });
          }
        }
      );

      console.log("Engine Initialized!");
      return engine;
    })();
  }
  return initPromise;
}

/**
 * This is the main event listener for the extension.
 * It listens for a "summarize" message from the popup UI.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message is for summarization
  if (request.type === "summarize") {
    // Start the process: initialize engine, then perform summarization
    initializeMLCEngine().then(async (engine) => {
        const { tab, contentType } = request.payload;

        // 1. Inject a script into the active tab to get its text content.
        const [injectionResult] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => document.body.innerText,
        });
        const pageText = injectionResult.result.substring(0, 4000); // Limit text to avoid overly long prompts

        // 2. Create the prompt and generate the summary using the local LLM.
        const prompt = `You are an expert summarizer. Provide a concise, two-sentence summary of the following ${contentType}: \n\n${pageText}`;
        const summaryResponse = await engine.chat.completions.create({
            messages: [{ "role": "user", "content": prompt }],
        });
        const summary = summaryResponse.choices[0].message.content;

        // 3. Send the summarized content to your backend API.
        try {
            const token = (await chrome.storage.local.get("token")).token;
            const response = await fetch(`${API_BASE_URL}/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    url: tab.url,
                    title: tab.title,
                    summary: summary,
                    content_type: contentType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to save.');
            }
            // Send a success message back to the popup
            sendResponse({ success: true, summary });
        } catch (error) {
            console.error("API Error:", error);
            // Send a failure message back to the popup
            sendResponse({ success: false, error: error.message });
        }
    }).catch(err => {
        console.error("Engine Init Error:", err);
        // Send a failure message if the engine itself fails to start
        sendResponse({ success: false, error: "Model engine failed to start." });
    });

    // `return true;` is essential to indicate that `sendResponse` will be called asynchronously.
    return true;
  }
});