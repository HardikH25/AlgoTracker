import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import ProblemCard from "../components/ProblemCard";
import { Star } from "lucide-react";

export default function Starred() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load all problems from the database when the page opens
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
        setProblems(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, [currentUser]);

  // Only show starred problems
  const starredProblems = problems.filter(p => p.isStarred === true);

  // Handle star toggle — unstarring removes from this view
  function handleStarToggle(problemId, newVal) {
    setProblems(prev => prev.map(p =>
      p.id === problemId ? { ...p, isStarred: newVal } : p
    ));
  }

  // Delete the problem from the database
  async function handleDelete(problemId) {
    try {
      await deleteDoc(doc(db, "problems", problemId));
      setProblems(prev => prev.filter(p => p.id !== problemId));
    } catch (err) {
      console.error("Failed to delete starred problem:", err);
      alert("Error deleting problem.");
    }
  }

  if (loading && problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-10 h-10 border-[3px] border-zinc-800 border-t-amber-400 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-600 font-medium text-sm">Loading your starred problems...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-500/[0.08] rounded-xl border border-amber-500/15">
          <Star size={20} className="text-amber-400" fill="currentColor" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Starred</h1>
      </div>
      <p className="text-zinc-600 mb-8 font-medium text-sm">
        Your bookmarked problems — the ones worth revisiting.
      </p>

      {starredProblems.length === 0 && !loading ? (
        <div className="relative overflow-hidden bg-gradient-to-b from-[#111] to-[#0c0c0c] p-14 rounded-2xl border border-dashed border-white/[0.06] text-center flex flex-col items-center animate-slide-up">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
          <Star size={32} className="text-zinc-700 mb-4" />
          <h3 className="text-lg font-bold text-zinc-300 mb-1">No starred problems yet</h3>
          <p className="text-zinc-600 max-w-xs text-sm">Star any problem from the dashboard or topic pages to bookmark it here.</p>
        </div>
      ) : (
        <div className="grid gap-3 animate-slide-up">
          {starredProblems.map(problem => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onDelete={handleDelete}
              onStarToggle={handleStarToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
