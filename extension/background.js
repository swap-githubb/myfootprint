import { CreateWebWorkerMLCEngine } from "./lib/web-llm.js";

const SELECTED_MODEL = "TinyLlama-1.1B-Chat-v0.4-q4f16_1";
const API_BASE_URL = "http://localhost:8000";

let engine;
let initPromise;

// Initialize the engine once and reuse it.
function initializeMLCEngine() {
  if (!initPromise) {
    initPromise = (async () => {
      console.log("Initializing WebLLM Engine...");
      engine = await CreateWebWorkerMLCEngine(
        new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
        SELECTED_MODEL,
        {
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

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "summarize") {
    // Ensure engine is ready, then process
    initializeMLCEngine().then(async (engine) => {
        const { tab, contentType } = request.payload;

        // 1. Get page content
        const [injectionResult] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => document.body.innerText, // Keep this simple for now
        });
        const pageText = injectionResult.result.substring(0, 4000); // Limit context

        // 2. Generate summary
        const prompt = `You are an expert summarizer. Provide a concise, two-sentence summary of the following ${contentType}: \n\n${pageText}`;
        const summaryResponse = await engine.chat.completions.create({
            messages: [{ "role": "user", "content": prompt }],
        });
        const summary = summaryResponse.choices[0].message.content;

        // 3. Send to backend
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
            sendResponse({ success: true, summary });
        } catch (error) {
            console.error("API Error:", error);
            sendResponse({ success: false, error: error.message });
        }
    }).catch(err => {
        console.error("Engine Init Error:", err);
        sendResponse({ success: false, error: "Model engine failed to start." });
    });

    return true; // Indicates we will send a response asynchronously
  }
});