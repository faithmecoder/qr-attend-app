import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [id, setId] = useState(''); // studentId or lecturerId
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const userData = {
      name,
      email,
      password,
      ...(role === 'student' ? { studentId: id } : { lecturerId: id })
    };

    try {
      const newUserData = await register(userData, role);
      if (newUserData.role === 'lecturer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Register as:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">{role === 'student' ? 'Student ID' : 'Lecturer ID'}</label>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;