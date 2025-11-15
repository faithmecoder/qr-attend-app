// src/components/RequireAuth.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children, role }) {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" />;

  if (role && user?.role !== role) return <Navigate to="/login" />;

  return children;
}
