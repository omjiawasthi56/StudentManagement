import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fas fa-home' },
    { path: '/students', label: 'Students', icon: 'fas fa-users' },
    { path: '/attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
    { path: '/fees', label: 'Fees', icon: 'fas fa-rupee-sign' },
    { path: '/reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { path: '/settings', label: 'Settings', icon: 'fas fa-cog' },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-graduation-cap text-2xl text-blue-600"></i>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-800">EduManage</h1>
              <p className="text-xs text-gray-500">Student Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            ))}
          </div>
         
<div className="hidden md:flex items-center space-x-4">
  <div className="relative">
    <i className="fas fa-bell text-gray-600 text-xl cursor-pointer hover:text-blue-600"></i>
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      3
    </span>
  </div>
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
      OA
    </div>
    <div>
      <p className="font-medium text-gray-800">Omji Awasthi</p>
      <p className="text-sm text-gray-500">BCA Student | Admin</p>
    </div>
  </div>
</div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg mb-1 ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className={`${item.icon} mr-3`}></i>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

// Nav items array mein add karein:
const navItems = [
  { path: '/', label: 'Dashboard', icon: 'fas fa-home' },
  { path: '/students', label: 'Students', icon: 'fas fa-users' },
  { path: '/attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
  { path: '/fees', label: 'Fees', icon: 'fas fa-rupee-sign' },
  { path: '/reports', label: 'Reports', icon: 'fas fa-chart-bar' },
  { path: '/settings', label: 'Settings', icon: 'fas fa-cog' },
];
export default Navbar;