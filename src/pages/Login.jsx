import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] animate-fade-in p-6">
      <div className="w-full max-w-md bg-[#111111] p-10 rounded-[40px] shadow-2xl border border-white/5 animate-slide-up">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-black via-zinc-800 to-zinc-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-6 shadow-2xl border border-white/10">
            A
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Welcome to AlgoTracker</h2>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Continue your technical journey.</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl mb-8 text-xs font-bold text-center uppercase tracking-widest">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-zinc-400 font-bold mb-2 ml-1 text-[10px] uppercase tracking-[0.2em]">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-black/40 border border-white/5 text-zinc-100 rounded-2xl focus:border-indigo-500/50 focus:bg-black/60 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-zinc-700 font-medium"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">Password</label>
            </div>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-black/40 border border-white/5 text-zinc-100 rounded-2xl focus:border-indigo-500/50 focus:bg-black/60 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-zinc-700 font-medium"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            disabled={loading} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl mt-4 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-500/20 tracking-widest uppercase text-xs"
            type="submit"
          >
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-zinc-500">
          Don't have an account? <Link to="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">Create one</Link>
        </div>
      </div>
    </div>
  );
}
