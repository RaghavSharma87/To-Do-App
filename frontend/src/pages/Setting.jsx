import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext";
import {
  Sun,
  Moon,
  Archive,
  Tag,
  Trash,
  Settings,
  Plus,
  AlertTriangle,
  Bell,
  BellOff,
} from "lucide-react";
import {
  requestNotificationPermission,
  registerSW,
} from "../utils/notifications";

export default function Setting() {
  const { theme, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState("settings");
  const navigate = useNavigate();

  const [autoDeleteArchive, setAutoDeleteArchive] = useState(
    localStorage.getItem("autoDeleteArchive") === "true"
  );
  const [archiveDays, setArchiveDays] = useState(
    localStorage.getItem("archiveDays") || "30"
  );
  const [confirmDelete, setConfirmDelete] = useState(
    localStorage.getItem("confirmDelete") !== "false"
  );
  const [notificationPersonality, setNotificationPersonality] = useState(
    localStorage.getItem("notificationPersonality") || "politeness"
  );
  const [notifPermission, setNotifPermission] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const [saved, setSaved] = useState(false);

  const todayLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const saveSettings = () => {
    localStorage.setItem("autoDeleteArchive", String(autoDeleteArchive));
    localStorage.setItem("archiveDays", archiveDays);
    localStorage.setItem("confirmDelete", String(confirmDelete));
    localStorage.setItem("notificationPersonality", notificationPersonality);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRequestPermission = async () => {
    await registerSW();
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? "granted" : "denied");
  };

  const navItems = [
    {
      id: "tasks",
      label: "My Tasks",
      icon: (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
      ),
      onClick: () => navigate("/home"),
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Tag size={15} />,
      onClick: () => navigate("/categories"),
    },
    {
      id: "archive",
      label: "Archive",
      icon: <Archive size={15} />,
      onClick: () => navigate("/archive"),
    },
    {
      id: "bin",
      label: "Bin",
      icon: <Trash size={15} />,
      onClick: () => navigate("/bin"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={15} />,
      onClick: () => setActiveNav("settings"),
    },
    {
      id: "missed",
      label: "Missed",
      icon: <AlertTriangle size={15} />,
      onClick: () => navigate("/missed-deadlines"),
    },
  ];

  const Toggle = ({ checked, onChange }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-text-main" : "bg-border-subtle"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background/60 backdrop-blur-none transition-colors duration-500 font-serif">
      {/* ============ MOBILE TOP BAR ============ */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">
            {todayLabel}
          </p>
          <p className="text-sm font-bold font-serif text-text-main">Settings</p>
        </div>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted"
        >
          {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>

      {/* ============ DESKTOP LEFT SIDEBAR ============ */}
      <aside className="hidden lg:flex w-48 flex-shrink-0 border-r border-border-subtle flex-col py-6 px-4 bg-background sticky top-0 h-screen">
        <div className="mb-8 px-2">
          <p className="font-semi-bold font-serif text-text-main tracking-tight">
            My Workspace
          </p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans w-full ${
                activeNav === item.id
                  ? "bg-card text-text-main border border-border-subtle"
                  : "text-text-muted hover:bg-card/60"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="flex-1">
        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-background sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-sans text-text-muted">{todayLabel}</p>
            <h1 className="text-xl font-serif text-text-main">Settings</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl space-y-8 pb-28 lg:pb-12">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted mb-2">
              Preferences
            </p>
            <h2 className="text-3xl font-semibold text-text-main">
              Control your workspace.
            </h2>
          </div>

          {/* ── Notifications ── */}
          <section className="border border-border-subtle rounded-2xl p-5 space-y-5 bg-card/40">
            <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-muted">
              Notifications
            </h3>

            {/* Permission row */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold font-serif text-text-main">
                  Browser notifications
                </p>
                <p className="text-xs font-sans text-text-muted">
                  {notifPermission === "granted"
                    ? "Notifications are enabled."
                    : notifPermission === "denied"
                    ? "Blocked by browser — update site permissions manually."
                    : notifPermission === "unsupported"
                    ? "Your browser does not support notifications."
                    : "Grant permission to receive task reminders."}
                </p>
              </div>
              {notifPermission === "granted" ? (
                <Bell size={16} className="text-text-muted flex-shrink-0" />
              ) : notifPermission === "denied" || notifPermission === "unsupported" ? (
                <BellOff size={16} className="text-red-400 flex-shrink-0" />
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="text-xs font-sans px-3 py-1.5 rounded-xl border border-border-subtle bg-background text-text-main hover:bg-card/60 transition-colors flex-shrink-0"
                >
                  Enable
                </button>
              )}
            </div>

            {/* Personality */}
            <div>
              <p className="text-sm font-semibold font-serif text-text-main mb-1">
                Reminder personality
              </p>
              <p className="text-xs font-sans text-text-muted mb-3">
                Choose how your notifications talk to you.
              </p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "politeness", label: "Polite 🙂" },
                  { value: "semi", label: "Semi Harami 😏" },
                  { value: "harami", label: "Harami 😈" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNotificationPersonality(opt.value)}
                    className={`text-xs font-sans px-3 py-1.5 rounded-xl border transition-colors ${
                      notificationPersonality === opt.value
                        ? "border-text-main bg-card text-text-main"
                        : "border-border-subtle text-text-muted hover:bg-card/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Archive Management ── */}
          <section className="border border-border-subtle rounded-2xl p-5 space-y-5 bg-card/40">
            <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-muted">
              Archive Management
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold font-serif text-text-main">
                  Auto-delete archived tasks
                </p>
                <p className="text-xs font-sans text-text-muted">
                  Remove archived tasks automatically after selected days.
                </p>
              </div>
              <Toggle checked={autoDeleteArchive} onChange={setAutoDeleteArchive} />
            </div>
            {autoDeleteArchive && (
              <div>
                <p className="text-xs font-sans text-text-muted mb-2">Delete after</p>
                <select
                  value={archiveDays}
                  onChange={(e) => setArchiveDays(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-border-subtle bg-background text-text-main text-sm font-sans"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            )}
          </section>

          {/* ── Task Actions ── */}
          <section className="border border-border-subtle rounded-2xl p-5 space-y-5 bg-card/40">
            <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-muted">
              Task Actions
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold font-serif text-text-main">
                  Confirm before delete
                </p>
                <p className="text-xs font-sans text-text-muted">
                  Show confirmation popup before deleting tasks.
                </p>
              </div>
              <Toggle checked={confirmDelete} onChange={setConfirmDelete} />
            </div>
          </section>

          {/* ── Appearance ── */}
          <section className="border border-border-subtle rounded-2xl p-5 space-y-5 bg-card/40">
            <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-muted">
              Appearance
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold font-serif text-text-main">
                  Theme
                </p>
                <p className="text-xs font-sans text-text-muted">
                  Switch between light and dark mode.
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-xs font-sans px-3 py-1.5 rounded-xl border border-border-subtle bg-background text-text-main hover:bg-card/60 transition-colors"
              >
                {theme === "light" ? (
                  <><Moon size={13} /> Dark</>
                ) : (
                  <><Sun size={13} /> Light</>
                )}
              </button>
            </div>
          </section>

          {/* Save button */}
          <button
            onClick={saveSettings}
            className="px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-sans font-semibold transition-opacity hover:opacity-80"
          >
            {saved ? "Saved ✓" : "Save Settings"}
          </button>
        </main>
      </div>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-border-subtle bg-background/80 backdrop-blur-md">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] font-sans uppercase tracking-[0.08em] transition-colors ${
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
