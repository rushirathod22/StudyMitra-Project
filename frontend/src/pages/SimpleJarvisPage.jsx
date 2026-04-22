import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaStop, FaVolumeUp, FaTimes } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import AICursor from "../components/AICursor";
import { API_BASE_URL } from "../config/api";

const MODE_CONFIG = {
  explain: { label: "Explain", icon: "💡", description: "Get clear explanations" },
  quiz:    { label: "Quiz",    icon: "🎯", description: "Practice with questions" },
  notes:   { label: "Notes",  icon: "📝", description: "Generate study notes" },
  revise:  { label: "Revise", icon: "🔁", description: "Quick revision summaries" },
};

const normalizeAssistantText = (content) => {
  if (!content) return "Studymitra is ready.";
  if (typeof content === "string") return content;
  if (content.explanation) return content.explanation;
  if (content.summary) return content.summary;
  if (content.message) return content.message;
  if (content.body) return content.body;
  if (Array.isArray(content.points)) return content.points.join("\n");
  if (Array.isArray(content.keyPoints)) return content.keyPoints.join("\n");
  if (Array.isArray(content.questions)) {
    return content.questions.map((item, index) => `${index + 1}. ${item.question}`).join("\n");
  }
  return "Studymitra is ready.";
};

const STATUS_CONFIG = {
  listening: {
    label: "Listening",
    color: "text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]",
    copy: "I'm listening carefully — finish speaking and I'll respond.",
  },
  thinking: {
    label: "Processing",
    color: "text-amber-400",
    dot: "bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.9)]",
    copy: "Analyzing your question and crafting the best answer for you.",
  },
  speaking: {
    label: "Speaking",
    color: "text-cyan-400",
    dot: "bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)]",
    copy: "I'm speaking back to you now. Listen carefully!",
  },
  ready: {
    label: "Ready",
    color: "text-slate-400",
    dot: "bg-slate-500",
    copy: "Tap the voice button to start hands-free learning.",
  },
};

export default function SimpleJarvisPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState("explain");
  const [transcript, setTranscript] = useState("");
  const [output, setOutput] = useState("Hello, I am Studymitra. Tap the voice button and talk to me.");
  const [chatId, setChatId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [hoverStars, setHoverStars] = useState([]);
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  const recognitionRef = useRef(null);
  const orbShellRef = useRef(null);
  const hoverStarIdRef = useRef(0);
  const lastSparkTimeRef = useRef(0);
  const token = localStorage.getItem("token");
  const currentMode = useMemo(() => MODE_CONFIG[mode], [mode]);

  const statusKey = isListening ? "listening" : isThinking ? "thinking" : isSpeaking ? "speaking" : "ready";
  const status = STATUS_CONFIG[statusKey];

  const groupedVoices = useMemo(() => {
    const preferred = availableVoices.filter((v) => {
      const lbl = `${v.name} ${v.lang}`.toLowerCase();
      return (
        lbl.includes("google us english") ||
        lbl.includes("google uk english female") ||
        lbl.includes("microsoft zira") ||
        lbl.includes("microsoft david") ||
        v.lang.toLowerCase().startsWith("en") ||
        v.lang.toLowerCase().startsWith("hi") ||
        v.lang.toLowerCase().startsWith("mr")
      );
    });
    return preferred.length ? preferred : availableVoices;
  }, [availableVoices]);

  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode && MODE_CONFIG[requestedMode]) setMode(requestedMode);
  }, [searchParams]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices?.() || [];
      setAvailableVoices(voices);
      if (!voices.length || selectedVoice) return;
      const preferred =
        voices.find((v) => v.lang.toLowerCase().startsWith("mr")) ||
        voices.find((v) => v.name.includes("Google UK English Female")) ||
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("Microsoft Zira")) ||
        voices.find((v) => v.name.includes("Microsoft David")) ||
        voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
        voices[0];
      if (preferred) setSelectedVoice(preferred.name);
    };
    loadVoices();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      recognitionRef.current?.stop();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  const speakText = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = availableVoices.find((v) => v.name === selectedVoice) || groupedVoices[0];
    if (voice) { utter.voice = voice; utter.lang = voice.lang; }
    utter.rate = 1;
    utter.pitch = 1;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Voice input is not supported in this browser."); return; }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    setError("");
    setIsListening(true);
    recognition.start();
    recognition.onresult = (e) => setTranscript(e.results?.[0]?.[0]?.transcript || "");
    recognition.onerror = () => { setError("Could not capture voice input. Please try again."); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
  };

  const askJarvis = async (voicePrompt) => {
    const messageText = (voicePrompt ?? transcript).trim();
    if (!messageText || isThinking) return;
    setError("");
    setIsThinking(true);
    if (!token) {
      setOutput(`Sign in to connect Studymitra with the live AI backend.\n\nYou asked: ${messageText}`);
      setIsThinking(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: messageText, mode, chatId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Studymitra could not answer right now.");
      const reply = normalizeAssistantText(data.data);
      setChatId(data.chatId || null);
      setOutput(reply);
      speakText(reply);
    } catch (err) {
      setError(err.message || "AI response failed. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    if (!isListening && transcript.trim()) askJarvis(transcript);
  }, [isListening]);

  const spawnHoverStar = (e) => {
    const bounds = orbShellRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const now = Date.now();
    if (now - lastSparkTimeRef.current < 45) return;
    lastSparkTimeRef.current = now;
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const id = hoverStarIdRef.current++;
    const size = 4 + Math.random() * 8;
    const driftX = (Math.random() - 0.5) * 42;
    const driftY = -18 - Math.random() * 26;
    setHoverStars((cur) => [...cur.slice(-15), { id, x, y, size, driftX, driftY, duration: 0.8 + Math.random() * 0.5 }]);
    window.setTimeout(() => setHoverStars((cur) => cur.filter((s) => s.id !== id)), 1300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient glow background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-600/5 blur-[100px]" />
      </div>

      {/* Minimal nav bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Studymitra Voice</span>
        </div>

        <button
          onClick={() => setShowVoicePanel((p) => !p)}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          <FaVolumeUp size={12} />
          Voice Settings
        </button>
      </header>

      {/* Voice panel slide-in */}
      <AnimatePresence>
        {showVoicePanel && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 h-full w-[300px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Voice Settings</h3>
              <button onClick={() => setShowVoicePanel(false)} className="text-slate-400 hover:text-white transition">
                <FaTimes size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/60"
                >
                  {groupedVoices.length > 0 ? (
                    groupedVoices.map((v) => (
                      <option key={`${v.name}-${v.lang}`} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))
                  ) : (
                    <option value="">No browser voices found</option>
                  )}
                </select>
                <p className="text-xs text-slate-500">Supports English, Hindi, and Marathi voices</p>
              </div>

              <button
                onClick={() => speakText("Hello! I am Studymitra. How can I help you today?")}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Test Voice
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center px-4 pt-24 pb-20">

        {/* Mode selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mt-4"
        >
          {Object.entries(MODE_CONFIG).map(([value, cfg]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
                mode === value
                  ? "bg-cyan-400/15 border border-cyan-400/50 text-cyan-200"
                  : "border border-slate-700/80 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              <span>{cfg.icon}</span>
              {cfg.label}
            </button>
          ))}
        </motion.div>

        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${status.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-[0.3em] ${status.color}`}>{status.label}</span>
          </div>
          <p className="text-xs text-slate-500 text-center max-w-xs">{status.copy}</p>
        </motion.div>

        {/* ORB */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 16 }}
          className="mt-8 flex justify-center"
        >
          <div
            ref={orbShellRef}
            className="jarvis-agent-shell relative flex h-[280px] w-[280px] items-center justify-center rounded-full md:h-[320px] md:w-[320px]"
            onMouseMove={spawnHoverStar}
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="jarvis-spark absolute rounded-full bg-cyan-300"
                style={{ width: 8 + (i % 3) * 4, height: 8 + (i % 3) * 4 }}
                animate={{
                  x: Math.cos((i / 14) * Math.PI * 2) * 138,
                  y: Math.sin((i / 14) * Math.PI * 2) * 138,
                  opacity: isListening || isThinking || isSpeaking ? [0.3, 1, 0.3] : [0.2, 0.7, 0.2],
                  scale: isListening ? [0.9, 1.6, 0.9] : [0.9, 1.15, 0.9],
                }}
                transition={{ duration: 3.4 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            {hoverStars.map((star) => (
              <motion.span
                key={star.id}
                className="jarvis-hover-star absolute"
                style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
                initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.5 }}
                animate={{
                  x: `calc(-50% + ${star.driftX}px)`,
                  y: `calc(-50% + ${star.driftY}px)`,
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.1, 0.2],
                  rotate: [0, 45, 90],
                }}
                transition={{ duration: star.duration, ease: "easeOut" }}
              />
            ))}

            <motion.div className="absolute inset-0 rounded-full border border-cyan-300/20" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-[22px] rounded-full border border-cyan-300/25" animate={{ rotate: -360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} />

            <motion.div
              className={`jarvis-orb relative flex h-44 w-44 items-center justify-center rounded-full md:h-52 md:w-52 ${isListening ? "jarvis-listening" : ""} ${isSpeaking ? "jarvis-speaking" : ""} ${isThinking ? "jarvis-thinking" : ""}`}
              animate={{ scale: isThinking ? [1, 1.06, 1] : isListening ? [1, 1.09, 1] : [1, 1.03, 1] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="jarvis-aura" />
              <div className="jarvis-halo" />
              <div className="jarvis-sheen" />
              <div className="jarvis-core" />
              <div className="jarvis-pulse" />
              <div className="jarvis-grid" />
              <div className="jarvis-inner-ring" />
              <div className="jarvis-orbit jarvis-orbit-one">
                <span className="jarvis-orbit-dot" />
                <span className="jarvis-orbit-dot jarvis-orbit-dot-soft" />
              </div>
              <div className="jarvis-orbit jarvis-orbit-two">
                <span className="jarvis-orbit-dot jarvis-orbit-dot-bright" />
              </div>
              {(isListening || isSpeaking || isThinking) && (
                <div className="jarvis-bars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="jarvis-bar" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Main CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <motion.button
            type="button"
            onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`flex min-w-[220px] items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-bold tracking-wide shadow-xl transition ${
              isListening
                ? "bg-rose-500 text-white shadow-rose-500/30"
                : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-400/20"
            }`}
          >
            {isListening ? <FaStop size={13} /> : <FaMicrophone size={13} />}
            {isListening ? "Stop Listening" : "Talk To Studymitra"}
          </motion.button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => speakText(output)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-slate-300 transition hover:border-slate-500 hover:text-white"
              title="Replay response"
            >
              <FaVolumeUp size={13} />
            </button>
            <button
              type="button"
              onClick={stopSpeaking}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Stop Voice
            </button>
          </div>
        </motion.div>

        {/* Transcript + Output panels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 w-full max-w-3xl space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {/* You Said */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">You said</p>
              </div>
              <p className="min-h-[72px] whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {transcript || (
                  <span className="text-slate-500 italic">Your voice transcript will appear here after you speak...</span>
                )}
              </p>
            </div>

            {/* AI Response */}
            <div className="rounded-2xl border border-cyan-400/15 bg-slate-900/60 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-1.5 w-1.5 rounded-full transition-all ${isSpeaking ? "bg-cyan-400" : "bg-slate-600"}`} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/70">Studymitra</p>
              </div>
              {isThinking ? (
                <div className="flex items-center gap-2 min-h-[72px]">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-cyan-400"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              ) : (
                <p className="min-h-[72px] whitespace-pre-wrap text-sm leading-7 text-slate-100">{output}</p>
              )}
            </div>
          </div>

          {/* How to use tips */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-3">How to use</p>
            <div className="grid gap-2 sm:grid-cols-3 text-xs text-slate-400 leading-5">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">01.</span>
                Pick a mode above for the type of help you need.
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">02.</span>
                Tap <span className="text-white font-medium mx-1">Talk To Studymitra</span> and speak naturally.
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">03.</span>
                Studymitra listens, thinks, and speaks back with the answer.
              </div>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AICursor />
    </div>
  );
}
