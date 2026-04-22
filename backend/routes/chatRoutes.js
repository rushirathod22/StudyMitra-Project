const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const { protect } = require("../middleware/authMiddleware");


// ✅ GET ALL CHATS
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chats" });
  }
});

// ✅ GET SINGLE CHAT
router.get("/:id", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chat" });
  }
});

// ✅ DELETE CHAT (ADDED)
router.delete("/:id", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await chat.deleteOne();

    res.json({ message: "Chat deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting chat" });
  }
});

module.exports = router;


