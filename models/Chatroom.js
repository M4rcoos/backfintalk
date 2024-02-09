const mongoose = require("mongoose");

const Chatroom = mongoose.model("Chatroom",{
  name: {
    type: String,
    required: "Name is required!",
  },
});

module.exports = Chatroom;

