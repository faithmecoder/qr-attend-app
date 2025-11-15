// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import LecturerDashboard from "./components/LecturerDashboard";
import StudentScanPage from "./components/StudentScanPage";
import RequireAuth from "./components/RequireAuth";
import AuthPage from "./pages/AuthPage.jsx";
import { useAuth } from "./context/AuthContext";
import StudentDashboard from "./pages/StudentDashboard";


function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ---------------- NAVBAR ---------------- */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-2xl font-bold text-indigo-600"
              >
                QR-Attend
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                {/* Dynamic Dashboard Link */}
                {user.role === "lecturer" && (
                  <Link
                    to="/dashboard"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Dashboard
                </Link>
              )}

                {user.role === "student" && (
                  <Link
                    to="/student/dashboard"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Dashboard
                  </Link>
                )}

                   <span className="text-gray-700">Hello, {user.name}</span>

                  <button
                    onClick={logout}
                    className="py-2 px-4 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 mr-4"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium rounded-md"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ---------------- ROUTES ---------------- */}
      <main className="py-10">
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Lecturer Dashboard */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth role="lecturer">
                <LecturerDashboard />
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

          <Route
            path="/student/dashboard"
            element={
              <RequireAuth role="student">
                <StudentDashboard />
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
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold">Welcome to QR-Attend</h1>

      {/* Not logged in */}
      {!user && (
        <p className="mt-4 text-lg">
          Please login or register to continue.
        </p>
      )}

      {/* Student */}
      {user && user.role === "student" && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Student Dashboard</h2>
          <p className="text-lg mb-6">
            Welcome back! You can scan attendance or view your attendance history.
          </p>

          <Link
            to="/student/dashboard"
            className="inline-block py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-lg"
          >
            Go to Student Dashboard
          </Link>

          <p className="mt-4 text-sm text-gray-500">
            (Your lecturer will provide a QR code to scan.)
          </p>
        </div>
      )}


      {/* Lecturer */}
      {user && user.role === "lecturer" && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Lecturer Dashboard
          </h2>
          <p className="text-lg mb-6">
            Manage classes and start attendance sessions.
          </p>
          <Link
            to="/dashboard"
            className="inline-block py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-lg"
          >
            Go to Lecturer Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

export default App;
