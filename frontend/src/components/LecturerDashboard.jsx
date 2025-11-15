import React, { useState, useEffect } from "react";
import api from "../services/api";
import QRCode from "react-qr-code";
import useGeolocation from "../hooks/useGeolocation";

function LecturerDashboard() {
  // -----------------------
  // States
  // -----------------------
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [attendance, setAttendance] = useState([]);

  // Create Class states (unchanged)
  const [newClassId, setNewClassId] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [geofenceEnabled, setGeofenceEnabled] = useState(false);
  const [geofenceRadius, setGeofenceRadius] = useState(100);

  // Session-specific geofence (new)
  const [sessionGeofenceEnabled, setSessionGeofenceEnabled] = useState(false);
  const [sessionGeofenceRadius, setSessionGeofenceRadius] = useState(100);

  // location for create-class and session creation
  const { location: autoGeoLocation, error: autoGeoError, loading: autoGeoLoading } =
    useGeolocation();
  const [formLocation, setFormLocation] = useState(null);

  // edit modal (if you had it)
  const [editClass, setEditClass] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // messages
  const [formError, setFormError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // -----------------------
  // Helpers
  // -----------------------
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showFormError = (msg) => {
    setFormError(msg);
    setTimeout(() => setFormError(""), 4000);
  };

  const showSessionError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  // -----------------------
  // Auto-update form location
  // -----------------------
  useEffect(() => {
    if (autoGeoLocation) setFormLocation(autoGeoLocation);
  }, [autoGeoLocation]);

  // -----------------------
  // Load classes on mount
  // -----------------------
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/api/lecturer/classes");
        setClasses(data || []);
        if (data && data.length > 0) setSelectedClass(data[0]._id);
      } catch (err) {
        showSessionError("Failed to load classes.");
      }
    };
    fetchClasses();
  }, []);

  // -----------------------
  // Poll attendance for active session
  // -----------------------
  useEffect(() => {
    let interval;
    if (activeSession) {
      const fetchAttendance = async () => {
        try {
          const { data } = await api.get(
            `/api/lecturer/sessions/${activeSession._id}/attendance`
          );
          setAttendance(data || []);
        } catch (err) {
          console.error("Failed to fetch attendance", err);
        }
      };
      fetchAttendance();
      interval = setInterval(fetchAttendance, 5000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  // -----------------------
  // Countdown timer for active session
  // -----------------------
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expire = new Date(activeSession.expirationTime);
      const secLeft = Math.max(Math.floor((expire - now) / 1000), 0);
      setCountdown(secLeft);

      if (secLeft <= 0) {
        clearInterval(interval);
        showSessionError("QR expired. Reload session.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // -----------------------
  // Create class (unchanged)
  // -----------------------
  const handleCreateClass = async (e) => {
    e.preventDefault();

    if (!newClassId || !newClassName) return showFormError("Class ID & Name required");
    if (geofenceEnabled && !formLocation) return showFormError("GPS required for geofence");

    try {
      const payload = {
        classId: newClassId,
        className: newClassName,
        geofenceEnabled,
        latitude: geofenceEnabled ? formLocation?.lat : null,
        longitude: geofenceEnabled ? formLocation?.lng : null,
        geofenceRadius: geofenceEnabled ? geofenceRadius : null,
      };

      const { data } = await api.post("/api/lecturer/classes", payload);

      if (!classes.find((c) => c._id === data.newClass._id)) {
        setClasses([...classes, data.newClass]);
      }

      setSelectedClass(data.newClass._id);
      setNewClassId("");
      setNewClassName("");
      setGeofenceEnabled(false);
      setGeofenceRadius(100);

      showSuccess(data.message);
    } catch (err) {
      console.error(err);
      showFormError(err.response?.data?.message || "Class creation failed");
    }
  };

  // -----------------------
  // Start session (UPDATED to include session-specific geofence)
  // -----------------------
  const startSession = async () => {
    if (!selectedClass) {
      showSessionError("Please select a class.");
      return;
    }

    if (sessionGeofenceEnabled && !formLocation) {
      showSessionError("Cannot enable session geofence: location not available.");
      return;
    }

    try {
      const payload = {
        classId: selectedClass,
        geofenceEnabled: sessionGeofenceEnabled,
        latitude: sessionGeofenceEnabled ? formLocation?.lat : null,
        longitude: sessionGeofenceEnabled ? formLocation?.lng : null,
        geofenceRadius: sessionGeofenceEnabled ? sessionGeofenceRadius : null,
      };

      const { data } = await api.post("/api/lecturer/sessions/start", payload);

      setActiveSession(data);
      setAttendance([]);
      showSuccess("Session started!");
    } catch (err) {
      console.error(err);
      showSessionError(err.response?.data?.message || "Failed to start session.");
    }
  };

  // -----------------------
  // Reload session (regenerate QR)
  // -----------------------
  const reloadSession = async () => {
    if (!activeSession) {
      showSessionError("No active session to reload.");
      return;
    }
    try {
      const { data } = await api.post("/api/lecturer/sessions/reload", {
        sessionId: activeSession._id,
      });
      setActiveSession(data);
      showSuccess("QR reloaded!");
    } catch (err) {
      console.error(err);
      showSessionError(err.response?.data?.message || "Failed to reload session.");
    }
  };

  const qrUrl = activeSession ? `${window.location.origin}/scan?qrCodeValue=${activeSession.qrCodeValue}` : "";

  // -----------------------
  // Save edited class (if you have edit modal)
  // -----------------------
  const saveClassChanges = async () => {
    if (!editClass) return;
    setEditLoading(true);
    try {
      const payload = {
        className: editClass.className,
        geofenceEnabled: editClass.geofenceEnabled,
        latitude: editClass.geofenceEnabled ? formLocation?.lat : null,
        longitude: editClass.geofenceEnabled ? formLocation?.lng : null,
        geofenceRadius: editClass.geofenceRadius || 100,
      };

      await api.put(`/api/lecturer/classes/${editClass._id}`, payload);
      showSuccess("Class updated");
      setEditClass(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      showSessionError("Failed to update class.");
    } finally {
      setEditLoading(false);
    }
  };

  const deleteClass = async () => {
    if (!editClass) return;
    if (!window.confirm("Delete class?")) return;
    try {
      await api.delete(`/api/lecturer/classes/${editClass._1d}`);
      showSuccess("Deleted class");
      setEditClass(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      showSessionError("Failed to delete class");
    }
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="max-w-6xl mx-auto p-4">
      {successMessage && (
        <div className="fixed top-20 right-5 bg-green-500 text-white p-3 rounded shadow">
          {successMessage}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Lecturer Dashboard</h1>

      {/* CREATE CLASS */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Class</h2>

        {formError && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{formError}</div>}

        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="text-sm">Class ID</label>
            <input value={newClassId} onChange={(e) => setNewClassId(e.target.value)} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="text-sm">Class Name</label>
            <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} className="w-full p-2 border rounded" />
          </div>

          <div className="flex justify-between items-center">
            <label className="text-sm">Enable Geofence (class default)</label>
            <input type="checkbox" checked={geofenceEnabled} onChange={(e) => setGeofenceEnabled(e.target.checked)} />
          </div>

          {geofenceEnabled && (
            <>
              <label className="text-sm">Radius: <strong>{geofenceRadius}m</strong></label>
              <input type="range" min="50" max="1000" step="50" value={geofenceRadius} onChange={(e) => setGeofenceRadius(Number(e.target.value))} className="w-full" />
              {formLocation && <p className="text-green-600 text-sm">✓ Location: {formLocation.lat}, {formLocation.lng}</p>}
            </>
          )}

          <button className="w-full bg-blue-600 text-white p-2 rounded">Create Class</button>
        </form>
      </div>

      {/* START SESSION */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Start Session</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="">Select class</option>
          {classes.map((cls) => <option key={cls._id} value={cls._id}>{cls.className} ({cls.classId})</option>)}
        </select>

        <div className="mt-3 mb-3 border p-3 rounded">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sessionGeofenceEnabled} onChange={(e) => setSessionGeofenceEnabled(e.target.checked)} />
            Enable Geofence for THIS session (optional)
          </label>

          {sessionGeofenceEnabled && (
            <>
              <p className="text-sm text-gray-600 mt-2">{autoGeoLoading ? "...Getting location" : (autoGeoError ? "Location permission denied" : (formLocation ? `Location captured: ${formLocation.lat}, ${formLocation.lng}` : "Waiting for location..."))}</p>

              <label className="block mt-2 text-sm">Radius: {sessionGeofenceRadius}m</label>
              <input type="range" min="50" max="1000" step="50" value={sessionGeofenceRadius} onChange={(e) => setSessionGeofenceRadius(Number(e.target.value))} className="w-full" />
            </>
          )}
        </div>

        <button onClick={startSession} disabled={!selectedClass} className="w-full bg-indigo-600 text-white p-2 rounded">Start Session / Generate QR</button>

        {activeSession && (
          <div className="text-center mt-6">
            <QRCode value={qrUrl} size={200} />
            <p className="mt-2">Expires in: <strong>{countdown}s</strong></p>
            <button onClick={reloadSession} className="w-full mt-3 bg-green-600 text-white p-2 rounded">Reload QR Code</button>
          </div>
        )}
      </div>

      {/* LIVE ATTENDANCE */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Live Attendance</h2>

        {!activeSession ? (
          <p>No active session.</p>
        ) : attendance.length === 0 ? (
          <p>No students have marked attendance yet.</p>
        ) : (
          <ul className="divide-y">
            {attendance.map((rec) => (
              <li key={rec._id} className="py-3 flex justify-between">
                <div>
                  <p className="font-medium">{rec.studentId?.name}</p>
                  <p className="text-sm text-gray-500">{rec.studentId?.studentId}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs ${rec.isProxy ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                  {rec.isProxy ? "Proxy / Outside Area" : "Present"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default LecturerDashboard;
