import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import ProblemCard from "../components/ProblemCard";
import { ArrowLeft } from "lucide-react";

export default function TopicDetail() {
  const { topicName } = useParams();
  const decodedTopic = decodeURIComponent(topicName);

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Load problems for this topic from the database
  useEffect(() => {
    async function fetchProblems() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, "problems"),
          where("userId", "==", currentUser.uid),
          where("topic", "==", decodedTopic)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        // Sort newest first
        data.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setProblems(data);
      } catch (err) {
        console.error("Error fetching topic problems:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, [currentUser, decodedTopic]);

  // Delete a problem
  const handleDelete = useCallback(async (problemId) => {
    try {
      await deleteDoc(doc(db, "problems", problemId));
      setProblems(prev => prev.filter(p => p.id !== problemId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete problem.");
    }
  }, []);

  // Handle star toggle in local state
  const handleStarToggle = useCallback((problemId, newVal) => {
    setProblems(prev => prev.map(p =>
      p.id === problemId ? { ...p, isStarred: newVal } : p
    ));
  }, []);

  const solvedCount = problems.filter(p => p.isSolved).length;
  const totalCount = problems.length;
  const successRate = totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  // Filter the problems list based on user selections
  const displayedProblems = useMemo(() => {
    return problems.filter(p => {
      const matchTitle = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDifficulty = filterDifficulty === "All" || p.difficulty === filterDifficulty;

      let matchStatus = true;
      if (filterStatus === "Solved") matchStatus = p.isSolved === true;
      else if (filterStatus === "Attempted") matchStatus = p.isSolved === false;

      return matchTitle && matchDifficulty && matchStatus;
    });
  }, [problems, searchTerm, filterDifficulty, filterStatus]);

  if (loading && problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-medium">Loading {decodedTopic} problems...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Back link + header */}
      <Link
        to="/topics"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors mb-6 text-sm font-medium group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Topics
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">{decodedTopic}</h1>
          <p className="text-zinc-500 font-medium">
            {totalCount} {totalCount === 1 ? "problem" : "problems"} logged under this topic.
          </p>
        </div>

        {/* Stats pill */}
        <div className="bg-[#111111] border border-white/5 px-6 py-4 rounded-2xl flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-black text-white">{solvedCount}</div>
            <div className="text-[10px] text-[#4C9C62] font-bold uppercase tracking-widest">Solved</div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-white">{totalCount - solvedCount}</div>
            <div className="text-[10px] text-[#C53030] font-bold uppercase tracking-widest">Attempted</div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-white">{successRate}%</div>
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Rate</div>
          </div>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 animate-slide-up">
        <h2 className="text-2xl font-bold text-white tracking-tight">Problems</h2>
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
        </div>
      </div>

      {/* Problem list */}
      {problems.length === 0 && !loading ? (
        <div className="bg-[#111111] p-16 rounded-[40px] border border-dashed border-white/5 text-center flex flex-col items-center animate-slide-up">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No problems here yet</h3>
          <p className="text-zinc-500 max-w-xs">Log a problem with the topic "{decodedTopic}" to see it listed here.</p>
        </div>
      ) : displayedProblems.length === 0 ? (
        <div className="text-center text-zinc-600 py-16 bg-[#111111] rounded-[40px] border border-white/5 animate-slide-up">
          No problems matching your active filters.
        </div>
      ) : (
        <div className="grid gap-5 animate-slide-up">
          {displayedProblems.map((problem) => (
            <div key={problem.id} className="transition-all hover:translate-x-1 duration-300">
              <ProblemCard problem={problem} onDelete={handleDelete} onStarToggle={handleStarToggle} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
