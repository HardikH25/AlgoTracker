import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, Layers, PlusCircle, Star } from "lucide-react";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Failed to log out", err);
    }
  }

  const navLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/topics", label: "Topics", icon: Layers },
    { to: "/log", label: "Log Problem", icon: PlusCircle },
    { to: "/starred", label: "Starred", icon: Star },
  ];

  // Mobile nav link styles
  const mobileNavItemClass = ({ isActive }) =>
    `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${isActive
      ? "bg-white text-black font-bold"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
    }`;

  return (
    <nav className="text-zinc-300 py-4 px-6 sm:px-8 sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl backdrop-saturate-150">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg flex items-center justify-center text-white font-black text-base group-hover:scale-105 transition-all duration-300 border border-white/[0.08] shadow-lg shadow-black/40">
            A
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            AlgoTracker
          </span>
        </Link>

        {currentUser ? (
          <>
            {/* ── Desktop: centered pill navbar ── */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1 bg-[#141414] rounded-full p-1.5 border border-white/[0.06] shadow-lg shadow-black/30">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `relative px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-300 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-white text-black font-semibold shadow-md"
                          : "text-zinc-500 hover:text-zinc-200"
                      }`
                    }
                  >
                    <link.icon size={14} />
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {/* Logout pill – distinct style like the "Contact" in reference */}
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-full bg-zinc-800 border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all text-[13px] font-medium flex items-center gap-2 shadow-lg shadow-black/20"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>

            {/* ── Mobile: hamburger ── */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-zinc-400 hover:text-white transition-colors z-50 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            {/* ── Mobile: fullscreen overlay ── */}
            <div className={`fixed inset-0 bg-[#050505] z-40 md:hidden transition-all duration-500 flex flex-col pt-24 px-6 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Navigation</p>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={mobileNavItemClass}
                    onClick={() => setIsMenuOpen(false)}
                    end={link.to === "/"}
                  >
                    <link.icon size={20} className="opacity-70" />
                    <span className="text-lg">{link.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto mb-10 pt-6 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-zinc-300 hover:text-white hover:border-white/[0.1] transition-all"
                >
                  <div className="p-3 bg-red-500/10 rounded-xl">
                    <LogOut size={20} className="text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Logout</p>
                    <p className="text-xs text-zinc-500">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link to="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
