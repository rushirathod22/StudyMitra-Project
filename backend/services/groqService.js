const axios = require("axios");

const callGroq = async (prompt) => {
  try {
    // Check for common naming variations
    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API || process.env.GROQ_KEY;

    if (!apiKey) {
      console.log("❌ GROQ_API_KEY is missing from environment variables!");
      console.log("Available keys:", Object.keys(process.env).filter(k => k.toLowerCase().includes("api") || k.toLowerCase().includes("key")).slice(0, 5));
      throw new Error("Groq API Key missing");
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",   
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.log("🔥 GROQ ERROR:", error.response?.data || error.message);
    throw new Error("Groq API Failed");
  }
};

module.exports = callGroq;