import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
//  GET
export const getTasks = (query = "") => API.get(`tasks/${query}`);

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
export default API;
