import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory, deleteCategory } from "../api";
import { useTheme } from "../components/ThemeContext";
import {
  Sun, Moon, Archive, Tag, Trash, Settings, Plus,
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
      id: "tasks", label: "My Tasks",
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
      id: "categories", label: "Categories", icon: <Tag size={15} />,
      onClick: () => setActiveNav("categories"),
    },
    {
      id: "archive", label: "Archive", icon: <Archive size={15} />,
      onClick: () => { setActiveNav("archive"); navigate("/archive"); },
    },
    {
      id: "bin", label: "Bin", icon: <Trash size={15} />,
      onClick: () => setActiveNav("bin"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={15} />,
      onClick: () => {navigate("/settings"); setActiveNav("settings")},
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background/60 backdrop-blur-none transition-colors duration-500 font-serif">

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background sticky top-0 z-20">
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">{todayLabel}</p>
          <p className="text-sm font-bold font-serif text-text-main">My Workspace</p>
        </div>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted"
        >
          {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex w-48 flex-shrink-0 border-r border-border-subtle flex-col py-6 px-4 bg-background sticky top-0 h-screen">
        <div className="mb-8 px-2">
          <p className="font-semi-bold font-serif text-text-main tracking-tight">My Workspace</p>
          <p className="text-[10px] font-serif uppercase tracking-[0.18em] text-text-muted mt-0.5">Task Master</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all text-left w-full ${
                activeNav === item.id
                  ? "bg-card text-text-main border border-border-subtle"
                  : "text-text-muted hover:text-text-main hover:bg-card/60"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-3 py-2.5 bg-primary text-background rounded-xl text-xs font-serif font-semibold hover:opacity-80 transition-all mt-4"
        >
          <Plus size={14} />
          New Entry
        </button>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* DESKTOP HEADER */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-background sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">{todayLabel}</p>
            <h1 className="text-xl font-semi-bold font-serif text-text-main leading-tight mt-0.5 tracking-tight">Categories</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted hover:border-text-muted hover:text-text-main transition-colors"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 lg:pb-8">

          {/* Hero */}
          <div className="mb-8">
            <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted mb-2">Organize</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-serif text-text-main leading-tight max-w-sm">
              Organize your world.
            </h2>
            <div className="w-10 h-px bg-text-main mt-5" />
          </div>

          {/* Add category form */}
          <form onSubmit={handleCreate} className="flex gap-2 mb-10">
            <div className="relative flex-1">
              <Tag
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className="h-9 w-full pl-8 pr-3 bg-card border border-border-subtle rounded-full text-xs text-text-main placeholder-text-muted outline-none focus:border-text-muted transition-colors font-sans"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 h-9 bg-primary text-background rounded-full text-xs font-sans font-semibold hover:opacity-80 transition-all flex-shrink-0"
            >
              <Plus size={13} />
              Add
            </button>
          </form>

          {/* Section label */}
          {categories.length > 0 && (
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-main">
                All Categories
              </h3>
              <span className="text-[10px] font-sans text-text-muted">
                {categories.length} entries
              </span>
            </div>
          )}

          {/* Category rows */}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 py-4 border-b border-border-subtle group last:border-b-0"
            >
              {/* Dot */}
              <div className="w-[18px] h-[18px] rounded-full border-2 border-border-subtle flex-shrink-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-serif leading-snug text-text-main">
                  {cat.name}
                </p>
                {cat.name === "General" && (
                  <p className="text-[10px] font-sans text-text-muted mt-0.5 uppercase tracking-wide">
                    Default
                  </p>
                )}
              </div>

              {/* Delete */}
              {cat.name !== "General" ? (
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-[10px] font-sans font-semibold uppercase tracking-wider text-text-muted hover:text-red-400 flex-shrink-0"
                >
                  Delete
                </button>
              ) : (
                <span className="text-[10px] font-sans text-text-muted italic flex-shrink-0 opacity-40">
                  Protected
                </span>
              )}
            </div>
          ))}

          {/* Empty state */}
          {categories.length === 0 && (
            <div className="text-center py-24">
              <Tag size={24} className="text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-text-muted text-xs font-sans tracking-wide uppercase">
                No categories defined yet.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-border-subtle bg-background">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] font-sans uppercase tracking-[0.08em] transition-colors ${
              activeNav === item.id ? "text-text-main" : "text-text-muted"
            }`}
          >
            <span>{item.icon}</span>
            {item.label === "My Tasks" ? "Tasks" : item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Categories;