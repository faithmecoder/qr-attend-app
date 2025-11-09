import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import LecturerDashboard from './components/LecturerDashboard';
import StudentScanPage from './components/StudentScanPage';
import Register from './components/Register';
import Login from './components/Login';
import RequireAuth from './components/RequireAuth';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">QR-Attend</Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <>
                  <span className="mr-4">Welcome, {user.name} ({user.role})</span>
                  <button
                    onClick={logout}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mr-4 text-gray-600 hover:text-gray-900">Login</Link>
                  <Link to="/register" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Lecturer Route */}
          <Route 
            path="/dashboard" 
            element={
              <RequireAuth role="lecturer">
                <LecturerDashboard />
              </RequireAuth>
            } 
          />
          
          {/* ▼▼▼ PROTECTED STUDENT ROUTE ▼▼▼ */}
          <Route 
            path="/scan" 
            element={
              <RequireAuth role="student">
                <StudentScanPage />
              </RequireAuth>
            } 
          />
          
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold">Welcome to QR-Attend</h1>
      {!user && (
        <p className="mt-4 text-lg">Please login or register to continue.</p>
      )}
      
      {user && user.role === 'student' && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Student Dashboard</h2>
          <p className="text-lg mb-6">You are logged in. To mark your attendance, go to the scan page.</p>
          <Link 
            to="/scan" 
            className="inline-block py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-lg"
          >
            Go to Scan Page
          </Link>
          <p className="mt-4 text-sm text-gray-500">(Note: The scan page will only work if you've been given a QR code link.)</p>
        </div>
      )}

      {user && user.role === 'lecturer' && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Lecturer Dashboard</h2>
          <p className="text-lg mb-6">Go to your dashboard to manage classes and start attendance sessions.</p>
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