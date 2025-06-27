// Import directly from the NPM package. Vite will handle the bundling.
import { CreateMLCEngine } from "@mlc-ai/web-llm";

const API_BASE_URL = "http://localhost:8000";
const SELECTED_MODEL = "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC";

let engine; // This will hold our initialized LLM engine.
let engine_init_promise; // A promise to prevent multiple initializations at once.

// This function initializes the engine and is called only when needed.
async function getEngine() {
  if (!engine_init_promise) {
    console.log("[background] Initializing new MLCEngine...");
    engine_init_promise = CreateMLCEngine(SELECTED_MODEL, {
      initProgressCallback: (progress) => {
        console.log("[background] Init progress:", progress.text);
        // Send progress updates to the popup.
        chrome.runtime.sendMessage({ type: "progress", data: progress.text });
      },
    });
  }
  engine = await engine_init_promise;
  console.log("[background] Engine is ready.");
  return engine;
}

// The main message listener.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ping') {
    // A simple way for the popup to check if the background is active.
    sendResponse({ success: true });
    return;
  }
  
  if (request.type === "summarize") {
    (async () => {
      try {
        // 1. Get the page content.
        const { tab, contentType } = request.payload;
        const [injectionResult] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => document.body.innerText,
        });
        const pageText = injectionResult.result.substring(0, 4000);

        // 2. Get the LLM engine (it will initialize if it hasn't already).
        const llm = await getEngine();
        
        // 3. Create the prompt and generate the summary directly. NO self-messaging.
        const prompt = `You are an expert summarizer. Provide a concise, two-sentence summary of the following ${contentType}: \n\n${pageText}`;
        const summaryResponse = await llm.chat.completions.create({
          messages: [{ "role": "user", "content": prompt }],
        });
        const summary = summaryResponse.choices[0].message.content;
        
        // 4. Send the data to your backend API.
        const { token } = await chrome.storage.local.get("token");
        const apiResponse = await fetch(`${API_BASE_URL}/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            url: tab.url,
            title: tab.title,
            summary: summary,
            content_type: contentType,
          }),
        });

        if (!apiResponse.ok) {
          const errData = await apiResponse.json();
          throw new Error(errData.detail || 'Failed to save to server.');
        }

        // 5. Send the successful result back to the popup.
        sendResponse({ success: true, summary: summary });
      } catch (err) {
        console.error("[background] Summarization pipeline failed:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    
    // Return true because we are responding asynchronously.
    return true;
  }
});