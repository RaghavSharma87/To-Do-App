import axios from "axios";
import { isTokenValid } from "./utils/auth";
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/auth") {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);
//  GET
export const getTasks = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return API.get(`tasks/${query ? `?${query}` : ""}`);
};

//  POST
export const createTask = (task) => API.post("tasks/", task);

//  PATCH
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
export default API;
