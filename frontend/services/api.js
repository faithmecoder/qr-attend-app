// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://qr-attend-app.onrender.com",
  withCredentials: true, // send cookies
});

export default api;
