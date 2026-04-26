import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory, deleteCategory } from "../api";
import { useTheme } from "../components/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Archive, Tag, Trash, Settings, Plus, Layers,
} from "lucide-react";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState("categories");
  const navigate = useNavigate();

  const todayLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })
    .toUpperCase();

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await createCategory({ name: newCategory });
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    {
      id: "tasks",
      label: "Tasks",
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
      ),
      onClick: () => { setActiveNav("tasks"); navigate("/home"); },
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Tag size={15} />,
      onClick: () => setActiveNav("categories"),
    },
    {
      id: "archive",
      label: "Archive",
      icon: <Archive size={15} />,
      onClick: () => { setActiveNav("archive"); navigate("/archive"); },
    },
    {
      id: "bin",
      label: "Bin",
      icon: <Trash size={15} />,
      onClick: () => setActiveNav("bin"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={15} />,
      onClick: () => { navigate("/settings"); setActiveNav("settings"); },
    },
  ];

  // Assign a soft accent color per category index for visual variety
  const ACCENT_COLORS = [
    "bg-violet-400/10 text-violet-400 border-violet-400/20",
    "bg-sky-400/10 text-sky-400 border-sky-400/20",
    "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    "bg-amber-400/10 text-amber-400 border-amber-400/20",
    "bg-rose-400/10 text-rose-400 border-rose-400/20",
    "bg-fuchsia-400/10 text-fuchsia-400 border-fuchsia-400/20",
  ];

  const DOT_COLORS = [
    "bg-violet-400",
    "bg-sky-400",
    "bg-emerald-400",
    "bg-amber-400",
    "bg-rose-400",
    "bg-fuchsia-400",
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background transition-colors duration-500 font-sans">

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/90 backdrop-blur-xl sticky top-0 z-20">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted">{todayLabel}</p>
          <p className="text-sm font-bold text-text-main tracking-tight">My Workspace</p>
        </div>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted"
        >
          {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex w-[220px] flex-shrink-0 border-r border-border-subtle flex-col px-4 py-7 gap-5 bg-background sticky top-0 h-screen overflow-y-auto">
        <div className="px-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-1">{todayLabel}</p>
          <p className="text-base font-bold text-text-main tracking-tight">My Workspace</p>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all text-left group ${
                activeNav === item.id
                  ? "bg-text-main/8 text-text-main font-semibold"
                  : "text-text-muted hover:text-text-main hover:bg-border-subtle/50"
              }`}
            >
              <span className={`transition-colors ${activeNav === item.id ? "text-text-main" : "text-text-muted group-hover:text-text-main"}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-text-muted hover:text-text-main hover:bg-border-subtle/50 transition-all"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center justify-center gap-2 h-9 rounded-xl bg-text-main text-background text-[13px] font-semibold transition-opacity hover:opacity-80"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* DESKTOP HEADER */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-border-subtle bg-background/90 backdrop-blur-xl sticky top-0 z-10">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted">{todayLabel}</p>
            <h1 className="text-lg font-bold text-text-main leading-tight mt-0.5 tracking-tight">Categories</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted hover:border-text-muted hover:text-text-main transition-colors"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-7 pb-32 lg:pb-8">

          {/* Hero */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3 font-medium">Organize</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-main leading-[1.15] tracking-tight max-w-xs">
              Organize your world.
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-px w-8 bg-text-main/30" />
              <span className="text-[11px] text-text-muted font-medium">
                {categories.length} {categories.length === 1 ? "category" : "categories"} defined
              </span>
            </div>
          </div>

          {/* Add category form */}
          <form onSubmit={handleCreate} className="flex gap-2 mb-10 max-w-lg">
            <div className="relative flex-1">
              <Tag size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className="h-9 w-full pl-9 pr-3 bg-card border border-border-subtle rounded-xl text-[13px] text-text-main placeholder-text-muted outline-none focus:border-text-muted transition-colors"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 h-9 bg-text-main text-background rounded-xl text-[13px] font-semibold hover:opacity-80 transition-all flex-shrink-0"
            >
              <Plus size={13} />
              Add
            </button>
          </form>

          {/* Section label */}
          {categories.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] uppercase tracking-[0.14em] font-bold text-text-main">All Categories</h3>
                <span className="text-[10px] bg-border-subtle text-text-muted font-bold px-2 py-0.5 rounded-md">
                  {categories.length} entries
                </span>
              </div>
            </div>
          )}

          {/* Category cards */}
          <div className="flex flex-col gap-2 max-w-lg">
            <AnimatePresence>
              {categories.map((cat, i) => {
                const accentCls = ACCENT_COLORS[i % ACCENT_COLORS.length];
                const dotCls = DOT_COLORS[i % DOT_COLORS.length];
                const isProtected = cat.name === "General";

                return (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border-subtle hover:border-text-muted/40 hover:shadow-sm hover:shadow-black/10 transition-all duration-200"
                  >
                    {/* Color dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />

                    {/* Name + badge */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <p className="text-[13px] font-medium text-text-main leading-snug">
                        {cat.name}
                      </p>
                      {isProtected && (
                        <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md border ${accentCls}`}>
                          Default
                        </span>
                      )}
                    </div>

                    {/* Delete / Protected */}
                    {!isProtected ? (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className=" group-hover:opacity-40 hover:!opacity-100 transition-opacity text-[12px] font-semibold text-text-muted hover:text-rose-400 flex-shrink-0"
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="text-[10px] text-text-muted/30 italic flex-shrink-0">Protected</span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-border-subtle flex items-center justify-center text-text-muted">
                <Layers size={20} />
              </div>
              <p className="text-text-muted text-xs uppercase tracking-wide">No categories defined yet.</p>
            </div>
          )}
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-border-subtle bg-background/90 backdrop-blur-xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] uppercase tracking-[0.08em] transition-colors ${
              activeNav === item.id ? "text-text-main" : "text-text-muted"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Categories;