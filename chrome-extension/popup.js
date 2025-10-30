// DOM elements
const loginScreen = document.getElementById('loginScreen');
const mainScreen = document.getElementById('mainScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const openWebAppBtn = document.getElementById('openWebAppBtn');
const openMarketplaceBtn = document.getElementById('openMarketplaceBtn');
const searchInput = document.getElementById('searchInput');
const promptPacksList = document.getElementById('promptPacksList');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const recordBtn = document.getElementById('recordBtn');
const recordingStatus = document.getElementById('recordingStatus');
const recordingTimer = document.getElementById('recordingTimer');
const transcribeResult = document.getElementById('transcribeResult');
const transcribeText = document.getElementById('transcribeText');
const noteTitle = document.getElementById('noteTitle');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

const WEB_APP_URL = 'https://14ede8a9-8a75-45fa-8dfc-391d6f908a82.lovableproject.com';

let currentUser = null;
let allPromptPacks = [];
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let recordingInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const session = await supabase.getSession();
  if (session && session.user) {
    currentUser = session.user;
    showMainScreen();
  } else {
    showLoginScreen();
  }
});

// Show screens
function showLoginScreen() {
  loginScreen.classList.remove('hidden');
  mainScreen.classList.add('hidden');
}

function showMainScreen() {
  loginScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  loadPromptPacks();
}

// Login form handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';
  loginError.classList.remove('show');
  
  try {
    const data = await supabase.signIn(email, password);
    currentUser = data.user;
    showMainScreen();
  } catch (error) {
    loginError.textContent = error.message;
    loginError.classList.add('show');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
  await supabase.signOut();
  currentUser = null;
  allPromptPacks = [];
  showLoginScreen();
});

// Open web app
openWebAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: WEB_APP_URL });
});

openMarketplaceBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: `${WEB_APP_URL}/prompt-marketplace` });
});

// Load prompt packs
async function loadPromptPacks() {
  loadingSpinner.style.display = 'block';
  promptPacksList.innerHTML = '';
  emptyState.classList.add('hidden');
  
  try {
    // Get installed packs
    const installedPacks = await supabase.query('user_installed_packs', {
      select: 'pack_id',
      eq: { user_id: currentUser.id }
    });
    
    const installedPackIds = installedPacks.map(p => p.pack_id);
    
    if (installedPackIds.length === 0) {
      loadingSpinner.style.display = 'none';
      emptyState.classList.remove('hidden');
      return;
    }
    
    // Get pack details
    const packs = await supabase.query('prompt_packs', {
      select: '*'
    });
    
    const myPacks = packs.filter(p => installedPackIds.includes(p.id));
    
    // Load prompts for each pack
    for (const pack of myPacks) {
      const prompts = await supabase.query('prompt_pack_items', {
        select: '*',
        eq: { pack_id: pack.id },
        order: 'order_index.asc'
      });
      pack.prompts = prompts;
    }
    
    allPromptPacks = myPacks;
    renderPromptPacks(myPacks);
    
  } catch (error) {
    console.error('Error loading packs:', error);
    promptPacksList.innerHTML = '<div class="error-message show">Failed to load prompt packs</div>';
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

// Render prompt packs
function renderPromptPacks(packs) {
  promptPacksList.innerHTML = '';
  
  if (packs.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  packs.forEach(pack => {
    const packElement = createPackElement(pack);
    promptPacksList.appendChild(packElement);
  });
}

// Create pack element
function createPackElement(pack) {
  const div = document.createElement('div');
  div.className = 'pack-item';
  
  const promptCount = pack.prompts ? pack.prompts.length : 0;
  
  div.innerHTML = `
    <div class="pack-header">
      <div class="pack-info">
        <div class="pack-title">${escapeHtml(pack.name)}</div>
        <div class="pack-count">${promptCount} prompts</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="btn-uninstall" data-pack-id="${pack.id}" title="Uninstall pack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    <div class="prompts-list">
      ${pack.prompts && pack.prompts.length > 0
        ? pack.prompts.map(prompt => createPromptElement(prompt)).join('')
        : '<p style="color: #999; font-size: 13px;">No prompts in this pack yet</p>'
      }
    </div>
  `;
  
  // Toggle expand on click
  div.querySelector('.pack-header').addEventListener('click', (e) => {
    // Don't toggle if clicking uninstall button
    if (e.target.closest('.btn-uninstall')) return;
    div.classList.toggle('expanded');
  });
  
  // Handle uninstall
  div.querySelector('.btn-uninstall').addEventListener('click', async (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to uninstall "${pack.name}"?`)) {
      try {
        const button = e.currentTarget;
        button.disabled = true;
        
        // Delete from user_installed_packs
        await supabase.query('user_installed_packs', {
          delete: true,
          eq: { user_id: currentUser.id, pack_id: pack.id }
        });
        
        // Reload packs
        await loadPromptPacks();
      } catch (error) {
        console.error('Error uninstalling pack:', error);
        alert('Failed to uninstall pack');
      }
    }
  });
  
  return div;
}

// Create prompt element
function createPromptElement(prompt) {
  const promptId = `prompt-${prompt.id}`;
  return `
    <div class="prompt-item" data-prompt-id="${prompt.id}">
      <div class="prompt-content">
        <div class="prompt-title">${escapeHtml(prompt.title)}</div>
        <div class="prompt-text">${escapeHtml(prompt.prompt_text)}</div>
      </div>
      <button class="btn-small btn-copy" data-prompt="${escapeHtml(prompt.prompt_text)}">
        Copy
      </button>
    </div>
  `;
}

// Event delegation for copy buttons
promptPacksList.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-copy')) {
    const promptText = e.target.getAttribute('data-prompt');
    copyToClipboard(promptText, e.target);
  }
});

// Copy to clipboard
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

// Search functionality
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  if (!searchTerm) {
    renderPromptPacks(allPromptPacks);
    return;
  }
  
  const filtered = allPromptPacks.map(pack => {
    const filteredPrompts = pack.prompts.filter(prompt =>
      prompt.title.toLowerCase().includes(searchTerm) ||
      prompt.prompt_text.toLowerCase().includes(searchTerm)
    );
    
    if (filteredPrompts.length > 0 || pack.name.toLowerCase().includes(searchTerm)) {
      return { ...pack, prompts: filteredPrompts.length > 0 ? filteredPrompts : pack.prompts };
    }
    return null;
  }).filter(Boolean);
  
  renderPromptPacks(filtered);
});

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Transcription functionality
recordBtn.addEventListener('click', async () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    await startRecording();
  } else {
    await stopRecording();
  }
});

saveNoteBtn.addEventListener('click', async () => {
  const content = transcribeText.value.trim();
  const title = noteTitle.value.trim();
  
  if (!content) {
    alert('Transcription is empty');
    return;
  }

  saveNoteBtn.disabled = true;
  saveNoteBtn.textContent = 'Saving...';

  try {
    const duration = recordingStartTime ? Math.floor((Date.now() - recordingStartTime) / 1000) : 0;
    
    await supabase.insert('notes', {
      user_id: currentUser.id,
      title: title || null,
      content: content,
      duration: duration
    });

    // Clear form
    transcribeText.value = '';
    noteTitle.value = '';
    transcribeResult.classList.add('hidden');
    
    alert('Note saved successfully!');
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Failed to save note: ' + error.message);
  } finally {
    saveNoteBtn.disabled = false;
    saveNoteBtn.textContent = 'Save Note';
  }
});

cancelNoteBtn.addEventListener('click', () => {
  transcribeText.value = '';
  noteTitle.value = '';
  transcribeResult.classList.add('hidden');
});

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      await processRecording();
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    recordingStartTime = Date.now();
    
    // Update UI
    recordBtn.classList.add('recording');
    recordBtn.querySelector('.record-text').textContent = 'Stop Recording';
    recordingStatus.classList.remove('hidden');
    
    // Start timer
    recordingInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      recordingTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
    
  } catch (error) {
    console.error('Error starting recording:', error);
    alert('Failed to access microphone: ' + error.message);
  }
}

async function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    
    // Clear timer
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }
    
    // Update UI
    recordBtn.classList.remove('recording');
    recordBtn.querySelector('.record-text').textContent = 'Start Recording';
    recordingStatus.classList.add('hidden');
  }
}

async function processRecording() {
  try {
    recordBtn.disabled = true;
    recordBtn.querySelector('.record-text').textContent = 'Transcribing...';
    
    // Convert audio to base64
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result.split(',')[1];
        
        // Call transcribe function
        const result = await supabase.invokeFunction('transcribe-audio', {
          audio: base64Audio
        });
        
        if (result.text) {
          transcribeText.value = result.text;
          transcribeResult.classList.remove('hidden');
        } else {
          throw new Error('No transcription returned');
        }
        
      } catch (error) {
        console.error('Transcription error:', error);
        alert('Failed to transcribe audio: ' + error.message);
      } finally {
        recordBtn.disabled = false;
        recordBtn.querySelector('.record-text').textContent = 'Start Recording';
      }
    };
    
    reader.readAsDataURL(audioBlob);
    
  } catch (error) {
    console.error('Error processing recording:', error);
    alert('Failed to process recording: ' + error.message);
    recordBtn.disabled = false;
    recordBtn.querySelector('.record-text').textContent = 'Start Recording';
  }
}
