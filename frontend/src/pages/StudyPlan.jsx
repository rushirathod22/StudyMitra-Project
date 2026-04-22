import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AICursor from "../components/AICursor";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config/api";

const ICONS = {
  subjects: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  goal: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  date: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  hours: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function StudyPlan() {
  const [form, setForm] = useState({
    subjects: "",
    goal: "",
    examDate: "",
    hours: "",
  });

  const planRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (plan && planRef.current) {
      planRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [plan]);

  const toggleWeek = (index) => {
    setExpandedWeeks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    setExpandedWeeks({});

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/study/generate-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: form.subjects,
          goal: form.goal,
          examDate: form.examDate,
          dailyHours: form.hours,
        }),
      });

      const data = await response.json();
      console.log("AI RESPONSE:", data);

      let parsedPlan;
      try {
        parsedPlan =
          typeof data.plan === "string" ? JSON.parse(data.plan) : data.plan;
      } catch (err) {
        console.error("Parse Error:", err);
        parsedPlan = null;
      }

      setPlan(parsedPlan);
      // Expand all weeks by default
      if (parsedPlan?.weeks) {
        const allExpanded = {};
        parsedPlan.weeks.forEach((_, i) => { allExpanded[i] = true; });
        setExpandedWeeks(allExpanded);
      }
    } catch (error) {
      console.error("ERROR:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = form.subjects.trim() && form.goal.trim() && form.examDate && form.hours.trim();

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ===== HEADER ===== */}
      <section className="pt-28 pb-10 max-w-3xl mx-auto px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 mb-2">
            <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            AI Study Plan Generator
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Tell the AI your subjects, goal, and available time. Get a personalized week-by-week study roadmap instantly.
          </p>
        </motion.div>
      </section>

      {/* ===== FORM ===== */}
      <section className="max-w-3xl mx-auto px-5 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-7 space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-5">
            {/* Subjects */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span className="text-cyan-400">{ICONS.subjects}</span>
                Subjects
              </label>
              <input
                name="subjects"
                placeholder="e.g. DBMS, Networks, OS..."
                value={form.subjects}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-700 px-4 py-3 rounded-xl text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 text-sm"
              />
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span className="text-violet-400">{ICONS.goal}</span>
                Goal
              </label>
              <input
                name="goal"
                placeholder="e.g. Score 90% in finals..."
                value={form.goal}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-700 px-4 py-3 rounded-xl text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/20 text-sm"
              />
            </div>

            {/* Exam Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span className="text-rose-400">{ICONS.date}</span>
                Exam Date
              </label>
              <input
                type="date"
                name="examDate"
                value={form.examDate}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-700 px-4 py-3 rounded-xl text-white outline-none transition focus:border-rose-400/60 focus:ring-1 focus:ring-rose-400/20 text-sm [color-scheme:dark]"
              />
            </div>

            {/* Daily Hours */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <span className="text-amber-400">{ICONS.hours}</span>
                  Daily Hours
                </label>
                <span className="text-sm font-bold text-amber-400">
                  {form.hours ? `${form.hours}h` : "–"}
                </span>
              </div>
              <input
                type="range"
                name="hours"
                min={1}
                max={12}
                value={form.hours || 1}
                onChange={handleChange}
                className="w-full accent-amber-400 h-1.5 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1h</span><span>12h</span>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={generatePlan}
            disabled={!isFormFilled || loading}
            className="w-full py-3.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "✨ Generate AI Study Plan"}
          </motion.button>
        </motion.div>
      </section>

      {/* ===== LOADING ===== */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="flex flex-col items-center justify-center gap-5 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full bg-violet-500/10 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-white">Building your plan...</p>
              <p className="text-sm text-slate-400">
                AI is crafting a roadmap for <span className="text-violet-400 font-medium">"{form.subjects}"</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PLAN DISPLAY ===== */}
      <AnimatePresence>
        {plan && (
          <motion.section
            ref={planRef}
            className="mt-4 max-w-3xl mx-auto px-5 pb-28"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Your AI-Generated Plan</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {plan?.weeks?.length} week{plan?.weeks?.length !== 1 ? "s" : ""} · {form.hours}h/day · {form.subjects}
                </p>
              </div>
              <button
                onClick={() => {
                  const allExpanded = {};
                  const allOpen = !Object.values(expandedWeeks).every(Boolean);
                  plan.weeks?.forEach((_, i) => { allExpanded[i] = allOpen; });
                  setExpandedWeeks(allExpanded);
                }}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                {Object.values(expandedWeeks).every(Boolean) ? "Collapse All" : "Expand All"}
              </button>
            </div>

            <div className="space-y-4">
              {plan?.weeks?.map((week, wIndex) => (
                <motion.div
                  key={wIndex}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: wIndex * 0.06 }}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
                >
                  {/* Week header */}
                  <button
                    onClick={() => toggleWeek(wIndex)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-bold text-violet-400">
                        W{wIndex + 1}
                      </div>
                      <h3 className="text-base font-semibold text-white">{week.week}</h3>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedWeeks[wIndex] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </button>

                  {/* Days */}
                  <AnimatePresence initial={false}>
                    {expandedWeeks[wIndex] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-3 border-t border-slate-800 pt-4">
                          {week.topics?.map((day, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-4"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-xs font-bold text-cyan-400">
                                  {day.day}
                                </span>
                                <p className="text-sm font-semibold text-white">{day.topic}</p>
                              </div>

                              <ul className="space-y-1.5 pl-1">
                                {day.tasks?.map((task, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2.5 text-sm text-slate-300 leading-snug"
                                  >
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Footer action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex justify-center"
            >
              <button
                onClick={() => { setPlan(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate New Plan
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <AICursor />
    </div>
  );
}
