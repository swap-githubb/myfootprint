import { jwtDecode } from 'jwt-decode';
// DOM Elements
const loginView = document.getElementById('login-view');
const summaryView = document.getElementById('summary-view');
const appFooter = document.getElementById('app-footer');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const summarizeBtn = document.getElementById('summarize-btn');
const pageInfo = document.getElementById('page-info');
const statusMessage = document.getElementById('status-message');
const usernameDisplay = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');

const API_BASE_URL = "http://localhost:8000";
let currentPageInfo = null;


function showSpinner(button, show = true) {
    const spinner = button.querySelector('.spinner');
    const text = button.querySelector('.btn-text');
    if (show) {
        spinner.style.display = 'block';
        if (text) text.style.display = 'none';
        button.disabled = true;
    } else {
        spinner.style.display = 'none';
        if (text) text.style.display = 'block';
        button.disabled = false;
    }
}

function setStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = type; 
}

// Function to analyze the current page and determine if it has content to summarize
// This function checks for articles or videos and updates the UI accordingly.
async function analyzeCurrentPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url || !tab.url.startsWith('http')) {
        pageInfo.innerHTML = `<p>Cannot summarize this page.</p>`;
        summarizeBtn.disabled = true;
        return;
    }
    
    // Inject script to detect content type
    const [injectionResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            const hasArticle = !!document.querySelector('article, [role="article"]');
            const hasVideo = !!document.querySelector('video');
            if (hasVideo) return 'video';
            if (hasArticle) return 'article';
            return document.body.innerText.length > 2000 ? 'article' : null;
        }
    });

    const contentType = injectionResult.result;

    if (contentType) {
        pageInfo.innerHTML = `<p>Found a potential <b>${contentType}</b> to summarize.</p>`;
        summarizeBtn.disabled = false;
        currentPageInfo = { tab, contentType };
    } else {
        pageInfo.innerHTML = `<p>No article or video found on this page.</p>`;
        summarizeBtn.disabled = true;
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const { token } = await chrome.storage.local.get("token");
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            const username = decodedToken.sub;
            usernameDisplay.textContent = username;

           
            loginView.style.display = 'none';
            summaryView.style.display = 'block';
            appFooter.style.display = 'flex';
            await analyzeCurrentPage();

        } catch (error) {
            console.error("Invalid token found:", error);
            await chrome.storage.local.remove("token");
            // Show the login view
            loginView.style.display = 'block';
            summaryView.style.display = 'none';
            appFooter.style.display = 'none';
        }
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showSpinner(loginBtn);
    loginError.textContent = '';
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const formData = new URLSearchParams({ username, password });

    try {
        const res = await fetch(`${API_BASE_URL}/token`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Invalid username or password.');
        const data = await res.json();
        await chrome.storage.local.set({ token: data.access_token });
        window.location.reload(); // Reload popup to switch views
    } catch (err) {
        loginError.textContent = err.message;
        showSpinner(loginBtn, false);
    }
});

logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove("token");
    window.location.reload();
});


summarizeBtn.addEventListener('click', async () => {
  showSpinner(summarizeBtn);
  setStatus('Waking background…');

  try {
    await chrome.runtime.sendMessage({ type: 'ping' });
    console.log('[popup] ping success');
  } catch (err) {
    console.warn('[popup] ping error:', chrome.runtime.lastError);
  }

  setStatus('Initializing model…');

  chrome.runtime.sendMessage({ type: 'summarize', payload: currentPageInfo }, (response) => {
    console.log('[popup] summarize response:', response);

    if (chrome.runtime.lastError) {
      setStatus('Background unavailable. Try again.', 'error');
    } else if (response?.success) {
      setStatus('Saved successfully!', 'success');
    } else {
      setStatus(response?.error || 'Unknown error', 'error');
    }
    showSpinner(summarizeBtn, false);
    summarizeBtn.disabled = true;
  });
});


// Listener for progress from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "progress") {
        setStatus(message.data);
    }
});