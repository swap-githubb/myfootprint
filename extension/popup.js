const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  checkModelStatus();
  
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('register-btn').addEventListener('click', handleRegister);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('view-profile-btn').addEventListener('click', viewProfile);
  document.getElementById('show-register').addEventListener('click', showRegister);
  document.getElementById('show-login').addEventListener('click', showLogin);
});

async function checkAuthStatus() {
  const data = await chrome.storage.local.get(['userId', 'apiToken', 'userName']);
  
  if (data.userId && data.apiToken) {
    showStatus(data.userName);
    loadContentCount();
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('register-section').classList.add('hidden');
  document.getElementById('status-section').classList.add('hidden');
  clearMessage();
}

function showRegister() {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.remove('hidden');
  document.getElementById('status-section').classList.add('hidden');
  clearMessage();
}

function showStatus(userName) {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('register-section').classList.add('hidden');
  document.getElementById('status-section').classList.remove('hidden');
  document.getElementById('user-name').textContent = `Logged in as: ${userName}`;
}

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      await chrome.storage.local.set({
        userId: data.userId,
        apiToken: data.token,
        userName: data.name
      });
      
      showStatus(data.name);
      loadContentCount();
      showMessage('Login successful!', 'success');
    } else {
      showMessage(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    showMessage('Network error. Please try again.', 'error');
  }
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  
  if (!name || !email || !password) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage('Registration successful! Please login.', 'success');
      showLogin();
    } else {
      showMessage(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    showMessage('Network error. Please try again.', 'error');
  }
}

async function handleLogout() {
  await chrome.storage.local.remove(['userId', 'apiToken', 'userName']);
  showLogin();
  showMessage('Logged out successfully', 'success');
}

async function loadContentCount() {
  const data = await chrome.storage.local.get(['apiToken']);
  
  try {
    const response = await fetch(`${API_BASE}/content/count`, {
      headers: { 'Authorization': `Bearer ${data.apiToken}` }
    });
    
    if (response.ok) {
      const result = await response.json();
      document.getElementById('content-count').textContent = 
        `Content tracked: ${result.count} items`;
    }
  } catch (error) {
    console.error('Error loading content count:', error);
  }
}

function viewProfile() {
  chrome.tabs.create({ url: 'http://localhost:3000/profile' });
}

function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  setTimeout(clearMessage, 3000);
}

function clearMessage() {
  const messageEl = document.getElementById('message');
  messageEl.textContent = '';
  messageEl.className = 'message';
}

async function checkModelStatus() {
  const statusEl = document.getElementById('model-status');
  const statusText = document.getElementById('model-status-text');
  const progressBar = document.querySelector('.progress-fill');
  
  const modelStatus = await chrome.storage.local.get(['modelLoaded', 'modelProgress']);
  
  if (modelStatus.modelLoaded) {
    statusText.textContent = '✅ AI Model ready';
    statusEl.classList.remove('loading');
  } else {
    statusText.textContent = '⏳ AI Model will load when you visit a content page';
    if (modelStatus.modelProgress) {
      statusEl.classList.add('loading');
      progressBar.style.width = modelStatus.modelProgress + '%';
    }
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.modelLoaded || changes.modelProgress) {
      checkModelStatus();
    }
  }
});