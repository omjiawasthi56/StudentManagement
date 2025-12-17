import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import StudentList from './components/StudentList';
import Fees from './components/Fees';
import Settings from './components/Settings';

import './App.css';

// ✅ CORRECT: Sab imports ke baad, function se pehle
const API_URL = 'https://studentmanagement-1-zjez.onrender.com/api';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2024 Student Management System. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Built with React, Flask, and SQLite | BCA Project
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
