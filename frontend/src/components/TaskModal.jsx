import { X, User, Folder } from "lucide-react";
import { useState, useMemo } from "react";

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
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [customDates, setCustomDates] = useState([]);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const todayStr = new Date().toISOString().split("T")[0];

  const calDays = useMemo(() => {
    let first = new Date(calYear, calMonth, 1).getDay();
    first = first === 0 ? 6 : first - 1;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) {
      const d = new Date(calYear, calMonth, -first + i + 1);
      cells.push({ day: d.getDate(), date: null, cur: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isPast = date < todayStr;
      cells.push({ day: d, date, cur: true, isPast });
    }
    return cells;
  }, [calYear, calMonth]);

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleSubmitWithTime = (e) => {
    e.preventDefault();
    let h=hour;
    if(!isAM && hour ==12 ) h=hour+12;
    if(isAM && hour==12) h=0;
    const timeStr = `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onSubmit(e, timeStr);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border-subtle rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-y-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-border-subtle">
          <h2 className="text-xl font-bold font-serif text-text-main tracking-tight">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-border-subtle text-text-muted hover:text-text-main hover:border-text-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmitWithTime}>
          <div className="px-8 py-6">
            {/* Task Title */}
            <div className="mb-6">
              <label className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-text-muted block mb-2">
                Task Title
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Drafting the concept narrative..."
                rows={2}
                className="w-full text-lg font-serif font-light italic outline-none placeholder-text-muted/40 resize-none text-text-main bg-transparent border-none leading-snug"
              />
            </div>

            <div className="h-px bg-border-subtle mb-6" />

            {/* Two-column: Calendar + Right panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* LEFT — Calendar */}
              <div>
                <label className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-text-muted block mb-3">
                  Deadline Date
                </label>
                <div className="border border-border-subtle rounded-xl p-4 bg-background">
                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear((y) => y - 1);
                        } else setCalMonth((m) => m - 1);
                      }}
                      className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-main transition-colors text-sm"
                    >
                      ‹
                    </button>
                    <span className="text-sm font-serif font-semibold italic text-text-main">
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
                      className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-main transition-colors text-sm"
                    >
                      ›
                    </button>
                  </div>

                  {/* Day labels */}
                  <div className="grid grid-cols-7 mb-1">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div
                        key={i}
                        className="text-[10px] text-center text-text-muted font-sans pb-1"
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-y-0.5">
                    {calDays.map((d, i) => {
                      const isSelected =
                        frequency === "custom"
                          ? customDates.includes(d.date)
                          : d.date === endDate;
                      const isToday =
                        d.date === new Date().toISOString().split("T")[0];
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (!d.cur || d.isPast) return;
                            if (frequency === "custom") {
                              if (customDates.includes(d.date)) {
                                setCustomDates(
                                  customDates.filter((dt) => dt !== d.date),
                                );
                              } else {
                                setCustomDates([...customDates, d.date]);
                              }
                            } else {
                              setEndDate(d.date);
                            }
                          }}
                          className={`aspect-square flex items-center justify-center text-xs font-sans rounded-full transition-all mx-auto w-7 h-7 ${
                            isSelected
                              ? "bg-text-main text-background font-semibold"
                              : d.isPast
                                ? "text-text-muted/20 cursor-not-allowed"
                                : isToday
                                  ? "border border-border-subtle text-text-main font-medium"
                                  : d.cur
                                    ? "text-text-main hover:bg-border-subtle cursor-pointer"
                                    : "text-text-muted/30 cursor-default"
                          }`}
                        >
                          {d.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT — Time + Assignee + Project */}
              <div className="flex flex-col gap-5">
                {/* Time Assignment */}
                <div>
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-text-muted block mb-3">
                    Time Assignment
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-sans text-text-muted">
                        Hour
                      </span>
                      <span className="text-xs font-mono font-semibold text-text-main w-6 text-right">
                        {String(hour).padStart(2, "0")}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={hour}
                      onChange={(e) => setHour(+e.target.value)}
                      className="w-full accent-text-main h-[2px] bg-border-subtle rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-sans text-text-muted">
                        Minute
                      </span>
                      <span className="text-xs font-mono font-semibold text-text-main w-6 text-right">
                        {String(minute).padStart(2, "0")}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={59}
                      step={1}
                      value={minute}
                      onChange={(e) => setMinute(+e.target.value)}
                      className="w-full accent-text-main h-[2px] bg-border-subtle rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex gap-2 pt-1">
                      {["AM", "PM"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setIsAM(p === "AM")}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-sans font-medium border transition-all ${
                            (p === "AM") === isAM
                              ? "bg-text-main text-background border-text-main"
                              : "bg-transparent text-text-muted border-border-subtle hover:border-text-muted"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border-subtle" />

                {/* Assignee */}
                <div>
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-text-muted block mb-2">
                    Assignee
                  </label>
                  <div className="flex items-center gap-2.5 border border-border-subtle rounded-xl px-3 py-2.5 bg-background hover:border-text-muted transition-colors">
                    <div className="w-6 h-6 rounded-full bg-border-subtle flex items-center justify-center flex-shrink-0">
                      <User size={12} className="text-text-muted" />
                    </div>
                    <input
                      value={person}
                      required
                      onChange={(e) => setPerson(e.target.value)}
                      placeholder="Unassigned"
                      className="bg-transparent outline-none text-text-main text-sm font-sans placeholder-text-muted/50 flex-1 min-w-0"
                    />
                  </div>
                </div>

                {/* Project Folder */}
                <div>
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-text-muted block mb-2">
                    Project Folder
                  </label>
                  <div className="flex items-center gap-2.5 border border-border-subtle rounded-xl px-3 py-2.5 bg-background hover:border-text-muted transition-colors">
                    <Folder
                      size={14}
                      className="text-text-muted flex-shrink-0"
                    />
                    <select
                      value={selectedCategoryId}
                      onChange={(e) =>
                        setSelectedCategoryId(Number(e.target.value))
                      }
                      className="bg-transparent outline-none text-text-main text-sm font-sans cursor-pointer appearance-none flex-1 min-w-0"
                    >
                      {categories.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                          className="bg-card text-text-main"
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-border-subtle mb-5" />

            {/* Priority */}
            <div className="mb-5">
              <label className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-text-muted block mb-3">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "None", value: "none" },
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium border transition-all ${
                      priority === opt.value
                        ? "bg-text-main text-background border-text-main"
                        : "text-text-muted border-border-subtle hover:border-text-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="mb-6">
              <label className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-text-muted block mb-3">
                Frequency
              </label>
              <div className="flex flex-wrap gap-2">
                {["once", "daily", "weekdays", "weekends", "custom"].map(
                  (v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setFrequency(v);
                        setFrequencyDays([]);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium border transition-all ${
                        frequency === v
                          ? "bg-text-main text-background border-text-main"
                          : "text-text-muted border-border-subtle hover:border-text-muted"
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>
            {/* Custom Days Selector */}
            {frequency === "weekdays" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, idx) => {
                    const isSelected = frequencyDays.includes(idx);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFrequencyDays(
                              frequencyDays.filter((d) => d !== idx),
                            );
                          } else {
                            setFrequencyDays([...frequencyDays, idx]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-sans border transition-all ${
                          isSelected
                            ? "bg-text-main text-background border-text-main"
                            : "text-text-muted border-border-subtle hover:border-text-muted"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-8 py-5 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-sans font-medium text-text-muted hover:text-text-main transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="bg-text-main text-background px-8 py-2.5 rounded-xl font-serif italic font-semibold text-sm hover:opacity-80 transition-all active:scale-95"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
