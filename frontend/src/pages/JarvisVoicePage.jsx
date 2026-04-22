// import { useEffect, useMemo, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   FaMicrophone,
//   FaPaperPlane,
//   FaPause,
//   FaPlay,
//   FaVolumeUp,
// } from "react-icons/fa";
// import { useSearchParams } from "react-router-dom";
// import AICursor from "../components/AICursor";
// import Navbar from "../components/Navbar";
// import { API_BASE_URL } from "../config/api";

// const ASSISTANT_LANGUAGES = [
//   { label: "English", value: "en-US" },
//   { label: "Hindi", value: "hi-IN" },
//   { label: "Marathi", value: "mr-IN" },
// ];

// const MODE_CONFIG = {
//   explain: {
//     label: "Explain",
//     title: "Concept guidance",
//     description: "Jarvis breaks complex topics into simple steps.",
//     placeholder: "Ask Jarvis to explain a concept...",
//     starters: [
//       "Explain binary search in simple words",
//       "Why is recursion useful in DSA?",
//       "Explain React hooks with an example",
//     ],
//   },
//   quiz: {
//     label: "Quiz",
//     title: "Practice mode",
//     description: "Jarvis creates quick questions so you can test yourself fast.",
//     placeholder: "Ask Jarvis to make a quiz...",
//     starters: [
//       "Make a quiz on stack and queue",
//       "Test me on DBMS normalization",
//       "Quiz me on JavaScript promises",
//     ],
//   },
//   notes: {
//     label: "Notes",
//     title: "Smart notes",
//     description: "Turn lessons into short clean notes for revision.",
//     placeholder: "Ask Jarvis to create notes...",
//     starters: [
//       "Make notes on operating system scheduling",
//       "Summarize REST API concepts",
//       "Create notes for graph traversal",
//     ],
//   },
//   revise: {
//     label: "Revise",
//     title: "Fast revision",
//     description: "Get compact summaries before class, exams, or interviews.",
//     placeholder: "Ask Jarvis for a quick revision...",
//     starters: [
//       "Revise time complexity basics",
//       "Quick revision of SQL joins",
//       "Summarize trees before interview",
//     ],
//   },
// };

// const fallbackResponses = {
//   explain:
//     "Sign in to connect Jarvis with the live AI backend. I can still help you prepare your voice prompt here.",
//   quiz:
//     "Sign in and Jarvis will generate topic-based quizzes with the backend AI.",
//   notes:
//     "Sign in and Jarvis will turn your topic into compact notes instantly.",
//   revise:
//     "Sign in and Jarvis will generate fast revision summaries for your topic.",
// };

// const normalizeAssistantText = (content) => {
//   if (!content) return "Jarvis is ready.";
//   if (typeof content === "string") return content;
//   if (content.explanation) return content.explanation;
//   if (content.summary) return content.summary;
//   if (content.message) return content.message;
//   if (content.body) return content.body;
//   if (Array.isArray(content.points)) return content.points.join("\n");
//   if (Array.isArray(content.keyPoints)) return content.keyPoints.join("\n");
//   if (Array.isArray(content.questions)) {
//     return content.questions
//       .map((item, index) => `${index + 1}. ${item.question}`)
//       .join("\n");
//   }
//   return "Jarvis is ready.";
// };

// export default function JarvisVoicePage() {
//   const [searchParams] = useSearchParams();
//   const [mode, setMode] = useState("explain");
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [chatId, setChatId] = useState(null);
//   const [isThinking, setIsThinking] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [voiceAgentEnabled, setVoiceAgentEnabled] = useState(true);
//   const [selectedLanguage, setSelectedLanguage] = useState("en-US");
//   const [error, setError] = useState("");

//   const endRef = useRef(null);
//   const recognitionRef = useRef(null);
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user") || "null");
//   const currentMode = useMemo(() => MODE_CONFIG[mode], [mode]);
//   const latestAssistantMessage = [...messages]
//     .reverse()
//     .find((message) => message.role === "assistant");

//   useEffect(() => {
//     const requestedMode = searchParams.get("mode");
//     if (requestedMode && MODE_CONFIG[requestedMode]) {
//       setMode(requestedMode);
//     }
//   }, [searchParams]);

//   useEffect(() => {
//     if (messages.length === 0) {
//       setMessages([
//         {
//           role: "assistant",
//           content: token
//             ? `Jarvis online for ${user?.name || "you"}. Voice agent is ready in ${currentMode.label.toLowerCase()} mode.`
//             : "Jarvis page is ready. Sign in for live AI answers, or use the voice controls to prepare your prompt.",
//         },
//       ]);
//     }
//   }, [currentMode.label, messages.length, token, user?.name]);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isThinking]);

//   useEffect(() => {
//     return () => {
//       recognitionRef.current?.stop();
//       if (window.speechSynthesis) {
//         window.speechSynthesis.cancel();
//       }
//     };
//   }, []);

//   const speakText = (text) => {
//     if (!window.speechSynthesis || !text) return;

//     window.speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = selectedLanguage;
//     utterance.rate = 1;
//     utterance.pitch = 1;
//     utterance.onstart = () => setIsSpeaking(true);
//     utterance.onend = () => setIsSpeaking(false);
//     utterance.onerror = () => setIsSpeaking(false);
//     window.speechSynthesis.speak(utterance);
//   };

//   const stopSpeaking = () => {
//     if (window.speechSynthesis) {
//       window.speechSynthesis.cancel();
//     }
//     setIsSpeaking(false);
//   };

//   const startListening = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       setError("Voice input is not supported in this browser.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.lang = selectedLanguage;
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognitionRef.current = recognition;

//     setError("");
//     setIsListening(true);
//     recognition.start();

//     recognition.onresult = (event) => {
//       const transcript = event.results?.[0]?.[0]?.transcript || "";
//       setInput((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
//     };

//     recognition.onerror = () => {
//       setError("Could not capture voice input. Please try again.");
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };
//   };

//   const newChat = () => {
//     stopSpeaking();
//     setMessages([
//       {
//         role: "assistant",
//         content: token
//           ? `New Jarvis session started in ${currentMode.label.toLowerCase()} mode.`
//           : "New Jarvis preview session started. Sign in to connect the live AI backend.",
//       },
//     ]);
//     setChatId(null);
//     setInput("");
//     setError("");
//   };

//   const sendMessage = async (presetMessage) => {
//     const messageText = (presetMessage ?? input).trim();
//     if (!messageText || isThinking) return;

//     setMessages((prev) => [...prev, { role: "user", content: messageText }]);
//     setInput("");
//     setError("");
//     setIsThinking(true);

//     if (!token) {
//       window.setTimeout(() => {
//         const previewText = `${fallbackResponses[mode]}\n\nPrompt captured: ${messageText}`;
//         setMessages((prev) => [...prev, { role: "assistant", content: previewText }]);
//         if (voiceAgentEnabled) {
//           speakText(previewText);
//         }
//         setIsThinking(false);
//       }, 700);
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/ai/ask`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ message: messageText, mode, chatId }),
//       });

//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data?.message || "Jarvis could not answer right now.");
//       }

//       const normalizedReply = normalizeAssistantText(data.data);
//       setChatId(data.chatId || null);
//       setMessages((prev) => [...prev, { role: "assistant", content: normalizedReply }]);
//       if (voiceAgentEnabled) {
//         speakText(normalizedReply);
//       }
//     } catch (sendError) {
//       setError(sendError.message || "AI response failed. Please try again.");
//     } finally {
//       setIsThinking(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#020617] text-white">
//       <Navbar />
//       <div className="relative overflow-hidden px-4 pb-10 pt-28 md:px-8">
//         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.18),transparent_22%),radial-gradient(circle_at_85%_12%,rgba(34,211,238,0.14),transparent_18%),radial-gradient(circle_at_50%_55%,rgba(14,165,233,0.08),transparent_32%)]" />

//         <div className="relative mx-auto max-w-7xl">
//           <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
//             <section className="rounded-[36px] border border-cyan-300/12 bg-slate-950/70 p-6 shadow-[0_35px_120px_rgba(8,145,178,0.14)] backdrop-blur-xl md:p-8">
//               <p className="text-[11px] uppercase tracking-[0.42em] text-cyan-300/75">
//                 Voice AI Agent
//               </p>
//               <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
//                 <div>
//                   <h1 className="text-3xl font-semibold text-white md:text-5xl">JARVIS</h1>
//                   <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
//                     A dedicated voice-first AI page with a live circular core. Ask by typing or speaking, then let Jarvis answer back like an assistant.
//                   </p>
//                 </div>
//                 <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-100">
//                   {isListening
//                     ? "Listening"
//                     : isThinking
//                     ? "Thinking"
//                     : isSpeaking
//                     ? "Speaking"
//                     : "Ready"}
//                 </div>
//               </div>

//               <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
//                 <div className="flex flex-col items-center justify-center rounded-[32px] border border-cyan-300/10 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.14),rgba(2,6,23,0.04)_60%)] px-4 py-10">
//                   <div className="jarvis-agent-shell relative flex h-[280px] w-[280px] items-center justify-center rounded-full md:h-[340px] md:w-[340px]">
//                     {Array.from({ length: 12 }).map((_, index) => (
//                       <motion.span
//                         key={index}
//                         className="jarvis-spark absolute rounded-full bg-cyan-300"
//                         style={{ width: 8 + (index % 3) * 4, height: 8 + (index % 3) * 4 }}
//                         animate={{
//                           x: Math.cos((index / 12) * Math.PI * 2) * 140,
//                           y: Math.sin((index / 12) * Math.PI * 2) * 140,
//                           opacity: isListening || isThinking || isSpeaking ? [0.35, 1, 0.35] : [0.2, 0.65, 0.2],
//                           scale: isListening ? [0.9, 1.5, 0.9] : [0.8, 1.15, 0.8],
//                         }}
//                         transition={{ duration: 3 + index * 0.12, repeat: Infinity, ease: "easeInOut" }}
//                       />
//                     ))}

//                     <motion.div
//                       className="absolute inset-0 rounded-full border border-cyan-300/20"
//                       animate={{ rotate: 360, scale: isListening ? [1, 1.05, 1] : 1 }}
//                       transition={{
//                         rotate: { duration: 16, repeat: Infinity, ease: "linear" },
//                         scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
//                       }}
//                     />
//                     <motion.div
//                       className="absolute inset-[18px] rounded-full border border-cyan-300/25"
//                       animate={{ rotate: -360 }}
//                       transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
//                     />
//                     <motion.div
//                       className={`jarvis-orb relative flex h-44 w-44 items-center justify-center rounded-full md:h-52 md:w-52 ${isListening ? "jarvis-listening" : ""} ${isSpeaking ? "jarvis-speaking" : ""}`}
//                       animate={{ scale: isThinking ? [1, 1.06, 1] : isListening ? [1, 1.08, 1] : 1 }}
//                       transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
//                     >
//                       <div className="jarvis-core" />
//                       <div className="jarvis-pulse" />
//                       <div className="jarvis-grid" />
//                     </motion.div>
//                   </div>

//                   <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
//                     <button
//                       type="button"
//                       onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
//                       className={`flex items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition ${isListening ? "bg-rose-500 text-white" : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"}`}
//                     >
//                       <FaMicrophone size={14} />
//                       {isListening ? "Stop Mic" : "Start Mic"}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setVoiceAgentEnabled((value) => !value)}
//                       className={`flex items-center justify-center gap-3 rounded-full border px-5 py-3 text-sm font-semibold transition ${voiceAgentEnabled ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100" : "border-slate-700 bg-slate-900 text-slate-300"}`}
//                     >
//                       {voiceAgentEnabled ? <FaPause size={12} /> : <FaPlay size={12} />}
//                       Voice Agent {voiceAgentEnabled ? "On" : "Off"}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="rounded-[28px] border border-cyan-300/10 bg-white/5 p-5">
//                     <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">
//                       Active mode
//                     </p>
//                     <h2 className="mt-3 text-2xl font-semibold text-white">{currentMode.title}</h2>
//                     <p className="mt-2 text-sm leading-7 text-slate-300">{currentMode.description}</p>
//                     <div className="mt-5">
//                       <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
//                         Assistant language
//                       </p>
//                       <select
//                         value={selectedLanguage}
//                         onChange={(event) => setSelectedLanguage(event.target.value)}
//                         className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition hover:border-cyan-300/25 focus:border-cyan-300/40"
//                       >
//                         {ASSISTANT_LANGUAGES.map((language) => (
//                           <option key={language.value} value={language.value}>
//                             {language.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="mt-5 flex flex-wrap gap-2">
//                       {Object.entries(MODE_CONFIG).map(([value, config]) => (
//                         <button
//                           key={value}
//                           type="button"
//                           onClick={() => setMode(value)}
//                           className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition ${mode === value ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100" : "border-white/10 bg-slate-950/60 text-slate-400 hover:border-cyan-300/25 hover:text-slate-100"}`}
//                         >
//                           {config.label}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="grid gap-3 md:grid-cols-2">
//                     {currentMode.starters.map((prompt) => (
//                       <button
//                         key={prompt}
//                         type="button"
//                         onClick={() => sendMessage(prompt)}
//                         className="rounded-[24px] border border-white/10 bg-slate-950/65 px-4 py-4 text-left text-sm text-slate-200 transition hover:border-cyan-300/25 hover:text-white"
//                       >
//                         {prompt}
//                       </button>
//                     ))}
//                   </div>

//                   <div className="rounded-[28px] border border-white/10 bg-slate-950/65 p-5">
//                     <div className="flex flex-wrap items-center gap-3">
//                       <button
//                         type="button"
//                         onClick={newChat}
//                         className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/20"
//                       >
//                         New Session
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => latestAssistantMessage && speakText(latestAssistantMessage.content)}
//                         disabled={!latestAssistantMessage}
//                         className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-40"
//                       >
//                         Replay Reply
//                       </button>
//                       <button
//                         type="button"
//                         onClick={stopSpeaking}
//                         className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/20"
//                       >
//                         Stop Voice
//                       </button>
//                     </div>

//                     <div className="mt-4 grid gap-3 sm:grid-cols-3">
//                       <div className="rounded-[22px] border border-cyan-300/10 bg-white/5 px-4 py-3">
//                         <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">User</p>
//                         <p className="mt-2 text-sm text-white">{user?.name || "Guest"}</p>
//                       </div>
//                       <div className="rounded-[22px] border border-cyan-300/10 bg-white/5 px-4 py-3">
//                         <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Input</p>
//                         <p className="mt-2 text-sm text-white">
//                           {isListening ? "Voice capture live" : "Text or voice"}
//                         </p>
//                       </div>
//                       <div className="rounded-[22px] border border-cyan-300/10 bg-white/5 px-4 py-3">
//                         <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Output</p>
//                         <p className="mt-2 text-sm text-white">{voiceAgentEnabled ? "Voice + text" : "Text only"}</p>
//                       </div>
//                       <div className="rounded-[22px] border border-cyan-300/10 bg-white/5 px-4 py-3">
//                         <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Language</p>
//                         <p className="mt-2 text-sm text-white">
//                           {ASSISTANT_LANGUAGES.find((language) => language.value === selectedLanguage)?.label}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </section>

//             <section className="flex min-h-[760px] flex-col rounded-[36px] border border-cyan-300/12 bg-slate-950/70 shadow-[0_35px_120px_rgba(8,145,178,0.14)] backdrop-blur-xl">
//               <div className="border-b border-white/10 px-5 py-5">
//                 <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/70">
//                   Conversation Stream
//                 </p>
//                 <p className="mt-2 text-sm text-slate-300">
//                   Jarvis listens, thinks, and answers here.
//                 </p>
//               </div>

//               <div className="flex-1 overflow-y-auto px-5 py-5">
//                 <div className="space-y-4">
//                   {messages.map((message, index) => (
//                     <div
//                       key={`${message.role}-${index}`}
//                       className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
//                     >
//                       <div
//                         className={`max-w-[88%] rounded-[26px] px-4 py-4 text-sm leading-7 ${message.role === "user" ? "bg-cyan-300 text-slate-950" : "border border-white/10 bg-white/6 text-slate-100"}`}
//                       >
//                         <p className="whitespace-pre-wrap">{message.content}</p>
//                       </div>
//                     </div>
//                   ))}

//                   {isThinking ? (
//                     <div className="flex justify-start">
//                       <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200">
//                         Jarvis is processing your request...
//                       </div>
//                     </div>
//                   ) : null}

//                   {error ? (
//                     <div className="rounded-[22px] border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
//                       {error}
//                     </div>
//                   ) : null}

//                   <div ref={endRef} />
//                 </div>
//               </div>

//               <div className="border-t border-white/10 px-4 py-4">
//                 <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-3">
//                   <div className="flex items-end gap-3">
//                     <textarea
//                       value={input}
//                       onChange={(event) => setInput(event.target.value)}
//                       onKeyDown={(event) => {
//                         if (event.key === "Enter" && !event.shiftKey) {
//                           event.preventDefault();
//                           sendMessage();
//                         }
//                       }}
//                       rows={1}
//                       className="min-h-[58px] max-h-40 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-500"
//                       placeholder={currentMode.placeholder}
//                     />

//                     <button
//                       type="button"
//                       onClick={startListening}
//                       className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${isListening ? "border-rose-500 bg-rose-500 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/25"}`}
//                     >
//                       <FaMicrophone size={14} />
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => latestAssistantMessage && speakText(latestAssistantMessage.content)}
//                       disabled={!latestAssistantMessage}
//                       className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-300/25 disabled:cursor-not-allowed disabled:opacity-40"
//                     >
//                       <FaVolumeUp size={14} />
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => sendMessage()}
//                       disabled={!input.trim() || isThinking}
//                       className="flex h-12 items-center gap-2 rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
//                     >
//                       <FaPaperPlane size={14} />
//                       Send
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </div>
//         </div>
//       </div>

//       <AICursor />
//     </div>
//   );
// }
