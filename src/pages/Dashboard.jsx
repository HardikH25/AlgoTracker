import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import ProblemCard from "../components/ProblemCard";

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const { currentUser } = useAuth();



  // Load all problems from the database when the page opens
  useEffect(() => {
    async function fetchProblems() {
      if (!currentUser) return; // do nothing if no one is logged in
      try {
        setLoading(true);
        // Only fetch problems that belong to the current user
        const q = query(
          collection(db, "problems"),
          where("userId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort newest problems to the top
        data.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setProblems(data);
      } catch (err) {
        console.error("Error fetching:", err);
        setFetchError(err.message || "Failed to load problems. Check Firestore rules.");
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, [currentUser]);



  // Calculate summary numbers for the stat cards
  const stats = useMemo(() => {
    const total = problems.length;
    const solvedCount = problems.filter(p => p.isSolved).length;
    const successRate = total === 0 ? 0 : Math.round((solvedCount / total) * 100);

    const easyCount = problems.filter(p => p.difficulty === "Easy").length;
    const mediumCount = problems.filter(p => p.difficulty === "Medium").length;
    const hardCount = problems.filter(p => p.difficulty === "Hard").length;

    return { total, solvedCount, successRate, easyCount, mediumCount, hardCount };
  }, [problems]);

  // Find the 3 most-used tags across all problems
  const topTags = useMemo(() => {
    const counts = {};
    problems.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [problems]);



  // Show a spinner while problems are loading for the first time
  if (loading && problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-medium">Analyzing your progress...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Show an error banner if fetching from the database failed */}
      {fetchError && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-5 py-4 rounded-2xl mb-6 text-sm font-medium flex items-start gap-3">
          <span className="text-red-400 text-lg">⚠️</span>
          <div>
            <p className="font-bold text-red-200 mb-1">Failed to load your problems</p>
            <p className="opacity-80">{fetchError}</p>
            <p className="mt-2 opacity-60 text-xs">This is likely a Firestore security rules issue. Make sure read access is allowed for authenticated users.</p>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Dashboard</h1>
        <p className="text-zinc-500 font-medium">Welcome back, analyze your performance and keep pushing.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">

        {/* Solved / total with a circle progress ring */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#111] to-[#0c0c0c] p-8 rounded-3xl border border-white/[0.04] flex items-center gap-8 animate-slide-up group card-hover" style={{ animationDelay: '0.1s' }}>
          {/* Subtle top gradient line accent */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>

          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/[0.03]" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - stats.successRate / 100)}
                className="text-indigo-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{stats.successRate}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1.5 group-hover:text-zinc-400 transition-colors">Success Rate</h3>
            <p className="text-4xl font-black text-white flex items-baseline gap-1">
              {stats.solvedCount} <span className="text-xl text-zinc-700 font-bold">/ {stats.total}</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-bold mt-1.5 uppercase tracking-wide">Problems Solved</p>
          </div>
        </div>

        {/* Difficulty bar chart */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#111] to-[#0c0c0c] p-8 rounded-3xl border border-white/[0.04] md:col-span-2 animate-slide-up group card-hover" style={{ animationDelay: '0.2s' }}>
          {/* Subtle top gradient line accent */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

          <h3 className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-6 group-hover:text-zinc-400 transition-colors">Difficulty Distribution</h3>

          {/* Coloured bar split into Easy / Medium / Hard */}
          <div className="flex h-2.5 w-full rounded-full bg-white/[0.03] overflow-hidden mb-6">
            <div className="bg-emerald-400 h-full transition-all duration-1000 rounded-full" style={{ width: `${(stats.easyCount / stats.total) * 100 || 0}%` }}></div>
            <div className="bg-amber-400 h-full transition-all duration-1000 rounded-full mx-0.5" style={{ width: `${(stats.mediumCount / stats.total) * 100 || 0}%` }}></div>
            <div className="bg-red-400 h-full transition-all duration-1000 rounded-full" style={{ width: `${(stats.hardCount / stats.total) * 100 || 0}%` }}></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-transparent p-4 rounded-2xl border border-emerald-400/20 hover:bg-emerald-400/[0.02] transition-colors">
              <div className="text-emerald-400 font-black text-2xl mb-1">{stats.easyCount}</div>
              <div className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest">Easy</div>
            </div>
            <div className="bg-transparent p-4 rounded-2xl border border-amber-400/20 hover:bg-amber-400/[0.02] transition-colors">
              <div className="text-amber-400 font-black text-2xl mb-1">{stats.mediumCount}</div>
              <div className="text-[10px] text-amber-400/60 font-bold uppercase tracking-widest">Medium</div>
            </div>
            <div className="bg-transparent p-4 rounded-2xl border border-red-400/20 hover:bg-red-400/[0.02] transition-colors">
              <div className="text-red-400 font-black text-2xl mb-1">{stats.hardCount}</div>
              <div className="text-[10px] text-red-400/60 font-bold uppercase tracking-widest">Hard</div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
