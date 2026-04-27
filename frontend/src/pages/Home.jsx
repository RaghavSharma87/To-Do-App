import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, ArrowBigLeft, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Archive,
  Tag,
  Trash,
  Settings,
  GripVertical,
  SlidersHorizontal,
  Filter,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  DndContext,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getTasks,
  createTask,
  completeTask,
  deleteTask,
  getCategories,
  reorderTasks,
} from "../api";
import TaskModal from "../components/TaskModal";
import { useTheme } from "../components/ThemeContext";
import {
  registerSW,
  requestNotificationPermission,
  scheduleTaskNotification,
  clearScheduledNotification,
} from "../utils/notifications";
import { keepAlive } from "../hooks/keepAlive";
// ---------------- CREDIT MAP ----------------
const CREDITS = { high: 4, medium: 3, low: 1, none: 0 };

// ---------------- PRIORITY CONFIG ----------------
const PRIORITY_CONFIG = {
  high: {
    label: "High",
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    ring: "ring-rose-500/30",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-400",
    badge: "bg-amber-400/10 text-amber-400 border border-amber-400/20",
    ring: "ring-amber-400/30",
  },
  low: {
    label: "Low",
    dot: "bg-sky-400",
    badge: "bg-sky-400/10 text-sky-400 border border-sky-400/20",
    ring: "ring-sky-400/30",
  },
  none: {
    label: null,
    dot: "bg-border-subtle",
    badge: null,
    ring: null,
  },
};

// ---------------- SORTABLE TASK ROW ----------------
function SortableTask({ task, onToggle, onDelete, showDate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const pConfig = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.none;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.18 }}
      className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-2 border transition-all duration-200
        ${task.completed
          ? "bg-border-subtle/20 border-border-subtle/30 opacity-60"
          : "bg-card border-border-subtle hover:border-text-muted/40 hover:shadow-sm hover:shadow-black/10"
        }`}
    >
      {/* Priority accent line */}
      {!task.completed && task.priority !== "none" && (
        <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${pConfig.dot}`} />
      )}

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab opacity-0 group-hover:opacity-30 hover:!opacity-60 flex-shrink-0 text-text-muted touch-none transition-opacity"
      >
        <GripVertical size={13} />
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(task)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? "bg-text-main border-text-main"
            : `border-border-subtle hover:border-text-muted ${pConfig.ring ? `hover:ring-2 ${pConfig.ring}` : ""}`
        }`}
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-background"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug transition-colors ${
          task.completed ? "line-through text-text-muted" : "text-text-main"
        }`}>
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {task.person && task.person !== "Unassigned" && (
            <span className="text-[11px] text-text-muted font-sans">{task.person}</span>
          )}
          {task.person && task.person !== "Unassigned" && (
            <span className="text-text-muted/40 text-[10px]">·</span>
          )}
          <span className="text-[11px] text-text-muted font-sans">
            {showDate ? task.end_date : "Today"}
            {task.end_time && ` at ${task.end_time}`}
          </span>
          {task.category_name && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-background border border-border-subtle text-[10px] font-sans uppercase tracking-wide text-text-muted">
              {task.category_name}
            </span>
          )}
        </div>
      </div>

      {/* Priority Badge */}
      {pConfig.badge && (
        <span className={`text-[10px] font-sans font-semibold uppercase tracking-widest px-2.5 py-1 rounded-lg flex-shrink-0 ${pConfig.badge}`}>
          {pConfig.label}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity text-text-muted hover:text-rose-400 flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

// ---------------- HOME ----------------
function Home() {
  keepAlive();
  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCreatedModalOpen, setIsCreatedModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("tasks");
  const [title, setTitle] = useState("");
  const [person, setPerson] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchPerson, setSearchPerson] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [frequencyDays, setFrequencyDays] = useState([]);
  const [priority, setPriority] = useState("none");
  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [allTasks, setAllTasks] = useState([]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLabel = new Date()
    .toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    .toUpperCase();

  const fetchTasks = async (query = "") => {
    try {
      const res = await getTasks(query);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchAllTasksForAnalytics = async () => {
    try {
      const res = await getTasks({ include_archived: "true" });
      setAllTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch all tasks", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
      if (res.data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchAllTasksForAnalytics();
    registerSW();
    requestNotificationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = {};
      if (searchPerson) params.person = searchPerson;
      if (filterDate) params.date = filterDate;
      if (filterCategory) params.category = filterCategory;
      fetchTasks(params);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchPerson, filterCategory, filterDate]);

    const now = new Date();
  const tomorrowStr = new Date(Date.now() + 86400000)
    .toISOString()
    .split("T")[0];

  const missedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.completed || t.archived || !t.end_date) return false;
      const deadline = new Date(`${t.end_date}T${t.end_time || "23:59"}`);
      return deadline < now;
    });
  }, [tasks, now]);

  const tasksDueToday = useMemo(
    () =>
      tasks.filter(
        (t) => t.end_date === todayStr && !t.completed && !t.archived,
      ),
    [tasks, todayStr],
  );

  const otherTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !t.completed &&
          !t.archived &&
          t.end_date >= todayStr &&
          t.end_date !== todayStr,
      ),
    [tasks, todayStr],
  );

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed && t.archived),
    [tasks],
  );
  const activeTasks = useMemo(() => tasks.filter((t) => !t.archived), [tasks]);

  const efficiencyTasks = useMemo(() => {
    if (filterDate === todayStr) {
      return allTasks.filter((t) => t.end_date === todayStr);
    }
    if (filterDate === tomorrowStr) {
      return allTasks.filter((t) => t.end_date === tomorrowStr);
    }
    return allTasks;
  }, [tasks, allTasks, filterDate, todayStr, tomorrowStr]);

  const totalCredits = useMemo(
    () =>
      efficiencyTasks.reduce((sum, t) => sum + (CREDITS[t.priority] ?? 0), 0),
    [efficiencyTasks],
  );

  const earnedCredits = useMemo(
    () =>
      efficiencyTasks
        .filter((t) => t.completed)
        .reduce((sum, t) => sum + (CREDITS[t.priority] ?? 0), 0),
    [efficiencyTasks],
  );

  const completionPct =
    totalCredits > 0 ? Math.round((earnedCredits / totalCredits) * 100) : 0;

  const penalty = missedTasks.length * 5;
  const adjustedEfficeincy = Math.max(0, completionPct - penalty);

  const handleSubmit = async (e, timeStr, customDates = []) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (frequency === "weekly" && frequencyDays.length === 0) {
      alert("Please select at least one day for the weekly frequency.");
      return;
    }
    if (frequency === "custom_dates" && customDates.length === 0) {
      alert("Please select at least one date for the custom dates frequency.");
      return;
    }
    const resolvedEndDate =
      frequency === "custom_dates" && customDates.length > 0
        ? customDates.sort()[0]
        : endDate || todayStr;
    try {
      const res = await createTask({
        title,
        completed: false,
        category: selectedCategoryId || null,
        person: person || "Unassigned",
        start_date: startDate || todayStr,
        end_date: resolvedEndDate,
        end_time: timeStr,
        frequency,
        frequency_days: frequencyDays,
        custom_dates: customDates,
        priority,
      });
      const selectPersonality = localStorage.getItem("notificationPersonality") || "politeness";
      const dueDateTime = `${resolvedEndDate}T${timeStr || "09:00"}`;
      scheduleTaskNotification(res.id, title, dueDateTime, selectPersonality);
      setTitle(""); setPerson(""); setStartDate(""); setEndDate("");
      setSearchPerson(""); setFrequency("once"); setFrequencyDays([]);
      setPriority("none"); setIsCreatedModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const handleToggle = async (task) => {
    try {
      await completeTask(task.id);
      clearScheduledNotification(task.id);
      fetchTasks();
      fetchAllTasksForAnalytics();
    } catch (err) {
      console.error("Failed to complete task", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      clearScheduledNotification(id);
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const makeHandleDragEnd = (list) => async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.findIndex((t) => t.id === active.id);
    const newIndex = list.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(list, oldIndex, newIndex);
    setTasks((prev) => {
      const ids = new Set(list.map((t) => t.id));
      const rest = prev.filter((t) => !ids.has(t.id));
      return [...rest, ...reordered];
    });
    await reorderTasks(reordered.map((t, i) => ({ id: t.id, order: i })));
  };

  const mobileFilterTop = showMobileSearch ? "top-[105px]" : "top-[57px]";

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
      onClick: () => setActiveNav("tasks"),
    },
    { id: "categories", label: "Categories", icon: <Tag size={15} />, onClick: () => { setActiveNav("categories"); navigate("/categories"); } },
    { id: "archive", label: "Archive", icon: <Archive size={15} />, onClick: () => { setActiveNav("archive"); navigate("/archive"); } },
    { id: "bin", label: "Bin", icon: <Trash size={15} />, onClick: () => setActiveNav("bin") },
    { id: "settings", label: "Settings", icon: <Settings size={15} />, onClick: () => { navigate("/settings"); setActiveNav("settings"); } },
    
    {
      id: "missed",
      label: "Missed",
      icon: <AlertTriangle size={15} />,
      onClick: () => { setActiveNav("missed"); navigate("/missed-deadlines"); },
      badge: missedTasks.length,
    },
    { id: "logout", label: "Logout", icon: <ArrowBigLeft size={15} />, onClick: () => navigate("/") },
  ];

  const efficiencyColor = adjustedEfficeincy >= 75
    ? "from-emerald-500 to-teal-400"
    : adjustedEfficeincy >= 40
    ? "from-amber-500 to-yellow-400"
    : "from-rose-500 to-red-400";

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background transition-colors duration-500 font-sans">

      {/* ============ MOBILE TOP BAR ============ */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/90 backdrop-blur-xl sticky top-0 z-20">
        <div>
          <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-text-muted">{todayLabel}</p>
          <p className="text-sm font-bold text-text-main tracking-tight">My Workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters((v) => !v)}
            className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
              showMobileFilters ? "border-text-main text-text-main bg-border-subtle" : "border-border-subtle text-text-muted"
            }`}
          >
            <Filter size={14} />
            {(filterDate || filterCategory) && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setShowMobileSearch((v) => !v)}
            className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted"
          >
            <Search size={14} />
          </button>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
      </div>

      {showMobileSearch && (
        <div className="lg:hidden px-4 py-2 border-b border-border-subtle bg-background/90 backdrop-blur-xl sticky top-[57px] z-20">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              placeholder="Search assignee..."
              value={searchPerson}
              onChange={(e) => setSearchPerson(e.target.value)}
              className="h-8 w-full pl-8 pr-3 bg-card border border-border-subtle rounded-xl text-xs text-text-main placeholder-text-muted outline-none focus:border-text-muted transition-colors"
              autoFocus
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            key="mobile-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`lg:hidden sticky ${mobileFilterTop} z-20 border-b border-border-subtle bg-background/95 backdrop-blur-xl overflow-hidden`}
          >
            <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5 overflow-x-auto scrollbar-hide">
              <span className="text-[9px] uppercase tracking-[0.15em] text-text-muted flex-shrink-0 mr-1">Date</span>
              {[
                { label: "Today", value: todayStr },
                { label: "Tomorrow", value: tomorrowStr },
                { label: "All", value: "" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setFilterDate(filterDate === item.value && item.value !== "" ? "" : item.value)}
                  className={`px-3 h-7 rounded-lg text-[11px] border whitespace-nowrap flex-shrink-0 transition-all ${
                    filterDate === item.value
                      ? "bg-text-main text-background border-text-main font-semibold"
                      : "border-border-subtle text-text-muted hover:border-text-muted hover:text-text-main"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 pt-1 pb-2.5 overflow-x-auto scrollbar-hide">
              <span className="text-[9px] uppercase tracking-[0.15em] text-text-muted flex-shrink-0 mr-1">Cat.</span>
              <button
                onClick={() => setFilterCategory("")}
                className={`px-3 h-7 rounded-lg text-[11px] border whitespace-nowrap flex-shrink-0 transition-all ${
                  filterCategory === "" ? "bg-text-main text-background border-text-main font-semibold" : "border-border-subtle text-text-muted"
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const count = tasks.filter((t) => t.category_name === cat.name && !t.completed && !t.archived).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(filterCategory === cat.name ? "" : cat.name)}
                    className={`flex items-center gap-1.5 px-3 h-7 rounded-lg text-[11px] border whitespace-nowrap flex-shrink-0 transition-all ${
                      filterCategory === cat.name ? "bg-text-main text-background border-text-main font-semibold" : "border-border-subtle text-text-muted"
                    }`}
                  >
                    {cat.name}
                    {count > 0 && <span className="text-[9px] font-bold">{count}</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ DESKTOP SIDEBAR ============ */}
      <div className="hidden lg:flex w-[220px] flex-shrink-0 border-r border-border-subtle flex-col px-4 py-7 gap-5 bg-background sticky top-0 h-screen overflow-y-auto">
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
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold leading-none">
                  {item.badge}
                </span>
              )}
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
            onClick={() => setIsCreatedModalOpen(true)}
            className="flex items-center justify-center gap-2 h-9 rounded-xl bg-text-main text-background text-[13px] font-semibold transition-opacity hover:opacity-80"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* ============ MAIN AREA ============ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ---- DESKTOP HEADER ---- */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-border-subtle bg-background/90 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-1.5">
            {[
              { label: "Today", value: todayStr },
              { label: "Tomorrow", value: tomorrowStr },
              { label: "All", value: "" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setFilterDate(item.value)}
                className={`px-3.5 h-8 rounded-lg text-[12px] font-medium border transition-all ${
                  filterDate === item.value
                    ? "bg-text-main text-background border-text-main"
                    : "border-border-subtle text-text-muted hover:border-text-muted hover:text-text-main"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {(filterDate || filterCategory || searchPerson) && (
              <button
                onClick={() => { setFilterDate(""); setFilterCategory(""); setSearchPerson(""); }}
                className="h-8 px-3 rounded-lg text-[12px] border border-dashed border-border-subtle text-text-muted hover:border-rose-400/60 hover:text-rose-400 transition-all flex items-center gap-1.5"
              >
                <span className="text-[10px]">✕</span> Clear
              </button>
            )}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-8 px-3 bg-card border border-border-subtle rounded-lg text-[12px] text-text-muted outline-none focus:border-text-muted transition-colors appearance-none cursor-pointer pr-7"
              style={{ backgroundImage: "none" }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                placeholder="Search assignee..."
                value={searchPerson}
                onChange={(e) => setSearchPerson(e.target.value)}
                className="h-8 pl-8 pr-3 bg-card border border-border-subtle rounded-lg text-[12px] text-text-main placeholder-text-muted outline-none focus:border-text-muted transition-colors w-40"
              />
            </div>
            <button className="w-8 h-8 rounded-lg border border-border-subtle flex items-center justify-center text-text-muted hover:border-text-muted hover:text-text-main transition-colors">
              <SlidersHorizontal size={13} />
            </button>
          </div>
        </header>

        {/* TWO-COLUMN CONTENT */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

          {/* ---- TASK JOURNAL ---- */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-7 pb-32 lg:pb-8">

            {/* Hero */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3 font-medium">
                Current Session
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-main leading-[1.15] tracking-tight max-w-xs">
                Curating your Tasks for today.
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px w-8 bg-text-main/30" />
                <span className="text-[11px] text-text-muted font-medium">
                  {tasksDueToday.length} due today · {otherTasks.length} upcoming
                </span>
              </div>
            </div>

            {/* ---- MOBILE: Next Priority + Efficiency ---- */}
            <div className="lg:hidden flex flex-col gap-3 mb-8">
              {/* Next Priority card */}
              <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-rose-500 to-orange-400">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)"
                }} />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2">Next Priority</p>
                {tasksDueToday[0] ? (
                  <>
                    <p className="text-base font-bold text-white leading-snug">{tasksDueToday[0].title}</p>
                    {tasksDueToday[0].category_name && (
                      <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-white/70 bg-white/10 px-2 py-0.5 rounded-md">
                        {tasksDueToday[0].category_name}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-base font-bold text-white">All caught up! 🎉</p>
                )}
              </div>

              {/* Efficiency strip */}
              <div className="bg-card border border-border-subtle rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap size={11} className="text-text-muted" />
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-text-muted">Efficiency</span>
                  </div>
                  <span className="text-sm font-bold text-text-main">{adjustedEfficeincy}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${efficiencyColor} rounded-full transition-all duration-700`}
                    style={{ width: `${adjustedEfficeincy}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-[11px] text-text-muted">{earnedCredits} / {totalCredits} credits</p>
                  <div className="flex items-center gap-1">
                    {[["H", "bg-rose-500/10 text-rose-400"], ["M", "bg-amber-400/10 text-amber-400"], ["L", "bg-sky-400/10 text-sky-400"]].map(([label, cls]) => (
                      <span key={label} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${cls}`}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Due Today Section */}
            {tasksDueToday.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] uppercase tracking-[0.14em] font-bold text-text-main">Due Today</h3>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 font-bold px-2 py-0.5 rounded-md">
                      {tasksDueToday.length} pending
                    </span>
                  </div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={makeHandleDragEnd(tasksDueToday)}>
                  <SortableContext items={tasksDueToday.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                      {tasksDueToday.map((task) => (
                        <SortableTask key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} showDate={false} />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              </section>
            )}

            {/* All Tasks Section */}
            {otherTasks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] uppercase tracking-[0.14em] font-bold text-text-main">Upcoming</h3>
                    <span className="text-[10px] bg-border-subtle text-text-muted font-bold px-2 py-0.5 rounded-md">
                      {otherTasks.length} entries
                    </span>
                  </div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={makeHandleDragEnd(otherTasks)}>
                  <SortableContext items={otherTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                      {otherTasks.map((task) => (
                        <SortableTask key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} showDate={true} />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              </section>
            )}

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-border-subtle flex items-center justify-center text-text-muted">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-text-muted text-xs uppercase tracking-wide">No tasks yet. Click + to create one.</p>
              </div>
            )}

            {/* Insert row */}
            <button
              onClick={() => setIsCreatedModalOpen(true)}
              className="flex items-center gap-2 mt-5 text-text-muted hover:text-text-main text-[12px] transition-colors group"
            >
              <span className="w-5 h-5 rounded-lg border border-dashed border-border-subtle group-hover:border-text-muted flex items-center justify-center transition-colors text-[13px]">
                +
              </span>
              Insert Task Entry
            </button>
          </main>

          {/* ---- DESKTOP RIGHT PANEL ---- */}
          <aside className="hidden lg:flex w-56 flex-shrink-0 border-l border-border-subtle px-5 py-7 flex-col gap-7 bg-background overflow-y-auto">

            {/* Efficiency */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Zap size={10} className="text-text-muted" />
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-text-muted">Task Efficiency</p>
              </div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-text-muted">Credits earned</span>
                <span className="text-[12px] font-bold text-text-main">{adjustedEfficeincy}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${efficiencyColor} rounded-full transition-all duration-700`}
                  style={{ width: `${adjustedEfficeincy}%` }}
                />
              </div>
              <p className="text-[10px] text-text-muted mt-2">
                {earnedCredits} of {totalCredits} credits · {completedTasks.length} done
              </p>
              <div className="mt-3.5 flex flex-col gap-1.5">
                {[
                  { label: "High priority", credit: 4, key: "high", color: "text-rose-400" },
                  { label: "Medium priority", credit: 3, key: "medium", color: "text-amber-400" },
                  { label: "Low priority", credit: 1, key: "low", color: "text-sky-400" },
                  { label: "No priority", credit: 0, key: "none", color: "text-text-muted" },
                ].map((row) => {
                  const hasAny = activeTasks.some((t) => t.priority === row.key);
                  return (
                    <div key={row.key} className="flex items-center justify-between">
                      <span className={`text-[10px] ${hasAny ? row.color : "text-text-muted/25"}`}>· {row.label}</span>
                      <span className={`text-[10px] font-bold ${hasAny ? "text-text-main" : "text-text-muted/25"}`}>{row.credit} cr</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Priority */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-rose-500 to-orange-600 animate-fade-in">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 55%)"
              }} />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white mb-2">Next Priority</p>
              {tasksDueToday[0] ? (
                <>
                  <p className="text-[13px] font-bold text-white leading-snug">{tasksDueToday[0].title}</p>
                  {tasksDueToday[0].category_name && (
                    <p className="text-[10px] text-white/70 mt-1.5 uppercase tracking-wider font-semibold">
                      {tasksDueToday[0].category_name}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[13px] font-bold text-white">All caught up! 🎉</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-text-muted mb-3">Categories</p>
              <div className="flex flex-col gap-0.5">
                {categories.slice(0, 6).map((cat) => {
                  const count = tasks.filter((t) => t.category_name === cat.name && !t.completed && !t.archived).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(filterCategory === cat.name ? "" : cat.name)}
                      className={`flex items-center justify-between text-[11px] px-2.5 py-2 rounded-lg transition-all text-left ${
                        filterCategory === cat.name
                          ? "bg-text-main/8 text-text-main font-semibold"
                          : "text-text-muted hover:text-text-main hover:bg-border-subtle/40"
                      }`}
                    >
                      <span>· {cat.name}</span>
                      {count > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          filterCategory === cat.name ? "bg-text-main text-background" : "bg-border-subtle text-text-muted"
                        }`}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deadlines */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-text-muted mb-3">Deadlines</p>
              <div className="flex flex-col gap-3">
                {tasks
                  .filter((t) => !t.completed && !t.archived && t.end_date)
                  .sort((a, b) => a.end_date.localeCompare(b.end_date))
                  .slice(0, 4)
                  .map((t) => {
                    const daysLeft = Math.max(0, Math.ceil((new Date(t.end_date) - new Date(todayStr)) / 86400000));
                    return (
                      <div key={t.id} className="flex gap-2.5 items-start">
                        <div className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${daysLeft === 0 ? "bg-rose-500" : daysLeft <= 2 ? "bg-amber-400" : "bg-text-main"}`} />
                        <div>
                          <p className="text-[11px] font-medium text-text-main leading-snug">{t.title}</p>
                          <p className={`text-[10px] mt-0.5 ${daysLeft === 0 ? "text-rose-400 font-semibold" : "text-text-muted"}`}>
                            {daysLeft === 0 ? "Due today" : `In ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ============ MOBILE FAB ============ */}
      <button
        onClick={() => setIsCreatedModalOpen(true)}
        className="lg:hidden fixed bottom-20 right-5 w-12 h-12 rounded-2xl bg-text-main text-background flex items-center justify-center z-30 shadow-xl shadow-black/20"
      >
        <Plus size={20} />
      </button>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-border-subtle bg-background/90 backdrop-blur-xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] uppercase tracking-[0.08em] transition-colors relative ${
              activeNav === item.id ? "text-text-main" : "text-text-muted"
            }`}
          >
            <span>{item.icon}</span>
            {item.label === "My Tasks" ? "Tasks" : item.label}
            {item.id === "tasks" && tasksDueToday.length > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-18px)] w-3.5 h-3.5 bg-rose-500 text-background text-[8px] rounded-full flex items-center justify-center font-bold">
                {tasksDueToday.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ============ MODAL ============ */}
      {isCreatedModalOpen && (
        <TaskModal
          onClose={() => setIsCreatedModalOpen(false)}
          onSubmit={handleSubmit}
          categories={categories}
          title={title}
          setTitle={setTitle}
          person={person}
          setPerson={setPerson}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          frequency={frequency}
          setFrequency={setFrequency}
          frequencyDays={frequencyDays}
          setFrequencyDays={setFrequencyDays}
          priority={priority}
          setPriority={setPriority}
        />
      )}
    </div>
  );
}

export default Home;