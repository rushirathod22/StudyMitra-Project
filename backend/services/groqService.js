const axios = require("axios");

const callGroq = async (prompt) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.log("❌ GROQ_API_KEY is missing from environment variables!");
      throw new Error("Groq API Key missing");
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",   
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`,
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