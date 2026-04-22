const express = require("express");
const router = express.Router();

const { askAITutor } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// ✅ correct usage
router.post("/ask", protect, askAITutor);

module.exports = router;