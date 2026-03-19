import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import AICursor from "../components/AICursor";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [studyPlan, setStudyPlan] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false);

  // ================= STREAK SYSTEM =================
  const updateStreak = () => {
    const today = new Date().toISOString().split("T")[0];
    const last = localStorage.getItem("lastCompletedDate");

    let streak = parseInt(localStorage.getItem("streak")) || 0;

    if (last === today) return; // already counted

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split("T")[0];

    if (last === yDate) {
      streak += 1;
    } else {
      streak = 1; // reset
    }

    localStorage.setItem("streak", streak);
    localStorage.setItem("lastCompletedDate", today);
  };

  // ================= TOGGLE TASK =================
  const toggleTask = async (task) => {
    let updated;

    if (completedTasks.includes(task)) {
      updated = completedTasks.filter((t) => t !== task);
    } else {
      updated = [...completedTasks, task];
    }

    setCompletedTasks(updated);

    // 🔹 Save to backend
    await fetch("http://localhost:5000/api/study/update-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ tasks: updated }),
    });

    // 🔹 Completion check
    const total = studyPlan.reduce(
      (acc, item) => acc + (item.tasks?.length || 0),
      0
    );

    if (updated.length === total && total > 0) {
      setShowCongrats(true);
      updateStreak();

      setTimeout(() => setShowCongrats(false), 2500);
    }
  };

  // ================= FETCH PLAN =================
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/study/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!data.plan) return;

        const today = new Date().toISOString().split("T")[0];

        let todayTasks = [];

        data.plan.plan.weeks.forEach((week) => {
          week.topics.forEach((day) => {
            if (day.day === today) {
              todayTasks.push(day);
            }
          });
        });

        setStudyPlan(todayTasks);

        // 🔥 IMPORTANT FIX
        setCompletedTasks(data.plan.completedTasks || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchPlan();
  }, []);

  // ================= PROGRESS =================
  const totalTasks = studyPlan.reduce(
    (acc, item) => acc + (item.tasks?.length || 0),
    0
  );

  const progress = totalTasks
    ? Math.round((completedTasks.length / totalTasks) * 100)
    : 0;

  // ================= SVG PROGRESS =================
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const stroke = circumference - (progress / 100) * circumference;

  // ================= ANALYTICS =================
  const chartData = [
    { day: "Mon", progress: 20 },
    { day: "Tue", progress: 40 },
    { day: "Wed", progress: 60 },
    { day: "Thu", progress: 80 },
    { day: "Fri", progress: progress },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-[#cbd5f5]">
      <Navbar />

      {/* ================= SUCCESS POPUP ================= */}
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 bg-[#22d3ee] text-black px-6 py-3 rounded-xl shadow-xl z-50"
          >
            🎉 Completed! Keep your streak 🔥
          </motion.div>
        )}
      </AnimatePresence>

      <section className="pt-32 pb-20 max-w-6xl mx-auto px-6 space-y-10">

        {/* ================= AI INSIGHT ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#020617]/70 border border-[#1e293b] p-6 backdrop-blur-md"
        >
          <h2 className="text-xl text-white font-semibold">
            Welcome back 👋
          </h2>
          <p className="text-[#94a3b8] mt-2">
            <span className="text-[#22d3ee]">AI Insight:</span> Stay consistent and complete your plan today.
          </p>
        </motion.div>

        {/* ================= GRID ================= */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* PROGRESS */}
          <div className="bg-[#020617]/70 p-6 rounded-xl border border-[#1e293b] text-center backdrop-blur-md">
            <p className="text-[#94a3b8]">Progress</p>

            <div className="flex justify-center mt-4">
              <svg width="100" height="100">
                <circle cx="50" cy="50" r={radius} stroke="#1e293b" strokeWidth="8" fill="none" />

                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#22d3ee"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={stroke}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-[#22d3ee] mt-2 font-semibold">{progress}%</p>
          </div>

          {/* STREAK */}
          <div className="bg-[#020617]/70 p-6 rounded-xl border border-[#1e293b] text-center backdrop-blur-md">
            <p className="text-[#94a3b8]">Streak</p>
            <h2 className="text-3xl text-[#22d3ee] mt-2">
              {localStorage.getItem("streak") || 0} 🔥
            </h2>
          </div>

          {/* FOCUS */}
          <div className="bg-[#020617]/70 p-6 rounded-xl border border-[#1e293b] backdrop-blur-md">
            <p className="text-[#94a3b8]">Today's Focus</p>
            <h3 className="text-white mt-2 font-medium">
              Complete all tasks
            </h3>

            <Link to="/practice">
              <button className="mt-4 w-full bg-[#22d3ee] text-black py-2 rounded-lg hover:scale-105 transition">
                Start Session 🚀
              </button>
            </Link>
          </div>
        </div>

        {/* ================= TASKS ================= */}
        <motion.div
          className="bg-[#020617]/80 p-8 rounded-2xl border border-[#1e293b] shadow-xl backdrop-blur-md"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            Today’s Plan
          </h2>

          {studyPlan.length === 0 ? (
            <p className="text-[#94a3b8]">No tasks for today</p>
          ) : (
            studyPlan.map((item, i) => (
              <div key={i}>
                <p className="text-[#22d3ee] mb-4">{item.day}</p>

                <ul className="space-y-3">
                  {item.tasks.map((task, idx) => {
                    const done = completedTasks.includes(task);

                    return (
                      <li
                        key={idx}
                        className={`flex items-center gap-4 p-4 rounded-xl transition ${
                          done
                            ? "bg-[#22d3ee]/10"
                            : "hover:bg-[#1e293b]"
                        }`}
                      >
                        <button onClick={() => toggleTask(task)}>
                          {done ? "✅" : "⬜"}
                        </button>

                        <span
                          className={`${
                            done ? "line-through text-[#64748b]" : ""
                          }`}
                        >
                          {task}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* BUTTONS */}
                <div className="mt-6 flex gap-3">
                  <Link to="/practice">
                    <button className="px-5 py-2 rounded-xl bg-[#22d3ee] text-black hover:scale-105 transition">
                      Practice 🚀
                    </button>
                  </Link>

                  <Link to="/ai-mentor">
                    <button className="px-5 py-2 rounded-xl border border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee]/10 transition">
                      AI Mentor 🤖
                    </button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </motion.div>

        {/* ================= ANALYTICS ================= */}
        <div className="bg-[#020617]/70 p-6 rounded-xl border border-[#1e293b] backdrop-blur-md">
          <h3 className="text-[#22d3ee] mb-4">Weekly Progress</h3>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#22d3ee"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </section>

      <AICursor />
    </div>
  );
}