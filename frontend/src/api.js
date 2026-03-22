import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

//  GET
export const getTasks = (query = "") =>
  API.get(`tasks/${query}`);

//  POST
export const createTask = (task) => API.post("tasks/", task);

//  PATCH
export const patchTask = (id, updatedTask) =>
  API.patch(`tasks/${id}/`, updatedTask);

export const deleteTask = (id) => API.delete(`tasks/${id}/`);

export const getCategories = () => API.get("categories/");
export const createCategory = (data) => API.post("categories/", data);

export default API;
