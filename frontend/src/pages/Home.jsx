import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Container } from "lucide-react";
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
  deleteTask,
  getCategories,
  reorderTasks,
} from "../api";
import TaskModal from "../components/TaskModal";
import { useTheme } from "../components/ThemeContext";

// ---------------- SORTABLE TASK CARD ----------------
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
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityDot = {
    none: "bg-border-subtle",
    low: "bg-blue-400",
    medium: "bg-amber-400",
    high: "bg-red-400",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card/50 rounded-2xl px-5 py-4 border border-border-subtle flex items-start justify-between group transition-colors duration-300"
    >
      <div className="flex gap-3 items-start w-full">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-2 flex flex-col gap-[3px] cursor-grab opacity-0 group-hover:opacity-90 flex-shrink-0"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-3 h-[2px] bg-text-muted rounded" />
          ))}
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
            task.completed
              ? "bg-green-500 border-green-500"
              : "border-border-subtle hover:border-text-muted"
          }`}
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center  gap-2">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority] || "bg-border-subtle"}`}
            />
            <p
              className={`font-semibold text-text-main text-base transition-colors ${task.completed ? "line-through text-text-muted" : ""}`}
            >
              {task.title}
            </p>
          </div>
          {task.person && task.person !== "Unassigned" && (
            <p className="text-sm text-text-muted mt-0.5 font-sans">
              {task.person}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-text-muted bg-background px-3 py-1 rounded-full font-sans border border-border-subtle/50">
              {task.category_name}
            </span>
            <span className="text-xs text-text-muted/60 font-sans">
              Due: {showDate ? task.end_date : "Today"}{" "}
              {task.end_time && `at ${task.end_time}`}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400 mt-0.5 flex-shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// ---------------- HOME ----------------
function Home() {
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor));
  const { theme } = useTheme();

  // ---------------- STATE ----------------
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCreatedModalOpen, setIsCreatedModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [person, setPerson] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchPerson, setSearchPerson] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [frequencyDays, setFrequencyDays] = useState([]);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [priority, setPriority] = useState("none");

  const [filterDate, seetFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

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
    () => tasks.filter((task) => task.end_date === todayStr && !task.completed),
    [tasks, todayStr],
  );

  const otherTasks = useMemo(
    () => tasks.filter((t) => !(t.end_date === todayStr && !t.completed)),
    [tasks, todayStr],
  );

  // ---------------- ACTIONS ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedCategoryId) return;

    await createTask({
      title,
      completed: false,
      category: selectedCategoryId,
      person: person || "Unassigned",
      start_date: startDate || todayStr,
      end_date: endDate || todayStr,
      end_time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
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
    setHour(12);
    setMinute(0);
    setPriority("none");
    setIsCreatedModalOpen(false);
    fetchTasks();
  };

  const handleToggle = async (task) => {
    await patchTask(task.id, { completed: !task.completed });
    fetchTasks();
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

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-serif">
      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        {/* HEADER */}
        <header className="mb-10">
          <h1 className="text-7xl font-bold tracking-tight text-text-main leading-none">
            Dashboard
          </h1>
          <p className="text-xs font-medium tracking-widest text-text-muted mt-3 uppercase font-sans">
            {todayLabel}
          </p>
        </header>

        {/* ACTION BAR */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => setIsCreatedModalOpen(true)}
            className="bg-primary text-background w-12 h-12 rounded-2xl flex items-center justify-center hover:opacity-80 transition-all flex-shrink-0"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => navigate("/categories")}
            className="relative bg-card w-12 h-12 rounded-2xl flex items-center justify-center border border-border-subtle hover:border-text-muted transition-colors flex-shrink-0"
          >
            <Container size={18} className="text-text-main" />
            {tasksDueToday.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </button>
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              placeholder="Search assignee..."
              value={searchPerson}
              onChange={(e) => setSearchPerson(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-card border border-border-subtle rounded-2xl text-sm text-text-main placeholder-text-muted outline-none focus:border-text-muted transition-colors font-sans"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => seetFilterDate(e.target.value)}
            className="h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
          >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
          </select>
        </div>

        <hr className="border-border-subtle mb-10" />

        {/* DUE TODAY */}
        {tasksDueToday.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text-main mb-5">
              Priority: Due Today
            </h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasksDueToday.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {tasksDueToday.map((task) => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      showDate={false}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        )}

        {/* ALL TASKS */}
        {otherTasks.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-text-main mb-5">
              All Tasks
            </h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={otherTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {otherTasks.map((task) => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      showDate={true}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm font-sans">
              No tasks yet. Click + to create one.
            </p>
          </div>
        )}
      </main>

      {/* HELP BUTTON */}
      <button className="fixed bottom-6 right-6 w-10 h-10 bg-primary text-background rounded-full flex items-center justify-center text-sm font-bold hover:opacity-90 transition-all shadow-lg">
        ?
      </button>

      {/* MODAL */}
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
          hour={hour}
          setHour={setHour}
          minute={minute}
          setMinute={setMinute}
        />
      )}
    </div>
  );
}

export default Home;
