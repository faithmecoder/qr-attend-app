import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://qr-attend-app-u66d.vercel.app",
  withCredentials: true, // send cookies with every request
});

// Optional: still allow Bearer token if you add it manually
/* api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}); */

export default api;
