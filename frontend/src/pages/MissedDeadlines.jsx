import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowBigLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, completeTask } from "../api";

function MissedDeadlines() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const todayStr = new Date().toISOString().split("T")[0];

  const fetchTasks = async () => {
    const res = await getTasks();
    setTasks(res.data || []);
  };

  useEffect(() => { fetchTasks(); }, []);

  const missedTasks = useMemo(() => tasks.filter(t => !t.completed && !t.archived && t.end_date && t.end_date < todayStr), [tasks, todayStr]);

  const handleComplete = async (id) => {
    await completeTask(id);
    fetchTasks();
  };

  const daysLate = (date) => Math.max(1, Math.ceil((new Date(todayStr) - new Date(date)) / 86400000));

  return (
    <div className="min-h-screen flex bg-background/60">
      <aside className="hidden lg:flex w-56 border-r border-border-subtle px-5 py-8 flex-col bg-background/80">
        <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-xs text-text-muted hover:text-text-main mb-4">
          <ArrowBigLeft size={14}/> Back Home
        </button>
        <p className="text-sm font-bold">Missed Deadlines</p>
        <p className="text-xs text-text-muted mt-2">Recover your efficiency by completing overdue work.</p>
      </aside>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-2">Recovery Zone</p>
            <h1 className="text-3xl font-semibold">Missed Deadlines</h1>
          </div>
          <div className="px-4 py-2 rounded-2xl border border-border-subtle bg-card text-sm">
            {missedTasks.length} overdue tasks
          </div>
        </div>

        {missedTasks.length === 0 ? (
          <div className="rounded-3xl border border-border-subtle bg-card p-10 text-center">
            <CheckCircle2 className="mx-auto mb-3" size={28} />
            <p className="text-lg font-semibold">You're back on track.</p>
            <p className="text-sm text-text-muted mt-1">No missed deadlines right now.</p>
          </div>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] uppercase tracking-[0.12em] font-semibold">Overdue Tasks</h3>
              <span className="text-[10px] text-text-muted">Complete these first</span>
            </div>
            <AnimatePresence>
              {missedTasks.map(task => (
                <motion.div key={task.id} layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="flex items-start gap-3 py-4 border-b border-border-subtle group">
                  <button onClick={() => handleComplete(task.id)} className="mt-0.5 w-[18px] h-[18px] rounded-full border-2 border-red-400 hover:bg-green-500 hover:border-green-500 transition-all" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug">{task.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">Deadline: {task.end_date} • Overdue by {daysLate(task.end_date)} day(s)</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 flex items-center gap-1">
                    <AlertTriangle size={12}/> Late
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        )}
      </main>
    </div>
  );
}

export default MissedDeadlines;
