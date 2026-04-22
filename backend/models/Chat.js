const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: String, // "user" or "assistant"
  content: mongoose.Schema.Types.Mixed, // can be string or object
});

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);