import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Archive,
  Tag,
  Trash,
  Settings,
  Plus,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, completeTask } from "../api";
import { useTheme } from "../components/ThemeContext";

function MissedDeadlines() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [activeNav, setActiveNav] = useState("missed");

  const todayLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const fetchTasks = async () => {
    const res = await getTasks();
    setTasks(res.data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const missedTasks = useMemo(() => {
    const now = new Date();

    const to24Hour = (timeStr) => {
      if (!timeStr) return "23:59";
      if (
        timeStr.includes(":") &&
        !timeStr.includes("AM") &&
        !timeStr.includes("PM")
      ) {
        return timeStr;
      }
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    return tasks
      .filter((t) => {
        if (t.completed || t.archived || !t.end_date) return false;
        const safeTime = to24Hour(t.end_time);
        const deadline = new Date(`${t.end_date}T${safeTime}`);
        return !isNaN(deadline.getTime()) && deadline < now;
      })
      .sort((a, b) => {
        // This sorts the filtered tasks so the one that was due
        // the longest time ago appears at index [0]
        const timeA = new Date(
          `${a.end_date}T${to24Hour(a.end_time)}`,
        ).getTime();
        const timeB = new Date(
          `${b.end_date}T${to24Hour(b.end_time)}`,
        ).getTime();
        return timeA - timeB;
      });
  }, [tasks]);

  const handleComplete = async (id) => {
    await completeTask(id);
    fetchTasks();
  };

  const overdueText = (date, time) => {
    const deadline = new Date(`${date}T${time || "23:59"}`);
    const diff = new Date() - deadline;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
    return `${Math.max(1, hours)} hour${hours !== 1 ? "s" : ""}`;
  };

  const navItems = [
    {
      id: "tasks",
      label: "My Tasks",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
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
      onClick: () => navigate("/settings"),
    },
    {
      id: "missed",
      label: "Missed",
      icon: <AlertTriangle size={15} />,
      onClick: () => setActiveNav("missed"),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background/60 backdrop-blur-none transition-colors duration-500 font-serif">
      {/* ============ MOBILE TOP BAR ============ */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">
            {todayLabel}
          </p>
          <p className="text-sm font-bold font-serif text-text-main">
            Missed Deadlines
          </p>
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

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto pb-28 lg:pb-8">
          {/* Desktop header */}
          <header className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted mb-1">
                {todayLabel}
              </p>
              <h1 className="text-3xl font-semibold text-text-main">
                Missed Deadlines
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl border border-border-subtle bg-card text-sm font-sans text-text-muted">
                {missedTasks.length} overdue
              </div>
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted"
              >
                {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            </div>
          </header>

          {/* Mobile count badge */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted mb-1">
                Recovery Zone
              </p>
              <h2 className="text-xl font-semibold text-text-main">
                Overdue Tasks
              </h2>
            </div>
            <div className="px-3 py-1.5 rounded-full border border-border-subtle bg-card text-xs font-sans text-text-muted">
              {missedTasks.length}
            </div>
          </div>

          {missedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border-subtle bg-card p-12 text-center"
            >
              <CheckCircle2
                className="mx-auto mb-3 text-text-muted"
                size={28}
              />
              <p className="text-lg font-semibold font-serif text-text-main">
                You're back on track.
              </p>
              <p className="text-sm text-text-muted font-sans mt-1">
                No missed deadlines right now.
              </p>
            </motion.div>
          ) : (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-muted">
                  Overdue Tasks
                </h3>
                <span className="text-[10px] font-sans text-text-muted">
                  Complete these first
                </span>
              </div>

              <AnimatePresence>
                {missedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3 py-4 border-b border-border-subtle group last:border-b-0"
                  >
                    {/* Complete button */}
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="mt-0.5 w-[18px] h-[18px] rounded-full border-2 border-red-400 hover:bg-green-500 hover:border-green-500 flex-shrink-0 transition-all"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold font-serif leading-snug text-text-main">
                        {task.title}
                      </p>
                      <p className="text-xs text-text-muted font-sans mt-0.5">
                        Deadline: {task.end_date}
                        {task.end_time && ` · ${task.end_time}`}
                        {" · "}Overdue by{" "}
                        {overdueText(task.end_date, task.end_time)}
                        {task.category_name && (
                          <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-background border border-border-subtle text-[10px] uppercase tracking-wide">
                            {task.category_name}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Late badge */}
                    <span className="text-[10px] font-sans px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 flex items-center gap-1 flex-shrink-0">
                      <AlertTriangle size={11} /> Late
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>
          )}
        </main>

        {/* ============ DESKTOP RIGHT PANEL ============ */}
        <aside className="hidden lg:flex w-56 flex-shrink-0 border-l border-border-subtle px-5 py-8 flex-col gap-7 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div>
            <p className="text-[9px] font-sans uppercase tracking-[0.2em] font-semibold text-text-muted mb-3">
              Summary
            </p>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-sans text-text-muted">
                Overdue tasks
              </span>
              <span className="text-[11px] font-sans font-semibold text-red-500">
                {missedTasks.length}
              </span>
            </div>
            <div className="h-[3px] rounded-full bg-border-subtle overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all duration-500"
                style={{ width: missedTasks.length > 0 ? "100%" : "0%" }}
              />
            </div>
            <p className="text-[10px] font-sans text-text-muted mt-2 leading-relaxed">
              {missedTasks.length === 0
                ? "All clear — nothing overdue."
                : "Complete these to restore your efficiency score."}
            </p>
          </div>

          {missedTasks.length > 0 && (
            <div className="bg-warn rounded-xl p-4">
              <p className="font-bold font-serif uppercase tracking-[0.18em] text-text mb-2 text-[10px]">
                Most Overdue
              </p>
              <p className="text-sm font-serif font-bold text-text leading-snug">
                {missedTasks[0].title}
              </p>
              <p className="text-[11px] font-sans text-text mt-1">
                {overdueText(missedTasks[0].end_date, missedTasks[0].end_time)}{" "}
                late
              </p>
            </div>
          )}

          <div>
            <p className="text-[9px] font-sans uppercase tracking-[0.2em] font-semibold text-text-muted mb-3">
              All Overdue
            </p>
            <div className="flex flex-col gap-2.5">
              {missedTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex gap-2 items-start">
                  <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-sans font-medium text-text-main leading-snug">
                      {t.title}
                    </p>
                    <p className="text-[10px] font-sans text-text-muted">
                      {overdueText(t.end_date, t.end_time)} late
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-border-subtle bg-background/80 backdrop-blur-md">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] font-sans uppercase tracking-[0.08em] transition-colors relative ${
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

export default MissedDeadlines;
