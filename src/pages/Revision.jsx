import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import ProblemCard from "../components/ProblemCard";

export default function Revision() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  //fetch problems on mount
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

  const revisionProblems = problems.filter(p => p.needsRevision === true);
  async function handleRemoveRevision(problemId) {
    try {
      const problemRef = doc(db, "problems", problemId);
      await updateDoc(problemRef, { needsRevision: false });

      setProblems(prev => prev.map(p =>
        p.id === problemId ? { ...p, needsRevision: false } : p
      ));
    } catch (err) {
      alert("Error updating problem.");
    }
  }

  async function handleDelete(problemId) {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      try {
        await deleteDoc(doc(db, "problems", problemId));
        setProblems(prev => prev.filter(p => p.id !== problemId));
      } catch (err) {
        alert("Error deleting problem.");
      }
    }
  }

  if (loading && problems.length === 0) {
    return <div className="p-8 text-center text-zinc-500 animate-fade-in">Loading your revision list...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-zinc-100">Revision Room</h1>
      <p className="text-zinc-500 mb-8">Review the problems you marked as struggling or important.</p>

      {revisionProblems.length === 0 && !loading ? (
        <div className="bg-[#18181b] p-12 rounded-3xl border border-dashed border-white/10 text-center text-zinc-400 animate-slide-up">
          Awesome! You have no problems assigned for revision right now!
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-slide-up">
          {revisionProblems.map(problem => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onDelete={handleDelete}
            >
              <button
                onClick={() => handleRemoveRevision(problem.id)}
                className="bg-[#00520A] text-white hover:bg-[#003806] px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-[#00520A]/20 whitespace-nowrap cursor-pointer"
              >
                Mark Learned
              </button>
            </ProblemCard>
          ))}
        </div>
      )}
    </div>
  );
}
