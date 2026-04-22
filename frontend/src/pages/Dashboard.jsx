import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import AICursor from "../components/AICursor";
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FaArrowRight, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";

const formatLongDate = (date) => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date);
const formatShortDate = (value) => {
  if (!value) return "Today";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
};

const StatCard = ({ label, value, hint }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 space-y-1 shadow-lg"
  >
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
    <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
    <p className="text-xs text-slate-400 pt-1">{hint}</p>
  </motion.div>
);

export default function Dashboard() {
  const [studyPlan, setStudyPlan] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState([]);

  const userName = localStorage.getItem("name") || "Learner";
  const streak = parseInt(localStorage.getItem("streak") || "0", 10);
  const today = new Date();

  const updateStreak = () => {
    const todayKey = new Date().toISOString().split("T")[0];
    const last = localStorage.getItem("lastCompletedDate");
    let nextStreak = parseInt(localStorage.getItem("streak") || "0", 10);

    if (last === todayKey) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    if (last === yesterdayKey) nextStreak += 1;
    else nextStreak = 1;

    localStorage.setItem("streak", String(nextStreak));
    localStorage.setItem("lastCompletedDate", todayKey);
  };

  const totalTasks = useMemo(() => studyPlan.reduce((acc, item) => acc + (item.tasks?.length || 0), 0), [studyPlan]);
  const progressPercent = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const completedCount = completedTasks.length;
  const remainingTasks = Math.max(totalTasks - completedCount, 0);
  const focusTopic = studyPlan[0]?.topic || studyPlan[0]?.title || "No active focus";
  const insightText = remainingTasks === 0
    ? "You are on track for today. Use AI Mentor for revision or move into practice."
    : `You have ${remainingTasks} task${remainingTasks > 1 ? "s" : ""} left today. Finish your most important item first.`;

  const averagePerformance = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, c) => acc + c.progress, 0) / chartData.length)
    : progressPercent;

  const updateTasksOnServer = async (tasks) => {
    await fetch(`${API_BASE_URL}/api/study/update-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ tasks }),
    });
  };

  const toggleTask = async (task) => {
    let updated;
    if (completedTasks.includes(task)) updated = completedTasks.filter((item) => item !== task);
    else updated = [...completedTasks, task];

    setCompletedTasks(updated);

    try {
      await updateTasksOnServer(updated);
    } catch (err) {
      console.error("Task update failed:", err);
      setError("Could not save task progress.");
    }

    const allTasks = studyPlan.reduce((acc, item) => acc + (item.tasks?.length || 0), 0);
    if (updated.length === allTasks && allTasks > 0) {
      setShowCongrats(true);
      updateStreak();
      setTimeout(() => setShowCongrats(false), 2500);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Study Plan
        const planRes = await fetch(`${API_BASE_URL}/api/study/latest`, { headers });
        const planData = await planRes.json();
        
        // Fetch Practice History for real chart
        const historyRes = await fetch(`${API_BASE_URL}/api/practice/history`, { headers });
        const historyData = await historyRes.json();

        // Process Plan
        if (planData.plan?.plan?.weeks) {
          const todayKey = new Date().toISOString().split("T")[0];
          const todayTasks = [];
          planData.plan.plan.weeks.forEach((week) => {
            week.topics.forEach((day) => { if (day.day === todayKey) todayTasks.push(day); });
          });
          setStudyPlan(todayTasks);
          setCompletedTasks(planData.plan.completedTasks || []);
        } else {
          setStudyPlan([]);
        }

        // Process History to real progress points over last 5 days
        const last5Days = Array.from({ length: 5 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (4 - i));
          return d.toISOString().split("T")[0];
        });

        const performanceByDay = {};
        last5Days.forEach(date => performanceByDay[date] = { score: 0, total: 0 });

        if (historyData.history) {
           historyData.history.forEach((attempt) => {
             const attemptDate = new Date(attempt.createdAt).toISOString().split("T")[0];
             if (performanceByDay[attemptDate]) {
               performanceByDay[attemptDate].score += attempt.score;
               performanceByDay[attemptDate].total += attempt.totalQuestions;
             }
           });
        }

        const realChartData = last5Days.map(dateStr => {
           const dayLabel = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(dateStr));
           const data = performanceByDay[dateStr];
           const progress = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
           return { day: dayLabel, progress };
        });

        const activeToday = realChartData[realChartData.length - 1];
        if (planData.plan?.completedTasks?.length && activeToday.progress === 0) {
           // If they did tasks but no practice today, give some credit on chart
           const totalP = planData.plan.plan.weeks.reduce((acc, w) => acc + w.topics.reduce((a, t) => a + t.tasks.length, 0), 0);
           const p = totalP ? Math.round((planData.plan.completedTasks.length / totalP) * 100) : 0;
           activeToday.progress = p; 
        }

        setChartData(realChartData);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Could not load your complete dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-md"
          >
            <FaCheckCircle size={16} /> All tasks completed for today. Great job!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-7xl px-5 pt-32">
        <div className="pointer-events-none absolute top-40 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-2xl"
        >
          <div className="grid gap-0 lg:grid-cols-[1.6fr_1fr]">
            <div className="p-8 md:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Overview</p>
              <h1 className="mt-3 text-3xl font-extrabold text-white md:text-5xl tracking-tight">
                Welcome back, {userName}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-400 md:text-base max-w-2xl">
                {formatLongDate(today)}. Review today's plan, track your progress,
                and continue with the next best action.
              </p>
            </div>

            <div className="border-t border-slate-800 bg-slate-900/50 p-8 lg:border-l lg:border-t-0 md:p-12">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80 mb-1.5">Focus area</p>
                  <p className="text-lg font-bold text-white">{focusTopic}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80 mb-1.5">Recommendation</p>
                  <p className="text-sm leading-relaxed text-slate-300">{insightText}</p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/practice"
                    className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-lg shadow-cyan-400/20"
                  >
                    Start Practice →
                  </Link>
                  <Link
                    to="/jarvis"
                    className="rounded-xl border border-slate-700 bg-slate-950/50 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-400 hover:text-white"
                  >
                    Ask Studymitra Voice
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Daily Progress" value={`${progressPercent}%`} hint={`${completedCount}/${totalTasks || 0} tasks done`} />
          <StatCard label="Current Streak" value={`${streak} Days`} hint="With at least one completed session" />
          <StatCard label="Tasks Remaining" value={`${remainingTasks}`} hint="Items left in today's active plan" />
          <StatCard label="Status" value={remainingTasks === 0 && totalTasks > 0 ? "Complete" : "Ongoing"} hint={remainingTasks === 0 && totalTasks > 0 ? "Plan finished!" : "Work still pending"} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-slate-800 bg-slate-900/40 backdrop-blur-md p-8"
          >
            <div className="flex flex-col gap-3 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">Today's plan</p>
                <h2 className="mt-2 text-2xl font-extrabold text-white">Task List</h2>
              </div>
              <p className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-xs font-semibold text-slate-300">
                {totalTasks === 0 ? "No tasks" : `${completedCount} / ${totalTasks} Completed`}
              </p>
            </div>

            {isLoading ? (
              <div className="mt-8 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 w-full rounded-2xl bg-slate-800/50 animate-pulse" />)}
              </div>
            ) : studyPlan.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-700 bg-slate-900/30 py-16 text-center">
                <span className="text-4xl">📝</span>
                <p className="mt-4 text-base font-bold text-white">No tasks planned for today</p>
                <p className="mt-2 text-sm text-slate-400 max-w-sm">
                  Continue with a practice quiz or use the AI Mentor to revise earlier topics.
                </p>
                <Link to="/study-plan" className="mt-6 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition">
                  Generate new study plan →
                </Link>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                {studyPlan.map((item, index) => (
                  <div key={`${item.day}-${index}`} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-slate-500">{formatShortDate(item.day)}</p>
                        <p className="text-sm font-bold text-slate-200 mt-1">{item.topic || item.title || "Study block"}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.tasks?.length || 0} tasks</span>
                    </div>

                    <div className="space-y-3">
                      {item.tasks?.map((task, taskIndex) => {
                        const done = completedTasks.includes(task);

                        return (
                          <button
                            key={`${task}-${taskIndex}`}
                            onClick={() => toggleTask(task)}
                            className={`flex w-full items-start gap-4 rounded-[1.25rem] border p-4 text-left transition-all ${
                              done
                                ? "border-emerald-500/20 bg-emerald-500/5 opacity-80"
                                : "border-slate-800 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-800"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {done ? (
                                <FaCheckCircle className="text-emerald-400" size={18} />
                              ) : (
                                <FaRegCircle className="text-slate-500 hover:text-cyan-400 transition" size={18} />
                              )}
                            </div>
                            <div>
                              <p className={`text-sm font-medium leading-relaxed ${done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                                {task}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-[2rem] border border-slate-800 bg-slate-900/40 backdrop-blur-md p-8"
            >
               <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400">Weekly trend</p>
                  <h3 className="mt-2 text-xl font-extrabold text-white">Progress overview</h3>
                </div>
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-400">{averagePerformance}% Avg</span>
              </div>

              <div className="h-56">
                {isLoading ? (
                   <div className="w-full h-full rounded-xl bg-slate-800/50 animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="4 4" />
                      <XAxis dataKey="day" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                      <Tooltip
                        cursor={{ stroke: '#334155', strokeWidth: 1 }}
                        contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                        formatter={(value) => [`${value}% Score`, "Accuracy Day"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#0f172a", stroke: "#22d3ee", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#22d3ee", stroke: "#0f172a" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[2rem] border border-slate-800 bg-slate-900/40 backdrop-blur-md p-8"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-6">Quick Actions</p>
              
              <div className="space-y-4">
                <Link to="/practice" className="group flex items-center justify-between rounded-[1.25rem] border border-slate-800 bg-slate-900/80 p-5 transition hover:border-slate-600 hover:bg-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400 text-lg">🎯</span>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition">Practice session</p>
                      <p className="text-xs text-slate-500 mt-0.5">Reinforce today's learning</p>
                    </div>
                  </div>
                  <FaArrowRight className="text-slate-600 group-hover:text-cyan-400 transition" />
                </Link>

                <Link to="/jarvis" className="group flex items-center justify-between rounded-[1.25rem] border border-slate-800 bg-slate-900/80 p-5 transition hover:border-slate-600 hover:bg-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-400/10 text-rose-400 text-lg">🎙️</span>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition">Studymitra Voice</p>
                      <p className="text-xs text-slate-500 mt-0.5">Hands-free AI assistance</p>
                    </div>
                  </div>
                  <FaArrowRight className="text-slate-600 group-hover:text-cyan-400 transition" />
                </Link>

                 <Link to="/ai-mentor" className="group flex items-center justify-between rounded-[1.25rem] border border-slate-800 bg-slate-900/80 p-5 transition hover:border-slate-600 hover:bg-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400/10 text-blue-400 text-lg">💬</span>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition">Ask AI text chat</p>
                      <p className="text-xs text-slate-500 mt-0.5">Detailed text explanations</p>
                    </div>
                  </div>
                  <FaArrowRight className="text-slate-600 group-hover:text-cyan-400 transition" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>

      <AICursor />
    </div>
  );
}
