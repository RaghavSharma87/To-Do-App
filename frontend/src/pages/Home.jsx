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

  // 🔍 Search states
  const [searchPerson, setSearchPerson] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // ✅ Fetch tasks
  const fetchTask = () => {
    getTasks().then((res) => setTasks(res.data));
  };

  // ✅ Fetch categories
  const fetchCategories = () => {
    getCategories().then((res) => {
      setCategories(res.data);
      if (res.data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(res.data[0].id);
      }
    });
  };

  useEffect(() => {
    fetchTask();
    fetchCategories();
  }, []);

  // ✅ Create Task
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

      // reset fields
      setTitle("");
      setPerson("");
      setStartDate("");
      setEndDate("");

      fetchTask();
    } catch (err) {
      console.error("Error creating task:", err.response?.data || err);
    }
  };

  // ✅ Add Category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    await createCategory({ name: newCategory });
    setNewCategory("");
    fetchCategories();
  };

  // ✅ Toggle
  const handleToggle = async (task) => {
    await patchTask(task.id, { completed: !task.completed });
    fetchTask();
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    await deleteTask(id);
    fetchTask();
  };

  // 🔍 Search
  const handleSearch = async () => {
    const query = `?category=${searchCategory}&person=${searchPerson}&date=${searchDate}`;
    const res = await getTasks(query);
    setTasks(res.data);
  };

  return (
    <div className="p-5 max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">
          Raghav's To-Do
        </h1>
        <p className="text-gray-500">Stay Efficient.</p>
      </div>

      {/* CATEGORY CREATION */}
      <div className="flex gap-2 mb-6 p-4 bg-purple-50 rounded-lg">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category"
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={handleAddCategory}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Add Category
        </button>
      </div>

      {/* TASK FORM */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 mb-8 p-4 border rounded bg-white shadow"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="border p-2 rounded"
        />

        <input
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          placeholder="Person"
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex gap-2">
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Add
          </button>
        </div>
      </form>

      {/* SEARCH */}
      <div className="flex gap-2 mb-6 p-4 bg-gray-100 rounded">
        <input
          placeholder="Search person"
          value={searchPerson}
          onChange={(e) => setSearchPerson(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={handleSearch}
          className="bg-green-500 text-white px-4 rounded"
        >
          Search
        </button>
      </div>

      {/* TASK LIST */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 border p-3 rounded"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task)}
            />

            <div className="flex-1">
              <h2
                className={`${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-800"
                }`}
              >
                {task.title}
              </h2>

              <div className="text-xs text-gray-500 flex gap-2">
                <span>{task.category_name}</span>
                <span>👤 {task.person}</span>
                <span>📅 {task.start_date}</span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(task.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;