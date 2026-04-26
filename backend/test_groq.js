const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const testGroq = async () => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "Hello" }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Success:", response.data.choices[0].message.content);
  } catch (error) {
    console.log("Error:", error.response?.data || error.message);
  }
};

testGroq();
