import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import ProblemCard from "../components/ProblemCard";

export default function Revision() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load all problems from the database when the page opens
  useEffect(() => {
    async function fetchProblems() {
      if (!currentUser) return; // skip if no one is logged in
      try {
        setLoading(true);
        // Only get problems belonging to the current user
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

  // Only show problems that the user marked as needing revision
  const revisionProblems = problems.filter(p => p.needsRevision === true);

  // Turn off the revision flag for a problem (user has learned it)
  async function handleRemoveRevision(problemId) {
    try {
      const problemRef = doc(db, "problems", problemId);
      await updateDoc(problemRef, { needsRevision: false });

      // Update the list on screen without reloading from the database
      setProblems(prev => prev.map(p =>
        p.id === problemId ? { ...p, needsRevision: false } : p
      ));
    } catch (err) {
      alert("Error updating problem.");
    }
  }

  // Delete the problem from the database
  async function handleDelete(problemId) {
    try {
      await deleteDoc(doc(db, "problems", problemId));
      setProblems(prev => prev.filter(p => p.id !== problemId));
    } catch (err) {
      alert("Error deleting problem.");
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
              {/* Button to mark a problem as fully learned */}
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
