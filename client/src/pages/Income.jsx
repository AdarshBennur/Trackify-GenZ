import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock income data
const MOCK_INCOMES = [
  { 
    _id: '1', 
    title: 'Monthly Salary', 
    amount: 3500, 
    category: 'Salary', 
    date: '2023-05-01T09:00:00Z',
    isRecurring: true,
    frequency: 'monthly',
    notes: 'Regular monthly income'
  },
  { 
    _id: '2', 
    title: 'Freelance Project', 
    amount: 850, 
    category: 'Freelance', 
    date: '2023-05-10T15:30:00Z',
    isRecurring: false,
    frequency: 'one-time',
    notes: 'Website development project'
  },
  { 
    _id: '3', 
    title: 'Dividend Payment', 
    amount: 120, 
    category: 'Dividends', 
    date: '2023-05-15T12:00:00Z',
    isRecurring: true,
    frequency: 'quarterly',
    notes: 'Stock dividends'
  },
  { 
    _id: '4', 
    title: 'Rental Income', 
    amount: 1200, 
    category: 'Rental', 
    date: '2023-05-05T10:00:00Z',
    isRecurring: true,
    frequency: 'monthly',
    notes: 'Apartment rental'
  },
  { 
    _id: '5', 
    title: 'Interest Payment', 
    amount: 45.50, 
    category: 'Interest', 
    date: '2023-05-20T14:00:00Z',
    isRecurring: true,
    frequency: 'monthly',
    notes: 'Savings account interest'
  }
];

// Mock stats data
const MOCK_STATS = {
  total: 5715.50,
  average: 1143.10,
  timeStats: [
    { _id: { day: 1 }, total: 3500 },
    { _id: { day: 5 }, total: 1200 },
    { _id: { day: 10 }, total: 850 },
    { _id: { day: 15 }, total: 120 },
    { _id: { day: 20 }, total: 45.50 }
  ],
  categoryStats: [
    { _id: 'Salary', total: 3500 },
    { _id: 'Rental', total: 1200 },
    { _id: 'Freelance', total: 850 },
    { _id: 'Dividends', total: 120 },
    { _id: 'Interest', total: 45.50 }
  ]
};

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('month');
  
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
  }, [filters]);

  // Function to fetch and filter incomes
  const fetchIncomes = () => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Filter the mock data based on filters
        let filtered = [...MOCK_INCOMES];
        
        if (filters.category && filters.category !== 'All') {
          filtered = filtered.filter(income => income.category === filters.category);
        }
        
        if (filters.startDate) {
          filtered = filtered.filter(income => new Date(income.date) >= filters.startDate);
        }
        
        if (filters.endDate) {
          filtered = filtered.filter(income => new Date(income.date) <= filters.endDate);
        }
        
        if (filters.frequency) {
          filtered = filtered.filter(income => income.frequency === filters.frequency);
        }
        
        setIncomes(filtered);
      } catch (error) {
        console.error('Error processing incomes:', error);
        toast.error('Failed to load incomes. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  // Fetch stats when showing stats or changing period
  useEffect(() => {
    if (showStats) {
      fetchStats();
    }
  }, [showStats, statsPeriod]);

  // Fetch mock income statistics
  const fetchStats = () => {
    // Simulate API delay
    setTimeout(() => {
      setStats(MOCK_STATS);
    }, 300);
  };

  // Format stats data for charts
  const formatTimeStats = (timeStats) => {
    if (!timeStats) return [];
    
    // For monthly data (days of month)
    if (timeStats[0]?._id?.day) {
      return timeStats.map(stat => ({
        name: `Day ${stat._id.day}`,
        amount: stat.total
      }));
    }
    
    // For yearly data (months)
    if (timeStats[0]?._id?.month) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      return timeStats.map(stat => ({
        name: monthNames[stat._id.month - 1],
        amount: stat.total
      }));
    }
    
    return [];
  };

  // Format category stats for charts
  const formatCategoryStats = (categoryStats) => {
    if (!categoryStats) return [];
    
    return categoryStats.map(stat => ({
      name: stat._id,
      amount: stat.total
    }));
  };

  // Calculate total income amount
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Handle form submission
  const onSubmit = (data) => {
    try {
      // Ensure date is in the right format
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date : new Date(data.date),
        // Convert string 'true'/'false' to boolean
        isRecurring: data.isRecurring === true || data.isRecurring === 'true'
      };

      if (isEditing) {
        // Update existing income
        const updatedIncome = {
          ...currentIncome,
          ...formattedData
        };
        
        setIncomes(incomes.map(item => (item._id === currentIncome._id ? updatedIncome : item)));
        toast.success('Income updated successfully!');
      } else {
        // Add new income
        const newIncome = {
          _id: Date.now().toString(),
          ...formattedData,
          date: formattedData.date.toISOString()
        };
        
        setIncomes([newIncome, ...incomes]);
        toast.success('Income added successfully!');
      }
      
      // Reset the form and close it
      reset();
      setShowForm(false);
      setIsEditing(false);
      setCurrentIncome(null);
    } catch (error) {
      console.error('Error processing income:', error);
      toast.error('Failed to process income. Please try again.');
    }
  };
  
  // Handle income deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        setIncomes(incomes.filter(income => income._id !== id));
        toast.success('Income deleted successfully!');
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

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income Tracker</h1>
            <p className="mt-1 text-gray-600">
              Track and manage all your income sources in one place.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="btn-outline flex items-center"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Income
              </button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {showStats && (
          <div className="mb-8 card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Income Statistics</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setStatsPeriod('month')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statsPeriod === 'month' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setStatsPeriod('year')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statsPeriod === 'year' 
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
                      ${stats.total.toFixed(2)}
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
                      ${(statsPeriod === 'month' 
                        ? stats.total / 30 
                        : stats.total / 12).toFixed(2)}
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
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
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
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
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
        )}

        {/* Income Form */}
        {showForm && (
          <div className="mb-8 card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Income' : 'Add New Income'}
              </h2>
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
                    Amount ($)
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
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update Income' : 'Add Income'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-900">Income Entries</h2>
            <div className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Total: ${totalIncome}
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center mr-2"
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
                applyFilters({...filters});
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
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
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
                    onChange={(date) => setFilters({...filters, startDate: date})}
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
                    onChange={(date) => setFilters({...filters, endDate: date})}
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
                    onChange={(e) => setFilters({...filters, frequency: e.target.value})}
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
                        ${parseFloat(income.amount).toFixed(2)}
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
            <div className="text-center py-12">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No income records</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first income.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Income
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
  );
};

export default Income; 