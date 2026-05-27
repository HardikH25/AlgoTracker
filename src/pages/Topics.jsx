import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Topics() {
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

  // Group problems by topic and count how many are solved in each
  const topicStats = useMemo(() => {
    const topics = {};

    problems.forEach(p => {
      if (!p.topic || p.topic === "None") return; // skip problems with no topic

      if (!topics[p.topic]) {
        topics[p.topic] = { name: p.topic, total: 0, solved: 0 };
      }

      topics[p.topic].total += 1;
      if (p.isSolved) topics[p.topic].solved += 1;
    });

    return Object.values(topics);
  }, [problems]);

  if (loading && problems.length === 0) return <div className="p-8 text-center text-gray-400">Loading your topics...</div>;

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-black mb-2 text-white tracking-tight">Topics</h1>
      <p className="text-zinc-500 mb-8 font-medium text-sm">
        Your progress grouped by individual topics (e.g., Arrays, Dynamic Programming).
      </p>

      {topicStats.length === 0 && !loading ? (
        <div className="bg-[#0f0f0f] p-12 rounded-3xl border border-dashed border-white/[0.06] text-center text-zinc-500 animate-slide-up">
          You haven't logged any problems under a specific topic yet!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up">
          {topicStats.map(topic => {
            const percent = Math.round((topic.solved / topic.total) * 100);
            return (
              <Link key={topic.name} to={`/topics/${encodeURIComponent(topic.name)}`} className="block group">
                <div className="bg-gradient-to-b from-[#111] to-[#0c0c0c] p-8 rounded-[1.25rem] border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300 card-hover relative overflow-hidden">

                  {/* Subtle top gradient */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                  <h2 className="text-lg font-bold text-zinc-200 mb-6 group-hover:text-white transition-colors truncate">{topic.name}</h2>

                  {/* Percentage and count */}
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-3xl font-black text-white">
                      {percent}%
                    </span>
                    <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.1em]">
                      {topic.solved} / {topic.total} Solved
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-white/[0.05] overflow-hidden rounded-full mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-zinc-600 to-zinc-200 transition-all duration-1000 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
