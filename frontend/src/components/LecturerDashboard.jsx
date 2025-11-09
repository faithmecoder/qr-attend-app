import React, { useState, useEffect } from 'react';
import api from '../services/api';
import QRCode from 'react-qr-code';
import useGeolocation from '../hooks/useGeolocation'; // ◄◄◄ IMPORT GEOLOCATION HOOK

function LecturerDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState('');

  // ▼▼▼ NEW STATE FOR THE CREATE CLASS FORM ▼▼▼
  const [newClassId, setNewClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [formLocation, setFormLocation] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const { location, error: geoError, getLocation } = useGeolocation();
  // ▲▲▲ NEW STATE FOR THE CREATE CLASS FORM ▲▲▲

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get('/api/lecturer/classes');
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch classes.');
      }
    };
    fetchClasses();
  }, []);

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
      intervalId = setInterval(fetchAttendance, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(intervalId); // Cleanup
  }, [activeSession]);

  const startSession = async () => {
    if (!selectedClass) {
      setError('Please select a class.');
      return;
    }
    setError('');
    try {
      const { data } = await api.post('/api/lecturer/sessions/start', { classId: selectedClass });
      setActiveSession(data);
      setAttendance([]); 
    } catch (err) {
      setError('Failed to start session.');
    }
  };

  // ▼▼▼ NEW FUNCTION TO HANDLE CREATING A CLASS ▼▼▼
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newClassId || !newClassName) {
      setFormError('Class ID and Name are required.');
      return;
    }
    if (!formLocation) {
      setFormError('Class location is required. Click "Get Current Location".');
      return;
    }

    setFormLoading(true);
    try {
      const newClassData = {
        classId: newClassId,
        className: newClassName,
        latitude: formLocation.latitude,
        longitude: formLocation.longitude,
        geofenceRadius: 100 // Default 100m
      };
      
      const { data: newClass } = await api.post('/api/lecturer/classes', newClassData);
      
      // Add new class to the dropdown and select it
      setClasses([...classes, newClass]);
      setSelectedClass(newClass._id);
      
      // Clear the form
      setNewClassId('');
      setNewClassName('');
      setFormLocation(null);
      setFormLoading(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create class.');
      setFormLoading(false);
    }
  };

  const handleGetLocation = () => {
    getLocation(); // Request location
    if (geoError) {
      setFormError(`Location Error: ${geoError}`);
    } else if (location) {
      setFormLocation(location);
      setFormError(''); // Clear error on success
    }
  };
  // ▲▲▲ NEW FUNCTION TO HANDLE CREATING A CLASS ▲▲▲


  const qrUrl = activeSession 
    ? `${window.location.origin}/scan?qrCodeValue=${activeSession.qrCodeValue}` 
    : '';

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* COLUMN 1: CREATE CLASS & START SESSION */}
      <div className="lg:col-span-1 space-y-8">
        
        {/* ▼▼▼ NEW "CREATE CLASS" FORM CARD ▼▼▼ */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Create New Class</h2>
          {formError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{formError}</div>}
          <form onSubmit={handleCreateClass} className="space-y-4">
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
            
            <div className="text-sm">
              <button
                type="button"
                onClick={handleGetLocation}
                className="w-full py-2 px-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Get Current Location for Geofence
              </button>
              {formLocation && (
                <p className="text-green-600 text-xs mt-2 text-center">✓ Location captured!</p>
              )}
              {geoError && (
                <p className="text-red-600 text-xs mt-2 text-center">✗ {geoError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {formLoading ? 'Creating...' : 'Create Class'}
            </button>
          </form>
        </div>
        {/* ▲▲▲ END "CREATE CLASS" FORM CARD ▲▲▲ */}

        {/* START SESSION CARD */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Start Session</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
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
  );
}

export default LecturerDashboard;