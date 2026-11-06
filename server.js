const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// এই লাইনটাই সবচেয়ে গুরুত্বপূর্ণ
app.use(express.static(__dirname));

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err.message));

// Message Model
const messageSchema = new mongoose.Schema({
  username: String,
  text: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const users = new Map();

io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);

  try {
    const history = await Message.find().sort({ createdAt: 1 }).limit(50);
    socket.emit('chat history', history);
  } catch (err) {
    console.log('History error:', err.message);
  }

  socket.on('join', (username) => {
    const name = (username || 'Anonymous').trim().slice(0, 20) || 'Anonymous';
    users.set(socket.id, name);
    socket.username = name;
    io.emit('userList', Array.from(users.values()));
    io.emit('system message', `${name} joined the chat`);
    socket.emit('system message', `Welcome, ${name}!`);
  });

  socket.on('chatMessage', async (msg) => {
    const name = users.get(socket.id) || 'Anonymous';
    const text = msg.toString().trim().slice(0, 500);
    if (!text) return;

    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
      const newMsg = new Message({ username: name, text, time });
      await newMsg.save();
    } catch (err) {
      console.log('Save error:', err.message);
    }

    io.emit('chatMessage', { username: name, text, time });
  });

  socket.on('disconnect', () => {
    const name = users.get(socket.id);
    users.delete(socket.id);
    if (name) {
      io.emit('userList', Array.from(users.values()));
      io.emit('system message', `${name} left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
