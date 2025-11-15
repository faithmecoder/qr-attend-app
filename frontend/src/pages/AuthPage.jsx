// src/pages/AuthPage.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [role, setRole] = useState("lecturer"); // registration only

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const clearForm = () =>
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentId: "",
    });

  // -----------------------------
  // HANDLE LOGIN
  // -----------------------------
  const handleLogin = async () => {
    try {
      // Try lecturer login first
      try {
        const res = await api.post("/api/lecturer/login", {
          email: form.email,
          password: form.password,
        });

        login(res.data.token, res.data.lecturer || res.data.user);
        navigate("/dashboard");
        return;
      } catch (_) {}

      // Try student login second
    try {
    const res = await api.post("/api/student/login", {
        email: form.email,
        password: form.password,
    });

    login(res.data.token, res.data.student || res.data.user);
    navigate("/student/dashboard");  // <-- UPDATED
    return;
    } catch (_) {}


      // If both fail
      setMessage({ type: "error", text: "Invalid email or password" });

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Login failed",
      });
    }
  };

  // -----------------------------
  // HANDLE REGISTER
  // -----------------------------
  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    try {
      if (role === "lecturer") {
        await api.post("/api/lecturer/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
      } else {
        await api.post("/api/student/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          studentId: form.studentId,
        });
      }

      setMessage({ type: "success", text: "Registration successful!" });
      clearForm();
      setMode("login");

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Registration failed",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (mode === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow rounded p-6">
        <h1 className="text-2xl font-semibold text-center mb-4">
          {mode === "login" ? "Login" : "Register"}
        </h1>

        {/* Mode Switch */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            className={`px-3 py-1 rounded ${
              mode === "login"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={`px-3 py-1 rounded ${
              mode === "register"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {/* Only show role selection during REGISTER */}
        {mode === "register" && (
          <>
            <label className="block mb-1 text-sm font-medium">I am a:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="lecturer">Lecturer</option>
              <option value="student">Student</option>
            </select>
          </>
        )}

        {/* Messages */}
        {message && (
          <div
            className={`p-3 mb-3 rounded text-center ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Name (register only) */}
          {mode === "register" && (
            <input
              name="name"
              placeholder="Full Name"
              className="w-full border p-2 rounded"
              value={form.name}
              onChange={handleChange}
            />
          )}

          {/* Email */}
          <input
            name="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={handleChange}
            type="email"
          />

          {/* Password */}
          <input
            name="password"
            placeholder="Password"
            type="password"
            className="w-full border p-2 rounded"
            value={form.password}
            onChange={handleChange}
          />

          {/* Extra registration fields */}
          {mode === "register" && (
            <>
              <input
                name="confirmPassword"
                placeholder="Confirm Password"
                type="password"
                className="w-full border p-2 rounded"
                value={form.confirmPassword}
                onChange={handleChange}
              />

              {role === "student" && (
                <input
                  name="studentId"
                  placeholder="Student ID"
                  className="w-full border p-2 rounded"
                  value={form.studentId}
                  onChange={handleChange}
                />
              )}
            </>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-2 rounded"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
