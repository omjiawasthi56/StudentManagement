import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://studentmanagement-1-zjez.onrender.com/api';

function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data.students);
      
      // Initialize attendance records
      const initialRecords = {};
      response.data.students.forEach(student => {
        initialRecords[student.id] = 'Present';
      });
      setAttendanceRecords(initialRecords);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [studentId]: status
    });
  };

  const submitAttendance = async () => {
    const records = Object.keys(attendanceRecords).map(studentId => ({
      student_id: parseInt(studentId),
      status: attendanceRecords[studentId]
    }));

    try {
      setLoading(true);
      await axios.post(`${API_URL}/attendance`, {
        date: attendanceDate,
        records: records
      });
      alert('Attendance marked successfully!');
    } catch (error) {
      alert('Error marking attendance: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendanceRecords).filter(status => status === 'Present').length;
    const absent = Object.values(attendanceRecords).filter(status => status === 'Absent').length;
    const leave = Object.values(attendanceRecords).filter(status => status === 'Leave').length;
    
    return { total, present, absent, leave };
  };

  const stats = getAttendanceStats();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-calendar-check mr-3"></i>
            Daily Attendance
          </h2>
          <p className="text-gray-600">Mark attendance for {attendanceDate}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          
          <div className="flex space-x-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-sm">Present: {stats.present}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-sm">Absent: {stats.absent}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span className="text-sm">Leave: {stats.leave}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium">{student.roll_no}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-blue-600"></i>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(student.id, 'Present')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        attendanceRecords[student.id] === 'Present'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'Absent')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        attendanceRecords[student.id] === 'Absent'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'Leave')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        attendanceRecords[student.id] === 'Leave'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-800 hover:bg-yellow-50'
                      }`}
                    >
                      Leave
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-gray-600">
          <i className="fas fa-info-circle mr-2"></i>
          Click on status buttons to mark attendance
        </div>
        <button
          onClick={submitAttendance}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-300"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Save Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Attendance;
