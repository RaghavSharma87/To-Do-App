import { useState, useEffect } from "react";
import {
  getTasks,
  createTask,
  patchTask,
  deleteTask,
  createCategory,
  getCategories,
} from "../api";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [person, setPerson] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchPerson, setSearchPerson] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchTask = () => getTasks().then((res) => setTasks(res.data));
  const fetchCategories = () => {
    getCategories().then((res) => {
      setCategories(res.data);
      if (res.data.length > 0 && !selectedCategoryId) setSelectedCategoryId(res.data[0].id);
    });
  };

  useEffect(() => {
    fetchTask();
    fetchCategories();
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        const query = `?category=${searchCategory}&person=${searchPerson}&date=${searchDate}`;
        const res = await getTasks(query);
        setTasks(res.data);
      } catch (err) { console.error("Search error", err); }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchCategory, searchPerson, searchDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedCategoryId) return;
    try {
      await createTask({
        title,
        completed: false,
        category: selectedCategoryId,
        person: person || "Unassigned",
        start_date: startDate || new Date().toISOString().split("T")[0],
        end_date: endDate || new Date().toISOString().split("T")[0],
      });
      setTitle(""); setPerson(""); setStartDate(""); setEndDate("");
      fetchTask();
    } catch (err) { console.error(err); }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await createCategory({ name: newCategory });
    setNewCategory("");
    fetchCategories();
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

  const saveEdit = async (id) => {
    if (!editText.trim()) { setEditId(null); return; }
    await patchTask(id, { title: editText });
    setEditId(null);
    fetchTask();
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* 🖼️ THE BACKGROUND IMAGE LAYER */}
      <div 
        className="fixed inset-0 -z-10 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/To-DoBKG.jpg')" }}
      >
        {/* Semi-transparent of background color */}
        <div className="absolute inset-0 opacity-60" style={{ backgroundColor: 'var(--color-background)' }}></div>
      </div>

      {/*  CONTENT CONTAINER */}
      <div className="relative z-10 p-5 max-w-2xl mx-auto pt-16">
        
        {/* HEADER (Floating Animation) */}
        <div className="mb-10 animate-fade-in animate-float">
          <h1 className="text-4xl font-extrabold tracking-wide font-serif" style={{ color: 'var(--color-text)' }}>
             To-Do
          </h1>
          <p className="text-lg font-medium opacity-80" style={{ color: 'var(--color-text)' }}>
            Stay Efficient.
          </p>
        </div>

        {/* CATEGORY CREATION (Fade In) */}
        <div className="flex gap-2 mb-8 p-4 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 animate-fade-in shadow-sm" >
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category..."
            className="bg-transparent border-none p-2 flex-1 rounded-lg outline-none text-gray-800 placeholder-text"  
          />
          <button
            onClick={handleAddCategory}
            className="px-6 py-2 rounded-2xl transition-all active:scale-95 font-bold text-white shadow-md hover:opacity-70"
            style={{ backgroundColor: 'var(--color-text)' }}
          >
            +
          </button>
        </div>

        {/* TASK FORM  */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mb-10 p-8 rounded-3xl border border-white/40 shadow-2xl animate-fade-in animation-delay-400 bg-white/30 backdrop-blur-2xl"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="bg-white/40 border-none p-4 rounded-2xl outline-none focus:bg-primary transition-all text-xl placeholder-text shadow-inner"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="Assignee "
              className="bg-white/40 border-none p-3 rounded-xl outline-none text-sm placeholder-text focus:bg-primary"
            />
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              className="bg-black/80 border-none p-3 rounded-xl outline-none cursor-pointer text-sm "
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 rounded-2xl font-black text-white mt-2 transition-all active:scale-95 shadow-lg tracking-widest uppercase text-sm"
            style={{ backgroundColor: 'var(--color-text)' }}
          >
            Add Task
          </button>
        </form>

        {/* SEARCH BAR (Delay 200ms) */}
        <div className="flex gap-4 mb-8 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 animate-fade-in animation-delay-200 shadow-sm">
          <input 
            placeholder="🔍 Search by assignee" 
            value={searchPerson} 
            onChange={(e) => setSearchPerson(e.target.value)} 
            className="bg-transparent text-gray-700 placeholder-gray-900 text-sm p-1 outline-none w-full" 
          />
        </div>

        {/* TASK LIST  */}
        <div className="space-y-4 pb-24">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
              className="group flex items-center gap-5 p-5 bg-white/40 backdrop-blur-lg rounded-full border border-white/30 hover:bg-white/60 transition-all animate-fade-in shadow-sm hover:shadow-md"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
                className="w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110"
                style={{ accentColor: 'var(--color-primary)' }}
              />

              <div className="flex-1">
                {editId === task.id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(task.id);
                      if (e.key === "Escape") setEditId(null);
                    }}
                    onBlur={()=>saveEdit(task.id)}
                    autoFocus
                    className="bg-black/50 p-2 rounded-xl w-full outline-none border border-gray-300"
                  />
                ) : (
                  <h2 className={`text-xl font-semibold transition-all duration-500 ${task.completed ? "line-through opacity-90 italic" : "text-gray-800"}`}>
                    {task.title}
                  </h2>
                )}

                <div className="flex gap-4 text-[11px] uppercase tracking-tighter font-bold opacity-60 mt-1" style={{ color: 'var(--color-text)' }}>
                  <span className="bg-white/40 px-2 py-0.5 rounded-lg border border-black/5">{task.category_name}</span>
                  <span className="flex items-center gap-1">👤 {task.person}</span>
                </div>
              </div>

              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setEditId(task.id); setEditText(task.title); }} className="text-gray-500 hover:text-black text-xs font-bold underline">Edit</button>
                <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:text-red-700 text-xs font-bold underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;