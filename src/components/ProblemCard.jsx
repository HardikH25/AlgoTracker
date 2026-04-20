import { useState } from "react";
import { Link } from "react-router-dom";
import PlatformIcon from "./PlatformIcon";

export default function ProblemCard({ problem, onDelete, children }) {
  const [showNotes, setShowNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      setIsDeleting(true);
      try {
        await onDelete(problem.id);
      } catch (error) {
        console.error("Failed to delete:", error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800 hover:bg-[#222] transition-colors group relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">

        <div className="flex gap-4 items-start sm:items-center w-full">
          <div className="mt-1 sm:mt-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <PlatformIcon platform={problem.platform} />
          </div>

          <div className="flex-grow">
            <h3 className="font-bold text-lg text-zinc-100 flex flex-wrap items-center gap-2 group-hover:text-white transition-colors">
              {problem.url ? (
                <a href={problem.url} target="_blank" rel="noreferrer" className="hover:underline">{problem.title}</a>
              ) : (
                problem.title
              )}
              {problem.needsRevision && <span className="text-xs bg-white/10 text-zinc-200 px-2 py-0.5 border border-white/10 rounded-md shadow-sm">Revision</span>}
            </h3>

            <div className="text-sm text-zinc-500 mt-1 flex flex-wrap items-center gap-y-2">
              <span className="mr-3">{problem.platform}</span>
              <span className={`mr-3 font-semibold ${problem.difficulty === 'Easy' ? 'text-[#4C9C62]' : problem.difficulty === 'Medium' ? 'text-yellow-600' : 'text-[#C53030]'}`}>
                {problem.difficulty}
              </span>
              <span className="mr-3">{problem.timeTaken} mins</span>
              {problem.sheet && problem.sheet !== "None" && (
                <span className="mr-3 px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-white/5 rounded text-xs">Sheet: {problem.sheet}</span>
              )}

              {problem.notes && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md text-xs font-semibold ml-1 cursor-pointer transition-colors border border-white/5"
                >
                  {showNotes ? "Hide Notes" : "View Ideas"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {children}

          <div className="flex items-center gap-1 order-2 sm:order-1">
            <Link
              to={`/log/${problem.id}`}
              className="p-2 text-zinc-600 hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-500/10"
              title="Edit Problem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            </Link>

            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                title="Delete Problem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
              </button>
            )}
          </div>

          <div className="order-1 sm:order-2">
            {problem.isSolved ? (
              <span className="bg-[#253D2C] text-[#CFFFDC] border border-[#2E6F40] px-3 py-1 rounded-full text-sm font-bold tracking-wide">Solved</span>
            ) : (
              <span className="bg-[#09090b] text-[#C53030] border border-[#C53030]/50 px-3 py-1 rounded-full text-sm font-bold tracking-wide">Attempted</span>
            )}
          </div>
        </div>
      </div>

      {showNotes && problem.notes && (
        <div className="mt-4 bg-[#09090b] p-5 rounded-xl border border-white/5 text-zinc-400 text-sm whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 duration-200">
          <strong className="block mb-2 text-zinc-300 uppercase text-[10px] tracking-widest font-bold">Your Approach / Ideas</strong>
          {problem.notes}
        </div>
      )}
    </div>
  );
}
