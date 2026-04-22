import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import { getToken, getUser } from "../utils/auth";

const MODE_CONFIG = {
  explain: {
    label: "Explain",
    placeholder: "Ask Jarvis to explain a topic or concept...",
    prompts: [
      "Explain binary search in simple words",
      "What is React state?",
      "Teach me recursion with an example",
    ],
  },
  quiz: {
    label: "Quiz",
    placeholder: "Ask Jarvis to create a quick quiz...",
    prompts: [
      "Quiz me on DBMS normalization",
      "Ask me 3 questions on JavaScript",
      "Test me on linked lists",
    ],
  },
  notes: {
    label: "Notes",
    placeholder: "Ask Jarvis to make short notes...",
    prompts: [
      "Create notes for operating systems",
      "Summarize SQL joins",
      "Make quick notes on trees",
    ],
  },
  revise: {
    label: "Revise",
    placeholder: "Ask Jarvis for a fast revision...",
    prompts: [
      "Revise graph traversal",
      "Quick summary of OOP pillars",
      "Help me revise stack and queue",
    ],
  },
};

const fallbackResponses = {
  explain:
    "I can help explain concepts, break topics into smaller parts, and guide your study flow. Sign in to connect me to the full AI backend.",
  quiz:
    "I can create quick practice questions for you. Once you sign in, I will generate personalized quizzes and save your chat.",
  notes:
    "I can turn a topic into short revision notes. Log in to get live AI-generated notes inside Jarvis.",
  revise:
    "I can give you a compact revision summary before exams. Sign in to unlock the full Jarvis assistant.",
};

const normalizeAssistantText = (data) => {
  if (!data) return "Jarvis is ready.";
  if (typeof data === "string") return data;

  return (
    data.explanation ||
    data.summary ||
    data.body ||
    data.message ||
    (Array.isArray(data.points) ? data.points.join("\n") : "") ||
    (Array.isArray(data.keyPoints) ? data.keyPoints.join("\n") : "") ||
    (Array.isArray(data.questions)
      ? data.questions
          .map((question, index) => `${index + 1}. ${question.question}`)
          .join("\n")
      : "") ||
    "Jarvis is ready."
  );
};

export default function JarvisChatModal({ open, onClose, defaultMode = "explain" }) {
  const [mode, setMode] = useState(defaultMode);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");

  const endRef = useRef(null);
  const token = getToken();
  const user = getUser();
  const currentMode = useMemo(() => MODE_CONFIG[mode] || MODE_CONFIG.explain, [mode]);

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [defaultMode, open]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: token
            ? `Jarvis online. I can help with ${currentMode.label.toLowerCase()} mode right away.`
            : "Jarvis preview mode is active. Sign in to use the full AI-powered assistant.",
        },
      ]);
    }
  }, [currentMode.label, messages.length, open, token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  if (!open) return null;

  const sendMessage = async (preset) => {
    const messageText = (preset ?? input).trim();
    if (!messageText || isThinking) return;

    setMessages((prev) => [...prev, { role: "user", content: messageText }]);
    setInput("");
    setError("");
    setIsThinking(true);

    if (!token) {
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `${fallbackResponses[mode]}\n\nTry asking: "${messageText}" after login for a full response.`,
          },
        ]);
        setIsThinking(false);
      }, 650);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          mode,
          chatId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Jarvis could not answer right now.");
      }

      setChatId(data.chatId || null);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: normalizeAssistantText(data.data),
        },
      ]);
    } catch (sendError) {
      setError(sendError.message || "Jarvis could not answer right now.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-end bg-slate-950/45 p-3 backdrop-blur-sm md:p-6">
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Close Jarvis"
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-[82vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[32px] border border-cyan-300/15 bg-[radial-gradient(circle_at_top,#0f3b5c_0%,#07111f_32%,#030712_72%)] shadow-[0_35px_120px_rgba(8,145,178,0.25)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.18),transparent_25%)]" />

        <div className="relative flex items-start justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-start gap-4">
            <div className="jarvis-orb relative mt-1 flex h-14 w-14 items-center justify-center rounded-full">
              <div className="jarvis-core" />
              <div className="jarvis-pulse" />
              <div className="jarvis-grid" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.38em] text-cyan-200/70">
                AI Assistant
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-white">JARVIS</h3>
              <p className="mt-1 text-sm text-slate-300">
                {token
                  ? `Ready for ${user?.name || "you"} in ${currentMode.label} mode`
                  : "Preview mode. Login unlocks live AI replies."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="relative flex gap-2 overflow-x-auto px-5 py-4 scroll-hidden">
          {Object.entries(MODE_CONFIG).map(([value, config]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                mode === value
                  ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-100"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-cyan-300/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">
                Quick prompts
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentMode.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-left text-xs text-slate-200 transition hover:border-cyan-300/25 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-[24px] px-4 py-3 text-sm leading-7 ${
                      message.role === "user"
                        ? "bg-cyan-300 text-slate-950"
                        : "border border-white/10 bg-white/6 text-slate-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isThinking ? (
              <div className="flex justify-start">
                <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[22px] border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>

        <div className="relative border-t border-white/10 px-4 py-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.45)]">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                className="max-h-32 min-h-[56px] flex-1 resize-none bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder={currentMode.placeholder}
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isThinking}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>

            <p className="px-2 pt-1 text-[11px] text-slate-500">
              {token
                ? "Jarvis replies through your study AI backend."
                : "Sign in to turn preview mode into live AI assistance."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
