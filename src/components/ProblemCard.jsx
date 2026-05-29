import { useState } from "react";
import { Link } from "react-router-dom";
import PlatformIcon from "./PlatformIcon";
import { Pencil, Trash2, ChevronDown, ExternalLink, Star } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function ProblemCard({ problem, onDelete, onStarToggle, children }) {
  const [showNotes, setShowNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [starring, setStarring] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleStarToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (starring) return;
    setStarring(true);
    const newVal = !problem.isStarred;
    
    // Optimistic UI update in the parent immediately
    if (onStarToggle) onStarToggle(problem.id, newVal);
    
    try {
      await updateDoc(doc(db, "problems", problem.id), { isStarred: newVal });
    } catch (err) {
      console.error("Star toggle failed:", err);
      // Revert in parent on failure
      if (onStarToggle) onStarToggle(problem.id, !newVal);
    } finally {
      setStarring(false);
    }
  };

  const diffColors = {
    Easy:   { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
    Medium: { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   dot: "bg-amber-400" },
    Hard:   { text: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     dot: "bg-red-400" },
  };
  const dc = diffColors[problem.difficulty] || diffColors.Easy;

  return (
    <div
      onClick={() => { if (problem.notes) setShowNotes(prev => !prev); }}
      className={`
        relative overflow-hidden rounded-2xl transition-all duration-300 group
        bg-gradient-to-b from-[#111] to-[#0c0c0c]
        border border-white/[0.05] hover:border-white/[0.1]
        ${isDeleting ? 'opacity-40 pointer-events-none scale-[0.99]' : ''}
        ${problem.notes ? 'cursor-pointer' : ''}
      `}
    >
      {/* Top gradient line accent */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${dc.dot === 'bg-emerald-400' ? 'via-emerald-500/30' : dc.dot === 'bg-amber-400' ? 'via-amber-500/30' : 'via-red-500/30'} to-transparent`}></div>

      <div className="p-5">
        {/* Row 1: Title + Status badge */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {/* Difficulty dot */}
              <span className={`w-2 h-2 rounded-full ${dc.dot} flex-shrink-0`}></span>

              <h3 className="font-semibold text-[15px] text-zinc-200 group-hover:text-white transition-colors truncate">
                {problem.url ? (
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline underline-offset-4 decoration-zinc-700 inline-flex items-center gap-1.5"
                    onClick={e => e.stopPropagation()}
                  >
                    {problem.title}
                    <ExternalLink size={12} className="text-zinc-600 flex-shrink-0" />
                  </a>
                ) : (
                  problem.title
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Star button */}
            <button
              onClick={handleStarToggle}
              disabled={starring}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                problem.isStarred
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-zinc-700 hover:text-zinc-400 hover:bg-white/[0.03]'
              }`}
              title={problem.isStarred ? "Unstar" : "Star"}
            >
              <Star size={16} fill={problem.isStarred ? "currentColor" : "none"} />
            </button>

            {problem.isSolved ? (
              <span className="bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/15 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
                Solved
              </span>
            ) : (
              <span className="bg-red-500/[0.08] text-red-400 border border-red-500/15 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
                Attempted
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Meta chips */}
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          {/* Platform chip */}
          <div className="flex items-center gap-1.5 text-zinc-500 text-[12px]">
            <PlatformIcon platform={problem.platform} />
            <span className="font-medium">{problem.platform}</span>
          </div>

          <span className="text-zinc-800">•</span>

          {/* Difficulty chip */}
          <span className={`${dc.bg} ${dc.text} ${dc.border} border px-2 py-0.5 rounded-md text-[11px] font-semibold`}>
            {problem.difficulty}
          </span>

          {/* Topic chip */}
          {problem.topic && problem.topic !== "None" && (
            <>
              <span className="text-zinc-800">•</span>
              <span className="bg-indigo-500/[0.06] text-indigo-400 border border-indigo-500/15 px-2 py-0.5 rounded-md text-[11px] font-medium">
                {problem.topic}
              </span>
            </>
          )}

          {/* Notes indicator chevron */}
          {problem.notes && (
            <ChevronDown
              size={14}
              className={`ml-auto text-zinc-700 group-hover:text-zinc-500 transition-all duration-300 ${showNotes ? 'rotate-180 text-zinc-500' : ''}`}
            />
          )}
        </div>

        {/* Row 3: Action buttons */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/[0.03]">
          {children}

          <div className="flex items-center gap-1 ml-auto">
            <Link
              to={`/log/${problem.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-600 hover:text-indigo-400 transition-all rounded-lg hover:bg-indigo-500/[0.06] text-[12px] font-medium"
              title="Edit Problem"
            >
              <Pencil size={13} />
              <span className="hidden sm:inline">Edit</span>
            </Link>

            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/[0.06] text-[12px] font-medium"
                title="Delete Problem"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes reveal with smooth animation */}
      <div className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${showNotes && problem.notes ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5">
          <div className="bg-[#080808] p-4 rounded-xl border border-white/[0.04] text-zinc-400 text-[13px] leading-relaxed whitespace-pre-wrap">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-indigo-500/50"></div>
              <strong className="text-zinc-400 uppercase text-[10px] tracking-[0.15em] font-bold">Your Approach / Ideas</strong>
            </div>
            {problem.notes}
          </div>
        </div>
      </div>
    </div>
  );
}
