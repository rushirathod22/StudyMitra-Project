const axios = require("axios");

const generateAIResponse = async (prompt, history = []) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.log("❌ GROQ_API_KEY is missing from environment variables!");
      throw new Error("AI Configuration Error: Missing API Key");
    }

    // Log key status for debugging (SAFE: only first 5 chars)
    console.log(`📡 Calling Groq with key starting with: ${process.env.GROQ_API_KEY.substring(0, 5)}...`);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a smart AI Tutor.",
          },
          ...history,   
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.log("AI ERROR:", error.response?.data || error.message);
    throw new Error("AI Failed");
  }
};

module.exports = generateAIResponse;