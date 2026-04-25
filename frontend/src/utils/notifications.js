// ─── Notification message banks ───────────────────────────────────────────────

const harami_texts = [
  "Kar le bhai, {task} pending hai",
  "Sirf create karne se kuch nahi hoga — {task} complete kar",
  "Kab tak soyega? {task} overdue ho gaya",
  "Tu hi tha jo bola tha kar lunga — {task}",
  "Chal uth, {task} abhi bhi wait kar raha hai",
];

const semi_harami = [
  "{task} due hai bhai, seriously",
  "Kab tak nahi karoge? {task} abhi bhi pending",
  "Abhi karlo {task}, phir aaram",
  "Ek kaam tha — {task} — woh bhi pending",
  "Yaar {task} toh kar do please",
];

const polite = [
  "Reminder: {task} is due",
  "Don't forget — {task} is waiting",
  "Just a nudge: {task} needs your attention",
  "Friendly reminder to complete {task}",
  "Your task '{task}' is coming up",
];

const PERSONALITIES = {
  harami: harami_texts,
  semi: semi_harami,
  politeness: polite,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRandomMessage(personality, taskTitle) {
  const messages = PERSONALITIES[personality] || polite;
  const template = messages[Math.floor(Math.random() * messages.length)];
  return template.replace(/\{task\}/g, taskTitle);
}

// ─── Permission & SW setup ────────────────────────────────────────────────────

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function registerSW() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (err) {
    console.warn("Service worker registration failed:", err);
    return null;
  }
}

// ─── Show a notification immediately ─────────────────────────────────────────

export function showDeviceNotification(taskTitle, personality = "politeness", options = {}) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const body = getRandomMessage(personality, taskTitle);

  const defaultOptions = {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `task-${taskTitle}`,
    data: { url: "/home" },
    requireInteraction: false,
  };

  navigator.serviceWorker.ready
    .then((reg) => {
      reg.showNotification("Task Reminder", { ...defaultOptions, ...options });
    })
    .catch(() => {
      // Fallback: plain Notification API (no actions/badge)
      new Notification("Task Reminder", defaultOptions);
    });
}

// ─── Timer store (in-memory) ──────────────────────────────────────────────────

function getTimerStore() {
  window.__taskTimers = window.__taskTimers || {};
  return window.__taskTimers;
}

// ─── Schedule a single-shot notification at due time ─────────────────────────

export function scheduleTaskNotification(
  taskId,
  taskTitle,
  dueDate,
  personality = "politeness"
) {
  const store = getTimerStore();

  // Clear any existing timers for this task first
  clearScheduledNotification(taskId);

  const due = new Date(dueDate).getTime();
  const now = Date.now();

  if (isNaN(due)) return;

  store[taskId] = [];

  // ── Reminder 1: 30 minutes before ──
  const thirtyMinBefore = due - 30 * 60 * 1000;
  if (thirtyMinBefore > now) {
    const t = setTimeout(() => {
      showDeviceNotification(taskTitle, personality, {
        tag: `task-${taskId}-30min`,
        body: `30 minutes left for: ${taskTitle}`,
      });
    }, thirtyMinBefore - now);
    store[taskId].push(t);
  }

  // ── Reminder 2: at due time ──
  if (due > now) {
    const t = setTimeout(() => {
      showDeviceNotification(taskTitle, personality, {
        tag: `task-${taskId}-due`,
        requireInteraction: true,
      });
    }, due - now);
    store[taskId].push(t);
  }

  // ── Reminder 3: 1 hour after (overdue nudge) ──
  const oneHourAfter = due + 60 * 60 * 1000;
  if (oneHourAfter > now) {
    const t = setTimeout(() => {
      showDeviceNotification(taskTitle, personality, {
        tag: `task-${taskId}-overdue`,
        body: getRandomMessage(personality, taskTitle) + " — still pending!",
        requireInteraction: true,
      });
    }, oneHourAfter - now);
    store[taskId].push(t);
  }
}

// ─── Cancel all timers for a task ────────────────────────────────────────────

export function clearScheduledNotification(taskId) {
  const store = getTimerStore();
  const timers = store[taskId];
  if (!timers) return;

  if (Array.isArray(timers)) {
    timers.forEach(clearTimeout);
  } else {
    // backwards-compat: old format stored a single timer id
    clearTimeout(timers);
  }

  delete store[taskId];
}

// ─── Reschedule all active tasks (call on app boot) ──────────────────────────

export function rescheduleAllNotifications(tasks, personality = "politeness") {
  if (!Array.isArray(tasks)) return;

  tasks.forEach((task) => {
    if (task.completed || task.archived || !task.end_date) return;

    const dueDateTime = `${task.end_date}T${task.end_time || "23:59"}`;
    const due = new Date(dueDateTime).getTime();

    // Only reschedule future tasks
    if (isNaN(due) || due <= Date.now()) return;

    scheduleTaskNotification(task.id, task.title, dueDateTime, personality);
  });
}
