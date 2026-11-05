const socket = io('https://realtime-chat-uijw.onrender.com');

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const userList = document.getElementById('user-list');
const onlineCount = document.getElementById('online-count');

let myName = '';

joinBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) return alert('নাম লিখো');
  myName = name;
  socket.emit('join', name);
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
});

usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinBtn.click();
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('chatMessage', text);
  messageInput.value = '';
});

function addMessage(data) {
  let name = 'Unknown';
  let text = '';
  if (typeof data === 'string') {
    text = data;
  } else if (data) {
    name = data.username || data.user || data.name || name;
    text = data.message || data.text || data.msg || '';
  }
  if (!text) return;
  const div = document.createElement('div');
  div.innerHTML = '<b></b>: <span></span>';
  div.querySelector('b').textContent = name;
  div.querySelector('span').textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateUsers(list) {
  if (!Array.isArray(list)) return;
  userList.innerHTML = '';
  list.forEach(u => {
    const name = typeof u === 'string' ? u : (u.username || u.name || '');
    if (!name) return;
    const li = document.createElement('li');
    li.textContent = name;
    userList.appendChild(li);
  });
  onlineCount.textContent = 'অনলাইন: ' + list.length;
}

socket.on('message', addMessage);
socket.on('chatMessage', addMessage);
socket.on('newMessage', addMessage);
socket.on('userList', updateUsers);
socket.on('updateUsers', updateUsers);
socket.on('onlineCount', (n) => {
  onlineCount.textContent = 'অনলাইন: ' + n;
});
socket.on('connect', () => {
  console.log('Connected', socket.id);
});
