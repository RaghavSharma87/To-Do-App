import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import {
  getTasks,
  createTask,
  patchTask,
  deleteTask,
  getCategories,
} from "../api";

import TaskModal from "../components/TaskModal";

function Home() {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isCreatedModalOpen, setIsCreatedModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [person, setPerson] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [searchPerson, setSearchPerson] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

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

  // ---------------- SEARCH ----------------
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchTasks(`?person=${searchPerson}`);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchPerson]);

  // ---------------- DERIVED ----------------
  const tasksDueToday = useMemo(() => {
    return tasks.filter(
      (task) => task.end_date === todayStr && !task.completed
    );
  }, [tasks]);

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
    });

    // Reset form
    setTitle("");
    setPerson("");
    setStartDate("");
    setEndDate("");

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

  // ---------------- UI ----------------
  return (
    <div className="relative min-h-screen w-full bg-background p-6 pt-24 max-w-3xl mx-auto">
      
      {/* HEADER */}
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-2">
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/categories")}
            className="text-sm text-gray-500"
          >
            Categories
          </button>

          <button
            onClick={() => setIsCreatedModalOpen(true)}
            className="bg-black text-white p-2 rounded-lg"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      {/* DUE TODAY */}
      {tasksDueToday.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xs uppercase text-gray-500 mb-3">
            Due Today
          </h3>

          <div className="space-y-3">
            {tasksDueToday.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-xl flex justify-between items-center"
              >
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task)}
                  />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <span className="text-xs text-gray-500">
                      {task.category_name} • {task.person}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SEARCH */}
      <input
        placeholder="Filter by assignee..."
        value={searchPerson}
        onChange={(e) => setSearchPerson(e.target.value)}
        className="mb-6 w-full p-2 border rounded-lg"
      />

      {/* TASK LIST */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded-xl flex justify-between items-center"
          >
            <div className="flex gap-3 items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />

              <div>
                <p
                  className={
                    task.completed ? "line-through text-gray-400" : ""
                  }
                >
                  {task.title}
                </p>

                <span className="text-xs text-gray-500">
                  {task.category_name} • {task.person} • {task.end_date}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(task.id)}
              className="text-red-400 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

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
        />
      )}
    </div>
  );
}

export default Home;