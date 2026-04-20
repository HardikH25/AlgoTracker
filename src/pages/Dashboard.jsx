import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import ProblemCard from "../components/ProblemCard";

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSheet, setFilterSheet] = useState("All");

  //fetchhing on mounting
  useEffect(() => {
    async function fetchProblems() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, "problems"),
          where("userId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        data.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setProblems(data);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, [currentUser]);

  const handleDelete = useCallback(async (problemId) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      try {
        await deleteDoc(doc(db, "problems", problemId));
        setProblems(prev => prev.filter(p => p.id !== problemId));
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete problem.");
      }
    }
  }, []);

  //stats
  const stats = useMemo(() => {
    const total = problems.length;
    const solvedCount = problems.filter(p => p.isSolved).length;
    const successRate = total === 0 ? 0 : Math.round((solvedCount / total) * 100);

    const easyCount = problems.filter(p => p.difficulty === "Easy").length;
    const mediumCount = problems.filter(p => p.difficulty === "Medium").length;
    const hardCount = problems.filter(p => p.difficulty === "Hard").length;

    return { total, solvedCount, successRate, easyCount, mediumCount, hardCount };
  }, [problems]);

  //unique sheet for filter
  const uniqueSheets = useMemo(() => {
    const sheets = new Set(problems.map(p => p.sheet).filter(s => s && s !== "None"));
    return Array.from(sheets).sort();
  }, [problems]);

  const displayedProblems = useMemo(() => {
    return problems.filter(p => {
      const matchTitle = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDifficulty = filterDifficulty === "All" || p.difficulty === filterDifficulty;

      let matchStatus = true;
      if (filterStatus === "Solved") matchStatus = p.isSolved === true;
      else if (filterStatus === "Attempted") matchStatus = p.isSolved === false;

      const matchSheet = filterSheet === "All" || p.sheet === filterSheet;

      return matchTitle && matchDifficulty && matchStatus && matchSheet;
    });
  }, [problems, searchTerm, filterDifficulty, filterStatus, filterSheet]);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-zinc-500 font-medium">Welcome back, analyze your performance and keep pushing.</p>
        </div>
      </div>

      {/* stats*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 flex items-center gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
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
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Success Rate</h3>
            <p className="text-3xl font-black text-white">{stats.solvedCount} <span className="text-lg text-zinc-600 font-medium">/ {stats.total}</span></p>
            <p className="text-xs text-[#4C9C62] font-semibold mt-1">Problems Solved</p>
          </div>
        </div>

        {/* difficulty bar*/}
        <div className="bg-[#111111] p-8 rounded-3xl border border-white/5 md:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Difficulty Distribution</h3>

          <div className="flex h-3 w-full rounded-full bg-zinc-900 overflow-hidden mb-6">
            <div className="bg-[#4C9C62] h-full transition-all duration-1000" style={{ width: `${(stats.easyCount / stats.total) * 100 || 0}%` }}></div>
            <div className="bg-yellow-600 h-full transition-all duration-1000" style={{ width: `${(stats.mediumCount / stats.total) * 100 || 0}%` }}></div>
            <div className="bg-[#C53030] h-full transition-all duration-1000" style={{ width: `${(stats.hardCount / stats.total) * 100 || 0}%` }}></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/20 p-3 rounded-2xl border border-[#4C9C62]/20">
              <div className="text-[#4C9C62] font-bold text-xl">{stats.easyCount}</div>
              <div className="text-[10px] text-[#4C9C62]/60 font-black uppercase tracking-widest">Easy</div>
            </div>
            <div className="bg-black/20 p-3 rounded-2xl border border-yellow-600/20">
              <div className="text-yellow-600 font-bold text-xl">{stats.mediumCount}</div>
              <div className="text-[10px] text-yellow-600/60 font-black uppercase tracking-widest">Medium</div>
            </div>
            <div className="bg-black/20 p-3 rounded-2xl border border-[#C53030]/20">
              <div className="text-[#C53030] font-bold text-xl">{stats.hardCount}</div>
              <div className="text-[10px] text-[#C53030]/60 font-black uppercase tracking-widest">Hard</div>
            </div>
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-2xl font-bold text-white tracking-tight">Activity Log</h2>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#111111] border border-white/10 text-white focus:border-indigo-500 rounded-2xl px-6 py-2.5 placeholder-zinc-600 focus:outline-none flex-grow transition-all min-w-[140px]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#111111] border border-white/10 text-zinc-300 focus:border-indigo-500 rounded-2xl px-6 py-2.5 focus:outline-none transition-all flex-shrink-0 cursor-pointer hover:bg-zinc-900"
          >
            <option value="All">All Status</option>
            <option value="Solved">Solved</option>
            <option value="Attempted">Attempted</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-[#111111] border border-white/10 text-zinc-300 focus:border-indigo-500 rounded-2xl px-6 py-2.5 focus:outline-none transition-all flex-shrink-0 cursor-pointer hover:bg-zinc-900"
          >
            <option value="All">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={filterSheet}
            onChange={(e) => setFilterSheet(e.target.value)}
            className="bg-[#111111] border border-white/10 text-zinc-300 focus:border-indigo-500 rounded-2xl px-6 py-2.5 focus:outline-none transition-all flex-shrink-0 cursor-pointer hover:bg-zinc-900 min-w-[120px]"
          >
            <option value="All">All Sheets</option>
            {uniqueSheets.map(sheet => (
              <option key={sheet} value={sheet}>{sheet}</option>
            ))}
          </select>
        </div>
      </div>

      {problems.length === 0 && !loading ? (
        <div className="bg-[#111111] p-16 rounded-[40px] border border-dashed border-white/5 text-center flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No problems tracked yet</h3>
          <p className="text-zinc-500 max-w-xs">Your logs will appear here once you've committed your first problem.</p>
        </div>
      ) : displayedProblems.length === 0 ? (
        <div className="text-center text-zinc-600 py-16 bg-[#111111] rounded-[40px] border border-white/5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          No problems matching your active filters.
        </div>
      ) : (
        <div className="grid gap-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {displayedProblems.map((problem, idx) => (
            <div key={problem.id} className="transition-all hover:translate-x-1 duration-300">
              <ProblemCard problem={problem} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
