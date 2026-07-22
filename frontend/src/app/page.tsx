"use client";

import { useEffect, useRef, useState } from "react";
import {
  getNotes,
  createNote,
  deleteNote,
  updateNote,
} from "../lib/api";

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState("Medium");
  const [pinned, setPinned] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ffffff");

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(true);

  const formRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  const noteColors = [
    "#ffffff",
    "#FDE68A",
    "#FECACA",
    "#BFDBFE",
    "#BBF7D0",
    "#DDD6FE",
    "#FED7AA",
    "#FBCFE8",
  ];

  async function loadNotes() {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  

  async function handleCreateNote() {
    if (!title.trim() || !content.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editingId !== null) {
        await updateNote(editingId, {
          title,
          content,
          category,
          priority,
          pinned,
          color: selectedColor,
        });

        setEditingId(null);
      } else {
        await createNote({
          title,
          content,
          category,
          priority,
          pinned,
          color: selectedColor,
        });
      }

      setTitle("");
      setContent("");
      setCategory("Personal");
      setPriority("Medium");
      setPinned(false);
      setSelectedColor("#ffffff");

      await loadNotes();
    } catch (error) {
      console.error(error);
      alert("Operation Failed");
    }
  }

async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    try {
      await deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error(error);
      alert("Failed to delete note");
    }
  }

  async function handleEdit(note: any) {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setPriority(note.priority);
    setPinned(note.pinned ?? false);
    setSelectedColor(note.color ?? "#ffffff");
  }

  async function handleTogglePin(note: any) {
    try {
      await updateNote(note.id, {
        title: note.title,
        content: note.content,
        category: note.category,
        priority: note.priority,
        pinned: !note.pinned,
        color: note.color,
      });

      await loadNotes();
    } catch (error) {
      console.error(error);
      alert("Failed to update pin.");
    }
  }

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" ||
        note.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        note.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriority
      );
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    });

  return (
    <main
      className={`min-h-screen p-8 transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
          : "bg-gradient-to-br from-purple-50 via-white to-orange-50"
      }`}
    >
      {/* Navbar */}

      <nav
        className={`mx-auto mb-10 flex max-w-7xl items-center justify-between rounded-3xl border p-5 backdrop-blur-xl transition-all duration-500 ${
          darkMode
            ? "border-white/10 bg-white/10"
            : "border-purple-200 bg-white shadow-xl"
        }`}
      >
        <h1
          className={`text-3xl font-bold ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          📝 Quick Notes
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 font-semibold text-white transition-all duration-300 hover:scale-105"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
  onClick={() =>
    window.open("http://localhost:5000/api/notes/export/pdf", "_blank")
  }
  className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2 font-semibold text-white transition-all duration-300 hover:scale-105"
>
  Export PDF
</button>

       <button
  onClick={() =>
    window.open("http://localhost:5000/api/notes/export/txt", "_blank")
  }
  className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2 font-semibold text-white transition-all duration-300 hover:scale-105"
>
  Export TXT
</button>   

        </div>
      </nav>

      {/* Dashboard */}

      <section
        className={`mx-auto max-w-7xl rounded-3xl border p-8 backdrop-blur-2xl shadow-2xl transition-all duration-500 ${
          darkMode
            ? "border-white/10 bg-white/10"
            : "border-purple-200 bg-white shadow-xl"
        }`}
      >
        <h2
          className={`mb-6 text-4xl font-bold ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Dashboard
        </h2>

        {/* Search */}

        <input
  type="text"
  placeholder="🔍 Search notes..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      notesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }}

          className={`mb-6 w-full rounded-xl border p-4 outline-none transition-all ${
            darkMode
              ? "border-white/10 bg-slate-900/60 text-white placeholder:text-gray-400"
              : "border-purple-200 bg-white text-slate-900 placeholder:text-slate-500"
          }`}
        />

        {/* Filters */}

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`rounded-xl p-4 ${
              darkMode
                ? "bg-slate-900/70 text-white"
                : "border border-purple-200 bg-white text-slate-900"
            }`}
          >
            <option>All</option>
            <option>Personal</option>
            <option>Work</option>
            <option>Study</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`rounded-xl p-4 ${
              darkMode
                ? "bg-slate-900/70 text-white"
                : "border border-purple-200 bg-white text-slate-900"
            }`}
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="cursor-pointer rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <h3 className="text-5xl font-bold text-cyan-300">
              {loading ? "..." : notes.length}
            </h3>

            <p className="mt-2 text-gray-300">
              Total Notes
            </p>
          </div>

          <div className="cursor-pointer rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <h3 className="text-5xl font-bold text-pink-300">
              {notes.filter((note) => note.pinned).length}
            </h3>

            <p className="mt-2 text-gray-300">
              Pinned Notes
            </p>
          </div>

          <div className="cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <h3 className="text-5xl font-bold text-emerald-300">
              {new Set(notes.map((note) => note.category)).size}
            </h3>

            <p className="mt-2 text-gray-300">
              Categories
            </p>
          </div>
        </div>

        {/* Create / Edit Form */}

        <div
          ref={formRef}
          className={`mt-10 rounded-3xl border p-8 backdrop-blur-xl transition-all duration-500 ${
            darkMode
              ? "border-white/10 bg-white/10"
              : "border-purple-200 bg-white shadow-xl"
          }`}
        >
          <h2
            className={`mb-6 text-3xl font-bold ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            {editingId !== null ? "✏️ Edit Note" : "Create New Note"}
          </h2>

          {editingId !== null && (
            <div className="mb-6 rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-4 text-yellow-300">
              You are editing a note. Make your changes and click{" "}
              <b>Update Note</b>.
            </div>
          )}

          <div className="grid gap-5">

            <input
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`rounded-xl p-4 outline-none transition-all ${
                darkMode
                  ? "bg-slate-900/60 text-white"
                  : "border border-purple-200 bg-white text-slate-900"
              }`}
            />

            <textarea
              rows={5}
              placeholder="Write your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`rounded-xl p-4 outline-none transition-all ${
                darkMode
                  ? "bg-slate-900/60 text-white"
                  : "border border-purple-200 bg-white text-slate-900"
              }`}
            />

            <div className="grid gap-4 md:grid-cols-2">

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`rounded-xl p-4 ${
                  darkMode
                    ? "bg-slate-900/60 text-white"
                    : "border border-purple-200 bg-white text-slate-900"
                }`}
              >
                <option>Personal</option>
                <option>Work</option>
                <option>Study</option>
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`rounded-xl p-4 ${
                  darkMode
                    ? "bg-slate-900/60 text-white"
                    : "border border-purple-200 bg-white text-slate-900"
                }`}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

            </div>

            <label
              className={`flex items-center gap-3 rounded-xl p-4 ${
                darkMode
                  ? "bg-slate-900/60 text-white"
                  : "border border-purple-200 bg-purple-50 text-slate-900"
              }`}
            >
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-5 w-5"
              />
              📌 Pin this note
            </label>

            <div>
              <p
                className={`mb-3 font-semibold ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Note Color
              </p>

              <div className="flex flex-wrap gap-3">
                {noteColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-full border-4 transition ${
                      selectedColor === color
                        ? "border-black scale-110"
                        : "border-white"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateNote}
              className="rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-[1.02]"
            >
              {editingId !== null ? "Update Note" : "Create Note"}
            </button>

            {editingId !== null && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                  setCategory("Personal");
                  setPriority("Medium");
                  setPinned(false);
                  setSelectedColor("#ffffff");
                }}
                className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-[1.02]"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

       {/* Recent Notes */}

        <div
          ref={notesRef}
          className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Recent Notes
            </h2>

            <p
              className={`mt-2 text-sm ${
                darkMode ? "text-cyan-300" : "text-purple-600"
              }`}
            >
              Showing {filteredNotes.length} of {notes.length} notes
            </p>
          </div>

          <button
            onClick={() =>
              formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            className="rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-fuchsia-500/30"
          >
            + New Note
          </button>
        </div>

        {loading ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>

            <p
              className={`text-lg font-semibold ${
                darkMode ? "text-purple-300" : "text-purple-700"
              }`}
            >
              Loading your notes...
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div
            className={`mt-10 rounded-3xl border border-dashed p-12 text-center ${
              darkMode
                ? "border-white/20 bg-white/5"
                : "border-purple-300 bg-purple-50"
            }`}
          >
            <div className="mb-4 text-7xl">📝</div>

            <h3
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              No Notes Found
            </h3>

            <p
              className={`mt-3 ${
                darkMode ? "text-gray-400" : "text-slate-600"
              }`}
            >
              Create your first beautiful note or change your filters.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => ( 

       <div
                key={note.id}
                className={`rounded-3xl border p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-3 hover:scale-[1.03] ${
                  darkMode
                    ? "border-white/10"
                    : "border-purple-200"
                }`}
                style={{
                  backgroundColor: note.color || (darkMode ? "#1e293b" : "#ffffff"),
                }}
              >
                <div className="mb-5 flex items-start justify-between">

                  <div className="flex flex-wrap gap-2">

                    <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-semibold text-cyan-300">
                      {note.category}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        note.priority === "High"
                          ? "bg-red-500/20 text-red-300"
                          : note.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {note.priority}
                    </span>

                    {note.pinned && (
                      <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white">
                        📌 PINNED
                      </span>
                    )}

                  </div>

                  <button
                    onClick={() => handleTogglePin(note)}
                    className="text-2xl transition hover:scale-125"
                  >
                    {note.pinned ? "📌" : "📍"}
                  </button>

                </div>

                <h3
  className="text-2xl font-bold text-slate-900"
>
                  {note.title}
                </h3>

                 <p
  className="mt-4 whitespace-pre-wrap text-slate-700"
>
                  {note.content}
                </p>

                <div className="mt-8 flex items-center justify-between">

                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    {new Date(
                      note.updatedAt || note.createdAt
                    ).toLocaleDateString()}
                  </span>

                  <div className="flex gap-3">

                    <button
                      onClick={() => handleEdit(note)}
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(note.id)}
                      className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

        <button
          onClick={() =>
            formRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
          className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-4xl text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-90"
        >
          +
        </button>

      </section>

    </main>
  );
} 
