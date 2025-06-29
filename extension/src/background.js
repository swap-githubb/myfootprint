// We no longer need any youtube transcript libraries.
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// --- Configuration ---
const API_BASE_URL = "http://localhost:8000";
const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";
const TRANSCRIPT_SERVICE_URL = "https://youtubetotranscript.com/transcript?v=";

// --- Global variables ---
let engine;
let engine_init_promise;

async function getEngine() {
  if (!engine_init_promise) {
    console.log(`[background] Initializing new MLCEngine with model: ${SELECTED_MODEL}`);
    engine_init_promise = CreateMLCEngine(SELECTED_MODEL, {
      initProgressCallback: (progress) => {
        console.log("[background] Init progress:", progress.text);
        chrome.runtime.sendMessage({ type: "progress", data: progress.text });
      },
    });
  }
  engine = await engine_init_promise;
  console.log("[background] Engine is ready.");
  return engine;
}

/**
 * THIS IS THE NEW, SMARTER PARSING FUNCTION
 * It specifically targets the correct paragraphs and spans.
 * @param {string} html - The raw HTML content of the page.
 * @returns {string} The extracted transcript text, joined by spaces.
 */
function parseTranscriptFromHTML(html) {
  // 1. Find all the paragraphs that contain the actual transcript content.
  // We look for `<p class="inline NA text-primary-content">`
  const paragraphRegex = /<p class="inline NA text-primary-content">([\s\S]*?)<\/p>/g;
  
  // 2. Inside those paragraphs, find the spans with the class "transcript-segment".
  const spanRegex = /<span[^>]*class="transcript-segment"[^>]*>([\s\S]*?)<\/span>/g;
  
  let paragraphMatch;
  const allText = [];

  // Iterate over all matching paragraphs
  while ((paragraphMatch = paragraphRegex.exec(html)) !== null) {
    const paragraphContent = paragraphMatch[1];
    let spanMatch;
    
    // Iterate over all matching spans within the current paragraph
    while ((spanMatch = spanRegex.exec(paragraphContent)) !== null) {
      // Clean up the text inside the span
      const text = spanMatch[1]
        .replace(/<[^>]+>/g, '') // Strip any remaining HTML tags
        .replace(/\s+/g, ' ')      // Replace multiple whitespace chars with a single space
        .trim();
        
      if (text) {
        allText.push(text);
      }
    }
  }

  if (allText.length === 0) {
    console.warn("[background] Scraping: Found the page, but no 'transcript-segment' spans inside the correct paragraphs.");
  }

  return allText.join(' ');
}


// --- Main Event Listener ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ping') {
    sendResponse({ success: true });
    return;
  }
  
  if (request.type === "summarize") {
    (async () => {
      try {
        const { tab, contentType } = request.payload;
        let pageText = "";

        if (tab.url.includes("youtube.com/watch")) {
          console.log("[background] YouTube video detected. Using scraping method.");
          const url = new URL(tab.url);
          const videoId = url.searchParams.get('v');

          if (!videoId) {
            throw new Error("Could not parse a valid YouTube Video ID from the URL.");
          }
          
          const targetUrl = TRANSCRIPT_SERVICE_URL + videoId;
          console.log(`[background] Scraping target URL: ${targetUrl}`);

          try {
            const response = await fetch(targetUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch transcript page, status: ${response.status}`);
            }
            const html = await response.text();
            pageText = parseTranscriptFromHTML(html);
          } catch (e) {
            console.error("[background] Scraping failed:", e.message);
            throw new Error("The transcript scraping service may be down or has blocked the request.");
          }
        } else {
          console.log("[background] Article/page detected. Scraping page text...");
          const [injectionResult] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => document.body.innerText,
          });
          pageText = injectionResult.result || "";
        }

        if (!pageText || pageText.trim().length < 100) {
          throw new Error("Could not extract enough readable content to summarize.");
        }
        
        const contentToSummarize = pageText.substring(0, 4000);
        const llm = await getEngine();
        
        const prompt = `You are an expert summarizer. Provide a brief summary of the page content provided to you.You should provide the most important points of summary(Around 7 to 8 most important points with numbering).\n Just start your output with "Here is a detailed summary: ".\n At last you also have to give the rating of the content as per you intelligence (out of 10).\n Use Markdown for formatting. For example:
- Use bullet points for lists.
- Use **bold** for emphasis.\n So this is the provided content to you -> ${contentType}: \n\n${contentToSummarize}`;
        const summaryResponse = await llm.chat.completions.create({
          messages: [{ "role": "user", "content": prompt }],
        });
        const summary = summaryResponse.choices[0].message.content;
        
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

        sendResponse({ success: true, summary: summary });

      } catch (err) {
        console.error("[background] Summarization pipeline failed:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    
    return true;
  }
});