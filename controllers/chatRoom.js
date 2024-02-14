const Chatroom = require("../models/Chatroom")


const createChatroom = async (req, res) => {
  const { name } = req.body;

  const nameRegex = /^[A-Za-z\s]+$/;

  if (!nameRegex.test(name)) throw "Chatroom name can contain only alphabets.";

  const chatroomExists = await Chatroom.findOne({ name });

  if (chatroomExists) throw "Chatroom with that name already exists!";

  const chatroom = new Chatroom({
    name,
  });

  await chatroom.save();

  res.json({
    message: "Chatroom created!",
  });
};

const getAllChatrooms = async (req, res) => {
  const chatrooms = await Chatroom.find({});

  res.json(chatrooms);
};
const updateChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedRoom = await Chatroom.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedRoom) {
      return res.status(404).json({ msg: "Festa não encontrada." });
    }

    res.status(200).json({ name: updatedRoom.name, msg: "Atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao atualizar a sala de bate-papo" });
  }
};
module.exports = {
    getAllChatrooms,
    createChatroom,
    updateChatRoom
  }

 