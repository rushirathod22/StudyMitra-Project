import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RobotAssistant from "../components/RobotAssistant";
import AICursor from "../components/AICursor";

export default function Features() {
  const features = [
    {
      title: "AI Study Planner",
      desc: "Automatically creates daily and weekly study plans based on your goals, time availability, and performance.",
      icon: "📅",
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      border: "border-violet-400/30",
    },
    {
      title: "AI Mentor",
      desc: "Acts as a personal guide that explains concepts, answers doubts, and adjusts difficulty intelligently.",
      icon: "💡",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/30",
    },
    {
      title: "Smart Practice",
      desc: "Practice questions are generated and selected based on your weak areas and recent mistakes.",
      icon: "🎯",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/30",
    },
    {
      title: "Progress Analytics",
      desc: "Clear insights into consistency, improvement trends, and topic-level strengths and weaknesses.",
      icon: "📊",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/30",
    },
    {
      title: "Voice Assistant",
      desc: "Interact hands-free. Ask questions and get answers in natural language. (Supports English, Hindi, and Marathi)",
      icon: "🎙️",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/30",
    },
    {
      title: "Mistake Review",
      desc: "Detailed explanations of what went wrong and how to fix it, turning errors into learning opportunities.",
      icon: "🔍",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/30",
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative pt-36 pb-28 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>

        <motion.div
           initial={{ opacity: 0, y: 14 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="relative z-10 space-y-4 max-w-4xl mx-auto px-5"
        >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Core Capabilities</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Built Around an Intelligent <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Learning System</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm text-slate-400 leading-relaxed md:text-base">
                Studymitra uses AI to understand how you study, adapt plans in real time,
                and guide you toward better learning outcomes.
            </p>
        </motion.div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="pb-32 relative z-10">
        <div className="max-w-6xl mx-auto px-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 transition"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 border ${feature.border} mb-5 text-xl`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= AI LOGIC EXPLANATION ================= */}
      <section className="py-28 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-5 text-center">
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
            >
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">Under the hood</p>
                <h2 className="text-3xl font-extrabold text-white">
                    How the AI Actually Helps You
                </h2>
                <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Studymitra does not just give content. It observes, adapts, and improves
                    your study strategy over time.
                </p>
            </motion.div>

          <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
            {[
              "Understands your study habits and pace to prevent burnout.",
              "Identifies weak topics automatically through practice metrics.",
              "Adjusts plans and practice dynamically based on performance.",
            ].map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-violet-400/20 bg-slate-900/60 backdrop-blur-sm p-6"
              >
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  {point}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-28 text-center relative overflow-hidden">
         <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 space-y-6"
        >
            <h2 className="text-3xl font-extrabold text-white">
                Ready to Study Smarter?
            </h2>
            <p className="text-sm text-slate-400">
                Let AI plan, guide, and improve your learning.
            </p>
            <a href="/auth" className="inline-block mt-4 px-8 py-3.5 rounded-xl bg-cyan-400 text-slate-950 font-bold shadow-xl shadow-cyan-400/20 transition hover:bg-cyan-300">
                Get Started with Studymitra →
            </a>
        </motion.div>
      </section>

      <Footer />
      <RobotAssistant />
      <AICursor />
    </div>
  );
}
