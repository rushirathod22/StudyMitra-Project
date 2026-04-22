import { useEffect, useMemo, useRef, useState } from "react";
import StydyMitra from "../assets/studymitra.png"
import {
  FaBars,
  FaCheck,
  FaCopy,
  FaPaperPlane,
  FaPlus,
  FaTrash,
  FaVolumeUp,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import AICursor from "../components/AICursor";
import { API_BASE_URL } from "../config/api";
import { getUser } from "../utils/auth";

const ASSISTANT_LANGUAGES = [
  { label: "English", value: "en-US" },
  { label: "Hindi", value: "hi-IN" },
  { label: "Marathi", value: "mr-IN" },
];
const cleanCodeTheme = Object.fromEntries(
  Object.entries(oneDark).map(([key, value]) => [
    key,
    value?.style
      ? {
          ...value,
          style: {
            ...value.style,
            background: "transparent",
            backgroundColor: "transparent",
          },
        }
      : value,
  ])
);

const MODE_CONFIG = {
  explain: {
    label: "Explain",
    title: "Explain concepts clearly",
    description: "Ask a topic, code doubt, or concept and get a guided explanation.",
    placeholder: "Ask anything...",
    starters: [
      "Explain binary search in simple words",
      "Why is recursion useful in DSA?",
      "Give me a C++ example for linked list reversal",
    ],
  },
  quiz: {
    label: "Quiz",
    title: "Practice with quick quizzes",
    description: "Generate topic-based MCQs and revise with active recall.",
    placeholder: "Enter a topic for quiz mode...",
    starters: [
      "Make a quiz on stack and queue",
      "Test me on DBMS normalization",
      "Quiz me on JavaScript promises",
    ],
  },
  notes: {
    label: "Notes",
    title: "Create crisp notes",
    description: "Turn a topic into short points that are easier to revise later.",
    placeholder: "Ask for notes on any topic...",
    starters: [
      "Make notes on operating system scheduling",
      "Summarize REST API concepts",
      "Create notes for graph traversal",
    ],
  },
  revise: {
    label: "Revise",
    title: "Revise faster",
    description: "Get a short summary with key points before a test or interview.",
    placeholder: "Ask for a quick revision summary...",
    starters: [
      "Revise time complexity basics",
      "Quick revision of SQL joins",
      "Summarize trees before interview",
    ],
  },
};

const tryParseJsonLike = (value) => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = trimmed.slice(start, end + 1);

  try {
    return JSON.parse(candidate);
  } catch {
    try {
      const normalized = candidate
        .replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*?)'/g, ': "$1"');

      return JSON.parse(normalized);
    } catch {
      return null;
    }
  }
};

const parseAssistantContent = (content) => {
  if (content == null) return { type: "text", body: "" };
  if (typeof content === "object") return content;

  const parsed = tryParseJsonLike(content);
  if (parsed) return parsed;

  return { type: "text", body: content };
};

const normalizeText = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join("\n");
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
};

const getAnswerLabel = (answer, options = []) => {
  if (!answer) return "";

  const trimmed = String(answer).trim();
  const letterIndex = trimmed.toUpperCase().charCodeAt(0) - 65;

  if (trimmed.length === 1 && letterIndex >= 0 && letterIndex < options.length) {
    return `${trimmed.toUpperCase()}. ${options[letterIndex]}`;
  }

  const exactOption = options.find(
    (option) => option?.trim?.().toLowerCase() === trimmed.toLowerCase()
  );

  return exactOption || trimmed;
};

const detectCodeLanguage = (code = "") => {
  if (code.includes("#include") || code.includes("Node*") || code.includes("cout")) {
    return "cpp";
  }

  if (code.includes("def ") || code.includes("print(")) return "python";
  if (code.includes("function ") || code.includes("const ") || code.includes("=>")) {
    return "javascript";
  }

  return "text";
};

const splitCodeBlocks = (text) => {
  const value = normalizeText(text);
  const parts = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(value)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: value.slice(lastIndex, match.index).trim() });
    }

    parts.push({
      type: "code",
      language: match[1] || detectCodeLanguage(match[2]),
      content: match[2].trim(),
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < value.length) {
    parts.push({ type: "text", content: value.slice(lastIndex).trim() });
  }

  return parts.filter((part) => part.content);
};

const AssistantText = ({ text }) => {
  const segments = splitCodeBlocks(text);

  return (
    <div className="space-y-4">
      {segments.map((segment, index) =>
        segment.type === "code" ? (
          <div
            key={`code-${index}`}
            className="overflow-hidden rounded-xl bg-[#020617] border border-slate-800 my-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400">
              <span>{segment.language}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(segment.content)}
                className="rounded-md px-2 py-1 transition hover:bg-slate-800 hover:text-white"
              >
                Copy code
              </button>
            </div>
            <SyntaxHighlighter
              language={segment.language}
              style={cleanCodeTheme}
              customStyle={{
                margin: 0,
                background: "transparent",
                padding: "1rem",
                borderRadius: 0,
              }}
              codeTagProps={{
                style: {
                  background: "transparent",
                  textShadow: "none",
                  fontFamily: "'Fira Code', 'Consolas', monospace",
                },
              }}
            >
              {segment.content}
            </SyntaxHighlighter>
          </div>
        ) : (
          <p
            key={`text-${index}`}
            className="whitespace-pre-wrap leading-[1.7] text-slate-300"
          >
            {segment.content}
          </p>
        )
      )}
    </div>
  );
};

const AssistantMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const content = parseAssistantContent(message.content);
  const type = content.type || "text";
  const description =
    content.explanation || content.summary || content.body || content.message || "";
  
  const handleCopy = async () => {
    const copyText =
      typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content, null, 2);

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="py-4 w-full flex gap-4 text-slate-300 group">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-300 mt-0.5">
        SM
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold text-white">Study &#2350;&#2367;&#2340;&#2381;&#2352;</div>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg p-1.5 text-slate-500 opacity-0 transition hover:bg-slate-800 hover:text-slate-300 group-hover:opacity-100"
            title="Copy message"
          >
            {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
          </button>
        </div>

        {(type === "explain" || type === "text") && (
          <div className="space-y-4 text-[15px]">
            <AssistantText text={description} />

            {content.examples?.map((example, index) => (
              <div
                key={`${index}-${example.description || "example"}`}
                className="overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 my-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
                  <span>Example {index + 1}</span>
                  {example.code ? (
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(example.code)}
                      className="rounded-md px-2 py-1 transition hover:bg-slate-800 hover:text-white"
                    >
                      Copy
                    </button>
                  ) : null}
                </div>

                {example.description ? (
                  <div className="px-4 py-3 text-[15px] leading-7 text-slate-300 border-b border-slate-800">
                    {example.description}
                  </div>
                ) : null}

                {example.code ? (
                  <div className="bg-[#020617]">
                    <SyntaxHighlighter
                      language={detectCodeLanguage(example.code)}
                      style={cleanCodeTheme}
                      customStyle={{
                        margin: 0,
                        background: "transparent",
                        padding: "1rem",
                        borderRadius: 0,
                      }}
                      codeTagProps={{
                        style: {
                          background: "transparent",
                          textShadow: "none",
                          fontFamily: "'Fira Code', 'Consolas', monospace",
                        },
                      }}
                    >
                      {example.code}
                    </SyntaxHighlighter>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {type === "notes" && (
          <div className="space-y-3 text-[15px]">
            {description ? <AssistantText text={description} /> : null}
            <ul className="list-inside list-disc space-y-2 pt-2">
              {content.points?.map((point, index) => (
                <li key={`${point}-${index}`} className="leading-7 text-slate-300">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {type === "revise" && (
          <div className="space-y-4 text-[15px]">
            {description ? <AssistantText text={description} /> : null}
            {content.keyPoints?.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {content.keyPoints.map((point, index) => (
                  <div
                    key={`${point}-${index}`}
                    className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 leading-7 text-slate-300"
                  >
                    <div className="mb-1 text-xs font-semibold uppercase text-cyan-400">
                      Point {index + 1}
                    </div>
                    {point}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {type === "quiz" && (
          <div className="space-y-6 text-[15px]">
            {description ? <AssistantText text={description} /> : null}
            {content.questions?.map((question, index) => (
              <div
                key={`${question.question}-${index}`}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm"
              >
                <h4 className="font-medium text-white mb-4">
                  {index + 1}. {question.question}
                </h4>

                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => {
                    const answerLabel = getAnswerLabel(question.answer, question.options);
                    const isAnswer = answerLabel.endsWith(option) || answerLabel === option;
                    return (
                      <div
                        key={`${option}-${optionIndex}`}
                        className={`rounded-lg px-4 py-2.5 text-sm transition-colors ${
                          isAnswer
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-900 text-slate-300 border border-slate-800"
                        }`}
                      >
                        <span className="mr-3 text-slate-500 font-medium">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AIMentor() {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [mode, setMode] = useState("explain");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  const endRef = useRef(null);
  const token = localStorage.getItem("token");
  const userName = user?.name || getUser()?.name || "User";
  const currentMode = useMemo(() => MODE_CONFIG[mode], [mode]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    setError("");
    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      setInput((prev) => (prev ? `${prev} ${text}`.trim() : text));
    };

    recognition.onerror = () => {
      setError("Could not capture voice input. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const loadChats = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChatList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setError("Could not load chats.");
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const openChat = async (id) => {
    try {
      setError("");
      const res = await fetch(`${API_BASE_URL}/api/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
      setChatId(data._id);
      setSidebarOpen(false);
    } catch (err) {
      console.log(err);
      setError("Could not open chat.");
    }
  };

  const deleteChat = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setChatList((prev) => prev.filter((chat) => chat._id !== id));

      if (chatId === id) {
        setMessages([]);
        setChatId(null);
      }
    } catch (err) {
      console.log(err);
      setError("Could not delete chat.");
    }
  };

  const newChat = () => {
    setMessages([]);
    setChatId(null);
    setInput("");
    setError("");
  };

  const sendMessage = async (presetMessage) => {
    const messageText = (presetMessage ?? input).trim();
    if (!messageText || isThinking) return;

    setLastPrompt(messageText);
    setMessages((prev) => [...prev, { role: "user", content: messageText }]);
    setInput("");
    setError("");
    setIsThinking(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText, mode, chatId }),
      });

      const data = await res.json();

      setChatId(data.chatId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.data },
      ]);
      loadChats();
    } catch (err) {
      console.log(err);
      setError("AI response failed. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100 font-sans">
      <div className="flex h-full min-h-0 flex-1 overflow-hidden relative">
        {sidebarOpen ? (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-label="Close sidebar"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[260px] min-h-0 flex-col bg-[#08101f] transition-transform duration-200 lg:static lg:inset-auto lg:w-[260px] lg:translate-x-0 border-r border-slate-800/60 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex min-h-0 flex-1 flex-col p-3">
            <button
              type="button"
              onClick={newChat}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white transition hover:bg-slate-900/80"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shrink-0">
                  <FaPlus size={10} />
                </span>
                New chat
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-900/80"
            >
              <FaArrowLeft size={14} className="shrink-0" />
              Return to Dashboard
            </button>

            <div className="mt-8 px-3 text-xs font-semibold text-slate-500">
              Recent chats
            </div>

            <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
              {chatList.map((chat) => {
                const isActive = chatId === chat._id;

                return (
                  <div
                    key={chat._id}
                    onClick={() => openChat(chat._id)}
                    className={`group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition ${
                      isActive
                        ? "bg-slate-900/80 text-slate-100"
                        : "bg-transparent text-slate-300 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px]">
                        {chat.title || "New Chat"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteChat(chat._id);
                      }}
                      className={`p-1 text-slate-400 opacity-0 transition hover:text-rose-400 ${isActive ? "opacity-100" : "group-hover:opacity-100"}`}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-4 hover:bg-slate-900/50 cursor-default transition border-t border-slate-800/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-semibold flex-shrink-0">
              {userName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 font-medium text-sm text-slate-200 truncate">
              {userName}
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col relative w-full h-full lg:max-w-[calc(100vw-260px)]">
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-white"
            >
              <FaBars size={18} />
            </button>
            <div className="ml-2 font-medium text-lg text-white">
              AI Mentor
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 md:px-6 scroll-smooth pt-16 lg:pt-8 w-full">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-40">
              {messages.length === 0 ? (
                <section className="flex flex-col items-center justify-center mt-12 md:mt-32">
                  {/* <div className="h-16 w-16 bg-white shrink-0 rounded-full flex items-center justify-center mb-6">
                    <span className="text-black font-bold text-2xl tracking-tighter">AI</span>
                  </div> */}
                  <img src={StydyMitra} alt="logo " />
                  <img src="./" alt="" />
                  <h2 className="mb-8 text-3xl font-semibold text-white">
                    How can I help you today?
                  </h2>

                  <div className="grid w-full gap-3 md:grid-cols-2">
                    {currentMode.starters.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendMessage(prompt)}
                        className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-left text-[14px] text-slate-300 transition hover:border-slate-600 hover:bg-slate-900/80"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className="flex w-full">
                  {message.role === "user" ? (
                    <div className="ml-auto mt-2 mb-2 max-w-[80%] rounded-[24px] bg-slate-800 px-5 py-3 text-[15px] leading-6 text-slate-100">
                      {message.content}
                    </div>
                  ) : (
                    <AssistantMessage message={message} />
                  )}
                </div>
              ))}

              {isThinking ? (
                <div className="py-4 w-full flex gap-4 text-slate-300">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-300 mt-0.5 animate-pulse">
                    AI
                  </div>
                  <div className="text-[15px] text-slate-400 mt-1">
                    Thinking...
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="mx-auto mt-4 w-full max-w-lg rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <div ref={endRef} className="h-4" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950 pt-6 pb-6 lg:pb-8 px-4 md:px-6 w-full pointer-events-none">
            <div className="mx-auto w-full max-w-3xl relative pointer-events-auto">
              
              <div className="mb-2 flex items-center justify-between w-full">
                <div className="flex bg-slate-900/80 border border-slate-800 rounded-xl p-1 gap-1 flex-wrap shadow-sm">
                  {Object.entries(MODE_CONFIG).map(([value, config]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMode(value)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        mode === value
                          ? "bg-cyan-400/15 text-cyan-300 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
                
                <select
                  value={selectedLanguage}
                  onChange={(event) => setSelectedLanguage(event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 outline-none transition hover:border-slate-500 focus:border-cyan-400/50 appearance-none"
                  style={{ backgroundImage: 'none' }}
                >
                  {ASSISTANT_LANGUAGES.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label.substring(0,3).toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center rounded-[26px] bg-slate-900/80 border border-slate-800 px-2 shadow-sm flex-wrap w-full focus-within:border-slate-600 transition">
                <button
                  type="button"
                  onClick={startListening}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ml-1 mt-1 mb-1 ${
                    isListening
                      ? "bg-rose-500/20 text-rose-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  title="Use microphone"
                >
                  <FaVolumeUp size={16} />
                </button>

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
                  className="min-h-[52px] max-h-[200px] flex-1 resize-none bg-transparent px-3 py-4 text-[15px] leading-[24px] text-white outline-none placeholder:text-slate-500"
                  placeholder={currentMode.placeholder}
                />

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isThinking}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition mr-2 mt-1 mb-1 ${
                    !input.trim() || isThinking
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  }`}
                >
                  <FaPaperPlane size={13} className={input.trim() ? "ml-0.5" : ""} />
                </button>
              </div>

              <div className="mt-2 text-center text-xs text-slate-500">
                AI Mentor can make mistakes. Consider checking important information.
              </div>
            </div>
          </div>
        </main>
      </div>

      <AICursor />
    </div>
  );
}
