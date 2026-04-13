import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
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
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
  patchTask,
  completeTask,
  deleteTask,
  getCategories,
  reorderTasks,
} from "../api";
import TaskModal from "../components/TaskModal";
import { useTheme } from "../components/ThemeContext";

// ---------------- CREDIT MAP ----------------
const CREDITS = { high: 4, medium: 3, low: 1, none: 0 };

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
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityBadge = {
    high: { label: "High Priority", cls: "bg-text-main text-background" },
    medium: {
      label: "Medium",
      cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    },
    low: { label: "Low", cls: "bg-border-subtle text-text-muted" },
    none: null,
  };

  const badge = priorityBadge[task.priority];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 py-4 border-b border-border-subtle group last:border-b-0"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab opacity-0 group-hover:opacity-40 flex-shrink-0 text-text-muted"
      >
        <GripVertical size={14} />
      </div>

      {/* Toggle Circle */}
      <button
        onClick={() => onToggle(task)}
        className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 transition-all ${
          task.completed
            ? "bg-text-main border-text-main"
            : "border-border-subtle hover:border-text-muted"
        }`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold font-serif leading-snug transition-colors ${
            task.completed ? "line-through text-text-muted" : "text-text-main"
          }`}
        >
          {task.title}
        </p>
        <p className="text-xs text-text-muted font-sans mt-0.5">
          {task.person && task.person !== "Unassigned" && (
            <span>{task.person} · </span>
          )}
          Due: {showDate ? task.end_date : "Today"}
          {task.end_time && ` at ${task.end_time}`}
          {task.category_name && (
            <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-background border border-border-subtle text-[10px] uppercase tracking-wide">
              {task.category_name}
            </span>
          )}
        </p>
      </div>

      {/* Priority Badge */}
      {badge && (
        <span
          className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${badge.cls}`}
        >
          {badge.label}
        </span>
      )}

      {/* Delete */}
      <button
  onClick={(e) => {
    e.stopPropagation();
    onDelete(task.id);
  }}
  className="opacity-60 md:opacity-0 md:group-hover:opacity-60 hover:!opacity-100 transition-opacity text-text-muted hover:text-red-400 mt-0.5 flex-shrink-0"
>
  <Trash2 size={14} />
</button>
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

// ---------------- HOME ----------------
function Home() {
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor));

  // ---------------- STATE ----------------
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

  const [filterDate, seetFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [allTasks, setAllTasks]=useState([]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  // ---------------- FETCH ----------------
  const fetchTasks = async (query = "") => {
    const res = await getTasks(query);
    setTasks(res.data);
  };
  const fetchAllTasksForAnalytics=async() =>{
    const res=await getTasks("?include_archived=true");
    setAllTasks(res.data);
  }

  const fetchCategories = async () => {
    const res = await getCategories();
    setCategories(res.data);
    if (res.data.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(res.data[0].id);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchAllTasksForAnalytics();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchPerson) params.append("person", searchPerson);
      if (filterDate) params.append("date", filterDate);
      if (filterCategory) params.append("category", filterCategory);
      fetchTasks(`?${params.toString()}`);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchPerson, filterCategory, filterDate]);

  // ---------------- DERIVED ----------------
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
        (t) => !t.archived && !(t.end_date === todayStr && !t.completed),
      ),
    [tasks, todayStr],
  );

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed && !t.archived),
    [tasks],
  );
  const activeTasks = useMemo(() => tasks.filter((t) => !t.archived), [tasks]);

  const tomorrowStr = new Date(Date.now() + 86400000)
    .toISOString()
    .split("T")[0];

  const efficiencyTasks = useMemo(() => {
    if (filterDate === todayStr) {
      return tasks.filter((t) => t.end_date === todayStr);
    }

    if (filterDate === tomorrowStr) {
      return tasks.filter((t) => t.end_date === tomorrowStr);
    }

    return allTasks; // All tasks including archived
  }, [tasks, filterDate, todayStr, tomorrowStr]);

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

  // ---------------- ACTIONS ----------------
  const handleSubmit = async (e,timeStr) => {
    e.preventDefault();
    if (!title.trim() ) return;

    await createTask({
      title,
      completed: false,
      category: selectedCategoryId || null ,
      person: person || "Unassigned",
      start_date: startDate || todayStr,
      end_date: endDate || todayStr,
      end_time: timeStr,
      frequency,
      frequency_days: frequencyDays,
      priority,
    });

    setTitle("");
    setPerson("");
    setStartDate("");
    setEndDate("");
    setSearchPerson("");
    setFrequency("once");
    setFrequencyDays([]);

    setPriority("none");
    setIsCreatedModalOpen(false);
    fetchTasks();
  };

  const handleToggle = async (task) => {
    await completeTask(task.id);
    fetchTasks();
    fetchAllTasksForAnalytics();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(id);
    fetchTasks();
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);
    await reorderTasks(reordered.map((t, i) => ({ id: t.id, order: i })));
  };

  // ---------------- NAV ITEMS ----------------
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
      onClick: () => setActiveNav("tasks"),
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Tag size={15} />,
      onClick: () => {
        setActiveNav("categories");
        navigate("/categories");
      },
    },
    {
      id: "archive",
      label: "Archive",
      icon: <Archive size={15} />,
      onClick: () => {
        setActiveNav("archive");
        navigate("/archive");
      },
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
      onClick: () => {
        navigate("/settings");
        setActiveNav("settings");
      },
    },
  ];

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background/60 backdrop-blur-none transition-colors duration-500 font-serif">
      {/* ============ MOBILE TOP BAR ============ */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">
            {todayLabel}
          </p>
          <p className="text-sm font-bold font-serif text-text-main">
            My Workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Mobile search bar (toggleable) */}
      {showMobileSearch && (
        <div className="lg:hidden px-4 py-2 border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-[57px] z-10">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              placeholder="Search assignee..."
              value={searchPerson}
              onChange={(e) => setSearchPerson(e.target.value)}
              className="h-8 w-full pl-8 pr-3 bg-card border border-border-subtle rounded-full text-xs text-text-main placeholder-text-muted outline-none focus:border-text-muted transition-colors font-sans"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* ============ MOBILE FILTER CHIPS ============ */}
      <div
        className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-background/80 backdrop-blur-md overflow-x-auto sticky top-[57px] z-10"
        style={{ scrollbarWidth: "none" }}
      >
        {[
          { label: "Today", value: todayStr },
          {
            label: "Tomorrow",
            value: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          },
          { label: "All", value: "" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => seetFilterDate(item.value)}
            className={`px-3 h-7 rounded-full text-xs font-sans border whitespace-nowrap flex-shrink-0 transition-all ${
              filterDate === item.value
                ? "bg-primary text-background border-primary"
                : "border-border-subtle text-text-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-7 px-2 bg-card border border-border-subtle rounded-full text-xs text-text-muted font-sans outline-none flex-shrink-0"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside className="hidden lg:flex w-48 flex-shrink-0 border-r border-border-subtle flex-col py-6 px-4 bg-background/80 backdrop-blur-md sticky top-0 h-screen">
        <div className="mb-8 px-2">
          <p className="font-semi-bold font-serif text-text-main tracking-tight">
            My Workspace
          </p>
          <p className="text-[10px] font-serif uppercase tracking-[0.18em] text-text-muted mt-0.5">
            Task Master
          </p>
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
              {item.id === "tasks" && tasksDueToday.length > 0 && (
                <span className="ml-auto text-[10px] bg-text-main text-background rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {tasksDueToday.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setIsCreatedModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2.5 bg-primary text-background rounded-xl text-xs font-serif font-semibold hover:opacity-80 transition-all mt-4"
        >
          <Plus size={14} />
          New Entry
        </button>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* DESKTOP TOP BAR */}
        <header className="hidden lg:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted">
              {todayLabel}
            </p>
            <h1 className="text-xl font-semi-bold font-serif text-text-main leading-tight mt-0.5 tracking-tight">
              Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted hover:border-text-muted hover:text-text-main transition-colors"
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Today", value: todayStr },
                {
                  label: "Tomorrow",
                  value: new Date(Date.now() + 86400000)
                    .toISOString()
                    .split("T")[0],
                },
                { label: "All", value: "" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => seetFilterDate(item.value)}
                  className={`px-3 h-8 rounded-full text-xs font-sans border transition-all ${
                    filterDate === item.value
                      ? "bg-primary text-background border-primary"
                      : "border-border-subtle text-text-muted hover:border-text-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-8 px-3 bg-card border border-border-subtle rounded-full text-xs text-text-muted font-sans outline-none focus:border-text-muted transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                placeholder="Search assignee..."
                value={searchPerson}
                onChange={(e) => setSearchPerson(e.target.value)}
                className="h-8 pl-8 pr-3 bg-card border border-border-subtle rounded-full text-xs text-text-main placeholder-text-muted outline-none focus:border-text-muted transition-colors font-sans w-full sm:w-40"
              />
            </div>
            <button className="w-8 h-8 rounded-xl border border-border-subtle flex items-center justify-center text-text-muted hover:border-text-muted hover:text-text-main transition-colors">
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </header>

        {/* TWO-COLUMN CONTENT */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* ---- TASK JOURNAL ---- */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 lg:pb-8">
            {/* Hero */}
            <div className="mb-8">
              <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-text-muted mb-2">
                Current Session
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-serif text-text-main leading-tight max-w-sm">
                Curating your Tasks for today.
              </h2>
              <div className="w-10 h-px bg-text-main mt-5" />
            </div>

            {/* ---- MOBILE: Next Priority + Efficiency ---- */}
            <div className="lg:hidden flex flex-col gap-3 mb-8">
              {/* Next Priority card */}
              <div className="bg-warn rounded-xl p-4">
                <p className="font-bold text-[9px] font-serif uppercase tracking-[0.18em] text-background mb-1">
                  Next Priority
                </p>
                {tasksDueToday[0] ? (
                  <>
                    <p className="text-sm font-serif font-bold text-background leading-snug">
                      {tasksDueToday[0].title}
                    </p>
                    <p className="text-[10px] font-sans text-text-muted mt-0.5">
                      {tasksDueToday[0].category_name}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-serif font-bold text-background leading-snug">
                    All caught up for today.
                  </p>
                )}
              </div>

              {/* Efficiency strip */}
              <div className="bg-card border border-border-subtle rounded-xl p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-sans uppercase tracking-[0.2em] font-semibold text-text-muted">
                    Task Efficiency
                  </span>
                  <span className="text-[11px] font-sans font-semibold text-text-main">
                    {completionPct}%
                  </span>
                </div>
                <div className="h-[3px] rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className="h-full bg-text-main rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] font-sans text-text-muted">
                    {earnedCredits} / {totalCredits} credits
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-sans px-1.5 py-0.5 rounded-full bg-text-main text-background">
                      H·4
                    </span>
                    <span className="text-[9px] font-sans px-1.5 py-0.5 rounded-full bg-border-subtle text-text-muted">
                      M·3
                    </span>
                    <span className="text-[9px] font-sans px-1.5 py-0.5 rounded-full bg-border-subtle text-text-muted">
                      L·1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Due Today Section */}
            {tasksDueToday.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-main">
                    Due Today
                  </h3>
                  <span className="text-[10px] font-sans text-text-muted">
                    {tasksDueToday.length} pending
                  </span>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={tasksDueToday.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence>
                      {tasksDueToday.map((task) => (
                        <SortableTask
                          key={task.id}
                          task={task}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                          showDate={false}
                        />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              </section>
            )}

            {/* All Tasks Section */}
            {otherTasks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[10px] font-sans uppercase tracking-[0.12em] font-semibold text-text-main">
                    All Tasks
                  </h3>
                  <span className="text-[10px] font-sans text-text-muted">
                    {otherTasks.length} entries
                  </span>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={otherTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence>
                      {otherTasks.map((task) => (
                        <SortableTask
                          key={task.id}
                          task={task}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                          showDate={true}
                        />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              </section>
            )}

            {/* Insert row */}
            <button
              onClick={() => setIsCreatedModalOpen(true)}
              className="flex items-center gap-2 mt-4 text-text-muted hover:text-text-main text-xs font-sans transition-colors group"
            >
              <span className="w-5 h-5 rounded-full border border-dashed border-border-subtle group-hover:border-text-muted flex items-center justify-center transition-colors text-[13px]">
                +
              </span>
              Insert Task Entry
            </button>

            {tasks.length === 0 && (
              <div className="text-center py-24">
                <p className="text-text-muted text-xs font-sans tracking-wide uppercase">
                  No tasks yet. Click + to create one.
                </p>
              </div>
            )}
          </main>

          {/* ---- DESKTOP RIGHT PANEL ---- */}
          <aside className="hidden lg:flex w-56 flex-shrink-0 border-l border-border-subtle px-5 py-8 flex-col gap-7 bg-background/80 backdrop-blur-md overflow-y-auto">
            {/* Efficiency */}
            <div>
              <p className="text-[9px] font-sans uppercase tracking-[0.2em] font-semibold text-text-muted mb-3">
                Task Efficiency
              </p>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-sans text-text-muted">
                  Credits earned
                </span>
                <span className="text-[11px] font-sans font-semibold text-text-main">
                  {completionPct}%
                </span>
              </div>
              <div className="h-[3px] rounded-full bg-border-subtle overflow-hidden">
                <div
                  className="h-full bg-text-main rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <p className="text-[10px] font-sans text-text-muted mt-2 leading-relaxed">
                {earnedCredits} of {totalCredits} credits ·{" "}
                {completedTasks.length} tasks done
              </p>

              {/* Credit legend */}
              <div className="mt-3 flex flex-col gap-1.5">
                {[
                  { label: "High priority", credit: 4, key: "high" },
                  { label: "Medium priority", credit: 3, key: "medium" },
                  { label: "Low priority", credit: 1, key: "low" },
                  { label: "No priority", credit: 0, key: "none" },
                ].map((row) => {
                  const hasAny = activeTasks.some(
                    (t) => t.priority === row.key,
                  );
                  return (
                    <div
                      key={row.key}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`text-[10px] font-sans ${hasAny ? "text-text-muted" : "text-text-muted/30"}`}
                      >
                        · {row.label}
                      </span>
                      <span
                        className={`text-[10px] font-sans font-semibold ${hasAny ? "text-text-main" : "text-text-muted/30"}`}
                      >
                        {row.credit} cr
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Priority — warm card */}
            <div className="bg-warn rounded-xl p-4">
              <p className="font-bold font-serif uppercase tracking-[0.18em] text-text mb-2">
                Next Priority
              </p>
              {tasksDueToday[0] ? (
                <>
                  <p className="text-sm font-serif font-bold text-text leading-snug">
                    {tasksDueToday[0].title}
                  </p>
                  <p className="text-[12px] font-serif uppercase text-text mt-1">
                    {tasksDueToday[0].category_name}
                  </p>
                </>
              ) : (
                <p className="text-sm font-serif font-bold text-text leading-snug">
                  All caught up for today.
                </p>
              )}
            </div>

            {/* Categories quick list */}
            <div>
              <p className="text-[9px] font-sans uppercase tracking-[0.2em] font-semibold text-text-muted mb-3">
                Categories
              </p>
              <div className="flex flex-col gap-1.5">
                {categories.slice(0, 6).map((cat) => {
                  const count = tasks.filter(
                    (t) =>
                      t.category_name === cat.name &&
                      !t.completed &&
                      !t.archived,
                  ).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setFilterCategory(
                          filterCategory === cat.name ? "" : cat.name,
                        )
                      }
                      className={`flex items-center justify-between text-[11px] font-sans px-0 py-1 border-b border-border-subtle/50 transition-colors text-left ${
                        filterCategory === cat.name
                          ? "text-text-main font-semibold"
                          : "text-text-muted hover:text-text-main"
                      }`}
                    >
                      <span>· {cat.name}</span>
                      {count > 0 && (
                        <span className="text-[10px]">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deadlines */}
            <div>
              <p className="text-[9px] font-sans uppercase tracking-[0.2em] font-semibold text-text-muted mb-3">
                Deadlines
              </p>
              <div className="flex flex-col gap-2.5">
                {tasks
                  .filter((t) => !t.completed && !t.archived && t.end_date)
                  .sort((a, b) => a.end_date.localeCompare(b.end_date))
                  .slice(0, 4)
                  .map((t) => (
                    <div key={t.id} className="flex gap-2 items-start">
                      <div className="w-1 h-1 rounded-full bg-text-main mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-sans font-medium text-text-main leading-snug">
                          {t.title}
                        </p>
                        <p className="text-[10px] font-sans text-text-muted">
                          In{" "}
                          {Math.max(
                            0,
                            Math.ceil(
                              (new Date(t.end_date) - new Date(todayStr)) /
                                86400000,
                            ),
                          )}{" "}
                          days
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ============ MOBILE FAB ============ */}
      <button
        onClick={() => setIsCreatedModalOpen(true)}
        className="lg:hidden fixed bottom-20 right-5 w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center z-30 shadow-lg"
      >
        <Plus size={20} />
      </button>

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
            {item.label === "My Tasks" ? "Tasks" : item.label}
            {item.id === "tasks" && tasksDueToday.length > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-18px)] w-3.5 h-3.5 bg-primary text-background text-[8px] rounded-full flex items-center justify-center font-bold">
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
