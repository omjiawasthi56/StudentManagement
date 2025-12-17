import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = 'https://studentmanagement-1-zjez.onrender.com/api';

function Fees() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeForm, setFeeForm] = useState({
    student_id: '',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    total_amount: '',
    paid_amount: '',
    due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStudents();
    fetchFees();
    fetchFeesStats();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchFees = async () => {
    try {
      const response = await axios.get(`${API_URL}/fees`);
      if (response.data.success) {
        setFees(response.data.fees);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fees:', error);
      setLoading(false);
    }
  };

  const fetchFeesStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/fees/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching fees stats:', error);
    }
  };

  const handleFeeFormChange = (e) => {
    setFeeForm({
      ...feeForm,
      [e.target.name]: e.target.value
    });
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    setSelectedStudent(student);
    setFeeForm({
      ...feeForm,
      student_id: studentId
    });
  };

  const submitFee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/fees`, feeForm);
      alert('Fees record saved successfully!');
      setShowFeeForm(false);
      setFeeForm({
        student_id: '',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        total_amount: '',
        paid_amount: '',
        due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
      });
      fetchFees();
      fetchFeesStats();
    } catch (error) {
      alert('Error saving fees: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteFee = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fees record?')) {
      try {
        await axios.delete(`${API_URL}/fees/${feeId}`);
        alert('Fees record deleted!');
        fetchFees();
        fetchFeesStats();
      } catch (error) {
        alert('Error deleting fee record');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-rupee-sign mr-3"></i>
            Fees Management
          </h2>
          <p className="text-gray-600">Manage student fees and payments</p>
        </div>
        <button
          onClick={() => setShowFeeForm(!showFeeForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          <i className="fas fa-plus mr-2"></i>
          {showFeeForm ? 'Cancel' : 'Add Fees Record'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="opacity-80">Total Fees</p>
                <h3 className="text-3xl font-bold mt-2">₹{stats.total_fees}</h3>
              </div>
              <div className="text-3xl">
                <i className="fas fa-money-bill-wave"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="opacity-80">Total Paid</p>
                <h3 className="text-3xl font-bold mt-2">₹{stats.total_paid}</h3>
              </div>
              <div className="text-3xl">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="opacity-80">Total Due</p>
                <h3 className="text-3xl font-bold mt-2">₹{stats.total_due}</h3>
              </div>
              <div className="text-3xl">
                <i className="fas fa-exclamation-circle"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="opacity-80">Collection Rate</p>
                <h3 className="text-3xl font-bold mt-2">{stats.collection_rate}%</h3>
              </div>
              <div className="text-3xl">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Fees Form */}
      {showFeeForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Add/Update Fees</h3>
          <form onSubmit={submitFee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student *
                </label>
                <select
                  name="student_id"
                  value={feeForm.student_id}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.roll_no} - {student.name} ({student.class})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <input
                  type="text"
                  name="month"
                  value={feeForm.month}
                  onChange={handleFeeFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., January 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (₹) *
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={feeForm.total_amount}
                  onChange={handleFeeFormChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Amount (₹)
                </label>
                <input
                  type="number"
                  name="paid_amount"
                  value={feeForm.paid_amount}
                  onChange={handleFeeFormChange}
                  step="0.01"
                  min="0"
                  max={feeForm.total_amount || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={feeForm.due_date}
                  onChange={handleFeeFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {selectedStudent && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700">
                  <i className="fas fa-info-circle mr-2"></i>
                  Selected Student: <strong>{selectedStudent.name}</strong> 
                  (Roll No: {selectedStudent.roll_no}, Class: {selectedStudent.class})
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowFeeForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <i className="fas fa-save mr-2"></i>
                Save Fees Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fees Records Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            <i className="fas fa-list mr-2"></i>
            Fees Records ({fees.length})
          </h3>
          <p className="text-gray-600 text-sm">All fees transactions and payments</p>
        </div>

        {fees.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-money-bill-slash text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-700">No Fees Records Found</h3>
            <p className="text-gray-500 mt-2">Add fees records using the "Add Fees Record" button</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fees.map((fee) => {
                  const student = students.find(s => s.id === fee.student_id);
                  return (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {student ? (
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              {student.roll_no} | {student.class}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Student not found</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{fee.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">₹{fee.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">₹{fee.paid_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">₹{fee.due_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{fee.due_date || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deleteFee(fee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Summary */}
      {stats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Fees Status Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.status_count?.paid || 0}</div>
              <div className="text-sm text-green-800">Fully Paid</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.status_count?.partial || 0}</div>
              <div className="text-sm text-yellow-800">Partially Paid</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.status_count?.pending || 0}</div>
              <div className="text-sm text-red-800">Pending Payment</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fees;
