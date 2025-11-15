import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { user } = useAuth();

  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await api.get("/api/students/attendance");
        setAttendanceList(data || []);
      } catch (err) {
        console.error("Failed to load attendance", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.name}
      </h1>

      {/* Scan Button */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Mark Attendance</h2>
        <p className="text-gray-600 mb-4">
          Click below to scan your lecturer's QR code.
        </p>
        <Link
          to="/scan"
          className="inline-block w-full py-3 text-center bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
        >
          Scan QR Code
        </Link>
      </div>

      {/* Attendance History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Attendance History</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : attendanceList.length === 0 ? (
          <p className="text-gray-500">No attendance records found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {attendanceList.map((rec) => (
              <li key={rec._id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{rec.sessionId?.classId?.className || "Class"}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(rec.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    rec.isProxy
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {rec.isProxy ? "Proxy Attempt" : "Present"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
