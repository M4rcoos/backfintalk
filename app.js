// imports
const express = require('express');
const mongoose = require('mongoose');

const { login, register } = require('./controllers/auth');
const { createChatroom, getAllChatrooms } = require('./controllers/chatRoom');
const app = express();

app.use(express.json());
app.use(require('cors')());

app.post("/Chatroom", createChatroom);
app.get("/Chatroom", getAllChatrooms);
app.post('/auth/register', register);

app.post('/auth/login', login);

// Credenciais
const dbUser = "fintalk";
const dbPassword = "KaRAbm12NJfHUSWT";
const server = app.listen(3000, () => {
    console.log("Server listening on port 3000");
});

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.kq6acrb.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log("Conectou ao Banco!");
}).catch();

const User = mongoose.model("User");

// Importe a model "Message" antes de usá-la
const Message = require("./models/Message");

const io = require("socket.io")(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Connected: " + socket.id);

    socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.id);
    });

    socket.on("joinRoom", ({ chatroomId }) => {
        socket.join(chatroomId);
        console.log("A user joined chatroom: " + chatroomId);
    });

    socket.on("leaveRoom", ({ chatroomId }) => {
        socket.leave(chatroomId);
        console.log("A user left chatroom: " + chatroomId);
    });

    socket.on("chatroomMessage", async ({ _id, message }) => {
        console.log("Received message in chatroom " + _id + ": " + message);
    
        if (message.trim().length > 0) {
            const user = await User.findOne({ _id }); // Busca o usuário usando o ID
    
            if (user && user.name) {
                console.log(user);
    
                const newMessage = new Message({
                    chatroom: _id,
                    user: user._id, // Use o ID do usuário, não o próprio usuário
                    message,
                });
    
                io.to(_id).emit("newMessage", {
                    message,
                    name: user.name,
                    userId: user._id,
                });
    
                await newMessage.save();
            } else {
                console.error("Usuário não encontrado ou não possui propriedade 'name'");
            }
        }
    });
    
});
