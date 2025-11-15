// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import LecturerDashboard from "./components/LecturerDashboard.jsx";
import StudentScanPage from "./components/StudentScanPage.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AuthPage from "./pages/AuthPage.jsx";

import RequireAuth from "./components/RequireAuth.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          QR-Attend
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-indigo-600 font-medium">
                Dashboard
              </Link>
              <span>Hello, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ROUTES */}
      <main className="py-10">
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Lecturer */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth role="lecturer">
                <LecturerDashboard />
              </RequireAuth>
            }
          />

          {/* Student Dashboard */}
          <Route
            path="/student/dashboard"
            element={
              <RequireAuth role="student">
                <StudentDashboard />
              </RequireAuth>
            }
          />

          {/* Student Scan Page */}
          <Route
            path="/scan"
            element={
              <RequireAuth role="student">
                <StudentScanPage />
              </RequireAuth>
            }
          />

          {/* Home */}
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  const { user } = useAuth();

  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl font-bold mb-4">Welcome to QR-Attend</h1>

      {!user && <p>Please login or register to continue.</p>}
    </div>
  );
}

export default App;
