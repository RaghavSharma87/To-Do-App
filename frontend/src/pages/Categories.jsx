import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory, deleteCategory } from "../api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    // Prevent page reload on form submission
    if (e) e.preventDefault(); 
    if (!newCategory.trim()) return;

    try {
      await createCategory({ name: newCategory });
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-28 max-w-2xl mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-text-main tracking-tighter glow-text">
            Categories
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-muted mt-2">
            Organize your world
          </p>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="glass px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-text-main transition-all"
        >
          ← Back
        </button>
      </div>

      {/* CREATE CATEGORY FORM (Enables Enter Key) */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-10 glass-strong p-2 rounded-2xl border-border-subtle">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category (e.g. Work, Studio)"
          className="flex-1 bg-transparent px-4 py-2 outline-none text-text-main placeholder:text-text-muted/30 text-sm"
        />

        <button
          type="submit"
          className="bg-primary text-background px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-md"
        >
          Add
        </button>
      </form>

      {/* CATEGORY LIST */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group flex justify-between items-center p-5 glass rounded-2xl border-border-subtle hover:bg-white/40 transition-all duration-300"
          >
            <div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-text-muted/60 mb-1 block">Name</span>
              <span className="font-semibold text-text-main text-lg tracking-tight">
                {cat.name}
              </span>
            </div>

            {cat.name !== "General" ? (
              <button
                onClick={() => handleDelete(cat.id)}
                className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-tighter underline underline-offset-4 transition-all"
              >
                Delete
              </button>
            ) : (
              <span className="text-[10px] uppercase font-bold text-text-muted/20 italic">Default</span>
            )}
          </div>
        ))}

        {/* EMPTY STATE */}
        {categories.length === 0 && (
          <p className="text-center text-text-muted/40 mt-20 text-sm tracking-widest uppercase">
            No categories defined
          </p>
        )}
      </div>
    </div>
  );
}

export default Categories;