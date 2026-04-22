const generateAIResponse = require("../services/aiTutorService");
const User = require("../models/User");
const Chat = require("../models/Chat");

const askAITutor = async (req, res) => {
  try {
    const { message, mode, chatId } = req.body;
    const userId = req.user ? req.user.id : null;

    let chat;

    // ✅ LOAD OR CREATE CHAT
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      chat = new Chat({
        user: userId,
        title: message.substring(0, 30),
        messages: [],
      });
    }

    // ✅ ADD USER MESSAGE
    chat.messages.push({
      role: "user",
      content: message,
    });

    // ✅ GET USER WEAK TOPICS
    let weakTopics = [];
    if (userId) {
      const user = await User.findById(userId);
      weakTopics = user?.weakTopics || [];
    }

    // ✅ FINAL CLEAN PROMPT
    const prompt = `
You are an AI Tutor.

STRICT RULES:
- Return ONLY ONE valid JSON object
- No markdown
- No backticks
- No explanation outside JSON
- Use \\n for line breaks inside text/code

Mode: ${mode}

FORMAT:

Explain:
{
  "type": "explain",
  "title": "",
  "explanation": "",
  "examples": [
    { "code": "", "description": "" }
  ]
}

Notes:
{
  "type": "notes",
  "title": "",
  "points": ["", "", ""]
}

Quiz:
{
  "type": "quiz",
  "title": "",
  "questions": [
    {
      "question": "",
      "options": ["A", "B", "C", "D"],
      "answer": ""
    }
  ]
}

Revise:
{
  "type": "revise",
  "title": "",
  "summary": "",
  "keyPoints": ["", "", ""]
}

User weak topics: ${weakTopics.join(", ") || "None"}

User question: ${message}
`;

    // ✅ CHAT HISTORY (last 6 messages)
    const history = chat.messages.slice(-6).map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));

    // ✅ CALL AI
    const aiReply = await generateAIResponse(prompt, history);

    // ✅ PROPER JSON PARSER
    const extractJSON = (text) => {
      try {
        let cleaned = text.trim();

        // 1. If wrapped in markdown json block, extract just that block
        const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (jsonMatch) {
          cleaned = jsonMatch[1].trim();
        }

        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1) return null;

        const jsonString = cleaned.substring(start, end + 1);

        try {
          return JSON.parse(jsonString);
        } catch (err) {
          // Handle cases where AI uses backticks or unescaped newlines for JSON strings
          // using a quick safe object evaluation fallback.
          return new Function(`return ${jsonString.trim()};`)();
        }
      } catch (err) {
        console.log("JSON Parse Error:", err.message);
        return null;
      }
    };

    let parsed = extractJSON(aiReply);

    // ✅ FALLBACK (VERY IMPORTANT)
    if (!parsed) {
      console.log("⚠️ AI returned invalid JSON, using fallback");

      parsed = {
        type: "explain",
        title: "AI Response",
        explanation: "I encountered an error parsing the response properly. Here is the raw output:\n\n" + aiReply,
        examples: [],
      };
    }

    // ✅ SAVE AI MESSAGE
    chat.messages.push({
      role: "assistant",
      content: parsed,
    });

    await chat.save();

    // ✅ UPDATE WEAK TOPICS (ONLY FOR QUIZ)
    if (userId && mode === "quiz") {
      const user = await User.findById(userId);

      if (user && parsed.title) {
        if (!user.weakTopics.includes(parsed.title)) {
          user.weakTopics.push(parsed.title);
          await user.save();
        }
      }
    }

    // ✅ FINAL RESPONSE
    res.json({
      success: true,
      data: parsed,
      chatId: chat._id,
      suggestions: ["Explain more", "Give quiz", "Revise"],
    });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ message: "AI error" });
  }
};

module.exports = { askAITutor };