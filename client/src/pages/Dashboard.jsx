import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import ExportButton from '../components/ExportButton';
import CurrencyReport from '../components/CurrencyReport';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { CurrencyDollarIcon, CalendarIcon, ArrowTrendingUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock data for dashboard
const MOCK_STATS = {
  totalExpenses: 2450.75,
  avgDailyExpense: 81.69,
  totalCategories: 5,
  categoryStats: [
    { _id: 'Food', totalAmount: 850.25 },
    { _id: 'Transportation', totalAmount: 425.50 },
    { _id: 'Entertainment', totalAmount: 350.00 },
    { _id: 'Utilities', totalAmount: 525.00 },
    { _id: 'Shopping', totalAmount: 300.00 }
  ],
  timelineStats: [
    { _id: '2023-05-01', totalAmount: 95.50 },
    { _id: '2023-05-02', totalAmount: 120.25 },
    { _id: '2023-05-03', totalAmount: 75.00 },
    { _id: '2023-05-04', totalAmount: 110.00 },
    { _id: '2023-05-05', totalAmount: 85.75 },
    { _id: '2023-05-06', totalAmount: 130.50 },
    { _id: '2023-05-07', totalAmount: 65.25 }
  ]
};

const MOCK_EXPENSES = [
  { 
    _id: '1', 
    title: 'Grocery shopping', 
    amount: 85.95, 
    category: 'Food', 
    date: '2023-05-07T14:30:00Z',
    currency: 'USD'
  },
  { 
    _id: '2', 
    title: 'Uber ride', 
    amount: 24.50, 
    category: 'Transportation', 
    date: '2023-05-06T08:15:00Z',
    currency: 'USD'
  },
  { 
    _id: '3', 
    title: 'Movie tickets', 
    amount: 35.00, 
    category: 'Entertainment', 
    date: '2023-05-05T19:45:00Z',
    currency: 'USD'
  },
  { 
    _id: '4', 
    title: 'Electric bill', 
    amount: 125.75, 
    category: 'Utilities', 
    date: '2023-05-04T10:00:00Z',
    currency: 'USD'
  },
  { 
    _id: '5', 
    title: 'New shoes', 
    amount: 79.99, 
    category: 'Shopping', 
    date: '2023-05-03T16:20:00Z',
    currency: 'USD'
  }
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  const [showCurrencyReport, setShowCurrencyReport] = useState(false);

  // Load mock data
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true);
      try {
        // Simulate API delay
        setTimeout(() => {
          setStats(MOCK_STATS);
          setRecentExpenses(MOCK_EXPENSES);
          setExpenseData(MOCK_EXPENSES);
          setIncomeData([]);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data.');
        console.error('Dashboard data error:', err);
        setLoading(false);
      }
    };

    loadMockData();
  }, [dateRange]);

  // Helper to get start date based on selected range
  const getStartDateFromRange = (range) => {
    const now = new Date();
    if (range === 'week') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sevenDaysAgo.toISOString();
    } else if (range === 'month') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return thirtyDaysAgo.toISOString();
    } else if (range === 'year') {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return oneYearAgo.toISOString();
    }
  };

  // Format the chart data
  const preparePieChartData = () => {
    if (!stats || !stats.categoryStats || stats.categoryStats.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#F4F1EB'],
            borderWidth: 0,
          },
        ],
      };
    }

    return {
      labels: stats.categoryStats.map(cat => cat._id),
      datasets: [
        {
          data: stats.categoryStats.map(cat => cat.totalAmount),
          backgroundColor: [
            '#D4AF37', // Champagne Gold
            '#2E8B57', // Emerald Green
            '#8D7B8E', // Muted Mauve
            '#1C2541', // Royal Navy
            '#A0A0A0', // Pewter Gray
            '#C39E2D', // Darker Gold
            '#207346', // Darker Green
            '#755F77', // Darker Mauve
            '#0F142B', // Darker Navy
            '#878787', // Darker Gray
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  const prepareLineChartData = () => {
    if (!stats || !stats.timelineStats || stats.timelineStats.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Expenses',
            data: [0],
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }

    return {
      labels: stats.timelineStats.map(item => format(new Date(item._id), 'MMM dd')),
      datasets: [
        {
          label: 'Expenses',
          data: stats.timelineStats.map(item => item.totalAmount),
          borderColor: '#D4AF37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          boxWidth: 10,
          color: '#A0A0A0',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#A0A0A0'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(244, 241, 235, 0.5)',
        },
        ticks: {
          color: '#A0A0A0',
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    }
  };

  // Handler for date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="card p-6 h-full">
      <div className="flex items-start">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-[#D4AF37]`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-[#2E8B57]">{value}</p>
          {subtitle && <p className="text-sm text-[#A0A0A0] mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-[#A0A0A0]">
            Overview of your financial activity for the selected period
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => handleDateRangeChange('week')}
              className={`${
                dateRange === 'week'
                  ? 'bg-[#F4F1EB] text-[#2E8B57] font-medium'
                  : 'bg-white text-[#A0A0A0]'
              } px-4 py-2 text-sm rounded-l-md border border-[#F4F1EB] focus:z-10 focus:ring-1 focus:ring-[#D4AF37] transition-colors duration-200`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => handleDateRangeChange('month')}
              className={`${
                dateRange === 'month'
                  ? 'bg-[#F4F1EB] text-[#2E8B57] font-medium'
                  : 'bg-white text-[#A0A0A0]'
              } px-4 py-2 text-sm border-t border-b border-[#F4F1EB] focus:z-10 focus:ring-1 focus:ring-[#D4AF37] transition-colors duration-200`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => handleDateRangeChange('year')}
              className={`${
                dateRange === 'year'
                  ? 'bg-[#F4F1EB] text-[#2E8B57] font-medium'
                  : 'bg-white text-[#A0A0A0]'
              } px-4 py-2 text-sm rounded-r-md border border-[#F4F1EB] focus:z-10 focus:ring-1 focus:ring-[#D4AF37] transition-colors duration-200`}
            >
              Year
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowCurrencyReport(true)}
              className="btn-outline"
            >
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Currency Report
            </button>
            
            <ExportButton data={expenseData} filename="expenses-export" />
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Expenses"
          value={`$${stats.totalExpenses.toFixed(2)}`}
          subtitle={`Across ${stats.categoryStats.length} categories`}
          icon={CurrencyDollarIcon}
          color="primary"
        />
        <StatCard
          title="Average Daily"
          value={`$${stats.avgDailyExpense.toFixed(2)}`}
          subtitle="Per day average spending"
          icon={CalendarIcon}
          color="secondary"
        />
        <StatCard
          title="Top Category"
          value={stats.categoryStats[0]?._id || 'None'}
          subtitle={stats.categoryStats[0] ? `$${stats.categoryStats[0].totalAmount.toFixed(2)}` : ''}
          icon={ArrowTrendingUpIcon}
          color="accent"
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
          <div className="h-64">
            <Pie data={preparePieChartData()} options={pieChartOptions} />
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Over Time</h3>
          <div className="h-64">
            <Line data={prepareLineChartData()} options={lineChartOptions} />
          </div>
        </div>
      </div>
      
      {/* Recent Expenses */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
          <Link to="/expenses" className="text-[#2E8B57] hover:text-[#207346] text-sm font-medium">
            View all
          </Link>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-[#F4F1EB]">
            <thead className="bg-[#F4F1EB] bg-opacity-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F4F1EB]">
              {recentExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-[#F8F6F0] transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0A0]">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0A0]">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-[#2E8B57]">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Currency Report Modal */}
      {showCurrencyReport && (
        <CurrencyReport onClose={() => setShowCurrencyReport(false)} />
      )}
    </motion.div>
  );
};

export default Dashboard; 