import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
});

export const login = async (data) => {
  const res = await api.post("/api/login", data);
  return res.data;
};

export const register = async (data) => {
  const res = await api.post("/api/register", data);
  return res.data;
};

export default api;
