import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import AICursor from "../components/AICursor";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const MetricCard = ({ label, value, sub, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm px-6 py-5 text-center space-y-1"
  >
    <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
    <p className="text-sm font-semibold text-white">{label}</p>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </motion.div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-xl">
        {payload[0].name}: <span className="font-bold text-cyan-400">{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

export default function SessionSummary() {
  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("sessionSummary"));

  if (!data) return null;

  const accuracy = Math.round((data.score / data.total) * 100);
  const wrong = data.total - data.score;

  const pieData = [
    { name: "Correct", value: data.score },
    { name: "Wrong", value: wrong },
  ];

  const barData = [
    { name: "Accuracy", value: accuracy },
  ];

  const COLORS = ["#34d399", "#f43f5e"];

  const getAccuracyColor = () => {
    if (accuracy >= 80) return "text-emerald-400";
    if (accuracy >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getAccuracyLabel = () => {
    if (accuracy >= 80) return "Excellent Performance! 🏆";
    if (accuracy >= 60) return "Good Work! Keep Practicing 💪";
    if (accuracy >= 40) return "Keep Going! You're learning 📚";
    return "Need More Practice 🔁";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section className="pt-28 pb-24 max-w-3xl mx-auto px-5 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 mb-3">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Session Complete!</h1>
          <p className="text-slate-400 text-sm">
            Topic: <span className="text-cyan-400 font-semibold">{data.topic}</span> &bull; Level: <span className="text-slate-200 font-medium capitalize">{data.level}</span>
          </p>
          <p className={`text-base font-semibold ${getAccuracyColor()}`}>{getAccuracyLabel()}</p>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Accuracy" value={`${accuracy}%`} sub="Overall" color={getAccuracyColor()} />
          <MetricCard label="Correct" value={data.score} sub={`of ${data.total}`} color="text-emerald-400" />
          <MetricCard label="Wrong" value={wrong} sub={`of ${data.total}`} color="text-rose-400" />
          <MetricCard label="Total" value={data.total} sub="Questions" color="text-cyan-400" />
        </div>

        {/* Charts Row */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-1">Correct vs Wrong</h3>
            <p className="text-xs text-slate-500 mb-4">Answer distribution breakdown</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-5 mt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" />
                Correct ({data.score})
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
                Wrong ({wrong})
              </div>
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-1">Accuracy Overview</h3>
            <p className="text-xs text-slate-500 mb-4">Score as a percentage of total</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={48}>
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.05)" }} />
                  <Bar dataKey="value" fill="#22d3ee" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/mistakes"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-rose-500/50 bg-rose-500/8 px-6 py-3.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/15 hover:border-rose-500/70"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Review Mistakes
          </Link>

          <Link
            to="/practice"
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Practice Again
          </Link>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </motion.div>
      </section>

      <AICursor />
    </div>
  );
}
