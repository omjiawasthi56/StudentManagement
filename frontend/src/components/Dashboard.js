import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const API_URL = 'https://studentmanagement-1-zjez.onrender.com/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    classes: [],
    classDistribution: {}
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      const students = response.data.students;
      
      // Calculate class distribution
      const classDist = {};
      students.forEach(student => {
        classDist[student.class] = (classDist[student.class] || 0) + 1;
      });
      
      setStats({
        totalStudents: students.length,
        classes: Object.keys(classDist),
        classDistribution: classDist
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Bar Chart Data - Class Distribution
  const barChartData = {
    labels: Object.keys(stats.classDistribution),
    datasets: [
      {
        label: 'Number of Students',
        data: Object.values(stats.classDistribution),
        backgroundColor: [
          '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
          '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
        ],
        borderColor: [
          '#2563EB', '#059669', '#7C3AED', '#D97706', '#DC2626',
          '#DB2777', '#0D9488', '#EA580C', '#4F46E5', '#65A30D'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Pie Chart Data - Simplified
  const pieChartData = {
    labels: ['Science', 'Commerce', 'Arts'],
    datasets: [
      {
        data: [40, 35, 25], // Sample data
        backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6'],
        hoverBackgroundColor: ['#2563EB', '#059669', '#7C3AED'],
      },
    ],
  };

  // Line Chart Data - Monthly Admission Trend
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Admissions',
        data: [12, 19, 8, 15, 10, 22],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Statistics',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="opacity-80">Total Students</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalStudents}</h3>
            </div>
            <div className="text-3xl">
              <i className="fas fa-users"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="opacity-80">Classes</p>
              <h3 className="text-3xl font-bold mt-2">{stats.classes.length}</h3>
            </div>
            <div className="text-3xl">
              <i className="fas fa-chalkboard"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="opacity-80">Attendance %</p>
              <h3 className="text-3xl font-bold mt-2">92.5%</h3>
            </div>
            <div className="text-3xl">
              <i className="fas fa-calendar-check"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="opacity-80">Fees Collected</p>
              <h3 className="text-3xl font-bold mt-2">₹1,85,000</h3>
            </div>
            <div className="text-3xl">
              <i className="fas fa-rupee-sign"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            <i className="fas fa-chart-bar mr-2"></i>
            Class-wise Student Distribution
          </h3>
          <div className="h-80">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Stream Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            <i className="fas fa-chart-pie mr-2"></i>
            Stream-wise Distribution
          </h3>
          <div className="h-80">
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>

        {/* Admission Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            <i className="fas fa-chart-line mr-2"></i>
            Monthly Admission Trend
          </h3>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          <i className="fas fa-history mr-2"></i>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { icon: 'fa-user-plus', text: 'New student "Aarav Sharma" added', time: '2 hours ago' },
            { icon: 'fa-calendar-check', text: 'Attendance marked for Class 12', time: '4 hours ago' },
            { icon: 'fa-rupee-sign', text: 'Fees received from Priya Patel', time: '1 day ago' },
            { icon: 'fa-edit', text: 'Student details updated - Rohan Singh', time: '2 days ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <i className={`fas ${activity.icon} text-blue-600`}></i>
              </div>
              <div className="flex-grow">
                <p className="text-gray-800">{activity.text}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
