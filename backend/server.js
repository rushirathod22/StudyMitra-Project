const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const studyRoutes = require("./routes/studyRoutes");
const aiRoutes = require("./routes/aiRoutes")

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/ai", aiRoutes)
app.use("/api/chat", chatRoutes);
app.use("/api/practice", require("./routes/practiceRoutes"));
// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// server start
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other process and try again.`);
    return;
  }

  console.error("Server startup failed:", error.message);
});
