let debounceTimer;
let lastAnalyzedUrl = '';
let mlEngine = null;
let isModelLoading = false;
let modelLoaded = false;

async function initializeWebLLM() {
  if (isModelLoading || modelLoaded) return;
  
  isModelLoading = true;
  console.log('Initializing WebLLM...');
  showNotification('AI Loading', 'Downloading AI model for content analysis (one-time setup, ~1GB)...');
  
  try {
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { CreateMLCEngine } from "https://esm.sh/@mlc-ai/web-llm@0.2.46";
      
      window.initializeLLM = async function() {
        try {
          const engine = await CreateMLCEngine(
            "gemma-2b-it-q4f16_1-MLC",
            {
              initProgressCallback: (progress) => {
                console.log('Model loading progress:', progress);
                window.postMessage({ 
                  type: 'LLM_PROGRESS', 
                  progress: progress.text,
                  percentage: progress.progress || 0
                }, '*');
              }
            }
          );
          return engine;
        } catch (error) {
          console.error('Failed to initialize LLM:', error);
          throw error;
        }
      };
    `;
    document.head.appendChild(script);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (window.initializeLLM) {
      mlEngine = await window.initializeLLM();
      modelLoaded = true;
      await chrome.storage.local.set({ modelLoaded: true });
      console.log('WebLLM initialized successfully');
      showNotification('AI Ready!', 'Content Tracker is now analyzing this page.');
    }
  } catch (error) {
    console.error('Error initializing WebLLM:', error);
    showNotification('AI Error', 'Failed to load AI model. Please refresh the page.');
  } finally {
    isModelLoading = false;
  }
}

async function analyzeWithLLM(title, content) {
  if (!mlEngine) {
    await initializeWebLLM();
    if (!mlEngine) {
      console.error('Failed to initialize LLM');
      return null;
    }
  }

  const prompt = `Analyze this content and determine if it's high-quality or meaningful for learning.

Title: ${title}
Content Preview: ${content.substring(0, 1500)}

Respond with ONLY a JSON object (no other text) containing:
{
  "quality_score": (number 1-10),
  "is_meaningful": (true/false),
  "summary": (50 words max summarizing key points),
  "category": (one of: article/video/tutorial/news/other)
}

Only mark as meaningful if quality_score >= 7. Focus on educational value, depth, and usefulness.`;

  try {
    const response = await mlEngine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.3,
    });
    
    const result = response.choices[0].message.content;
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error analyzing with LLM:', error);
    return null;
  }
}

function extractPageContent() {
  const title = document.title;
  const url = window.location.href;
  
  if (url === lastAnalyzedUrl) return;
  
  let content = '';
  let type = 'article';
  
  const isYouTube = url.includes('youtube.com/watch');
  const isArticle = document.querySelector('article') || 
                   document.querySelector('[role="article"]') ||
                   document.querySelector('.post-content') ||
                   document.querySelector('.article-content');
  
  if (isYouTube) {
    type = 'video';
    const description = document.querySelector('#description')?.innerText || '';
    const channelName = document.querySelector('#channel-name')?.innerText || '';
    const transcript = document.querySelector('#transcript')?.innerText || '';
    content = `Channel: ${channelName}\nDescription: ${description}\nTranscript: ${transcript}`.substring(0, 3000);
  } else if (isArticle) {
    const articleElement = isArticle;
    content = articleElement.innerText || '';
  } else {
    const mainContent = document.querySelector('main') || 
                       document.querySelector('#content') ||
                       document.querySelector('.content') ||
                       document.body;
    
    const paragraphs = mainContent.querySelectorAll('p');
    content = Array.from(paragraphs)
      .map(p => p.innerText)
      .filter(text => text.length > 50)
      .join('\n\n');
  }
  
  if (content.length < 200) return;
  
  const shouldAnalyze = 
    isYouTube ||
    url.includes('medium.com') ||
    url.includes('substack.com') ||
    url.includes('dev.to') ||
    url.includes('hackernews') ||
    url.includes('reddit.com') ||
    url.includes('arxiv.org') ||
    url.includes('github.com') ||
    url.includes('wikipedia.org') ||
    url.includes('stackoverflow.com') ||
    (content.length > 500 && document.readyState === 'complete');
  
  if (shouldAnalyze) {
    lastAnalyzedUrl = url;
    performAnalysis(title, content, type);
  }
}

async function performAnalysis(title, content, type) {
  console.log('Analyzing content...');
  
  if (!chrome.storage) {
    console.error('Chrome storage API not available');
    return;
  }
  
  const analysis = await analyzeWithLLM(title, content);
  
  if (!analysis || !analysis.is_meaningful || analysis.quality_score < 7) {
    console.log('Content not meaningful enough:', analysis);
    return;
  }
  
  chrome.runtime.sendMessage({
    action: 'analyzeContent',
    data: {
      title,
      content: content.substring(0, 2000),
      type,
      summary: analysis.summary,
      category: analysis.category,
      qualityScore: analysis.quality_score
    }
  }, response => {
    if (response?.success) {
      console.log('Content saved successfully');
      showNotification('Content tracked!', `"${title}" has been saved to your profile.`);
    } else {
      console.error('Failed to save content:', response?.error);
    }
  });
}

function showNotification(title, message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <strong style="display: block; margin-bottom: 5px;">${title}</strong>
    <span style="font-size: 14px;">${message}</span>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function debounceExtraction() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(extractPageContent, 3000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageLoaded') {
    debounceExtraction();
  }
});

window.addEventListener('message', (event) => {
  if (event.data.type === 'LLM_PROGRESS') {
    console.log('Model loading:', event.data.progress);
    const percentage = Math.round(event.data.percentage * 100);
    if (percentage > 0) {
      chrome.storage.local.set({ modelProgress: percentage });
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeWebLLM();
    debounceExtraction();
  });
} else {
  initializeWebLLM();
  debounceExtraction();
}

const observer = new MutationObserver(() => {
  if (window.location.href !== lastAnalyzedUrl) {
    debounceExtraction();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});