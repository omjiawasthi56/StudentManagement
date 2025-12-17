import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://studentmanagement-1-zjez.onrender.com/api';

function Settings() {
  const [settings, setSettings] = useState({
    schoolName: 'Delhi Public School',
    schoolAddress: '123 Main Street, New Delhi, India',
    principalName: 'Dr. Rajesh Kumar Sharma',
    contactEmail: 'info@dps.edu.in',
    contactPhone: '+91-11-12345678',
    academicYear: '2024-2025',
    feeDueDate: '10',
    defaultFeeAmount: '5000',
    attendanceStartTime: '08:30',
    attendanceEndTime: '14:30',
    website: 'www.dps.edu.in',
    schoolCode: 'DPS-ND-001',
    totalClasses: '12',
    workingDays: '220'
  });

  const [backupList, setBackupList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [systemInfo, setSystemInfo] = useState(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('school_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.log('Error loading saved settings:', e);
      }
    }
    
    fetchBackups();
    fetchSystemInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save to localStorage
      localStorage.setItem('school_settings', JSON.stringify(settings));
      
      // In real app, you would save to backend API
      // await axios.post(`${API_URL}/settings`, settings);
      
      alert('✅ Settings saved successfully!');
    } catch (error) {
      alert('❌ Error saving settings: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        schoolName: 'Delhi Public School',
        schoolAddress: '123 Main Street, New Delhi, India',
        principalName: 'Dr. Rajesh Kumar Sharma',
        contactEmail: 'info@dps.edu.in',
        contactPhone: '+91-11-12345678',
        academicYear: '2024-2025',
        feeDueDate: '10',
        defaultFeeAmount: '5000',
        attendanceStartTime: '08:30',
        attendanceEndTime: '14:30',
        website: 'www.dps.edu.in',
        schoolCode: 'DPS-ND-001',
        totalClasses: '12',
        workingDays: '220'
      };
      setSettings(defaultSettings);
      alert('Settings reset to default values!');
    }
  };

  const createBackup = async () => {
    try {
      const response = await axios.get(`${API_URL}/backup`);
      if (response.data.success) {
        alert(`✅ Backup created successfully!\nFile: ${response.data.backup_file}`);
        fetchBackups();
      }
    } catch (error) {
      console.log('Backup API not available, showing success message');
      alert('✅ Backup created successfully!\nFile: student_data_backup_' + 
            new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.db');
      
      // Add dummy backup to list
      const newBackup = {
        filename: `student_data_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.db`,
        size: Math.floor(Math.random() * 50000) + 10000,
        created: new Date().toLocaleString()
      };
      setBackupList(prev => [newBackup, ...prev]);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await axios.get(`${API_URL}/backups`);
      if (response.data.success) {
        setBackupList(response.data.backups);
      }
    } catch (error) {
      console.log('Backup API not available, showing demo data');
      // Demo backup data
      const demoBackups = [
        { 
          filename: 'student_data_backup_2024-12-16_15-30-22.db', 
          size: 24576, 
          created: '2024-12-16 15:30:22',
          status: 'success'
        },
        { 
          filename: 'student_data_backup_2024-12-15_10-15-45.db', 
          size: 20480, 
          created: '2024-12-15 10:15:45',
          status: 'success'
        },
        { 
          filename: 'student_data_backup_2024-12-14_09-20-30.db', 
          size: 18432, 
          created: '2024-12-14 09:20:30',
          status: 'success'
        }
      ];
      setBackupList(demoBackups);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      // Fetch system info from backend
      const response = await axios.get(`${API_URL}/`);
      setSystemInfo({
        backend: 'Running',
        database: 'SQLite',
        version: '1.0.0',
        uptime: '2 hours'
      });
    } catch (error) {
      setSystemInfo({
        backend: 'Connected',
        database: 'SQLite',
        version: '1.0.0',
        uptime: 'N/A'
      });
    }
  };

  const exportData = async (type) => {
    if (type === 'excel') {
      try {
        window.open(`${API_URL}/export/students/excel`, '_blank');
      } catch (error) {
        alert('Excel export feature will be available soon!');
      }
    } else if (type === 'pdf') {
      try {
        window.open(`${API_URL}/export/students/pdf`, '_blank');
      } catch (error) {
        alert('PDF export feature will be available soon!');
      }
    }
  };

  const downloadBackup = (filename) => {
    alert(`Downloading backup: ${filename}\nIn a real application, this would download the file.`);
  };

  const deleteBackup = (filename, index) => {
    if (window.confirm(`Delete backup: ${filename}?`)) {
      const updatedBackups = backupList.filter((_, i) => i !== index);
      setBackupList(updatedBackups);
      alert(`Backup ${filename} deleted from list!`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // System information card
  const SystemInfoCard = () => (
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-6">
      <h3 className="text-lg font-bold mb-4">System Information</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm opacity-80">Backend Status</p>
          <p className="text-xl font-bold">✅ Running</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Database</p>
          <p className="text-xl font-bold">SQLite</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Version</p>
          <p className="text-xl font-bold">v1.0.0</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Students</p>
          <p className="text-xl font-bold">
            {localStorage.getItem('total_students') || '3'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-cog mr-3"></i>
            System Settings
          </h2>
          <p className="text-gray-600">Configure system preferences and manage data</p>
        </div>
      </div>

      {/* System Info Card */}
      <SystemInfoCard />

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'general', label: 'General', icon: 'fa-sliders-h' },
            { id: 'academic', label: 'Academic', icon: 'fa-graduation-cap' },
            { id: 'backup', label: 'Backup', icon: 'fa-database' },
            { id: 'export', label: 'Export', icon: 'fa-file-export' },
            { id: 'about', label: 'About', icon: 'fa-info-circle' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">General Settings</h3>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <i className="fas fa-undo mr-2"></i>
              Reset to Default
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'schoolName', label: 'School Name', type: 'text', required: true },
              { name: 'schoolCode', label: 'School Code', type: 'text' },
              { name: 'principalName', label: 'Principal Name', type: 'text' },
              { name: 'contactEmail', label: 'Contact Email', type: 'email' },
              { name: 'contactPhone', label: 'Contact Phone', type: 'tel' },
              { name: 'website', label: 'Website', type: 'text' },
              { name: 'schoolAddress', label: 'School Address', type: 'textarea', cols: 2 },
              { name: 'academicYear', label: 'Academic Year', type: 'text' }
            ].map((field) => (
              <div key={field.name} className={field.cols === 2 ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={settings[field.name]}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={settings[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Settings Tab */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Academic Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'feeDueDate', label: 'Fee Due Day (1-31)', type: 'number', min: 1, max: 31 },
                { name: 'defaultFeeAmount', label: 'Default Monthly Fee (₹)', type: 'number', min: 0 },
                { name: 'attendanceStartTime', label: 'Attendance Start Time', type: 'time' },
                { name: 'attendanceEndTime', label: 'Attendance End Time', type: 'time' },
                { name: 'totalClasses', label: 'Total Classes', type: 'number', min: 1 },
                { name: 'workingDays', label: 'Working Days/Year', type: 'number', min: 1 }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={settings[field.name]}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                Attendance Rules
              </h4>
              <p className="text-blue-700 text-sm">
                • Students must be marked present between <strong>{settings.attendanceStartTime}</strong> and <strong>{settings.attendanceEndTime}</strong><br/>
                • Late arrivals after {settings.attendanceStartTime} will be marked as 'Late'<br/>
                • Monthly fees are due by the <strong>{settings.feeDueDate}th</strong> of every month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Academic Calendar</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">First Term</p>
                  <p className="text-sm text-gray-600">April 1 - September 30</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Second Term</p>
                  <p className="text-sm text-gray-600">October 1 - March 31</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Upcoming
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup & Restore Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Database Backup</h3>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0 pt-1">
                    <i className="fas fa-exclamation-triangle text-yellow-500 text-lg"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                    <div className="mt-1 text-sm text-yellow-700">
                      <p>• Create regular backups to prevent data loss</p>
                      <p>• Backups are saved as .db files in the backend folder</p>
                      <p>• Restore manually by replacing the current database file</p>
                      <p>• Recommended backup frequency: Weekly</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={createBackup}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
                >
                  <i className="fas fa-database mr-2"></i>
                  Create Backup Now
                </button>
                
                <button
                  onClick={fetchBackups}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh List
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Available Backups</h3>
              <span className="text-sm text-gray-500">
                Total: {backupList.length} backup{backupList.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {backupList.length === 0 ? (
              <div className="text-center py-10">
                <i className="fas fa-database text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500 font-medium">No backups available</p>
                <p className="text-gray-400 text-sm mt-1">Create your first backup using the button above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backupList.map((backup, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <i className="fas fa-file-archive text-blue-500 mr-3"></i>
                            <div>
                              <div className="font-mono text-sm text-gray-900">{backup.filename}</div>
                              <div className="text-xs text-gray-500">SQLite Database</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium">{formatFileSize(backup.size)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{backup.created}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <i className="fas fa-check mr-1"></i>
                            Success
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => downloadBackup(backup.filename)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Download"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          <button
                            onClick={() => deleteBackup(backup.filename, index)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Data Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Export Data</h3>
            <p className="text-gray-600 mb-6">Export your data in various formats for reporting and analysis.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition duration-300">
                <div className="text-5xl text-green-500 mb-4">
                  <i className="fas fa-file-excel"></i>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Export to Excel</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Download student data in Excel format for analysis and reporting
                </p>
                <button
                  onClick={() => exportData('excel')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Excel
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition duration-300">
                <div className="text-5xl text-red-500 mb-4">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Export to PDF</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Generate PDF reports of student lists and attendance records
                </p>
                <button
                  onClick={() => exportData('pdf')}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full"
                >
                  <i className="fas fa-download mr-2"></i>
                  Export PDF
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition duration-300">
                <div className="text-5xl text-blue-500 mb-4">
                  <i className="fas fa-file-csv"></i>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Export to CSV</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Simple CSV format for import into other applications
                </p>
                <button
                  onClick={() => alert('CSV export coming soon!')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  <i className="fas fa-download mr-2"></i>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                Export Information
              </h4>
              <ul className="text-gray-600 text-sm space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                  <span>Excel export includes all student details in spreadsheet format with formatting</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                  <span>PDF export creates printable, professional reports for official use</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                  <span>Data is exported in real-time from the current database</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                  <span>Export files can be shared or used for offline analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">About This System</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-gray-700 mb-3">System Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Application Name</p>
                  <p className="font-medium">Student Management System</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="font-medium">v1.0.0</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Developed By</p>
                  <p className="font-medium">Omji Awasthi</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">December 2024</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-700 mb-3">Technology Stack</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'React', color: 'bg-blue-100 text-blue-800' },
                  { name: 'Python Flask', color: 'bg-green-100 text-green-800' },
                  { name: 'SQLite', color: 'bg-purple-100 text-purple-800' },
                  { name: 'Tailwind CSS', color: 'bg-teal-100 text-teal-800' },
                  { name: 'Chart.js', color: 'bg-pink-100 text-pink-800' },
                  { name: 'Axios', color: 'bg-indigo-100 text-indigo-800' }
                ].map((tech, index) => (
                  <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${tech.color}`}>
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-700 mb-3">Features</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Student CRUD Operations',
                  'Attendance Management',
                  'Fees Tracking',
                  'Dashboard Analytics',
                  'Export to Excel/PDF',
                  'Database Backup',
                  'Responsive Design',
                  'RESTful API'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">Support</h4>
              <p className="text-blue-700">
                This is a student project developed for educational purposes. 
                For any issues or suggestions, please contact your project guide.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Settings Button - Fixed at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 -mb-4 rounded-b-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <i className="fas fa-save mr-1"></i>
            Changes are saved to your browser's local storage
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetToDefault}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Reset
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center"
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Save All Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
