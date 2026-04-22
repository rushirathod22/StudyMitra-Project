import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import AICursor from "../components/AICursor";
import { API_BASE_URL } from "../config/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PIE_COLORS = ["#22d3ee", "#818cf8", "#34d399", "#fb923c", "#f472b6", "#a78bfa"];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-xl">
        {payload[0].name}: <span className="font-bold text-cyan-400">{payload[0].value}%</span>
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, color, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm px-6 py-5 space-y-3"
  >
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color.bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 ${color.text}`}>{value}</p>
    </div>
  </motion.div>
);

export default function Progress() {
  const [activeSubject, setActiveSubject] = useState("All");
  const [stats, setStats] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [consistency, setConsistency] = useState([]);
  const [loading, setLoading] = useState(true);

  const subjects = ["All", ...subjectPerformance.map((s) => s.subject)];

  const studyDistribution = subjectPerformance.map((s) => ({
    name: s.subject,
    value: s.value,
  }));

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/practice/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const attempts = data.history || [];

        let totalCorrect = 0;
        let totalQuestions = 0;
        const topics = new Set();

        attempts.forEach((a) => {
          totalCorrect += a.score;
          totalQuestions += a.totalQuestions;
          topics.add(a.topic);
        });

        const accuracy = totalQuestions
          ? Math.round((totalCorrect / totalQuestions) * 100)
          : 0;

        if (attempts.length === 0) {
          setStats([]);
          setSubjectPerformance([]);
          setConsistency([]);
        } else {
          setStats([
            { label: "Accuracy", value: `${accuracy}%` },
            { label: "Sessions", value: `${attempts.length}` },
            { label: "Topics Covered", value: `${topics.size}` },
            { label: "Recent Topic", value: attempts[0]?.topic || "–" },
          ]);

          const subjectMap = {};
          attempts.forEach((a) => {
            if (!subjectMap[a.topic]) subjectMap[a.topic] = { correct: 0, total: 0 };
            subjectMap[a.topic].correct += a.score;
            subjectMap[a.topic].total += a.totalQuestions;
          });

          const subjectData = Object.keys(subjectMap).map((topic) => ({
            subject: topic,
            value: Math.round(
              (subjectMap[topic].correct / subjectMap[topic].total) * 100
            ),
          }));

          setSubjectPerformance(subjectData);


          const last7Days = Array(7).fill(false);
          const today = new Date();
          attempts.forEach((a) => {
            const date = new Date(a.createdAt);
            const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
            if (diff < 7) last7Days[6 - diff] = true;
          });

          setConsistency(last7Days);
        }
      } catch (err) {
        console.log("Progress error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const statConfig = [
    {
      color: { text: "text-cyan-400", bg: "bg-cyan-400/10" },
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      color: { text: "text-violet-400", bg: "bg-violet-400/10" },
      icon: (
        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      color: { text: "text-emerald-400", bg: "bg-emerald-400/10" },
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      color: { text: "text-amber-400", bg: "bg-amber-400/10" },
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section className="pt-28 pb-24 max-w-5xl mx-auto px-5 space-y-10">

        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-white">Progress Overview</h1>
            <p className="text-sm text-slate-400 mt-1">Track your study performance and consistency</p>
          </div>
        </motion.div>

        {/* ===== LOADING SKELETON ===== */}
        {loading && (
          <div className="grid md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse" />
            ))}
          </div>
        )}

        {/* ===== STAT CARDS ===== */}
        {!loading && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((item, i) => (
              <StatCard
                key={i}
                label={item.label}
                value={item.value}
                color={statConfig[i]?.color || { text: "text-cyan-400", bg: "bg-cyan-400/10" }}
                icon={statConfig[i]?.icon}
                delay={i * 0.07}
              />
            ))}
          </div>
        )}

        {/* ===== CONSISTENCY ===== */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6"
          >
            <div className="mb-4">
              <h3 className="text-base font-semibold text-white">Study Streak</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days activity</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {(consistency.length > 0 ? consistency : Array(7).fill(false)).map((active, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? "bg-cyan-400/20 border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                        : "bg-slate-800/60 border border-slate-700"
                    }`}
                  >
                    {active ? (
                      <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    )}
                  </motion.div>
                  <span className="text-[10px] text-slate-500 font-medium">{DAY_LABELS[i]}</span>
                </div>
              ))}

              <div className="ml-auto flex items-center gap-2 text-sm">
                <span className="text-slate-400">Active days:</span>
                <span className="font-bold text-cyan-400">
                  {(consistency.length > 0 ? consistency : []).filter(Boolean).length}/7
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== SUBJECT FILTER + PERFORMANCE ===== */}
        {!loading && subjectPerformance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">Subject Performance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Accuracy per topic across all sessions</p>
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 flex-wrap">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubject(sub)}
                    className={`px-3 py-1 rounded-full border text-xs font-semibold transition ${
                      activeSubject === sub
                        ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {subjectPerformance
                .filter((s) => activeSubject === "All" || s.subject === activeSubject)
                .map((s, i) => {
                  const color = PIE_COLORS[i % PIE_COLORS.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="space-y-1.5"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-200">{s.subject}</span>
                        <span className="font-bold" style={{ color }}>{s.value}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.value}%` }}
                          transition={{ duration: 0.7, delay: 0.4 + i * 0.06 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* ===== PIE CHART ===== */}
        {!loading && studyDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6"
          >
            <h3 className="text-base font-semibold text-white mb-0.5">Study Distribution</h3>
            <p className="text-xs text-slate-500 mb-5">Relative accuracy across all topics</p>

            <div className="grid sm:grid-cols-2 items-center gap-6">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studyDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {studyDistribution.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          opacity={0.85}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2.5">
                {studyDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-sm text-slate-300 truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== EMPTY STATE ===== */}
        {!loading && stats.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
              <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">No progress data yet</p>
            <p className="text-sm text-slate-400 max-w-xs">
              Complete a practice session to see your performance stats, subject scores, and consistency tracking here.
            </p>
            <a
              href="/practice"
              className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Start Practicing →
            </a>
          </motion.div>
        )}

      </section>

      <AICursor />
    </div>
  );
}
