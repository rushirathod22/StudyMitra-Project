const axios = require("axios");

const generateAIResponse = async (prompt, history = []) => {
  try {
    // Check for common naming variations
    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API || process.env.GROQ_KEY;

    if (!apiKey) {
      console.log("❌ GROQ_API_KEY is missing from environment variables!");
      console.log("Available keys:", Object.keys(process.env).filter(k => k.toLowerCase().includes("api") || k.toLowerCase().includes("key")).slice(0, 5));
      throw new Error("AI Configuration Error: Missing API Key");
    }

    // Log key status for debugging (SAFE: only first 5 chars)
    console.log(`📡 Calling Groq with key starting with: ${apiKey.substring(0, 5)}...`);

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
          Authorization: `Bearer ${apiKey.trim()}`,
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