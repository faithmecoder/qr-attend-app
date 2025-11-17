// src/components/RequireAuth.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children, role }) {
  const { user } = useAuth();

  // Not logged in → redirect
  if (!user) return <Navigate to="/login" replace />;

  // Role-based protection
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
