const express = require("express");
const router = express.Router();

const practiceController = require("../controllers/practiceController");
const { protect } = require("../middleware/authMiddleware"); // ✅ FIX

// ✅ Routes
router.post("/generate", protect, practiceController.generatePractice);
router.post("/submit", protect, practiceController.submitPractice);
router.get("/history", protect, practiceController.getPracticeHistory);

module.exports = router;