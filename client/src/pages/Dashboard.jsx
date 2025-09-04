import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import ExportButton from '../components/ExportButton';
import IncomeVsExpensesBar from '../components/IncomeVsExpensesBar';
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
import { CurrencyDollarIcon, CalendarIcon, ArrowTrendingUpIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatINR, formatINRCompact } from '../utils/currency';

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

// Mock data for dashboard - ONLY FOR GUEST USERS
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
    currency: 'INR'
  },
  { 
    _id: '2', 
    title: 'Uber ride', 
    amount: 24.50, 
    category: 'Transportation', 
    date: '2023-05-06T08:15:00Z',
    currency: 'INR'
  },
  { 
    _id: '3', 
    title: 'Movie tickets', 
    amount: 35.00, 
    category: 'Entertainment', 
    date: '2023-05-05T19:45:00Z',
    currency: 'INR'
  },
  { 
    _id: '4', 
    title: 'Electric bill', 
    amount: 125.75, 
    category: 'Utilities', 
    date: '2023-05-04T10:00:00Z',
    currency: 'INR'
  },
  { 
    _id: '5', 
    title: 'New shoes', 
    amount: 79.99, 
    category: 'Shopping', 
    date: '2023-05-03T16:20:00Z',
    currency: 'INR'
  }
];

const MOCK_INCOMES = [
  { 
    _id: '1', 
    title: 'Monthly Salary', 
    amount: 5000.00, 
    category: 'Salary', 
    date: '2023-05-01T09:00:00Z',
    currency: 'INR'
  },
  { 
    _id: '2', 
    title: 'Freelance Project', 
    amount: 1200.00, 
    category: 'Freelance', 
    date: '2023-05-15T16:30:00Z',
    currency: 'INR'
  },
  { 
    _id: '3', 
    title: 'Stock Dividend', 
    amount: 350.25, 
    category: 'Investment', 
    date: '2023-05-10T14:00:00Z',
    currency: 'INR'
  }
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    avgDailyExpense: 0,
    totalCategories: 0,
    categoryStats: [],
    timelineStats: []
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  const { user, isAuthenticated, isGuestUser } = useAuth();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        // Get the date range for filtering data
        const startDate = getStartDateFromRange(dateRange);
        
        // Check if user is guest user
        if (isAuthenticated && isGuestUser()) {
          // Use mock data for guest users
          setStats(MOCK_STATS);
          setRecentExpenses(MOCK_EXPENSES);
          setExpenseData(MOCK_EXPENSES);
          setIncomeData(MOCK_INCOMES);
        } 
        else if (isAuthenticated) {
          // Fetch real data for authenticated users
          try {
            // Fetch expenses data (remove date filtering for now to show all data)
            const expenseResponse = await api.get('/expenses', {
              params: {
                limit: 100 // Get enough for statistics
              }
            });
            
            // Fetch income data (remove date filtering for now to show all data)
            const incomeResponse = await api.get('/incomes', {
              params: {
                limit: 100
              }
            });
            
            // Get the data from the responses
            const expenses = expenseResponse.data.data || [];
            setExpenseData(expenses);
            
            const incomes = incomeResponse.data.data || [];
            setIncomeData(incomes);
            
            // Debug logging to see what data we're getting
            console.log('Dashboard - Income data loaded:', incomes.length, 'entries');
            console.log('Dashboard - Expense data loaded:', expenses.length, 'entries');
            console.log('Dashboard - First income entry:', incomes[0]);
            console.log('Dashboard - First expense entry:', expenses[0]);
            
            // Get recent expenses (limited to 5)
            const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentExpenses(sortedExpenses.slice(0, 5));
            
            // Calculate statistics if there are expenses
            if (expenses.length > 0) {
              // Calculate total expenses
              const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
              
              // Calculate average daily expense
              const uniqueDates = new Set(expenses.map(exp => new Date(exp.date).toDateString()));
              const avgDailyExpense = totalExpenses / Math.max(uniqueDates.size, 1);
              
              // Group expenses by category
              const categoryMap = {};
              expenses.forEach(expense => {
                if (!categoryMap[expense.category]) {
                  categoryMap[expense.category] = 0;
                }
                categoryMap[expense.category] += expense.amount;
              });
              
              // Sort categories by amount
              const categoryStats = Object.keys(categoryMap)
                .map(category => ({
                  _id: category,
                  totalAmount: categoryMap[category]
                }))
                .sort((a, b) => b.totalAmount - a.totalAmount);
              
              // Group expenses by date
              const timelineMap = {};
              expenses.forEach(expense => {
                const dateStr = new Date(expense.date).toISOString().split('T')[0];
                if (!timelineMap[dateStr]) {
                  timelineMap[dateStr] = 0;
                }
                timelineMap[dateStr] += expense.amount;
              });
              
              // Create timeline statistics
              const timelineStats = Object.keys(timelineMap)
                .map(date => ({
                  _id: date,
                  totalAmount: timelineMap[date]
                }))
                .sort((a, b) => new Date(a._id) - new Date(b._id));
              
              // Update stats
              setStats({
                totalExpenses,
                avgDailyExpense,
                totalCategories: categoryStats.length,
                categoryStats,
                timelineStats
              });
            } else {
              // No expenses, set empty stats
              setStats({
                totalExpenses: 0,
                avgDailyExpense: 0,
                totalCategories: 0,
                categoryStats: [],
                timelineStats: []
              });
            }
          } catch (apiError) {
            console.error('API error:', apiError);
            toast.error('Failed to fetch dashboard data');
            
            // Set empty stats on error
            setStats({
              totalExpenses: 0,
              avgDailyExpense: 0,
              totalCategories: 0,
              categoryStats: [],
              timelineStats: []
            });
            setRecentExpenses([]);
          }
        }
        else {
          // Not authenticated, show empty state
          setStats({
            totalExpenses: 0,
            avgDailyExpense: 0,
            totalCategories: 0,
            categoryStats: [],
            timelineStats: []
          });
          setRecentExpenses([]);
          setExpenseData([]);
          setIncomeData([]);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data.');
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, isAuthenticated, user]);

  // Helper to get start date based on selected range
  const getStartDateFromRange = (range) => {
    const now = new Date();
    if (range === 'week') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sevenDaysAgo.toISOString();
    } else if (range === 'month') {
      // Get data from 30 days ago OR from 30 days in the future to handle future-dated entries
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return thirtyDaysAgo.toISOString();
    } else if (range === 'year') {
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return oneYearAgo.toISOString();
    }
    return null; // Return null for no date filtering
  };

  // Format the chart data
  const preparePieChartData = () => {
    // Check for missing or empty data
    if (!stats || !stats.categoryStats || !Array.isArray(stats.categoryStats) || stats.categoryStats.length === 0) {
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
    // Check for missing or empty data
    if (!stats || !stats.timelineStats || !Array.isArray(stats.timelineStats) || stats.timelineStats.length === 0) {
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
            return `${context.label}: ${formatINR(value)} (${percentage}%)`;
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
            return formatINR(value);
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
            return formatINR(context.raw);
          }
        }
      }
    }
  };

  // Handler for date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Empty State Component - Shows a friendly "No data yet" message
  const EmptyState = ({ message = 'No data yet', callToAction = true }) => (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg text-center h-full">
      <div className="text-gray-400 mb-4">
        <CurrencyDollarIcon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4">Start tracking your finances to see insights here</p>
      {callToAction && (
        <Link 
          to="/expenses"
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
        >
          Add Your First Expense
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#D4AF37]"></div>
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
            {isAuthenticated && !isGuestUser() 
              ? "Overview of your financial activity for the selected period"
              : "Welcome to your financial dashboard. Log in to track your expenses."}
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
            <ExportButton 
              data={expenseData} 
              stats={stats}
              recentExpenses={recentExpenses}
              filters={{
                startDate: getStartDateFromRange(dateRange),
                endDate: new Date().toISOString(),
                category: 'All'
              }}
              filename="dashboard-expense-report" 
              className="bg-white text-[#2E8B57] border border-gray-200 hover:bg-gray-50 font-medium rounded-lg px-4 py-2" 
            />
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Expenses"
          value={formatINR(stats.totalExpenses)}
          subtitle={`${stats.categoryStats.length > 0 
            ? `Across ${stats.categoryStats.length} categories` 
            : 'No expenses recorded'}`}
          icon={CurrencyDollarIcon}
          color="primary"
        />
        <StatCard
          title="Average Daily"
          value={formatINR(stats.avgDailyExpense)}
          subtitle={stats.avgDailyExpense > 0 ? "Per day average spending" : "No daily average yet"}
          icon={CalendarIcon}
          color="secondary"
        />
        <StatCard
          title="Top Category"
          value={stats.categoryStats && stats.categoryStats.length > 0 ? stats.categoryStats[0]._id : 'None'}
          subtitle={stats.categoryStats && stats.categoryStats.length > 0 
            ? formatINR(stats.categoryStats[0].totalAmount)
            : 'No category data yet'}
          icon={ArrowTrendingUpIcon}
          color="tertiary"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart - Category Breakdown */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Expense Breakdown</h2>
            <span className="text-sm text-[#A0A0A0]">By Category</span>
          </div>
          
          {(!stats || !stats.categoryStats || stats.categoryStats.length === 0) ? (
            <EmptyState 
              message="No expense data to visualize" 
              callToAction={true} 
            />
          ) : (
            <div className="h-80">
              <Pie data={preparePieChartData()} options={pieChartOptions} />
            </div>
          )}
        </div>

        {/* Line Chart - Timeline */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Spending Timeline</h2>
            <span className="text-sm text-[#A0A0A0]">
              {dateRange === 'week' ? 'Last 7 days' : 
               dateRange === 'month' ? 'Last 30 days' : 
               'Last 12 months'}
            </span>
          </div>
          
          {(!stats || !stats.timelineStats || stats.timelineStats.length === 0) ? (
            <EmptyState 
              message="No timeline data to show" 
              callToAction={true} 
            />
          ) : (
            <div className="h-80">
              <Line data={prepareLineChartData()} options={lineChartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Income vs Expenses - Replacing Budget Utilization */}
      <div className="mb-8">
        <div className="card p-6">
          <IncomeVsExpensesBar 
            incomeData={incomeData || []}
            expenseData={expenseData || []}
            loading={loading}
            className="w-full"
          />
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
          <Link 
            to="/expenses" 
            className="text-[#D4AF37] hover:text-[#C39E2D] font-medium text-sm"
          >
            View All
          </Link>
        </div>
        
        {(!recentExpenses || recentExpenses.length === 0) ? (
          <EmptyState 
            message="No recent expenses to show" 
            callToAction={true} 
          />
        ) : (
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-4 bg-[#F4F1EB] rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center mr-4">
                    <CurrencyDollarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{expense.title}</h4>
                    <p className="text-sm text-[#A0A0A0]">
                      {expense.category} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-[#2E8B57]">
                  {formatINR(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;