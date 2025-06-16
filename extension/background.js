let userId = null;
let apiToken = null;
const API_BASE = 'http://localhost:5000/api';

chrome.runtime.onInstalled.addListener(() => {
  loadUserCredentials();
});

async function loadUserCredentials() {
  const data = await chrome.storage.local.get(['userId', 'apiToken']);
  userId = data.userId;
  apiToken = data.apiToken;
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.userId) userId = changes.userId.newValue;
    if (changes.apiToken) apiToken = changes.apiToken.newValue;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    handleContentAnalysis(request.data, sender.tab).then(sendResponse);
    return true;
  }
});

async function handleContentAnalysis(data, tab) {
  if (!userId || !apiToken) {
    console.error('User not authenticated');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_BASE}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({
        url: tab.url,
        title: data.title,
        summary: data.summary,
        category: data.category,
        qualityScore: data.qualityScore,
        contentType: data.type,
        content: data.content,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error('Failed to save content');
    
    return { success: true };
  } catch (error) {
    console.error('Error saving content:', error);
    return { success: false, error: error.message };
  }
}

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.sendMessage(details.tabId, { action: 'pageLoaded' });
  }
});