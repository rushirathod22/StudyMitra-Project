import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import AICursor from "./AICursor";
import { motion } from "framer-motion";
import BrandLogo from "./BrandLogo";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Study Plan", path: "/study-plan" },
  { name: "AI Mentor", path: "/ai-mentor" },
  { name: "Practice", path: "/practice" },
  { name: "Progress", path: "/progress" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="fixed left-0 top-0 z-50 w-full">
      <div
        className={`w-full transition-all duration-300 ${
          scrolled ? "border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-2xl" : "bg-transparent py-2"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <BrandLogo imageClassName="w-[140px] md:w-[160px]" />

          <div className="hidden items-center gap-8 md:flex border border-slate-800/60 bg-slate-900/40 px-6 py-2.5 rounded-full backdrop-blur-md shadow-inner">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`relative text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400 hover:text-cyan-300"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute -bottom-3 left-1/2 h-[2px] w-full -translate-x-1/2 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    />
                  )}
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="rounded-full border border-slate-700 bg-slate-900/50 px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 transition-all hover:border-rose-500/50 hover:text-rose-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/auth"
                  className="text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:text-cyan-400"
                >
                  Log in
                </Link>

                <Link
                  to="/auth"
                  className="rounded-full bg-cyan-400 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-950 transition hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
       <AICursor/>
    </nav>
  );
}
