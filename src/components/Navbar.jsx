import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, Database, PlusCircle, RotateCw } from "lucide-react";

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

  const navItemClass = ({ isActive }) => 
    `transition-all duration-300 relative py-1 px-1 flex items-center gap-2 ${
      isActive 
        ? "text-white font-bold" 
        : "text-zinc-500 hover:text-zinc-300 font-medium"
    }`;

  const mobileNavItemClass = ({ isActive }) => 
    `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
      isActive 
        ? "bg-indigo-500/10 text-white font-bold border border-indigo-500/20" 
        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
    }`;

  const activeIndicator = ({ isActive }) => 
    isActive ? (
      <span className="absolute -bottom-1 left-1 right-1 h-0.5 bg-indigo-500 rounded-full animate-fade-in"></span>
    ) : null;

  const navLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/sheets", label: "Sheets", icon: Database },
    { to: "/log", label: "Log Problem", icon: PlusCircle },
    { to: "/revision", label: "Revision", icon: RotateCw },
  ];

  return (
    <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 text-zinc-300 py-4 px-6 sm:px-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="w-8 h-8 bg-gradient-to-br from-black via-zinc-800 to-zinc-600 rounded-lg flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10">
            A
          </div>
          <span className="text-xl font-black text-white tracking-tighter">
            AlgoTracker
          </span>
        </Link>
        
        {currentUser ? (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-8 items-center text-sm">
              <div className="flex gap-6 items-center">
                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={navItemClass}>
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {activeIndicator({ isActive })}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
              
              <button 
                onClick={handleLogout}
                className="px-6 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all ml-4 text-xs font-bold tracking-widest uppercase"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-zinc-400 hover:text-white transition-colors z-50 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Navigation Panel */}
            <div className={`fixed inset-0 bg-black/95 backdrop-blur-2xl z-40 md:hidden transition-all duration-500 flex flex-col pt-24 px-6 ${
              isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
            }`}>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-2">Navigation</p>
                {navLinks.map((link) => (
                  <NavLink 
                    key={link.to} 
                    to={link.to} 
                    className={mobileNavItemClass}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <link.icon size={20} className="opacity-70" />
                    <span className="text-lg">{link.label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto mb-10 pt-6 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-6 rounded-3xl bg-zinc-900/50 border border-white/5 text-zinc-300 hover:text-white hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl">
                      <LogOut size={20} className="text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Logout</p>
                      <p className="text-xs text-zinc-500">Sign out of your account</p>
                    </div>
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

