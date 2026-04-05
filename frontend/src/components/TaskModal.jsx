import { X, User, Folder } from "lucide-react";
import { useState, useMemo } from "react";
import { useTheme } from "../components/ThemeContext";

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
  frequency,
  setFrequency,
  frequencyDays,
  setFrequencyDays,
  priority,
  setPriority,
}) {
  const { theme } = useTheme();
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);

  const calDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) {
      const d = new Date(calYear, calMonth, -first + i + 1);
      cells.push({ day: d.getDate(), date: null, cur: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date, cur: true });
    }
    return cells;
  }, [calYear, calMonth]);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleSubmitWithTime = (e) => {
    e.preventDefault();
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${isAM ? "AM" : "PM"}`;
    // Pass the synthetic event and time string back
    onSubmit(e, timeStr);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border-subtle rounded-[32px] shadow-2xl w-full max-w-2xl p-10 relative overflow-y-auto max-h-[90vh] transition-colors duration-500"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-text-muted hover:text-text-main transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h2 className="text-[40px] font-serif leading-tight mb-8 text-text-main">
          Create New Task
        </h2>

        <form onSubmit={handleSubmitWithTime}>
          <div className="border border-border-subtle rounded-[24px] p-8 mb-8 shadow-sm">
            {/* Title */}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the next objective?"
              rows="1"
              className="w-full text-2xl font-light outline-none placeholder-text-muted/40 resize-none mb-10 text-text-main bg-transparent border-none font-serif"
            />

            <div className="h-[1px] bg-border-subtle w-full mb-8" />

            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Calendar */}
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 block">
                  Deadline
                </span>

                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 0) {
                        setCalMonth(11);
                        setCalYear((y) => y - 1);
                      } else setCalMonth((m) => m - 1);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle text-text-muted hover:bg-primary/10 transition-colors"
                  >
                    ←
                  </button>
                  <span className="text-sm font-medium text-text-main">
                    {MONTHS[calMonth]} {calYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 11) {
                        setCalMonth(0);
                        setCalYear((y) => y + 1);
                      } else setCalMonth((m) => m + 1);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle text-text-muted hover:bg-primary/10 transition-colors"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-[10px] text-center text-text-muted/60 pb-1">
                      {d}
                    </div>
                  ))}
                  {calDays.map((d, i) => {
                    const isSelected = d.date === endDate;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => d.cur && setEndDate(d.date)}
                        className={`aspect-square flex items-center justify-center text-xs transition rounded-full ${
                          isSelected
                            ? "bg-primary text-background"
                            : d.cur
                            ? "text-text-main hover:bg-primary/20"
                            : "text-text-muted/20 cursor-default"
                        }`}
                        style={{ cursor: d.cur ? "pointer" : "default" }}
                      >
                        {d.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Section */}
              <div className="w-full md:w-36 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 block">
                  Time
                </span>

                <div className="text-2xl font-mono font-medium text-text-main mb-4">
                  {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
                  <span className="text-sm text-text-muted ml-1">{isAM ? "AM" : "PM"}</span>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Hour</label>
                    <input
                      type="range"
                      min={1} max={12}
                      value={hour}
                      onChange={(e) => setHour(+e.target.value)}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Minute</label>
                    <input
                      type="range"
                      min={0} max={59}
                      step={1}
                      value={minute}
                      onChange={(e) => setMinute(+e.target.value)}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {["AM", "PM"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setIsAM(p === "AM")}
                      className={`flex-1 py-1 rounded-lg text-xs border transition-all ${
                        (p === "AM") === isAM
                          ? "bg-primary text-background border-primary"
                          : "bg-transparent text-text-muted border-border-subtle hover:border-text-main"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-border-subtle w-full mb-8" />

            {/* Assignee + Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-start gap-3">
                <User size={18} className="text-text-muted mt-1" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Assignee</span>
                  <input
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder="Unassigned"
                    className="bg-transparent outline-none text-text-main text-sm placeholder-text-muted/40 w-full"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Folder size={18} className="text-text-muted mt-1" />
                <div className="flex flex-col w-full">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Project</span>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    className="bg-transparent outline-none text-text-main text-sm cursor-pointer appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-card text-text-main">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="h-[1px] bg-border-subtle w-full mb-6 mt-2" />
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 block">Priority</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "None", value: "none", color: "text-text-muted border-border-subtle" },
                  { label: "Low", value: "low", color: "text-blue-400 border-blue-400/30 bg-blue-400/5" },
                  { label: "Medium", value: "medium", color: "text-amber-400 border-amber-400/30 bg-amber-400/5" },
                  { label: "High", value: "high", color: "text-red-400 border-red-400/30 bg-red-400/5" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      priority === opt.value
                        ? `${opt.color} ring-1 ring-current`
                        : "text-text-muted border-border-subtle hover:border-text-main"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="h-[1px] bg-border-subtle w-full mb-6" />
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 block">Frequency</span>
              <div className="flex flex-wrap gap-2">
                {["once", "daily", "weekdays", "weekends", "custom"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setFrequency(v); setFrequencyDays([]); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      frequency === v
                        ? "bg-primary text-background border-primary"
                        : "text-text-muted border-border-subtle hover:border-text-main"
                    }`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary text-background px-10 py-4 rounded-3xl font-serif hover:opacity-90 transition-all active:scale-95 shadow-lg"
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