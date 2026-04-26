import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Robot3D from "../components/Robot3D";
import RobotAssistant from "../components/RobotAssistant";
import AICursor from "../components/AICursor";
import { saveAuth } from "../utils/auth";
import { API_BASE_URL } from "../config/api";

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "login" : "register";
      const payload = mode === "login" ? { email: formData.email, password: formData.password } : formData;

      const res = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : { message: "Invalid response" };

      if (!res.ok) throw new Error(data.message || "Authentication failed");

      if (mode === "login" && data.token) {
        saveAuth(data);
        navigate("/dashboard");
      } else if (mode === "signup" && !data.token) {
        setMode("login");
        setDirection(-1);
      } else if (data.token) {
        saveAuth(data);
        navigate("/dashboard");
      } else {
        throw new Error("Authentication failed");
      }
    } catch (err) {
      setError(err.message || "Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode, newDir) => {
    setError("");
    setDirection(newDir);
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section className="relative pt-28 pb-20 min-h-screen flex items-center">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left side text/robot */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="hidden md:block"
            >
              <div className="max-w-md">
                <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                    Studymitra Platform
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  Your AI-powered <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Study Companion</span>
                </h1>
                <p className="mt-6 text-slate-400 leading-relaxed text-sm lg:text-base">
                  Join thousands of students using AI to generate intelligent study plans,
                  practice efficiently, and grasp complex concepts.
                </p>
                <div className="mt-8 flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><FaCheckCircle className="text-emerald-400" /> Free forever</span>
                  <span className="flex items-center gap-1.5"><FaCheckCircle className="text-emerald-400" /> No credit card</span>
                </div>
              </div>
            </motion.div>

            {/* Right side form */}
            <div className="w-full max-w-md mx-auto xl:mr-10">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
                {/* Accent line top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={mode}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  >
                    <div className="text-center mb-8">
                       <h2 className="text-2xl font-bold text-white">
                        {mode === "login" ? "Welcome back" : "Create an account"}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {mode === "login" ? "Enter your details to access your dashboard" : "Sign up and start studying smarter today"}
                      </p>
                    </div>

                    {error && (
                      <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 text-center">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {mode === "signup" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-400 focus:bg-slate-950 placeholder:text-slate-600"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-400 focus:bg-slate-950 placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-400 focus:bg-slate-950 placeholder:text-slate-600"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 rounded-xl bg-cyan-400 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 shadow-lg shadow-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                      </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                      {mode === "login" ? (
                        <>
                          Don't have an account?{" "}
                          <button onClick={() => switchMode("signup", 1)} className="font-semibold text-cyan-400 transition hover:text-cyan-300">
                            Sign up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <button onClick={() => switchMode("login", -1)} className="font-semibold text-cyan-400 transition hover:text-cyan-300">
                            Sign in
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
      <RobotAssistant />
      <AICursor />
    </div>
  );
}

// Inline this purely to make the file compile since we couldn't import it cleanly in this specific environment, but let's keep standard imports where we can.
function FaCheckCircle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" {...props}>
      <path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm-1.8 14.8l-5-5 1.4-1.4 3.6 3.6 7.6-7.6 1.4 1.4z" />
    </svg>
  );
}
