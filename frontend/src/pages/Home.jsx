import { useState, useEffect, useMemo } from "react"; // Added useMemo
import { useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  patchTask,
  deleteTask,
  getCategories,
} from "../api";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [person, setPerson] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchPerson, setSearchPerson] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const navigate = useNavigate();

  // Helper to get today's date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];

  // Memoized filter for tasks due today
  const tasksDueToday = useMemo(() => {
    return tasks.filter(
      (task) => task.end_date === todayStr && !task.completed,
    );
  }, [tasks, todayStr]);

  const fetchTask = () => getTasks().then((res) => setTasks(res.data));
  const fetchCategories = () => {
    getCategories().then((res) => {
      setCategories(res.data);
      if (res.data.length > 0 && !selectedCategoryId)
        setSelectedCategoryId(res.data[0].id);
    });
  };

  useEffect(() => {
    fetchTask();
    fetchCategories();
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        const query = `?person=${searchPerson}`;
        const res = await getTasks(query);
        setTasks(res.data);
      } catch (err) {
        console.error("Search error", err);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchPerson]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedCategoryId) return;
    try {
      await createTask({
        title,
        completed: false,
        category: selectedCategoryId,
        person: person || "Unassigned",
        start_date: startDate || todayStr,
        end_date: endDate || todayStr,
      });
      setTitle("");
      setPerson("");
      setStartDate("");
      setEndDate("");
      fetchTask();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (task) => {
    await patchTask(task.id, { completed: !task.completed });
    fetchTask();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(id);
      fetchTask();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background selection:bg-primary/10">
      <div
        className="fixed inset-0 -z-10 w-full h-full bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('/To-DoBKG.jpg')" }}
      />

      <div className="relative z-10 p-6 max-w-3xl mx-auto pt-28">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-text-main glow-text">
              Dashboard
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-muted mt-2 ">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => navigate("/categories")}
            className="glass px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-text-main transition-all "
          >
            Categories
          </button>
        </header>

        {/* --- DUE TODAY SECTION --- */}
        {tasksDueToday.length > 0 && (
          <section className="mb-12 animate-fade-in animation-delay-200">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-primary mb-4 ml-2">
              Priority: Due Today
            </h3>
            <div className="space-y-3">
              {tasksDueToday.map((task) => (
                <div
                  key={task.id}
                  className="glass-strong p-4 rounded-2xl border-l-4 border-l-primary flex items-center justify-between group shadow-lg shadow-primary/5"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggle(task)}
                      className="w-5 h-5 rounded-full accent-primary cursor-pointer"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-text-main tracking-tight">
                        {task.title}
                      </h2>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-text-muted">
                        {task.category_name} • {task.person}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- TASK FORM --- */}
        <form
          onSubmit={handleSubmit}
          className="glass p-6 rounded-[2rem] border-border-subtle shadow-sm mb-12 space-y-4"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the next objective?"
            className="w-full bg-transparent border-b border-border-subtle/50 p-2 text-xl text-text-main placeholder:text-text-muted/20 outline-none focus:border-primary transition-colors"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-serif">
            <span className="text-sm py-2 font-serif">Set Deadline :</span>

            <input
              type="date"
              value={endDate}
              min={todayStr}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background/40 p-2 rounded-lg text-[10px] uppercase font-bold text-text-muted outline-none"
            />
            <input
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="Assignee"
              className="bg-background/40 p-2 rounded-lg text-xs text-text-main outline-none"
            />
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              className="bg-background/40 p-2 rounded-lg text-xs text-text-main outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-background rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary-hover transition-all"
          >
            Create Task
          </button>
        </form>

        {/* --- GENERAL TASK LIST --- */}
        {/* --- GENERAL TASK LIST --- */}
        <div className="space-y-4 pb-20">
          <div className="flex items-center gap-4 px-2 mb-6">
            <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
              All Tasks
            </span>
            <div className="h-[1px] flex-1 bg-border-subtle/30" />
            <input
              placeholder="Filter assignee..."
              value={searchPerson}
              onChange={(e) => setSearchPerson(e.target.value)}
              className="bg-transparent text-[10px] uppercase tracking-widest font-bold text-text-muted outline-none w-32 text-right"
            />
          </div>

          {tasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-center gap-4 p-4 glass rounded-2xl border-border-subtle hover:translate-x-1 transition-all duration-300"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
                className="w-4 h-4 rounded-full accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <h2
                  className={`text-base font-medium transition-all ${task.completed ? "opacity-30 line-through" : "text-text-main"}`}
                >
                  {task.title}
                </h2>

                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] uppercase tracking-widest font-bold mt-1 text-text-muted/60">
                  <span className="text-primary/70">{task.category_name}</span>
                  <span>👤 {task.person}</span>

                  {/* Displaying the End Date */}
                  <span
                    className={`${task.end_date === todayStr ? "text-primary font-black" : ""}`}
                  >
                    Due Date : 🗓️ {task.end_date}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-red-400 uppercase tracking-tighter transition-opacity px-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
