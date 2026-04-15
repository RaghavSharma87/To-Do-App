import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext";
import { Sun, Moon, Archive, Tag, Trash, Settings, Plus } from "lucide-react";

export default function Setting() {
  const { theme, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState("settings");
  const navigate = useNavigate();
  const [autoDeleteArchive, setAutoDeleteArchive] = useState(localStorage.getItem("autoDeleteArchive") === "true");
  const [archiveDays, setArchiveDays] = useState(localStorage.getItem("archiveDays") || "30");
  const [confirmDelete, setConfirmDelete] = useState(localStorage.getItem("confirmDelete") !== "false");

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase();

  const saveSettings = () => {
    localStorage.setItem("autoDeleteArchive", String(autoDeleteArchive));
    localStorage.setItem("archiveDays", archiveDays);
    localStorage.setItem("confirmDelete", String(confirmDelete));
  };

  const navItems = [
    { id: "tasks", label: "My Tasks", icon: <Plus size={15} />, onClick: () => navigate("/home") },
    { id: "categories", label: "Categories", icon: <Tag size={15} />, onClick: () => navigate("/categories") },
    { id: "archive", label: "Archive", icon: <Archive size={15} />, onClick: () => navigate("/archive") },
    { id: "bin", label: "Bin", icon: <Trash size={15} />, onClick: () => setActiveNav("bin") },
    { id: "settings", label: "Settings", icon: <Settings size={15} />, onClick: () => setActiveNav("settings") },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background transition-colors duration-500 font-serif">
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background sticky top-0 z-20">
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">{todayLabel}</p>
          <p className="text-sm font-bold font-serif text-text-main">My Workspace</p>
        </div>
        <button onClick={toggleTheme} className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted">{theme === "light" ? <Moon size={14} /> : <Sun size={14} />}</button>
      </div>

      <aside className="hidden lg:flex w-48 flex-shrink-0 border-r border-border-subtle flex-col py-6 px-4 bg-background sticky top-0 h-screen">
        <div className="mb-8 px-2"><p className="font-semi-bold font-serif text-text-main tracking-tight">My Workspace</p></div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={item.onClick} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans w-full ${activeNav === item.id ? "bg-card text-text-main border border-border-subtle" : "text-text-muted hover:bg-card/60"}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-background sticky top-0 z-10">
          <div><p className="text-[10px] text-text-muted">{todayLabel}</p><h1 className="text-xl font-serif text-text-main">Settings</h1></div>
          <button onClick={toggleTheme} className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted">{theme === "light" ? <Moon size={14} /> : <Sun size={14} />}</button>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl space-y-8 pb-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-2">Preferences</p>
            <h2 className="text-3xl font-semibold text-text-main">Control your workspace.</h2>
          </div>

          <section className="border border-border-subtle rounded-2xl p-5 space-y-5 bg-card/40">
            <h3 className="text-sm uppercase tracking-[0.12em] text-text-main">Archive Management</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-main">Auto-delete archived tasks</p>
                <p className="text-xs text-text-muted">Remove archived tasks automatically after selected days.</p>
              </div>
              <input type="checkbox" checked={autoDeleteArchive} onChange={(e)=>setAutoDeleteArchive(e.target.checked)} />
            </div>
            {autoDeleteArchive && (
              <div>
                <p className="text-xs text-text-muted mb-2">Delete after</p>
                <select value={archiveDays} onChange={(e)=>setArchiveDays(e.target.value)} className="h-10 px-3 rounded-xl border border-border-subtle bg-background">
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            )}
          </section>

          <section className="border border-border-subtle rounded-2xl p-5 space-y-5 bg-card/40">
            <h3 className="text-sm uppercase tracking-[0.12em] text-text-main">Task Actions</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-main">Confirm before delete</p>
                <p className="text-xs text-text-muted">Show confirmation popup before deleting tasks.</p>
              </div>
              <input type="checkbox" checked={confirmDelete} onChange={(e)=>setConfirmDelete(e.target.checked)} />
            </div>
          </section>

          <button onClick={saveSettings} className="px-4 py-2 rounded-xl bg-primary text-background text-sm font-semibold">Save Settings</button>
        </main>
      </div>
    </div>
  );
}