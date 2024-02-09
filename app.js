// imports
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')



const {login, register} =require ('./controllers/auth')
const {createChatroom, getAllChatrooms} =require ('./controllers/chatRoom')


const app = express()
app.use(express.json())
app.use(require('cors')())

app.post("/Chatroom",  createChatroom)
app.get("/Chatroom",  getAllChatrooms)
app.post('/auth/register', register)

app.post('/auth/login', login)

//Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS
const server = app.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.kq6acrb.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log("Conectou ao Banco!")
}).catch()


require("./models/User");
require("./models/chatroom");
require("./models/Message");

const io = require("socket.io")(server, {
    allowEIO3: true,
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const Message = mongoose.model("Message");
  const User = mongoose.model("User");

  io.use(async (socket,) => {
    try {
      // Obtenha o token do Local Storage
      const token = localStorage.getItem('token');
  
      if (token) {
        // Verifique o token e obtenha o payload
        const payload = token
  
        // Salve o ID do usuário na propriedade userId do socket
        socket = payload;
      }
    } catch (err) {
      console.error('Erro ao verificar o token:', err.message);
    }
     
    io.on("connection", (socket) => {
        console.log("Connected: " + socket.userId);
      
        socket.on("disconnect", () => {
          console.log("Disconnected: " + socket.userId);
        });
      
        socket.on("joinRoom", ({ chatroomId }) => {
          socket.join(chatroomId);
          console.log("A user joined chatroom: " + chatroomId);
        });
      
        socket.on("leaveRoom", ({ chatroomId }) => {
          socket.leave(chatroomId);
          console.log("A user left chatroom: " + chatroomId);
        });
      
        socket.on("chatroomMessage", async ({ chatroomId, message }) => {
          if (message.trim().length > 0) {
            const user = await User.findOne({ _id: socket.userId });
            const newMessage = new Message({
              chatroom: chatroomId,
              user: socket.userId,
              message,
            });
            io.to(chatroomId).emit("newMessage", {
              message,
              name: user.name,
              userId: socket.userId,
            });
            await newMessage.save();
          }
        });
    });
  })