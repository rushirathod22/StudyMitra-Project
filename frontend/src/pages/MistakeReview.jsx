import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import AICursor from "../components/AICursor";

export default function MistakeReview() {
  const mistakes = JSON.parse(localStorage.getItem("mistakes")) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section className="pt-28 pb-24 max-w-2xl mx-auto px-5 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          {mistakes.length === 0 ? (
            <>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-white">Perfect Score!</h1>
              <p className="text-slate-400 text-sm">You had no mistakes in this session. Incredible work! 🎉</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 mb-4">
                <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-white">Mistake Review</h1>
              <p className="text-slate-400 text-sm">
                {mistakes.length} mistake{mistakes.length > 1 ? "s" : ""} to review — learn from each one!
              </p>
            </>
          )}
        </motion.div>

        {/* Empty State Actions */}
        {mistakes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/practice"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-8 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Practice Again
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-8 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        )}

        {/* Mistakes List */}
        {mistakes.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence>
              {mistakes.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
                >
                  {/* Question number */}
                  <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-3 bg-slate-950/40">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-xs font-bold text-rose-400">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-white leading-snug">{q.question}</p>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Wrong answer */}
                    <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/8 px-4 py-3">
                      <svg className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-0.5">Your Answer</p>
                        <p className="text-sm text-rose-200">{q.userAnswer}</p>
                      </div>
                    </div>

                    {/* Correct answer */}
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3">
                      <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">Correct Answer</p>
                        <p className="text-sm text-emerald-200">{q.correct}</p>
                      </div>
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Explanation</p>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bottom Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              <Link
                to="/practice"
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Practice Again
              </Link>
              <Link
                to="/session-summary"
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Summary
              </Link>
            </motion.div>
          </div>
        )}
      </section>

      <AICursor />
    </div>
  );
}
