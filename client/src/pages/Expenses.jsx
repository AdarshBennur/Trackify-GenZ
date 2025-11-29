import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseTable from '../components/ExpenseTable';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import { motion } from 'framer-motion';
import { FunnelIcon, PlusIcon, XMarkIcon, ChartBarIcon, TagIcon, CalendarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import api from '../utils/apiClient';
import { hasLikelyToken } from '../utils/authGuard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { formatINR, formatINRCompact } from '../utils/currency';
import { protectedRequest } from '../utils/requestWithAuth';
import { hasValidAuth } from '../utils/authGuard';

const Expenses = () => {
  // Get auth state
  const { user, isAuthenticated } = useAuth();

  // State for expenses
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    avgDailyExpense: 0,
    totalCategories: 0,
    categoryStats: [],
    timelineStats: []
  });

  // Form handling
  const { reset } = useForm();

  // State for filters
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // StatCard component for expense stats
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

  // Available categories (should match with backend)
  const categories = [
    'All',
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Healthcare',
    'Insurance',
    'Personal',
    'Entertainment',
    'Education',
    'Savings',
    'Debt',
    'Other'
  ];

  // Calculate stats from expenses
  const calculateStats = () => {
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
    }
  };

  // Prepare line chart data
  const prepareLineChartData = () => {
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
          callback: function (value) {
            return '₹' + value;
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
          label: function (context) {
            return `₹${context.raw.toFixed(2)}`;
          }
        }
      }
    }
  };

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters, isAuthenticated, user]);

  // Calculate stats when expenses change
  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);

    try {
      // Only fetch if authenticated and has valid token
      if (!isAuthenticated || !hasLikelyToken()) {
        setLoading(false);
        return;
      }

      // Skip API call for guest users
      if (user && (user.role === 'guest' || user.email === 'guest@demo.com')) {
        setExpenses([]);
        setPagination({
          ...pagination,
          total: 0,
          pages: 1
        });
        setLoading(false);
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      if (filters.category && filters.category !== 'All') {
        params.append('category', filters.category);
      }

      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }

      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      if (filters.searchTerm) {
        params.append('search', filters.searchTerm);
      }

      // Make API request using protectedRequest
      const response = await protectedRequest({
        url: `/expenses?${params.toString()}`,
        method: 'GET'
      });

      // Update state with response data
      setExpenses(response.data.data || []);
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 1
      });
    } catch (err) {
      // Handle NO_TOKEN error silently
      if (err.code === 'NO_TOKEN') {
        console.log('No auth token - skipping expenses fetch');
        setLoading(false);
        return;
      }

      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again.');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // Add a new expense
  const handleAddExpense = async (expenseData) => {
    try {
      setLoading(true);

      // Validate expense data on the client-side
      if (!expenseData.title) {
        toast.error('Please provide a title for the expense');
        return;
      }

      if (!expenseData.amount || isNaN(parseFloat(expenseData.amount)) || parseFloat(expenseData.amount) <= 0) {
        toast.error('Please provide a valid amount greater than zero');
        return;
      }

      if (!expenseData.category) {
        toast.error('Please select a category for the expense');
        return;
      }

      if (!expenseData.date) {
        toast.error('Please select a date for the expense');
        return;
      }

      // Validate currency object
      if (!expenseData.currency || typeof expenseData.currency !== 'object') {
        toast.error('Invalid currency information. Please try again.');
        console.error('Currency issue:', expenseData.currency);
        return;
      }

      // Log the data we're about to send to the API
      console.log('Sending expense data to API:', expenseData);

      // Send POST request to API
      const response = await api.post('/expenses', expenseData);

      // Add new expense to state
      setExpenses([response.data.data, ...expenses]);

      toast.success('Expense added successfully!');
      setShowForm(false);
    } catch (err) {
      console.error('Error adding expense:', err);

      // Display specific error message from the server if available
      if (err.response && err.response.data) {
        // Log the entire error response for debugging
        console.error('Server error response:', err.response.data);

        if (err.response.data.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
          // If we have validation errors array, show them
          err.response.data.errors.forEach(errorMsg => {
            toast.error(errorMsg);
          });
        } else if (err.response.data.message) {
          // Show the main error message
          toast.error(err.response.data.message);
        } else if (err.response.data.error) {
          // Sometimes the error might be in a different field
          toast.error(err.response.data.error);
        } else {
          toast.error('Failed to add expense. Please try again.');
        }
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Failed to add expense. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit an expense
  const handleEditExpense = async (expenseData) => {
    try {
      setLoading(true);

      // Send PUT request to API
      const response = await api.put(`/expenses/${currentExpense._id}`, expenseData);

      // Update expense in state
      setExpenses(
        expenses.map((expense) =>
          expense._id === currentExpense._id ? response.data.data : expense
        )
      );

      toast.success('Expense updated successfully!');
      setIsEditing(false);
      setCurrentExpense(null);
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  // Delete an expense
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setLoading(true);

        // Send DELETE request to API
        await api.delete(`/expenses/${id}`);

        // Remove expense from state
        setExpenses(expenses.filter((expense) => expense._id !== id));

        toast.success('Expense deleted successfully!');
      } catch (err) {
        console.error('Error deleting expense:', err);
        toast.error('Failed to delete expense');
      } finally {
        setLoading(false);
      }
    }
  };

  // Set up expense for editing
  const handleSetupEdit = (expense) => {
    console.log('Setting up expense for editing:', expense);
    setCurrentExpense(expense);
    setIsEditing(true);
    setShowForm(true); // Show the form when editing
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
  };

  // Information banner for guest users
  const GuestBanner = () => {
    if (user && (user.role === 'guest' || user.email === 'guest@demo.com')) {
      return (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                You're viewing demo data as a guest user. Changes won't be permanently saved.
              </p>
              <p className="mt-3 text-sm md:mt-0 md:ml-6">
                <Link to="/signup" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                  Sign up for full access
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render expense content based on data
  const renderExpenseContent = () => {
    // If loading, show skeleton loader
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      );
    }

    // If error, show error message
    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading expenses</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={fetchExpenses}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no expenses and not guest user, show empty state
    if (expenses.length === 0 && (!user || (user.role !== 'guest' && user.email !== 'guest@demo.com'))) {
      return <EmptyState type="Expense" onAddNew={() => setShowForm(true)} />;
    }

    // Otherwise, show expense table
    return (
      <>
        <ExpenseTable
          expenses={expenses}
          onEdit={handleSetupEdit}
          onDelete={handleDeleteExpense}
        />

        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {expenses.length} of {pagination.total} expenses
            </div>
            <nav className="flex items-center">
              <button
                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
                className={`mx-1 px-3 py-1 rounded ${pagination.page === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:bg-green-50'
                  }`}
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPagination({ ...pagination, page: i + 1 })}
                  className={`mx-1 px-3 py-1 rounded ${pagination.page === i + 1
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                disabled={pagination.page === pagination.pages}
                className={`mx-1 px-3 py-1 rounded ${pagination.page === pagination.pages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:bg-green-50'
                  }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </>
    );
  };

  const onSubmit = (data) => {
    setSubmitting(true);

    // Create new expense object with the string ID format
    const newExpense = {
      ...data,
      amount: parseFloat(data.amount),
      date: data.date.toISOString()
    };

    // If editing, maintain the existing ID
    if (isEditing && currentExpense._id) {
      newExpense._id = currentExpense._id;
    } else {
      // Generate a new string ID for new expenses
      newExpense._id = `exp_${Date.now()}`;
    }

    try {
      if (isEditing) {
        // Update existing expense
        handleEditExpense(newExpense);
      } else {
        // Add new expense
        handleAddExpense(newExpense);
      }

      // Close form and reset
      setShowForm(false);
      setIsEditing(false);
      setCurrentExpense(null);
      reset();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <GuestBanner />

      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Manage and track your expenses
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white text-[#2E8B57] border border-gray-200 hover:bg-gray-50 font-medium rounded-lg px-4 py-2 flex items-center text-sm"
          >
            {showFilters ? (
              <>
                <XMarkIcon className="h-4 w-4 mr-1" />
                Hide Filters
              </>
            ) : (
              <>
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filter
              </>
            )}
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg font-medium rounded-lg px-6 py-2.5 flex items-center transition-all duration-300"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Expense
          </button>

          <ExportButton
            data={expenses}
            filters={filters}
            filename="expenses-report"
            className="bg-white text-[#2E8B57] border border-gray-200 hover:bg-gray-50 font-medium rounded-lg px-4 py-2"
          />
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
            : 'No categories yet'}
          icon={ArrowTrendingUpIcon}
          color="accent"
        />
      </div>

      {/* Chart - Expenses Over Time */}
      <div className="mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expenses Over Time</h3>
          <div className="h-64">
            {stats && stats.timelineStats && Array.isArray(stats.timelineStats) && stats.timelineStats.length > 0 ? (
              <Line data={prepareLineChartData()} options={lineChartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 rounded-lg text-center h-full">
                <div className="text-gray-400 mb-4">
                  <CurrencyDollarIcon className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No expense history yet</h3>
                <p className="text-gray-500 mb-4">Start tracking your expenses to see trends</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter section */}
      {showFilters && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Expenses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  category !== 'All' && <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search expenses..."
                className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={fetchExpenses}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Render expenses content */}
      {renderExpenseContent()}

      {/* Expense form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-sm sm:max-w-md md:max-w-lg">
            <div className="bg-white px-3 sm:px-4 pt-4 sm:pt-5 pb-3 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-2 sm:mt-0 sm:ml-4 w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEditing ? 'Edit Expense' : 'Add New Expense'}
                  </h3>
                  <div className="mt-2">
                    <ExpenseForm
                      onSubmit={onSubmit}
                      initialValues={currentExpense}
                      isEdit={isEditing}
                      onCancel={() => {
                        setShowForm(false);
                        setIsEditing(false);
                        setCurrentExpense(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 sm:flex sm:flex-row-reverse">
              {submitting ? (
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 font-medium text-sm">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-emerald-600 mr-2"></div>
                  Processing...
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Expenses;