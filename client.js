const socket = io("https://realtime-chat-server.onrender.com");
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const userList = document.getElementById('user-list');
const onlineCount = document.getElementById('online-count');

let myUsername = '';

function joinChat() {
  const name = usernameInput.value.trim();
  if (!name) {
    usernameInput.focus();
    return;
  }
  myUsername = name;
  socket.emit('join', name);
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
  messageInput.focus();
}

joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinChat();
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('chat message', text);
  messageInput.value = '';
  messageInput.focus();
});

socket.on('chat message', (data) => {
  const div = document.createElement('div');
  const isOwn = data.username === myUsername;
  div.className = `message ${isOwn ? 'own' : 'other'}`;
  div.innerHTML = `
    <div class="meta">${escapeHtml(data.username)} · ${data.time}</div>
    <div>${escapeHtml(data.text)}</div>
  `;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('system message', (text) => {
  const div = document.createElement('div');
  div.className = 'message system';
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('user list', (users) => {
  userList.innerHTML = '';
  users.forEach((u) => {
    const li = document.createElement('li');
    li.textContent = u;
    userList.appendChild(li);
  });
  onlineCount.textContent = `অনলাইন: ${users.length}`;
});

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
