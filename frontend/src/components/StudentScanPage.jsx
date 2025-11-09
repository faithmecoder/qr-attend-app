import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useGeolocation from '../hooks/useGeolocation';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // ◄◄◄ IMPORT useAuth

function StudentScanPage() {
  const [searchParams] = useSearchParams();
  const qrCodeValue = searchParams.get('qrCodeValue');
  
  // const [studentId, setStudentId] = useState(''); // ◄◄◄ REMOVE THIS
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  
  const { location, error: geoError } = useGeolocation();
  const { user } = useAuth(); // ◄◄◄ GET LOGGED IN USER

  useEffect(() => {
    if (geoError) {
      setStatus('error');
      setMessage(`Geolocation Error: ${geoError}. Please enable location services.`);
    }
  }, [geoError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!qrCodeValue) {
      setStatus('error');
      setMessage('Invalid or missing session code. Please scan the QR code again.');
      return;
    }
    
    if (!location) {
      setStatus('error');
      setMessage('Getting your location... Please wait and ensure location is enabled.');
      return;
    }

    setStatus('loading');
    setMessage('Submitting attendance...');
    
    try {
      // ▼▼▼ 'studentId' is NO LONGER SENT in the body ▼▼▼
      const { data } = await api.post('/api/student/attendance/mark', {
        qrCodeValue,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'An error occurred.');
    }
  };

  const getMessageColor = () => {
    if (status === 'success') return 'bg-green-100 text-green-800';
    if (status === 'error') return 'bg-red-100 text-red-800';
    if (status === 'loading') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Mark Attendance</h2>
      <p className="text-center text-gray-700 mb-6">
        Logged in as: <span className="font-medium">{user.name}</span>
      </p>
      
      {!qrCodeValue && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          Error: No session code found. Please scan the QR code again.
        </div>
      )}
      
      {message && (
        <div className={`p-4 rounded mb-4 text-center ${getMessageColor()}`}>
          {message}
        </div>
      )}

      {status !== 'success' && qrCodeValue && (
        <form onSubmit={handleSubmit}>
          {/* ▼▼▼ STUDENT ID INPUT IS REMOVED ▼▼▼ */}
          
          <div className="mb-6 text-sm text-gray-600">
            {location ? (
              <p className="text-green-600">✓ Location captured.</p>
            ) : geoError ? (
              <p className="text-red-600">✗ Location permission denied. You must allow location access.</p>
            ) : (
              <p className="text-blue-600">... Requesting location permission...</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-400"
            // ▼▼▼ 'studentId' check is REMOVED from disabled logic ▼▼▼
            disabled={status === 'loading' || !location}
          >
            {status === 'loading' ? 'Submitting...' : 'Mark Me Present'}
          </button>
        </form>
      )}
    </div>
  );
}

export default StudentScanPage;