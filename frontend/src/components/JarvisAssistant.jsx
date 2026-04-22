import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const sparkles = [
  { id: 1, width: 10, height: 10, top: "8%", left: "18%", delay: 0 },
  { id: 2, width: 8, height: 8, top: "18%", right: "10%", delay: 0.7 },
  { id: 3, width: 12, height: 12, bottom: "16%", left: "12%", delay: 1.1 },
  { id: 4, width: 9, height: 9, bottom: "8%", right: "16%", delay: 0.35 },
  { id: 5, width: 6, height: 6, top: "48%", left: "-4%", delay: 1.5 },
  { id: 6, width: 7, height: 7, top: "42%", right: "-2%", delay: 0.9 },
];

const modes = [
  { value: "explain", label: "Explain" },
  { value: "quiz", label: "Quiz" },
  { value: "notes", label: "Notes" },
  { value: "revise", label: "Revise" },
];

export default function JarvisAssistant() {
  const [selectedMode, setSelectedMode] = useState("explain");
  const navigate = useNavigate();
  const currentLabel = useMemo(
    () => modes.find((mode) => mode.value === selectedMode)?.label || "Explain",
    [selectedMode]
  );

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] md:bottom-8 md:right-8">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto"
      >
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="mb-4 ml-auto max-w-[240px] rounded-[22px] border border-cyan-300/15 bg-slate-950/90 px-4 py-3 text-left shadow-[0_20px_80px_rgba(14,165,233,0.18)] backdrop-blur-xl"
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/75">
            Studymitra Online
          </p>
          <p className="mt-1 text-sm font-medium text-slate-100">
            Click the orb to open the full voice agent page.
          </p>
        </motion.div>

        <div className="flex justify-end">
          <div className="relative">
            {sparkles.map((sparkle) => (
              <motion.span
                key={sparkle.id}
                className="absolute rounded-full bg-cyan-300/80 shadow-[0_0_22px_rgba(103,232,249,0.95)]"
                style={{
                  width: sparkle.width,
                  height: sparkle.height,
                  top: sparkle.top,
                  bottom: sparkle.bottom,
                  left: sparkle.left,
                  right: sparkle.right,
                }}
                animate={{
                  opacity: [0.35, 1, 0.35],
                  scale: [0.85, 1.35, 0.85],
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: sparkle.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

            <motion.button
              type="button"
              onClick={() => navigate(`/jarvis-assistant?mode=${selectedMode}`)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/25 bg-slate-950/90 shadow-[0_30px_90px_rgba(34,211,238,0.28)] backdrop-blur-xl md:h-28 md:w-28"
              aria-label="Open Studymitra assistant"
            >
              <motion.span
                className="absolute inset-[-8px] rounded-full border border-cyan-300/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                className="absolute inset-[8px] rounded-full border border-cyan-400/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              />
              <div className="jarvis-orb relative flex h-16 w-16 items-center justify-center rounded-full md:h-20 md:w-20">
                <div className="jarvis-core" />
                <div className="jarvis-pulse" />
                <div className="jarvis-grid" />
              </div>
              <div className="absolute -bottom-2 left-1/2 w-[74px] -translate-x-1/2 rounded-full bg-cyan-400/25 px-3 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-100 opacity-0 transition duration-300 group-hover:opacity-100">
                {currentLabel}
              </div>
            </motion.button>
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setSelectedMode(mode.value)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                selectedMode === mode.value
                  ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                  : "border-slate-700/90 bg-slate-950/80 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
