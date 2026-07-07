function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

// --- Calendar & Approvals Logic ---

async function fetchCalendar() {
  try {
    const res = await fetch('/api/calendar');
    const posts = await res.json();
    renderCalendar(posts);
  } catch (err) {
    console.error('Failed to load calendar', err);
  }
}

function renderCalendar(posts) {
  const pendingList = document.getElementById('pendingList');
  const approvedList = document.getElementById('approvedList');
  const alertBanner = document.getElementById('alertBanner');
  
  pendingList.innerHTML = '';
  approvedList.innerHTML = '';

  // Sort by date
  posts.sort((a, b) => new Date(a.date) - new Date(b.date));

  let hasUpcoming = false;
  const today = new Date();
  today.setHours(0,0,0,0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  posts.forEach(post => {
    const postHtml = `
      <div class="post-item ${post.status === 'approved' ? 'approved' : 'pending'}">
        <div class="post-header">
          <span>Date: ${post.date}</span>
          <span>Status: ${post.status === 'approved' ? '🟢 APPROVED' : '🟠 PENDING'}</span>
        </div>
        <div class="post-prompt">${post.prompt}</div>
        <div class="post-actions">
          ${post.status === 'pending_approval' ? `<button class="btn-approve" onclick="approvePost(${post.id})">Approve</button>` : ''}
          <button class="btn-edit" onclick="openEdit(${post.id}, '${post.date}', \`${post.prompt.replace(/`/g, '\\`')}\`)">Edit</button>
          <button class="btn-delete" onclick="deletePost(${post.id})">Delete</button>
        </div>
      </div>
    `;

    if (post.status === 'pending_approval') {
      pendingList.innerHTML += postHtml;
    } else {
      approvedList.innerHTML += postHtml;
      
      // Check if it's within the next 7 days
      const postDate = new Date(post.date);
      if (postDate >= today && postDate <= nextWeek) {
        hasUpcoming = true;
      }
    }
  });

  if (pendingList.innerHTML === '') pendingList.innerHTML = '<p style="color:#aaa;">No posts waiting for approval.</p>';
  if (approvedList.innerHTML === '') approvedList.innerHTML = '<p style="color:#aaa;">No scheduled posts.</p>';

  // Alert logic
  alertBanner.style.display = hasUpcoming ? 'none' : 'block';
}

async function addPost() {
  const date = document.getElementById('postDate').value;
  const prompt = document.getElementById('postPrompt').value;
  if (!date || !prompt) return alert('Please fill in both Date and Prompt.');

  await fetch('/api/post/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, prompt })
  });
  
  document.getElementById('postDate').value = '';
  document.getElementById('postPrompt').value = '';
  fetchCalendar();
}

async function approvePost(id) {
  await fetch('/api/post/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  fetchCalendar();
}

async function deletePost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  await fetch('/api/post/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  fetchCalendar();
}

function openEdit(id, date, prompt) {
  document.getElementById('editId').value = id;
  document.getElementById('editDate').value = date;
  document.getElementById('editPrompt').value = prompt;
  document.getElementById('editModal').style.display = 'block';
}

function closeEdit() {
  document.getElementById('editModal').style.display = 'none';
}

async function saveEdit() {
  const id = parseInt(document.getElementById('editId').value);
  const date = document.getElementById('editDate').value;
  const prompt = document.getElementById('editPrompt').value;

  await fetch('/api/post/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, date, prompt })
  });
  closeEdit();
  fetchCalendar();
}

async function runPosterManually() {
  alert('Starting autopilot script. Please wait for the process to finish...');
  try {
    const res = await fetch('/api/queue/run', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert('Script Finished successfully!\nOutput:\n' + data.output);
    } else {
      alert('Script Error:\n' + data.details);
    }
    fetchCalendar(); // refresh in case it processed things
  } catch (err) {
    alert('Failed to execute script. Check console.');
  }
}

// --- Chat Logic ---

let chatMessages = [
  { 
    role: "system", 
    content: "You are Agnes, the Bat Portal AI Assistant. Your job is to help the user brainstorm social media content and write image generation prompts. IMPORTANT: You do not have the ability to post to Instagram directly. If the user asks you to schedule or post something, tell them: 'I cannot post directly, but I can write the prompt for you! Once you are happy with it, you can copy it and paste it into the Calendar & Approvals tab to schedule it.' Keep your answers concise and friendly." 
  }
];

function handleChatKey(e) {
  if (e.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  // Add User Message to UI
  appendMessage('chat-user', text);
  input.value = '';
  
  // Disable button
  const btn = document.getElementById('chatSendBtn');
  btn.disabled = true;
  btn.innerText = 'Thinking...';

  // Add to payload
  chatMessages.push({ role: "user", content: text });

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatMessages })
    });
    const data = await res.json();
    
    if (data.choices && data.choices.length > 0) {
      const reply = data.choices[0].message.content;
      appendMessage('chat-agnes', reply);
      chatMessages.push({ role: "assistant", content: reply });
    } else {
      appendMessage('chat-agnes', "Error: Agnes did not return a response.");
    }
  } catch (err) {
    appendMessage('chat-agnes', "System Error: Could not connect to Agnes.");
  }

  // Enable button
  btn.disabled = false;
  btn.innerText = 'Send';
}

function appendMessage(className, text) {
  const history = document.getElementById('chatHistory');
  const div = document.createElement('div');
  div.className = `chat-bubble ${className}`;
  div.innerText = text;
  history.appendChild(div);
  history.scrollTop = history.scrollHeight;
}

// Initialize
fetchCalendar();
