import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

//  GET
export const getTasks = () => API.get("tasks/");

//  POST
export const createTask = (task) =>
  API.post("tasks/", task);

//  PATCH
export const patchTask = (id, updatedTask) =>
  API.patch(`tasks/${id}/`, updatedTask);

export const deleteTask = (id) =>
    API.delete(`tasks/${id}/`);

export default API;