const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    const name = (username || 'Anonymous').trim().slice(0, 20) || 'Anonymous';
    users.set(socket.id, name);
    socket.username = name;

    io.emit('user list', Array.from(users.values()));
    socket.broadcast.emit('system message', `${name} joined the chat`);
    socket.emit('system message', `Welcome, ${name}!`);
  });

  socket.on('chat message', (msg) => {
    const name = users.get(socket.id) || 'Anonymous';
    const text = (msg || '').toString().trim().slice(0, 500);
    if (!text) return;

    io.emit('chat message', {
      username: name,
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on('disconnect', () => {
    const name = users.get(socket.id);
    users.delete(socket.id);
    if (name) {
      io.emit('user list', Array.from(users.values()));
      io.emit('system message', `${name} left the chat`);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});