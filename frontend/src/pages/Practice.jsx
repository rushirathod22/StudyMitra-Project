import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AICursor from "../components/AICursor";
import { API_BASE_URL } from "../config/api";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", color: "text-emerald-400", border: "border-emerald-400/60", bg: "bg-emerald-400/10" },
  medium: { label: "Medium", color: "text-amber-400", border: "border-amber-400/60", bg: "bg-amber-400/10" },
  hard: { label: "Hard", color: "text-rose-400", border: "border-rose-400/60", bg: "bg-rose-400/10" },
};

export default function Practice() {
  const navigate = useNavigate();

  const [step, setStep] = useState("setup");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("easy");
  const [count, setCount] = useState(5);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);

  const current = questions[index];

  const startPractice = async () => {
    if (!topic.trim()) return;
    setStep("loading");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/practice/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    topic,
    difficulty: level.charAt(0).toUpperCase() + level.slice(1),
    count,
  }),
});

// ✅ Check response first
if (!res.ok) {
  const text = await res.text();
  console.error("Server Error:", text);
  throw new Error("API failed");
}

const data = await res.json();

      const data = await res.json();

      if (data.success && data.questions.length > 0) {
        const formatted = data.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correct: q.correctAnswer,
          explanation: q.explanation,
        }));
        setQuestions(formatted);
        setUserAnswers(new Array(formatted.length).fill(""));
        setStep("practice");
      } else {
        alert("Failed to generate questions.");
        setStep("setup");
      }
    } catch (error) {
      console.error("Practice error:", error);
      alert("Error connecting to server.");
      setStep("setup");
    }
  };

  const answer = (opt) => {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);

    setUserAnswers((prev) => {
      const nextAnswers = [...prev];
      nextAnswers[index] = opt;
      return nextAnswers;
    });

    if (opt === current.correct) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => [...prev, { ...current, userAnswer: opt }]);
    }
  };

  const next = async () => {
    setSelected(null);
    setShowResult(false);

    if (index + 1 === questions.length) {
      try {
        await fetch(`${API_BASE_URL}/api/practice/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            topic,
            difficulty: level.charAt(0).toUpperCase() + level.slice(1),
            questions: questions.map((q, i) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correct,
              userAnswer: userAnswers[i],
              explanation: q.explanation,
            })),
          }),
        });
      } catch (err) {
        console.log("Submit error:", err);
      }

      localStorage.setItem(
        "sessionSummary",
        JSON.stringify({
          topic,
          level,
          total: questions.length,
          score,
          accuracy: Math.round((score / questions.length) * 100),
        })
      );
      localStorage.setItem("mistakes", JSON.stringify(mistakes));
      navigate("/session-summary");
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const progress = questions.length > 0 ? ((index + (showResult ? 1 : 0)) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section className="pt-28 pb-24 max-w-2xl mx-auto px-5">

        {/* ===== SETUP ===== */}
        <AnimatePresence mode="wait">
          {step === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 mb-4">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white">Start Practice</h1>
                <p className="mt-2 text-sm text-slate-400">Configure your session and let AI generate a personalized quiz</p>
              </div>

              {/* Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-7 space-y-6">
                {/* Topic input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Topic</label>
                  <input
                    placeholder="e.g. Binary Trees, DBMS, React Hooks..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startPractice()}
                    className="w-full bg-slate-950/80 border border-slate-700 px-4 py-3 rounded-xl text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 text-sm"
                  />
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Difficulty</label>
                  <div className="flex gap-3">
                    {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setLevel(key)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                          level === key
                            ? `${cfg.border} ${cfg.bg} ${cfg.color}`
                            : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Questions</label>
                    <span className="text-sm font-bold text-cyan-400">{count}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>2</span><span>10</span>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={startPractice}
                  disabled={!topic.trim()}
                  className="w-full py-3.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Generate Practice Session →
                </button>
              </div>
            </motion.div>
          )}

          {/* ===== LOADING ===== */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full bg-cyan-400/10 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-white">AI Generating Questions</p>
                <p className="text-sm text-slate-400">Crafting personalized questions for <span className="text-cyan-400 font-medium">"{topic}"</span></p>
              </div>
            </motion.div>
          )}

          {/* ===== PRACTICE ===== */}
          {step === "practice" && current && (
            <motion.div
              key={`practice-${index}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Question <span className="text-white font-bold">{index + 1}</span> of {questions.length}
                  </span>
                  <span className="text-cyan-400 font-semibold">{Math.round(progress)}% done</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((index) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs text-slate-500">Score:</span>
                  <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">{score} correct</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_CONFIG[level].bg} ${DIFFICULTY_CONFIG[level].border} ${DIFFICULTY_CONFIG[level].color}`}>
                    {DIFFICULTY_CONFIG[level].label}
                  </span>
                </div>
              </div>

              {/* Question card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 space-y-5">
                <h2 className="text-lg font-semibold text-white leading-relaxed">{current.question}</h2>

                {/* Options */}
                <div className="space-y-2.5">
                  {current.options.map((opt, i) => {
                    let optClass = "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50";
                    if (showResult) {
                      if (opt === current.correct) {
                        optClass = "border-emerald-500/60 bg-emerald-500/10 text-emerald-300";
                      } else if (opt === selected) {
                        optClass = "border-rose-500/60 bg-rose-500/10 text-rose-300";
                      } else {
                        optClass = "border-slate-800 bg-slate-950/30 text-slate-500";
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => answer(opt)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left text-sm transition-all duration-200 ${optClass}`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold opacity-70">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                        <span className="ml-auto">
                          {showResult && opt === current.correct && (
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {showResult && opt === selected && opt !== current.correct && (
                            <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">AI Explanation</p>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{current.explanation}</p>
                      </div>

                      <button
                        onClick={next}
                        className="mt-4 w-full py-3 rounded-xl bg-white/5 border border-slate-700 text-white font-semibold text-sm transition hover:bg-white/10 hover:border-slate-500"
                      >
                        {index + 1 === questions.length ? "Finish & See Results →" : "Next Question →"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AICursor />
    </div>
  );
}
