import React, { useState, useEffect } from 'react';
import api from '../services/api';
import QRCode from 'react-qr-code';
import useGeolocation from '../hooks/useGeolocation';

function LecturerDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState('');
  
  // --- States for the create class form ---
  const [newClassId, setNewClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [formLocation, setFormLocation] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [geofenceRadius, setGeofenceRadius] = useState(100);

  // --- Use the automatic geolocation hook ---
  const { location: autoGeoLocation, error: autoGeoError, loading: autoGeoLoading } = useGeolocation();

  // --- Notification functions ---
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  const showFormError = (message) => {
    setFormError(message);
    setTimeout(() => setFormError(''), 5000);
  };
  const showSessionError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // --- Effect to handle automatic location ---
  useEffect(() => {
    if (autoGeoLocation) {
      setFormLocation(autoGeoLocation);
      // Only show this notification once, not every time
      // showSuccess('Location captured automatically!');
    }
    if (autoGeoError) {
      showFormError(autoGeoError);
    }
  }, [autoGeoLocation, autoGeoError]);

  // --- Fetch existing classes ---
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get('/api/lecturer/classes');
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0]._id);
        }
      } catch (err) {
        showSessionError('Failed to fetch classes.');
      }
    };
    fetchClasses();
  }, []);

  // --- Poll for attendance during active session ---
  useEffect(() => {
    let intervalId;
    if (activeSession) {
      const fetchAttendance = async () => {
        try {
          const { data } = await api.get(`/api/lecturer/sessions/${activeSession._id}/attendance`);
          setAttendance(data);
        } catch (err) {
          console.error('Failed to fetch attendance');
        }
      };
      
      fetchAttendance();
      intervalId = setInterval(fetchAttendance, 5000);
    }
    return () => clearInterval(intervalId);
  }, [activeSession]);

  // --- Function to start a session ---
  const startSession = async () => {
    if (!selectedClass) {
      showSessionError('Please select a class.');
      return;
    }
    setError('');
    try {
      const { data } = await api.post('/api/lecturer/sessions/start', { classId: selectedClass });
      setActiveSession(data);
      setAttendance([]); 
      showSuccess('Session started successfully!');
    } catch (err) {
      showSessionError('Failed to start session.');
    }
  };

  // --- Function to create a new class ---
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newClassId || !newClassName) {
      showFormError('Class ID and Name are required.');
      return;
    }
    
    if (geofenceEnabled && !formLocation) {
      showFormError('Geofence is enabled, but location is not available. Check browser permissions.');
      return;
    }

    setFormLoading(true);
    try {
      const newClassData = {
        classId: newClassId,
        className: newClassName,
        geofenceEnabled: geofenceEnabled,
        latitude: geofenceEnabled ? formLocation.latitude : null,
        longitude: geofenceEnabled ? formLocation.longitude : null,
        geofenceRadius: geofenceEnabled ? geofenceRadius : null
      };
      
      const { data: newClass } = await api.post('/api/lecturer/classes', newClassData);
      
      setClasses([...classes, newClass]);
      setSelectedClass(newClass._id);
      
      setNewClassId('');
      setNewClassName('');
      setFormLoading(false);
      showSuccess('Class created successfully!');
      
    } catch (err) {
      showFormError(err.response?.data?.message || 'Failed to create class.');
      setFormLoading(false);
    }
  };

  // ▼▼▼ ADD THIS NEW FUNCTION ▼▼▼
  const handleReloadSession = async () => {
    if (!activeSession) {
      showSessionError('No active session to reload.');
      return;
    }
    try {
      // Send the request to our new endpoint
      const { data } = await api.post('/api/lecturer/sessions/reload', { sessionId: activeSession._id });
      setActiveSession(data); // Update the session state with new data
      showSuccess('QR Code reloaded! New 5-minute timer.');
    } catch (err) {
      showSessionError('Failed to reload QR code.');
    }
  };
  // ▲▲▲ END OF NEW FUNCTION ▲▲▲

  const qrUrl = activeSession 
    ? `${window.location.origin}/scan?qrCodeValue=${activeSession.qrCodeValue}` 
    : '';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Notification Display Area */}
      {successMessage && (
        <div className="fixed top-20 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Lecturer Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: CREATE CLASS & START SESSION */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* CREATE CLASS FORM CARD */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Create New Class</h2>
            {formError && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                  {formError}
                </div>
            )}
            <form onSubmit={handleCreateClass} className="space-y-4">
              {/* ... (all your form inputs for Class ID, Name, Geofence Toggle, Slider) ... */}
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Class ID (e.g., CS101)</label>
                <input
                  type="text"
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Class Name (e.g., Intro to CS)</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <label className="block text-gray-700 text-sm font-medium">Enable Geofence</label>
                <input
                  type="checkbox"
                  checked={geofenceEnabled}
                  onChange={(e) => setGeofenceEnabled(e.target.checked)}
                  className="h-5 w-5 rounded text-indigo-600"
                />
              </div>

              {geofenceEnabled && (
                <div className="pt-2">
                  <label className="block text-gray-700 mb-2 text-sm">
                    Geofence Radius: <span className="font-bold">{geofenceRadius} meters</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={geofenceRadius}
                    onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50m</span>
                    <span>500m</span>
                    <span>1000m (1km)</span>
                  </div>
                  
                  <div className="text-sm mt-3">
                    {autoGeoLoading && (
                      <p className="text-blue-600">... Getting location...</p>
                    )}
                    {autoGeoError && (
                      <p className="text-red-600">✗ Location permission denied. Geofence will not work.</p>
                    )}
                    {formLocation && !autoGeoError && (
                       <p className="text-green-600">✓ Location captured automatically.</p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {formLoading ? 'Creating...' : 'Create Class'}
              </button>
            </form>
          </div>

          {/* START SESSION CARD */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Start Session</h2>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Existing Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={activeSession}
              >
                <option value="">-- Select a class --</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.className} ({cls.classId})</option>
))}
              </select>
            </div>
            <button
              onClick={startSession}
              disabled={activeSession || !selectedClass}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {activeSession ? 'Session Active' : 'Start Class / Generate QR'}
            </button>
          </div>
        </div>

        {/* COLUMN 2 & 3: ACTIVE SESSION & ATTENDANCE */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* QR CODE CARD */}
          {activeSession && (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h2 className="text-2xl font-semibold mb-4">Active Session</h2>
              <p className="font-medium mb-4">Scan this code to mark attendance:</p>
              <div className="inline-block bg-white p-4 rounded">
                <QRCode value={qrUrl} />
              </div>
              <p className="text-sm text-gray-600 mt-4">Session expires at: {new Date(activeSession.expirationTime).toLocaleTimeString()}</p>
              
              {/* ▼▼▼ ADD THIS NEW BUTTON ▼▼▼ */}
              <button
                onClick={handleReloadSession}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-4"
              >
                Reload QR Code (New 5 min)
              </button>
              {/* ▲▲▲ END OF NEW BUTTON ▲▲▲ */}

            </div>
          )}

          {/* LIVE ATTENDANCE CARD */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Live Attendance</h2>
            {activeSession ? (
              <ul className="divide-y divide-gray-200">
                {attendance.length > 0 ? attendance.map((record) => (
                  <li key={record._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{record.studentId?.name || 'Unknown Student'}</p>
                      <p className="text-sm text-gray-500">{record.studentId?.studentId || 'N/A'}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.isProxy ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {record.isProxy ? 'Geofence Fail' : 'Present'}
                    </span>
                  </li>
                )) : (
                  <p className="text-gray-500">No students have checked in yet.</p>
                )}
              </ul>
            ) : (
              <p className="text-gray-500">No active session. Start a session to see live attendance.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerDashboard;