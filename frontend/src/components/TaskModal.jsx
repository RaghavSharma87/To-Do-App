import { X, Calendar, User, Folder, ChevronDown } from "lucide-react";

function TaskModal({
  onClose,
  onSubmit,
  categories,
  title,
  setTitle,
  person,
  setPerson,
  endDate,
  setEndDate,
  selectedCategoryId,
  setSelectedCategoryId,
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 "
    >
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl p-10 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h2 className="text-[40px] font-serif leading-tight mb-8 text-gray-900">
          Create New Task
        </h2>

        <form onSubmit={onSubmit}>
          {/* Main Content Card */}
          <div className="border border-gray-200 rounded-[24px] p-8 mb-8 shadow-sm glass">
            {/* Input Field */}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the next objective?"
              rows="1"
              className="w-full text-2xl font-light outline-none placeholder-gray-300 resize-none mb-10 text-gray-800 border-none font-serif"
            />

            {/* Separator line */}
            <div className="h-[1px] bg-gray-200 w-full mb-8" />

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-22">
              {/* Deadline */}
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-1" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Deadline
                  </span>
                  <div className="relative flex items-center gap-1 group">
                    <input
                      type="date"
                      value={endDate}
                      min={todayStr}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent outline-none text-gray-600 text-sm cursor-pointer appearance-none"
                    />
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Assignee */}
              <div className="flex items-start gap-3 border-l md:border-l-0 md:pl-0 pl-4 border-gray-50">
                <User size={18} className="text-gray-400 mt-1" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Assignee
                  </span>
                  <input
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder="Unassigned"
                    className="bg-transparent outline-none text-gray-600 text-sm placeholder-gray-300 w-full"
                  />
                </div>
              </div>

              {/* Project */}
              <div className="flex items-start gap-3 border-l md:border-l-0 md:pl-0 pl-4 border-gray-50">
                <Folder size={18} className="text-gray-400 mt-1" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Project
                  </span>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) =>
                      setSelectedCategoryId(Number(e.target.value))
                    }
                    className="bg-transparent outline-none text-gray-600 text-sm cursor-pointer appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Action Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-black text-white px-10 py-4 rounded-3xl font-serif text-s hover:bg-zinc-800 transition-all active:scale-95"
              >
                Create Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
