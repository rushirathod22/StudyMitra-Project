import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JarvisAssistant from "../components/JarvisAssistant";
import AICursor from "../components/AICursor";
import Robot3D from "../components/Robot3D";

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "Set Goals",
    desc: "Choose subjects and available study time",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/30",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI Plans",
    desc: "Creates a realistic and adaptive study schedule",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Study & Practice",
    desc: "Learn with guided explanations and AI quizzes",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Track Progress",
    desc: "See improvement and weak areas clearly",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
];

const STATS = [
  { num: "90%", label: "Consistency Improvement", color: "text-cyan-400" },
  { num: "3×", label: "Faster Revision", color: "text-violet-400" },
  { num: "24/7", label: "AI Availability", color: "text-emerald-400" },
  { num: "100%", label: "Personalized", color: "text-amber-400" },
];

const CAPABILITIES = [
  { title: "AI Mentor", desc: "Explains concepts in a way you understand", icon: "💡" },
  { title: "Smart Planner", desc: "Adapts daily plans based on performance", icon: "📋" },
  { title: "Insight Engine", desc: "Finds weak areas automatically", icon: "🔍" },
];

const USE_CASES = [
  { title: "Daily Study Routine", desc: "Build a consistent habit with AI-scheduled tasks aligned to your goals.", icon: "📚" },
  { title: "Exam Preparation", desc: "Get a focused revision plan with practice quizzes and key summaries.", icon: "🎯" },
  { title: "Improving Weak Topics", desc: "AI detects weak areas and generates targeted practice sessions.", icon: "💪" },
];

const FAQS = [
  ["Is Studymitra free?", "Yes, you can start completely free. All core features including AI Mentor, Practice, and Study Plans are available."],
  ["Does AI replace teachers?", "No. Studymitra supports your learning by being available 24/7 for explanations, revision, and practice—complementing your classroom education."],
  ["Can study plans adapt?", "Absolutely. As you complete tasks and practice sessions, the AI adjusts future plans to focus on areas that need more work."],
  ["Which languages are supported?", "Studymitra supports English, Hindi, and Marathi for voice interactions, making it accessible to a wider audience."],
];

export default function Landing() {
  return (
    <div className="bg-slate-950 text-slate-100 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen pt-28 flex items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute top-1/3 left-0 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200">
                Studymitra AI Ready
              </span>
            </div>

            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white">
              Study Smarter with <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Your AI Mentor
              </span>
            </h1>

            <p className="mt-6 text-base md:text-lg max-w-xl text-slate-400 leading-relaxed">
              Studymitra helps you plan studies, understand concepts,
              practice effectively, and track progress — now with support for
              <span className="text-cyan-400 font-medium"> English, Hindi & Marathi</span>.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/auth"
                className="rounded-xl bg-cyan-400 px-8 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-xl shadow-cyan-400/20"
              >
                Get Started →
              </Link>
              <Link
                to="/features"
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-8 py-3.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Explore Features
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Free to Use
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> AI Powered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> 3 Languages
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40"
          >
            <Robot3D />
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-28 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">How It Works</p>
            <h2 className="text-3xl font-extrabold text-white">How Studymitra Helps You Study</h2>
          </motion.div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 text-left transition"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.bg} border ${f.border} ${f.color} mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== USE CASES ===== */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">Use Cases</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">Designed for Real Study Sessions</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {USE_CASES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6"
              >
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI CAPABILITIES ===== */}
      <section className="py-28 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Intelligence</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">What Makes Studymitra Intelligent</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 group"
              >
                <span className="text-2xl">{cap.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-white">{cap.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ADAPTIVE FLOW ===== */}
      <section className="py-28">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Adaptive</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">How Learning Adapts Over Time</h2>
          </div>

          {["You start studying", "AI observes your pace", "Weak areas are detected", "Plans adapt automatically"].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`mb-6 flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div className="w-full md:w-2/3 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30 text-xs font-bold text-cyan-400">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-white">{step}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm py-8"
            >
              <p className={`text-4xl font-extrabold ${s.color}`}>{s.num}</p>
              <p className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-28">
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-400">FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">Questions Students Usually Ask</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map(([q, a], i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-semibold text-white list-none">
                  {q}
                  <svg className="w-4 h-4 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">{a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-28 bg-slate-900/30 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-extrabold text-white">Make Your Study Time More Effective</h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Let AI plan, guide, and improve your learning — in English, Hindi, or Marathi.
          </p>
          <Link
            to="/auth"
            className="inline-block rounded-xl bg-cyan-400 px-10 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-xl shadow-cyan-400/20"
          >
            Start Studying with AI →
          </Link>
        </motion.div>
      </section>

      <Footer />
      <JarvisAssistant />
      <AICursor />
    </div>
  );
}
