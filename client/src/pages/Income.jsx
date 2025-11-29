import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  CalendarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/apiClient';
import { formatINR, formatINRCompact } from '../utils/currency';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated, isGuestUser } = useAuth();

  // Filters
  const [filters, setFilters] = useState({
    category: 'All',
    startDate: null,
    endDate: null,
    frequency: ''
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      date: new Date(),
      category: '',
      isRecurring: false,
      frequency: 'one-time',
      notes: ''
    }
  });

  // Available categories
  const categories = [
    'Salary',
    'Business',
    'Freelance',
    'Investments',
    'Dividends',
    'Rental',
    'Interest',
    'Gift',
    'Refund',
    'Other'
  ];

  // Frequency options
  const frequencies = [
    { value: 'one-time', label: 'One-time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ];

  // Fetch incomes with applied filters
  useEffect(() => {
    fetchIncomes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isAuthenticated, user]);

  // Function to fetch and filter incomes
  const fetchIncomes = async () => {
    setLoading(true);

    try {
      // Only fetch real data for authenticated non-guest users
      if (isAuthenticated && !isGuestUser()) {
        // Build query parameters
        const queryParams = {};

        if (filters.category && filters.category !== 'All') {
          queryParams.category = filters.category;
        }

        if (filters.startDate) {
          queryParams.startDate = filters.startDate.toISOString();
        }

        if (filters.endDate) {
          queryParams.endDate = filters.endDate.toISOString();
        }

        if (filters.frequency) {
          queryParams.frequency = filters.frequency;
        }

        // Call API to get this user's income data
        const response = await api.get('/incomes', { params: queryParams });
        setIncomes(response.data.data || []);
      } else {
        // For guest or unauthenticated users, show empty state
        setIncomes([]);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast.error('Failed to load incomes. Please try again.');
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats when component mounts or statsPeriod changes (removed showStats dependency)
  useEffect(() => {
    // Add a simple error catch to prevent unhandled promise rejections
    (async () => {
      try {
        await fetchStats();
      } catch (error) {
        // Silently log errors without showing error toasts
        console.log('Stats fetch error in effect:', error.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsPeriod, isAuthenticated, user]);

  // Fetch income statistics with improved error handling
  const fetchStats = async () => {
    // Don't set loading here since the toggleStats handles loading state

    try {
      // Only fetch real stats for authenticated non-guest users
      if (isAuthenticated && !isGuestUser()) {
        // Attempt to fetch stats from API
        try {
          const response = await api.get('/incomes/stats', {
            params: { period: statsPeriod }
          });

          if (response.data && response.data.success) {
            setStats(response.data.data);
            return true; // Successful fetch
          }
        } catch (err) {
          // Silently handle the error and proceed to fallback
          console.log('Stats API fallback:', err.message);
        }

        // Fallback: calculate from current income data
        try {
          calculateStatsFromIncomes();
          return true; // Successful calculation
        } catch (calcError) {
          console.error('Error calculating stats:', calcError);
          throw calcError; // Re-throw only if both API and calculation failed
        }
      } else {
        // For guest or unauthenticated users, show empty stats
        setStats({
          total: 0,
          average: 0,
          count: 0,
          timeStats: [],
          categoryStats: []
        });
        return true;
      }
    } catch (error) {
      console.error('Critical error fetching income stats:', error);
      // Only show error toast for complete failures
      if (!stats) {
        // Set empty stats in case of error
        setStats({
          total: 0,
          average: 0,
          count: 0,
          timeStats: [],
          categoryStats: []
        });
      }
      throw error; // Re-throw so caller knows there was an issue
    }
  };

  // Calculate stats from current income data
  const calculateStatsFromIncomes = () => {
    // If no incomes, set empty stats and exit
    if (!incomes || incomes.length === 0) {
      setStats({
        total: 0,
        average: 0,
        count: 0,
        timeStats: [],
        categoryStats: []
      });
      return;
    }

    try {
      // Calculate total income
      const total = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);

      // Calculate average income
      const average = total / incomes.length;

      // Determine date format based on period
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Prepare time stats based on period
      let timeStats = [];

      if (statsPeriod === 'month') {
        // Create a map for all days of the month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dayMap = {};

        // Initialize all days with 0
        for (let day = 1; day <= daysInMonth; day++) {
          dayMap[day] = 0;
        }

        // Populate with actual income data
        incomes.forEach(income => {
          const date = new Date(income.date);
          // Only include this month's data
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const day = date.getDate();
            dayMap[day] += parseFloat(income.amount);
          }
        });

        // Convert to array format for chart
        timeStats = Object.keys(dayMap).map(day => ({
          _id: { day: parseInt(day) },
          total: dayMap[day]
        }));
      } else if (statsPeriod === 'year') {
        // Create a map for all months
        const monthMap = {};

        // Initialize all months with 0
        for (let month = 0; month < 12; month++) {
          monthMap[month] = 0;
        }

        // Populate with actual income data
        incomes.forEach(income => {
          const date = new Date(income.date);
          // Only include this year's data
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth();
            monthMap[month] += parseFloat(income.amount);
          }
        });

        // Convert to array format for chart
        timeStats = Object.keys(monthMap).map(month => ({
          _id: { month: parseInt(month) },
          total: monthMap[month]
        }));
      } else {
        // 'all' period - group by month across all years
        const monthYearMap = {};

        incomes.forEach(income => {
          const date = new Date(income.date);
          const year = date.getFullYear();
          const month = date.getMonth();
          const key = `${year}-${month}`;

          if (!monthYearMap[key]) {
            monthYearMap[key] = {
              year,
              month,
              total: 0
            };
          }
          monthYearMap[key].total += parseFloat(income.amount);
        });

        // Convert to array format for chart
        timeStats = Object.values(monthYearMap).map(item => ({
          _id: { year: item.year, month: item.month },
          total: item.total
        }));
      }

      // Group by category
      const categoryMap = {};
      incomes.forEach(income => {
        if (!categoryMap[income.category]) {
          categoryMap[income.category] = 0;
        }
        categoryMap[income.category] += parseFloat(income.amount);
      });

      const categoryStats = Object.keys(categoryMap).map(category => ({
        _id: category,
        total: categoryMap[category]
      }));

      setStats({
        total,
        average,
        count: incomes.length,
        timeStats,
        categoryStats
      });
    } catch (error) {
      console.error('Error calculating stats from incomes:', error);
      // Set fallback stats without showing error to user
      setStats({
        total: 0,
        average: 0,
        count: 0,
        timeStats: [],
        categoryStats: []
      });
    }
  };

  // Update the time stats formatting to properly handle both month and year periods
  const formatTimeStats = (timeStats) => {
    if (!timeStats || timeStats.length === 0) return [];

    if (statsPeriod === 'month') {
      // Sort by day
      const sortedData = [...timeStats].sort((a, b) =>
        (a._id.day || 0) - (b._id.day || 0)
      );

      return sortedData.map(item => ({
        name: `Day ${item._id.day || ''}`,
        amount: item.total || 0
      }));
    } else if (statsPeriod === 'year') {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      // Sort by month number
      const sortedData = [...timeStats].sort((a, b) =>
        (a._id.month || 0) - (b._id.month || 0)
      );

      return sortedData.map(item => ({
        name: monthNames[item._id.month || 0],
        amount: item.total || 0
      }));
    } else {
      // 'all' period - format as "MMM YYYY"
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      // Sort by year and month
      const sortedData = [...timeStats].sort((a, b) => {
        const aYear = a._id.year || 0;
        const bYear = b._id.year || 0;
        const aMonth = a._id.month || 0;
        const bMonth = b._id.month || 0;

        if (aYear !== bYear) {
          return aYear - bYear;
        }
        return aMonth - bMonth;
      });

      return sortedData.map(item => ({
        name: `${monthNames[item._id.month || 0]} ${item._id.year || ''}`,
        amount: item.total || 0
      }));
    }
  };

  // Format category stats for charts
  const formatCategoryStats = (categoryStats) => {
    if (!categoryStats || categoryStats.length === 0) return [];

    return categoryStats.map(stat => ({
      name: stat._id,
      amount: stat.total
    }));
  };

  // Calculate total income amount
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Set submitting state to prevent multiple submissions
      setSubmitting(true);

      // Ensure form data is properly formatted
      const numAmount = parseFloat(data.amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        toast.error('Please enter a valid amount greater than zero');
        setSubmitting(false);
        return;
      }

      // Format data for API
      const newIncome = {
        ...data,
        amount: numAmount,
        date: data.date.toISOString(),
        // Ensure currency data is present
        currency: {
          code: 'INR',
          symbol: '₹',
          rate: 1
        }
      };

      console.log('Submitting income data:', newIncome);

      let response;

      if (isEditing) {
        // Update existing income
        response = await api.put(`/incomes/${currentIncome._id}`, newIncome);

        if (response.data && response.data.success) {
          // Update local state with updated income
          setIncomes(incomes.map(inc =>
            inc._id === currentIncome._id ? response.data.data : inc
          ));
          toast.success('Income updated successfully');

          // Close form and reset
          setShowForm(false);
          setIsEditing(false);
          setCurrentIncome(null);
          reset();

          // Refresh stats if showing
          if (showStats) {
            try {
              await fetchStats();
            } catch (statsError) {
              // Just log the error, don't show to user since the main action succeeded
              console.log('Stats refresh error:', statsError.message);
            }
          } else {
            // Show stats after updating income
            setShowStats(true);
          }
        }
      } else {
        // Add new income
        response = await api.post('/incomes', newIncome);

        if (response.data && response.data.success) {
          // Add new income to local state
          setIncomes([response.data.data, ...incomes]);
          toast.success('Income added successfully');

          // Close form and reset
          setShowForm(false);
          setIsEditing(false);
          setCurrentIncome(null);
          reset();

          // Refresh stats if showing
          if (showStats) {
            try {
              await fetchStats();
            } catch (statsError) {
              // Just log the error, don't show to user since the main action succeeded
              console.log('Stats refresh error:', statsError.message);
            }
          } else {
            // Show stats after adding income
            setShowStats(true);
          }
        }
      }
    } catch (error) {
      console.error('Error saving income:', error);

      // Display specific error message if available
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          toast.error(errorData.message);
        } else if (errorData.errors && errorData.errors.length > 0) {
          errorData.errors.forEach(err => toast.error(err.msg || err));
        } else {
          toast.error('Failed to save income. Please try again.');
        }
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to save income. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle income deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        const response = await api.delete(`/incomes/${id}`);

        if (response.data.success) {
          setIncomes(incomes.filter(income => income._id !== id));
          toast.success('Income deleted successfully!');

          // Refresh stats if showing
          if (showStats) {
            fetchStats();
          }
        }
      } catch (error) {
        console.error('Error deleting income:', error);
        toast.error('Failed to delete income. Please try again.');
      }
    }
  };

  // Handle edit setup
  const handleEdit = (income) => {
    setCurrentIncome(income);
    setValue('title', income.title);
    setValue('amount', income.amount);
    setValue('date', new Date(income.date));
    setValue('category', income.category);
    setValue('isRecurring', income.isRecurring);
    setValue('frequency', income.frequency);
    setValue('notes', income.notes || '');
    setIsEditing(true);
    setShowForm(true);
  };

  // Apply filters
  const applyFilters = (filterData) => {
    setFilters(filterData);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: 'All',
      startDate: null,
      endDate: null,
      frequency: ''
    });
    setShowFilters(false);
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm text-center">
      <div className="text-gray-400 mb-4">
        <BanknotesIcon className="h-16 w-16" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">No income data yet</h3>
      <p className="text-gray-500 mb-4">Add your first income record to start tracking</p>
      <button
        onClick={() => {
          setShowForm(true);
          setIsEditing(false);
          setCurrentIncome(null);
          reset();
        }}
        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
      >
        Add Your First Income
      </button>
    </div>
  );

  // Handle add button click - update to match modal behavior of Expenses page
  const handleAddClick = () => {
    setShowForm(true);
    setIsEditing(false);
    setCurrentIncome(null);
    reset();
  };

  // StatCard component for income stats - Add back the component definition
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
          <h1 className="text-2xl font-bold text-gray-900">Income Management</h1>
          <p className="mt-1 text-[#A0A0A0]">
            Track, manage, and analyze all your income sources
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <button
            onClick={handleAddClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg font-medium rounded-lg px-6 py-2.5 flex items-center transition-all duration-300"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Income
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline'} flex items-center`}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Filter'}
          </button>
        </div>
      </div>

      {/* Stats Grid - Similar to Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Income"
          value={formatINR(stats?.total || 0)}
          subtitle={`Across ${stats?.categoryStats?.length || 0} categories`}
          icon={BanknotesIcon}
          color="primary"
        />
        <StatCard
          title="Average Income"
          value={formatINR(stats?.average || 0)}
          subtitle={statsPeriod === 'month' ? "Per entry this month" : "Per entry this year"}
          icon={CalendarIcon}
          color="secondary"
        />
        <StatCard
          title="Top Category"
          value={stats?.categoryStats && stats?.categoryStats.length > 0
            ? stats.categoryStats[0]?._id
            : 'None'}
          subtitle={stats?.categoryStats && stats?.categoryStats.length > 0
            ? formatINR(stats.categoryStats[0]?.total)
            : 'No categories yet'}
          icon={ArrowTrendingUpIcon}
          color="accent"
        />
      </div>

      {/* Stats Section - Always visible now */}
      <div className="mb-8 card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Income Statistics</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setStatsPeriod('month')}
              className={`px-3 py-1 text-sm rounded-md ${statsPeriod === 'month'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setStatsPeriod('year')}
              className={`px-3 py-1 text-sm rounded-md ${statsPeriod === 'year'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {stats ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-primary-50 p-4">
                <div className="text-sm text-primary-600 font-medium">Total Income</div>
                <div className="mt-2 text-2xl font-bold text-primary-900">
                  {formatINR(stats.total)}
                </div>
                <div className="text-xs text-primary-500">
                  {statsPeriod === 'month' ? 'This Month' : 'This Year'}
                </div>
              </div>

              <div className="card bg-green-50 p-4">
                <div className="text-sm text-green-600 font-medium">Number of Entries</div>
                <div className="mt-2 text-2xl font-bold text-green-900">
                  {stats.count}
                </div>
                <div className="text-xs text-green-500">
                  {statsPeriod === 'month' ? 'This Month' : 'This Year'}
                </div>
              </div>

              <div className="card bg-blue-50 p-4">
                <div className="text-sm text-blue-600 font-medium">
                  {statsPeriod === 'month' ? 'Daily Average' : 'Monthly Average'}
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-900">
                  {formatINR(statsPeriod === 'month'
                    ? stats.total / 30
                    : stats.total / 12)}
                </div>
                <div className="text-xs text-blue-500">
                  {statsPeriod === 'month' ? 'Per Day' : 'Per Month'}
                </div>
              </div>
            </div>

            {/* Time-based Chart */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {statsPeriod === 'month' ? 'Daily Income' : 'Monthly Income'}
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatTimeStats(stats.timeStats)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatINR(value), 'Amount']}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Income"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Chart */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Income by Category</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatCategoryStats(stats.categoryStats)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip
                      formatter={(value) => [formatINR(value), 'Amount']}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Income"
                      fill="#10b981"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Income Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-sm sm:max-w-md md:max-w-lg">
            <div className="bg-white px-3 sm:px-4 pt-4 sm:pt-5 pb-3 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-2 sm:mt-0 sm:ml-4 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditing ? 'Edit Income' : 'Add New Income'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setIsEditing(false);
                        setCurrentIncome(null);
                        reset();
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="title" className="form-label">
                          Income Title
                        </label>
                        <input
                          id="title"
                          type="text"
                          className="form-input"
                          placeholder="e.g., Monthly Salary, Freelance Project"
                          {...register('title', { required: 'Title is required' })}
                        />
                        {errors.title && (
                          <p className="form-error">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="amount" className="form-label">
                          Amount (₹)
                        </label>
                        <input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-input"
                          placeholder="0.00"
                          {...register('amount', {
                            required: 'Amount is required',
                            min: {
                              value: 0,
                              message: 'Amount must be positive'
                            }
                          })}
                        />
                        {errors.amount && (
                          <p className="form-error">{errors.amount.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="category" className="form-label">
                          Category
                        </label>
                        <select
                          id="category"
                          className="form-input"
                          {...register('category', { required: 'Category is required' })}
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="form-error">{errors.category.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="date" className="form-label">
                          Date Received
                        </label>
                        <DatePicker
                          selected={watch('date')}
                          onChange={(date) => setValue('date', date)}
                          className="form-input w-full"
                          dateFormat="MMMM d, yyyy"
                        />
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <input
                            id="isRecurring"
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-primary-600"
                            {...register('isRecurring')}
                          />
                          <label htmlFor="isRecurring" className="ml-2 form-label mb-0">
                            Recurring Income
                          </label>
                        </div>

                        {watch('isRecurring') && (
                          <div>
                            <label htmlFor="frequency" className="form-label">
                              Frequency
                            </label>
                            <select
                              id="frequency"
                              className="form-input"
                              {...register('frequency')}
                            >
                              {frequencies.map(freq => (
                                <option key={freq.value} value={freq.value}>
                                  {freq.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="notes" className="form-label">
                          Notes (optional)
                        </label>
                        <textarea
                          id="notes"
                          rows="3"
                          className="form-input"
                          placeholder="Add any additional details..."
                          {...register('notes')}
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setIsEditing(false);
                          setCurrentIncome(null);
                          reset();
                        }}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="inline-block animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></span>
                            Processing...
                          </>
                        ) : isEditing ? 'Update Income' : 'Add Income'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <h2 className="text-lg font-medium text-gray-900">Income Entries</h2>
          <div className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Total: {formatINR(totalIncome)}
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-[#2E8B57] text-white hover:bg-[#237249] font-medium rounded-lg px-4 py-2 flex items-center"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            {Object.values(filters).some(v => v && v !== 'All') ? 'Filters Applied' : 'Filter'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 card p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-900">Filter Incomes</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyFilters({ ...filters });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filterCategory" className="form-label">
                  Category
                </label>
                <select
                  id="filterCategory"
                  className="form-input"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filterStartDate" className="form-label">
                  Start Date
                </label>
                <DatePicker
                  id="filterStartDate"
                  selected={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  selectsStart
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  className="form-input w-full"
                  dateFormat="MMMM d, yyyy"
                  isClearable
                  placeholderText="Select start date"
                />
              </div>

              <div>
                <label htmlFor="filterEndDate" className="form-label">
                  End Date
                </label>
                <DatePicker
                  id="filterEndDate"
                  selected={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  selectsEnd
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  minDate={filters.startDate}
                  className="form-input w-full"
                  dateFormat="MMMM d, yyyy"
                  isClearable
                  placeholderText="Select end date"
                />
              </div>

              <div>
                <label htmlFor="filterFrequency" className="form-label">
                  Frequency
                </label>
                <select
                  id="filterFrequency"
                  className="form-input"
                  value={filters.frequency}
                  onChange={(e) => setFilters({ ...filters, frequency: e.target.value })}
                >
                  <option value="">All Frequencies</option>
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetFilters}
                className="btn-outline"
              >
                Reset
              </button>
              <button type="submit" className="btn-primary">
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incomes List */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : incomes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomes.map((income) => (
                  <tr key={income._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <BanknotesIcon className="h-5 w-5 text-green-500 mr-2" />
                        {income.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {income.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(income.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {income.isRecurring ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {frequencies.find(f => f.value === income.frequency)?.label || income.frequency}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          One-time
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      {formatINR(parseFloat(income.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(income)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(income._id)}
                          className="text-danger-600 hover:text-danger-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </motion.div>
  );
};

export default Income; 