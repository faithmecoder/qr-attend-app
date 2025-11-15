// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(localStorage.getItem("token"));
  const [user, setUserState] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Keep axios interceptor behavior as-is (api attaches token from localStorage).
  // If token exists but no user, optionally you could fetch profile here (not required).

  const login = (tokenValue, userObj) => {
    if (tokenValue) {
      localStorage.setItem("token", tokenValue);
      setTokenState(tokenValue);
    }
    if (userObj) {
      localStorage.setItem("user", JSON.stringify(userObj));
      setUserState(userObj);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTokenState(null);
    setUserState(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, setToken: setTokenState, user, setUser: setUserState, login, logout, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
