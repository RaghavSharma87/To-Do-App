import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});


const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// AFTER (fixed)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token && isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && !isTokenValid(token)) {
    localStorage.removeItem("access"); // only clear if expired, not if missing
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

const processPendingQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute = window.location.pathname === "/auth";
    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;

    if (!is401 || alreadyRetried || isAuthRoute) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
      localStorage.removeItem("access");
      window.location.href = "/auth";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/token/refresh/`,
        { refresh },
      );

      localStorage.setItem("access", data.access);
      if (data.refresh) localStorage.setItem("refresh", data.refresh);

      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      processPendingQueue(null, data.access);

      return API(originalRequest);
    } catch (refreshError) {
      processPendingQueue(refreshError, null);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/auth";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── GET
export const getTasks = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return API.get(`tasks/${query ? `?${query}` : ""}`);
};

// ── POST
export const createTask = (task) => API.post("tasks/", task);

// ── PATCH
export const patchTask = (id, updatedTask) =>
  API.patch(`tasks/${id}/`, updatedTask);

export const deleteTask = (id) => API.delete(`tasks/${id}/`);

export const getCategories = () => API.get("categories/");
export const createCategory = (data) => API.post("categories/", data);
export const deleteCategory = (id) => API.delete(`categories/${id}/`);
export const loginUser = (data) => API.post("login/", data);
export const registerUser = (data) => API.post("register/", data);
export const reorderTasks = (data) => API.post("tasks/reorder/", data);
export const completeTask = (id) => API.post(`tasks/${id}/complete/`);
export const deleteArchivedTasks = (days) =>
  API.delete(`tasks/auto-delete-archive/`, { params: { days } });

export default API;