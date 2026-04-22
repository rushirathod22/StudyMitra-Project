const callGroq = require("./groqService");

const generateMCQs = async ({ topic, difficulty, count }) => {
  const prompt = `
Generate ${count} ${difficulty} level MCQs on "${topic}"

Return ONLY valid JSON array:

[
  {
    "question": "clear conceptual question",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": "exact option text",
    "explanation": "short explanation"
  }
]

Rules:
- Questions must be concept-based (not definition only)
- Options must be realistic and confusing
- Only ONE correct answer
- Avoid vague answers like "Database" or "Software"
- Strict JSON only
`;

  
  let content = await callGroq(prompt);

  
  content = content.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid format");
    }

    return parsed;
  } catch (err) {
    console.log(" RAW AI RESPONSE:", content);
    throw new Error("AI JSON parsing failed");
  }
};

module.exports = {
  generateMCQs
};