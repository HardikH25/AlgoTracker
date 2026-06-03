import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Plus, X, Trash2, Pencil, StickyNote, ChevronDown } from "lucide-react";

export default function NotesManager({ topic }) {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  const titleInputRef = useRef(null);
  const formRef = useRef(null);

  // Fetch notes for this topic from the dedicated topicNotes collection
  useEffect(() => {
    async function fetchNotes() {
      if (!currentUser || !topic) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, "topicNotes"),
          where("userId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(
            (d) =>
              d.topic &&
              d.topic.toLowerCase().trim() === topic.toLowerCase().trim()
          )
          .sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
        setNotes(data);
      } catch (err) {
        console.error("Error fetching topic notes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [currentUser, topic]);

  // Focus title input when form opens
  useEffect(() => {
    if (isFormOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isFormOpen]);

  // Scroll form into view when it opens
  useEffect(() => {
    if (isFormOpen && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [isFormOpen]);

  const resetForm = useCallback(() => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setIsFormOpen(false);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent) return;

    try {
      setSaving(true);

      if (editingId) {
        // Update existing note
        await updateDoc(doc(db, "topicNotes", editingId), {
          title: cleanTitle,
          content: cleanContent,
          updatedAt: serverTimestamp(),
        });
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingId
              ? { ...n, title: cleanTitle, content: cleanContent }
              : n
          )
        );
      } else {
        // Create new note in the dedicated topicNotes collection
        const noteData = {
          userId: currentUser.uid,
          topic: topic.trim(),
          title: cleanTitle,
          content: cleanContent,
          createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, "topicNotes"), noteData);
        setNotes((prev) => [{ id: docRef.id, ...noteData }, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteDoc(doc(db, "topicNotes", noteId));
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note.");
    }
  }, []);

  const handleEdit = useCallback((note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsFormOpen(true);
  }, []);

  const toggleExpand = useCallback((noteId) => {
    setExpandedNotes((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mt-16 animate-slide-up">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
            <StickyNote size={18} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Notes
            </h2>
            <p className="text-zinc-600 text-sm font-medium">
              {notes.length} {notes.length === 1 ? "note" : "notes"} for this
              topic
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (isFormOpen && !editingId) {
              resetForm();
            } else {
              resetForm();
              setIsFormOpen(true);
            }
          }}
          className={`
            group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 border cursor-pointer
            ${
              isFormOpen && !editingId
                ? "bg-zinc-800/50 text-zinc-400 border-white/5 hover:bg-zinc-800"
                : "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20 hover:text-violet-300"
            }
          `}
        >
          {isFormOpen && !editingId ? (
            <>
              <X size={16} className="transition-transform group-hover:rotate-90 duration-300" />
              Cancel
            </>
          ) : (
            <>
              <Plus size={16} className="transition-transform group-hover:rotate-90 duration-300" />
              New Note
            </>
          )}
        </button>
      </div>

      {/* Divider line */}
      <div className="h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent mb-8"></div>

      {/* Create / Edit form */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isFormOpen ? "max-h-[600px] opacity-100 mb-8" : "max-h-0 opacity-0"
        }`}
      >
        <form
          ref={formRef}
          onSubmit={handleSave}
          className="relative bg-gradient-to-b from-[#111] to-[#0c0c0c] p-6 sm:p-8 rounded-2xl border border-white/[0.05] shadow-2xl flex flex-col gap-5 overflow-hidden"
        >
          {/* Decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>

          <div>
            <label className="block text-zinc-400 font-bold mb-2 text-[10px] uppercase tracking-[0.15em]">
              Note Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-[#0a0a0a] border border-white/[0.05] text-white rounded-2xl focus:border-violet-500/50 focus:bg-black focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-all placeholder-zinc-700 font-medium"
              placeholder="e.g. Key pattern insight, Edge case reminder..."
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-2 text-[10px] uppercase tracking-[0.15em]">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="4"
              className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/[0.05] text-zinc-300 rounded-2xl focus:border-violet-500/50 focus:bg-black focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-all placeholder-zinc-700 font-medium resize-y"
              placeholder="Write your notes, observations, tricks, patterns..."
            ></textarea>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-all hover:bg-white/[0.03] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !content.trim()}
              className="relative group bg-gradient-to-b from-violet-600 to-violet-900 hover:from-violet-500 hover:to-violet-800 text-white font-bold py-2.5 px-6 rounded-xl disabled:opacity-50 transition-all border border-white/10 hover:border-white/20 shadow-xl overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              <span className="relative z-10 tracking-widest uppercase text-[11px]">
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Note"
                  : "Save Note"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-zinc-700 border-t-violet-500 rounded-full animate-spin mb-3"></div>
          <p className="text-zinc-600 text-sm font-medium">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-[#111111] p-12 rounded-[2rem] border border-dashed border-white/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500 mb-5">
            <StickyNote size={28} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No notes yet</h3>
          <p className="text-zinc-500 max-w-xs text-sm">
            Capture key insights, patterns, and tricks you discover while
            working through this topic.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note, index) => (
            <div
              key={note.id}
              onClick={() => toggleExpand(note.id)}
              className="relative overflow-hidden rounded-2xl transition-all duration-300 group bg-gradient-to-b from-[#111] to-[#0c0c0c] border border-white/[0.05] hover:border-white/[0.1] cursor-pointer"
              style={{
                animationDelay: `${index * 60}ms`,
                animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                opacity: 0,
              }}
            >
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>

              <div className="p-5">
                {/* Title row */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-grow">
                    <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0"></div>
                    <h3 className="font-semibold text-[15px] text-zinc-200 group-hover:text-white transition-colors truncate">
                      {note.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {note.createdAt && (
                      <span className="text-zinc-700 text-[11px] font-medium hidden sm:block">
                        {formatDate(note.createdAt)}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className={`text-zinc-700 group-hover:text-zinc-500 transition-all duration-300 ${
                        expandedNotes[note.id] ? "rotate-180 text-zinc-500" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Preview text (only when collapsed) */}
                {!expandedNotes[note.id] && (
                  <p className="text-zinc-600 text-[13px] mt-2 ml-5 line-clamp-1">
                    {note.content}
                  </p>
                )}
              </div>

              {/* Expanded content */}
              <div
                className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  expandedNotes[note.id]
                    ? "max-h-[800px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-5">
                  <div className="bg-[#080808] p-4 rounded-xl border border-white/[0.04] text-zinc-400 text-[13px] leading-relaxed whitespace-pre-wrap">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-violet-500/50"></div>
                      <strong className="text-zinc-400 uppercase text-[10px] tracking-[0.15em] font-bold">
                        Note Content
                      </strong>
                    </div>
                    {note.content}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/[0.03]">
                    {note.createdAt && (
                      <span className="text-zinc-700 text-[11px] font-medium sm:hidden">
                        {formatDate(note.createdAt)}
                      </span>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(note);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-600 hover:text-violet-400 transition-all rounded-lg hover:bg-violet-500/[0.06] text-[12px] font-medium cursor-pointer"
                        title="Edit Note"
                      >
                        <Pencil size={13} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/[0.06] text-[12px] font-medium cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
