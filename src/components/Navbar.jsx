import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  }

  const navItemClass = ({ isActive }) => 
    `transition-all duration-300 relative py-1 px-1 ${
      isActive 
        ? "text-white font-bold" 
        : "text-zinc-500 hover:text-zinc-300 font-medium"
    }`;

  const activeIndicator = ({ isActive }) => 
    isActive ? (
      <span className="absolute -bottom-1 left-1 right-1 h-0.5 bg-indigo-500 rounded-full animate-fade-in"></span>
    ) : null;

  return (
    <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 text-zinc-300 py-4 px-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-black via-zinc-800 to-zinc-600 rounded-lg flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10">
            A
          </div>
          <span className="text-xl font-black text-white tracking-tighter">
            AlgoTracker
          </span>
        </Link>
        
        {currentUser ? (
          <div className="flex gap-8 items-center text-sm">
            <div className="hidden sm:flex gap-6 items-center">
              <NavLink to="/" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    Dashboard
                    {activeIndicator({ isActive })}
                  </>
                )}
              </NavLink>
              <NavLink to="/sheets" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    Sheets
                    {activeIndicator({ isActive })}
                  </>
                )}
              </NavLink>
              <NavLink to="/log" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    Log Problem
                    {activeIndicator({ isActive })}
                  </>
                )}
              </NavLink>
              <NavLink to="/revision" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    Revision
                    {activeIndicator({ isActive })}
                  </>
                )}
              </NavLink>
            </div>
            
            <button 
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all ml-4 text-xs font-bold tracking-widest uppercase"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
