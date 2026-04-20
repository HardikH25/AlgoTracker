import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function TrainingSheets() {
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

  const sheetStats = useMemo(() => {
    const sheets = {};

    problems.forEach(p => {
      if (!p.sheet || p.sheet === "None") return;

      if (!sheets[p.sheet]) {
        sheets[p.sheet] = { name: p.sheet, total: 0, solved: 0 };
      }

      sheets[p.sheet].total += 1;
      if (p.isSolved) sheets[p.sheet].solved += 1;
    });

    return Object.values(sheets);
  }, [problems]);

  if (loading && problems.length === 0) return <div className="p-8 text-center text-gray-400">Loading your training sheets...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-zinc-100">Training Sheets</h1>
      <p className="text-zinc-400 mb-8 font-medium">
        Your progress on specific interview sheets (e.g., CP-31, Striver A2Z).
      </p>

      {sheetStats.length === 0 && !loading ? (
        <div className="bg-[#18181b] p-12 rounded-3xl border border-dashed border-white/10 text-center text-zinc-500 animate-slide-up">
          You haven't logged any problems under a specific training sheet yet!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
          {sheetStats.map(sheet => (
            <div key={sheet.name} className="bg-[#18181b] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all shadow-sm">
              <h2 className="text-xl font-bold text-zinc-100 mb-6">{sheet.name}</h2>

              <div className="flex justify-between items-end mb-3">
                <span className="text-3xl font-black text-white">
                  {Math.round((sheet.solved / sheet.total) * 100)}%
                </span>
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">
                  {sheet.solved} / {sheet.total} Done
                </span>
              </div>

              <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4C9C62] transition-all duration-1000"
                  style={{ width: `${(sheet.solved / sheet.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
