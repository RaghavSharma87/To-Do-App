import { useState, useEffect } from "react";
// Ensure these names match exactly what is exported in your api.js
import { getTasks, createTask, patchTask, deleteTask } from "../api";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const fetchTask = () => {
    getTasks().then((res) => setTasks(res.data));
  };

  useEffect(() => {
    fetchTask();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload

    if (!title.trim()) return;

    try {
      // Use the correct function name from your imports
      await createTask({
        title: title,
        completed: false,
      });

      setTitle("");
      fetchTask(); // Use fetchTask() to match your function name
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleToggle = async (task) => {
    try {
      // Sending the patch to Django
      await patchTask(task.id, { completed: !task.completed });
      fetchTask();
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

const handleDelete = async (id) => {
    // Basic confirmation to prevent accidental deletes
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        fetchTask();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  return (
    <div className="p-5">
      <h1>Home</h1>
      {/* CRITICAL: Added onSubmit here */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Task"
          className="border p-1"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
        >
          Add Task
        </button>
      </form>

      {/* Task List */}
      <div>
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 border-b p-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task)}
            />
            <h2 className={task.completed ? "line-through text-gray-400" : ""}>
              {task.title}
            </h2>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
