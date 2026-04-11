import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext";
import {
  Sun, Moon, Archive, Tag, Trash, Settings, Plus, Upload, RotateCcw,
} from "lucide-react";

const PRESETS = [
  {
    label: "Valley",
    value: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1400&auto=format&fit=crop",
  },
  {
    label: "Forest",
    value: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1400&auto=format&fit=crop",
  },
  {
    label: "Ocean",
    value: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1400&auto=format&fit=crop",
  },
  { label: "Midnight", value: "linear-gradient(135deg,#111827,#1f2937)" },
  { label: "Violet",   value: "linear-gradient(135deg,#312e81,#7c3aed)" },
  { label: "Emerald",  value: "linear-gradient(135deg,#064e3b,#065f46)" },
];

export default function Setting() {
  const { theme, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState("settings");
  const navigate = useNavigate();

  const [bg, setBg]           = useState("");
  const [overlay, setOverlay] = useState(35);
  const [blur, setBlur]       = useState(0);

  const todayLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })
    .toUpperCase();

  useEffect(() => {
    setBg(localStorage.getItem("bgImage") || "");
    setOverlay(Number(localStorage.getItem("bgOverlay") || 35));
    setBlur(Number(localStorage.getItem("bgBlur") || 0));
  }, []);

  const save = (nextBg = bg, nextOverlay = overlay, nextBlur = blur) => {
    localStorage.setItem("bgImage", nextBg);
    localStorage.setItem("bgOverlay", String(nextOverlay));
    localStorage.setItem("bgBlur", String(nextBlur));
    setBg(nextBg);
    setOverlay(nextOverlay);
    setBlur(nextBlur);
    window.dispatchEvent(new Event("bg-updated"));
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => save(reader.result);
    reader.readAsDataURL(file);
  };

  const previewStyle = bg
    ? bg.startsWith("linear-gradient")
      ? { background: bg }
      : {
          backgroundImage: `linear-gradient(rgba(0,0,0,${overlay / 100}),rgba(0,0,0,${overlay / 100})),url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: blur ? `blur(${blur}px)` : undefined,
        }
    : { background: "var(--color-background-secondary, #f5f5f5)" };

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
      onClick: () => { setActiveNav("categories"); navigate("/categories"); },
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
      id: "settings", label: "Settings", icon: <Settings size={15} />,
      onClick: () => setActiveNav("settings"),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background transition-colors duration-500 font-serif">

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
            <h1 className="text-xl font-semi-bold font-serif text-text-main leading-tight mt-0.5 tracking-tight">Settings</h1>
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
            <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted mb-2">Customise</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-serif text-text-main leading-tight max-w-sm">
              Make it yours.
            </h2>
            <div className="w-10 h-px bg-text-main mt-5" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-4xl">

            {/* ── LEFT: controls ── */}
            <div className="flex-1 min-w-0">

              {/* PRESET BACKGROUNDS — as "task rows" */}
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-main">
                  Preset Backgrounds
                </h3>
                <span className="text-[10px] font-sans text-text-muted">{PRESETS.length} options</span>
              </div>

              {PRESETS.map((preset, i) => {
                const isActive = bg === preset.value;
                return (
                  <button
                    key={i}
                    onClick={() => save(preset.value)}
                    className={`w-full flex items-center gap-3 py-4 border-b border-border-subtle group last:border-b-0 text-left transition-colors ${
                      isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Swatch circle */}
                    <div
                      className={`w-[18px] h-[18px] rounded-full flex-shrink-0 border-2 transition-all ${
                        isActive ? "border-text-main scale-110" : "border-border-subtle"
                      }`}
                      style={{
                        background: preset.value.startsWith("linear-gradient")
                          ? preset.value
                          : `url(${preset.value}) center/cover`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold font-serif leading-snug ${isActive ? "text-text-main" : "text-text-muted"}`}>
                        {preset.label}
                      </p>
                      <p className="text-xs text-text-muted font-sans mt-0.5 truncate">
                        {preset.value.startsWith("linear-gradient") ? "Gradient" : "Photo"}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-text-main text-background flex-shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}

              {/* UPLOAD ROW */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-main">
                    Custom Upload
                  </h3>
                </div>
                <label className="flex items-center gap-3 py-4 border-b border-border-subtle cursor-pointer group">
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-border-subtle flex-shrink-0 flex items-center justify-center text-text-muted group-hover:border-text-muted transition-colors">
                    <Upload size={9} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold font-serif leading-snug text-text-main">Upload your own image</p>
                    <p className="text-xs text-text-muted font-sans mt-0.5">JPG, PNG, WEBP supported</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>

              {/* SLIDERS */}
              <div className="mt-6 flex flex-col gap-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-main">
                    Adjustments
                  </h3>
                </div>

                {/* Overlay slider */}
                <div className="flex items-start gap-3 py-4 border-b border-border-subtle">
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-border-subtle flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold font-serif leading-snug text-text-main">Overlay Darkness</p>
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-border-subtle text-text-muted">
                        {overlay}%
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="80" value={overlay}
                      onChange={(e) => save(bg, Number(e.target.value), blur)}
                      className="w-full accent-text-main"
                    />
                  </div>
                </div>

                {/* Blur slider */}
                <div className="flex items-start gap-3 py-4 border-b border-border-subtle">
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-border-subtle flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold font-serif leading-snug text-text-main">Blur Strength</p>
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-border-subtle text-text-muted">
                        {blur}px
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="12" value={blur}
                      onChange={(e) => save(bg, overlay, Number(e.target.value))}
                      className="w-full accent-text-main"
                    />
                  </div>
                </div>
              </div>

              {/* REMOVE — dark card style */}
              <div className="mt-8 bg-text-main rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-sans uppercase tracking-[0.18em] text-text-muted mb-1">Reset</p>
                  <p className="text-sm font-serif font-bold text-background leading-snug">Remove background</p>
                </div>
                <button
                  onClick={() => save("", 35, 0)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-background text-text-main rounded-full text-xs font-sans font-semibold hover:opacity-80 transition-all"
                >
                  <RotateCcw size={11} />
                  Reset
                </button>
              </div>
            </div>

            {/* ── RIGHT: live preview ── */}
            <div className="lg:w-56 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <p className="text-[9px] font-sans uppercase tracking-[0.2em] font-semibold text-text-muted mb-3">
                  Live Preview
                </p>
                <div
                  className="w-full aspect-[9/16] max-h-[420px] rounded-xl overflow-hidden border border-border-subtle relative"
                  style={previewStyle}
                >
                  {/* Mini mock of the app UI over the bg */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="px-3 py-2 border-b border-white/10 bg-black/20 backdrop-blur-sm">
                      <p className="text-[8px] uppercase tracking-widest text-white/50">My Workspace</p>
                      <p className="text-xs font-serif font-bold text-white">Dashboard</p>
                    </div>
                    <div className="flex-1 px-3 py-3 flex flex-col gap-2">
                      {["Design handoff", "Review tickets", "Send report"].map((t, i) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/10">
                          <div className="w-3 h-3 rounded-full border border-white/40 flex-shrink-0" />
                          <p className="text-[10px] font-serif text-white/80 truncate">{t}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-3 py-2 bg-white/10 backdrop-blur-sm mx-2 mb-2 rounded-lg">
                      <p className="text-[9px] uppercase tracking-widest text-white/50">Next Priority</p>
                      <p className="text-[11px] font-serif font-bold text-white">Design handoff</p>
                    </div>
                  </div>
                </div>
                {bg && (
                  <p className="text-[10px] font-sans text-text-muted mt-2 text-center">
                    Background active across all pages
                  </p>
                )}
              </div>
            </div>
          </div>
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