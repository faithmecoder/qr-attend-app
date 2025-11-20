import React, { createContext, useContext, useState } from "react";
import api from "../services/api"; // 👈 New: Import the Axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Attempt to load user data from localStorage on initial load
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Called after successful login (lecturer or student)
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * Logs the user out by clearing the secure cookie on the backend
   * and resetting frontend state.
   * @param {string} role - 'lecturer' or 'student'
   */
  const logout = async (role) => {
    try {
      // 🚀 CRITICAL FIX: Tell the backend to clear the secure cookie
      if (role === "lecturer") {
        await api.post("/api/lecturer/logout");
      } else if (role === "student") {
        // Note: Your student logout endpoint expects "jwt" cookie to be cleared
        // Check your backend studentController.js for the exact cookie name if needed
        await api.post("/api/student/logout");
      }
    } catch (err) {
      // Log error but proceed with frontend logout for better user experience
      console.error("Failed to clear cookie on backend (may be expired/already logged out):", err);
    }

    // Clear frontend state regardless of backend success
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);