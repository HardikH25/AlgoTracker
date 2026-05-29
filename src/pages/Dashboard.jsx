import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ProblemCard from "../components/ProblemCard";
import { Search, PlusCircle, TrendingUp, Target, Zap } from "lucide-react";

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const { currentUser } = useAuth();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
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
    const unsolvedCount = total - solvedCount;

    return { total, solvedCount, successRate, easyCount, mediumCount, hardCount, unsolvedCount };
  }, [problems]);



  // Gather topic stats for the pill row
  const topicList = useMemo(() => {
    const counts = {};
    const displayNames = {};
    problems.forEach(p => {
      if (p.topic && p.topic !== "None") {
        const lower = p.topic.toLowerCase().trim();
        counts[lower] = (counts[lower] || 0) + 1;
        // Prefer capitalized version for display
        if (!displayNames[lower] || (p.topic.charAt(0) === p.topic.charAt(0).toUpperCase() && displayNames[lower].charAt(0) !== displayNames[lower].charAt(0).toUpperCase())) {
          displayNames[lower] = p.topic.trim();
        }
      }
    });
    return Object.entries(counts)
      .map(([lower, count]) => [displayNames[lower], count])
      .sort((a, b) => b[1] - a[1]); // sort by count descending
  }, [problems]);

  // Filtered + searched problems
  const filteredProblems = useMemo(() => {
    let result = problems;

    // Apply filter
    switch (activeFilter) {
      case "Easy":
        result = result.filter(p => p.difficulty === "Easy");
        break;
      case "Medium":
        result = result.filter(p => p.difficulty === "Medium");
        break;
      case "Hard":
        result = result.filter(p => p.difficulty === "Hard");
        break;
      case "Unsolved":
        result = result.filter(p => !p.isSolved);
        break;
      default:
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.topic?.toLowerCase().includes(q) ||
        p.platform?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [problems, activeFilter, searchQuery]);

  // Delete a problem from Firestore + local state
  async function handleDelete(problemId) {
    try {
      await deleteDoc(doc(db, "problems", problemId));
      setProblems(prev => prev.filter(p => p.id !== problemId));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  // Handle star toggle in local state
  function handleStarToggle(problemId, newVal) {
    setProblems(prev =>
      prev.map(p => (p.id === problemId ? { ...p, isStarred: newVal } : p))
    );
  }

  // Filter chip definitions
  const filters = [
    { label: "All", count: stats.total },
    { label: "Easy", count: stats.easyCount },
    { label: "Medium", count: stats.mediumCount },
    { label: "Hard", count: stats.hardCount },
    { label: "Unsolved", count: stats.unsolvedCount },
  ];

  // Static styles mapping for statically extractable Tailwind classes
  const filterStyles = {
    All: {
      active: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-sm",
      inactive: "bg-transparent text-zinc-600 border-white/[0.04] hover:border-white/[0.08] hover:text-zinc-400"
    },
    Easy: {
      active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm",
      inactive: "bg-transparent text-zinc-600 border-white/[0.04] hover:border-white/[0.08] hover:text-zinc-400"
    },
    Medium: {
      active: "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-sm",
      inactive: "bg-transparent text-zinc-600 border-white/[0.04] hover:border-white/[0.08] hover:text-zinc-400"
    },
    Hard: {
      active: "bg-red-500/15 text-red-400 border-red-500/30 shadow-sm",
      inactive: "bg-transparent text-zinc-600 border-white/[0.04] hover:border-white/[0.08] hover:text-zinc-400"
    },
    Unsolved: {
      active: "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-sm",
      inactive: "bg-transparent text-zinc-600 border-white/[0.04] hover:border-white/[0.08] hover:text-zinc-400"
    }
  };

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
    <div className="min-h-[calc(100vh-80px)] animate-fade-in">

      {/* ─── Error Banner ─── */}
      {fetchError && (
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-6">
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-5 py-4 rounded-2xl text-sm font-medium flex items-start gap-3">
            <span className="text-red-400 text-lg">⚠️</span>
            <div>
              <p className="font-bold text-red-200 mb-1">Failed to load your problems</p>
              <p className="opacity-80">{fetchError}</p>
              <p className="mt-2 opacity-60 text-xs">This is likely a Firestore security rules issue. Make sure read access is allowed for authenticated users.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1 — Hero Header */}
      <section className="relative overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-10 px-6 sm:px-8">
        {/* Animated gradient orb */}
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent blur-3xl animate-pulse-glow pointer-events-none"
          style={{ transform: "translate(-50%, -50%)" }}
        ></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-indigo-400/80 text-sm font-semibold uppercase tracking-widest mb-2 animate-slide-up">Dashboard</p>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 animate-slide-up" style={{ animationDelay: "0.05s" }}>
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Welcome back</span>
              </h1>
              <p className="text-zinc-500 font-medium text-base max-w-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
                {problems.length === 0
                  ? "Start logging problems to track your algorithmic journey."
                  : `You've conquered ${stats.solvedCount} out of ${stats.total} problems. Keep the momentum going.`
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Stats Grid (4 cards)*/}
      <section className="px-6 sm:px-8 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

          {/* ── Card 1: Total Problems ── */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#111] to-[#0c0c0c] p-6 sm:p-7 rounded-3xl border border-white/[0.04] animate-slide-up card-hover group" style={{ animationDelay: "0.1s" }}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/15">
                <Target size={16} className="text-indigo-400" />
              </div>
              <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Total Problems</h3>
            </div>
            <p className="text-4xl sm:text-5xl font-black text-white animate-count-entrance">{stats.total}</p>
            <p className="text-[11px] text-zinc-600 font-semibold mt-2 uppercase tracking-wider">Problems Logged</p>
          </div>

          {/* ── Card 2: Success Rate (Ring) ── */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#111] to-[#0c0c0c] p-6 sm:p-7 rounded-3xl border border-white/[0.04] animate-slide-up card-hover group" style={{ animationDelay: "0.15s" }}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/15">
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Questions Solved</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="38%" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/[0.04]" />
                  <circle cx="50%" cy="50%" r="38%" stroke="currentColor" strokeWidth="5" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 38} 100`}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - stats.successRate / 100)}
                    className="text-emerald-400 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                    style={{ strokeDasharray: `${2 * Math.PI * 38}` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-black text-white">{stats.successRate}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white animate-count-entrance">{stats.solvedCount}<span className="text-zinc-700 text-lg font-bold"> / {stats.total}</span></p>
                <p className="text-[11px] text-emerald-400/70 font-bold uppercase tracking-wider mt-0.5">Solved</p>
              </div>
            </div>
          </div>



          {/* ── Card 4: Difficulty Split ── */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#111] to-[#0c0c0c] p-6 sm:p-7 rounded-3xl border border-white/[0.04] animate-slide-up card-hover group" style={{ animationDelay: "0.25s" }}>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-violet-500/[0.08] border border-violet-500/15">
                <Zap size={16} className="text-violet-400" />
              </div>
              <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Difficulty</h3>
            </div>

            {/* Stacked bar */}
            <div className="flex h-2 w-full rounded-full bg-white/[0.03] overflow-hidden mb-5">
              {stats.total > 0 && (
                <>
                  <div className="bg-emerald-400 h-full rounded-l-full transition-all duration-1000" style={{ width: `${(stats.easyCount / stats.total) * 100}%` }}></div>
                  <div className="bg-amber-400 h-full transition-all duration-1000 mx-px" style={{ width: `${(stats.mediumCount / stats.total) * 100}%` }}></div>
                  <div className="bg-red-400 h-full rounded-r-full transition-all duration-1000" style={{ width: `${(stats.hardCount / stats.total) * 100}%` }}></div>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xl font-black text-emerald-400">{stats.easyCount}</p>
                <p className="text-[9px] text-emerald-400/50 font-bold uppercase tracking-widest">Easy</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-amber-400">{stats.mediumCount}</p>
                <p className="text-[9px] text-amber-400/50 font-bold uppercase tracking-widest">Med</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-red-400">{stats.hardCount}</p>
                <p className="text-[9px] text-red-400/50 font-bold uppercase tracking-widest">Hard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Topic Pills */}
      {topicList.length > 0 && (
        <section className="px-6 sm:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Topics Practiced</h2>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {topicList.map(([topicName, count]) => (
                <Link
                  key={topicName}
                  to={`/topics/${encodeURIComponent(topicName)}`}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/[0.05] rounded-full hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-300 group"
                >
                  <span className="text-[12px] font-semibold text-zinc-400 group-hover:text-indigo-300 transition-colors">{topicName}</span>
                  <span className="text-[10px] font-bold text-zinc-700 bg-white/[0.03] px-1.5 py-0.5 rounded-md">{count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4 — Problem Feed */}
      <section className="px-6 sm:px-8 pb-16">
        <div className="max-w-7xl mx-auto">

          {/* Section header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">All Problems</h2>
              <p className="text-zinc-600 text-sm font-medium mt-0.5">{filteredProblems.length} problem{filteredProblems.length !== 1 ? "s" : ""} found</p>
            </div>

            {/* Search bar */}
            <div className="relative max-w-xs w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#111] border border-white/[0.05] text-zinc-300 rounded-xl focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all placeholder-zinc-700 text-sm font-medium"
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map(f => {
              const styles = filterStyles[f.label];
              const isActive = activeFilter === f.label;
              return (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className={`
                    inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-200 border cursor-pointer
                    ${isActive ? styles.active : styles.inactive}
                  `}
                >
                  {f.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/[0.08]" : "bg-white/[0.03]"}`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Problem list */}
          {filteredProblems.length > 0 ? (
            <div className="grid gap-3 animate-slide-up">
              {filteredProblems.map(problem => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  onDelete={handleDelete}
                  onStarToggle={handleStarToggle}
                />
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="relative overflow-hidden bg-gradient-to-b from-[#111] to-[#0c0c0c] p-14 sm:p-20 rounded-3xl border border-dashed border-white/[0.06] text-center flex flex-col items-center animate-slide-up">
              {/* Decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

              {/* Faded orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/15 flex items-center justify-center">
                  <PlusCircle size={28} className="text-indigo-400/60" />
                </div>
                <h3 className="text-xl font-bold text-zinc-200 mb-2">
                  {problems.length === 0 ? "Your journey starts here" : "No matching problems"}
                </h3>
                <p className="text-zinc-600 max-w-sm text-sm mb-8">
                  {problems.length === 0
                    ? "Log your first coding problem and start building your personal algorithm knowledge base."
                    : "Try adjusting your search or filters to find what you're looking for."
                  }
                </p>
                {problems.length === 0 && (
                  <Link
                    to="/log"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl border border-white/10 hover:border-white/20 shadow-xl shadow-indigo-900/30 transition-all"
                  >
                    <PlusCircle size={16} />
                    Log Your First Problem
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
