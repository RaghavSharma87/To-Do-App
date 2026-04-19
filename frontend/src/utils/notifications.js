const harami_texts = [
  "Complete karle lodu",
  "Shanti se karle: {task}",
  "Sirf create karne se kuch nahi hoga chutiye",
];

const semi_harami = [
  "{task} due hai bhai",
  "Kab tak nahi karoge?",
  "Abhi karlo, phir aaram",
];

const polite = [
  "{task} overdue",
  "Please complete your tasks",
  "Tick done, increase efficiency",
];

const PERSONALITIES = {
  harami: harami_texts,
  semi: semi_harami,
  politeness: polite,
};

function getRandomMessage(personality, taskTitle) {
  const messages = PERSONALITIES[personality] || polite;
  const random =
    messages[Math.floor(Math.random() * messages.length)];

  return random.replace("{task}", taskTitle);
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  await navigator.serviceWorker.register("/sw.js");
}

export function showDeviceNotification(
  taskTitle,
  personality = "politeness"
) {
  if (Notification.permission !== "granted") return;

  const body = getRandomMessage(personality, taskTitle);

  navigator.serviceWorker.ready.then((reg) => {
    reg.showNotification("Task Reminder", {
      body,
      icon: "/favicon.ico",
      tag: taskTitle,
      data: { url: "/home" },
    });
  });
}

export function scheduleTaskNotification(
  taskId,
  taskTitle,
  dueDate,
  personality = "politeness"
) {
  const due = new Date(dueDate).getTime();
  const now = Date.now();

  if (isNaN(due) || due <= now) return;

  const timer = setTimeout(() => {
    showDeviceNotification(taskTitle, personality);
  }, due - now);

  window.__taskTimers = window.__taskTimers || {};
  window.__taskTimers[taskId] = timer;
}

export function clearScheduledNotification(taskId) {
  if (window.__taskTimers?.[taskId]) {
    clearTimeout(window.__taskTimers[taskId]);
    delete window.__taskTimers[taskId];
  }
}