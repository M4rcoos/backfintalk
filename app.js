const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { login, register } = require('./controllers/auth');
const { createChatroom, getAllChatrooms,updateChatRoom } = require('./controllers/chatRoom');
const Message = require('./models/Message'); // Import before usage

const app = express();
app.use(express.json());
app.use(cors());

const User = require('./models/User'); // Assuming User model is in models/User.js
const Chatroom = require('./models/Chatroom'); // Assuming User model is in models/User.js

app.post('/Chatroom', createChatroom);
app.get('/Chatroom', getAllChatrooms);
app.post('/auth/register', register);
app.post('/auth/login', login);
app.put("/Chatroom/:id", updateChatRoom)

// Database and server configuration: adjust to your environment
const dbUser = "fintalk";
const dbPassword = "KaRAbm12NJfHUSWT";
const server = app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.kq6acrb.mongodb.net/?retryWrites=true&w=majority`)
  .then(() => console.log("Connected to database!"))
  .catch(err => console.error("Database connection error:", err));

const io = require('socket.io')(server, {
  allowEIO3: true,
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
  });

  socket.on('joinRoom', ({ chatroomId }) => {
    socket.join(chatroomId);
    console.log("Client joined chatroom:", chatroomId);
  });

  socket.on('leaveRoom', ({ chatroomId }) => {
    socket.leave(chatroomId);
    console.log("Client left chatroom:", chatroomId);
  });

  socket.on("chatroomMessage", async ({ _id, message, userId }) => {
    if (message.trim().length > 0) {
      try {
        const user = await User.findById(userId);
  
        const newMessage = new Message({
          chatroom: _id,
          user: userId,
          message,
        });
  
        console.log(newMessage)
        await newMessage.save();
  
        // Emita a nova mensagem para a sala atual
       io.emit("newMessage", {
          message,
          name: user.name,
          userId,
        });
        console.log("ENVIOU", test)
      } catch (error) {
        // Trate qualquer erro durante o processo
        console.error("Erro ao processar mensagem:", error.message);
      }
    }
  });
});
