const Practice = require("../models/Practice");
const { generateMCQs } = require("../services/practiceService");

// ✅ Generate Questions
const generatePractice = async (req, res, next) => {
  try {
    const { topic, difficulty, count } = req.body;

    if (!topic || !difficulty || !count) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (count > 20) {
      return res.status(400).json({
        success: false,
        message: "Maximum 20 questions allowed"
      });
    }

    const questions = await generateMCQs({
      topic,
      difficulty,
      count
    });

    res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Submit Answers
const submitPractice = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { topic, difficulty, questions } = req.body;

    let score = 0;

    const evaluated = questions.map((q) => {
      const isCorrect = q.userAnswer === q.correctAnswer;
      if (isCorrect) score++;

      return {
        ...q,
        isCorrect
      };
    });

    const attempt = await Practice.create({
      userId,
      topic,
      difficulty,
      score,
      totalQuestions: questions.length,
      questions: evaluated
    });

    res.status(200).json({
      success: true,
      score,
      total: questions.length,
      attempt
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get History
const getPracticeHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const history = await Practice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePractice,
  submitPractice,
  getPracticeHistory
};