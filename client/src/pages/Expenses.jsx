import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseTable from '../components/ExpenseTable';
import ExportButton from '../components/ExportButton';
import EmptyState from '../components/EmptyState';
import { motion } from 'framer-motion';
import { FunnelIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

// Mock expenses data
const MOCK_EXPENSES = [
  { 
    _id: '1', 
    title: 'Grocery shopping', 
    amount: 85.95, 
    category: 'Food', 
    date: '2023-05-07T14:30:00Z',
    currency: 'USD',
    description: 'Weekly grocery shopping at Whole Foods'
  },
  { 
    _id: '2', 
    title: 'Uber ride', 
    amount: 24.50, 
    category: 'Transportation', 
    date: '2023-05-06T08:15:00Z',
    currency: 'USD',
    description: 'Ride to work'
  },
  { 
    _id: '3', 
    title: 'Movie tickets', 
    amount: 35.00, 
    category: 'Entertainment', 
    date: '2023-05-05T19:45:00Z',
    currency: 'USD',
    description: 'Movie night with friends'
  },
  { 
    _id: '4', 
    title: 'Electric bill', 
    amount: 125.75, 
    category: 'Utilities', 
    date: '2023-05-04T10:00:00Z',
    currency: 'USD',
    description: 'Monthly electric bill'
  },
  { 
    _id: '5', 
    title: 'New shoes', 
    amount: 79.99, 
    category: 'Personal', 
    date: '2023-05-03T16:20:00Z',
    currency: 'USD',
    description: 'New running shoes'
  },
  { 
    _id: '6', 
    title: 'Internet bill', 
    amount: 65.00, 
    category: 'Utilities', 
    date: '2023-05-02T11:30:00Z',
    currency: 'USD',
    description: 'Monthly internet service'
  },
  { 
    _id: '7', 
    title: 'Restaurant dinner', 
    amount: 94.80, 
    category: 'Food', 
    date: '2023-05-01T20:15:00Z',
    currency: 'USD',
    description: 'Dinner with family'
  }
];

const Expenses = () => {
  // Get auth state
  const { user } = useAuth();
  
  // State for expenses
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

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

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses();
  }, [pagination.page, filters]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    
    try {
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
      
      // Make API request
      const response = await api.get(`/expenses?${params.toString()}`);
      
      // Update state with response data
      setExpenses(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      });
    } catch (err) {
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
      
      // Send POST request to API
      const response = await api.post('/expenses', expenseData);
      
      // Add new expense to state
      setExpenses([response.data.data, ...expenses]);
      
      toast.success('Expense added successfully!');
      setShowForm(false);
    } catch (err) {
      console.error('Error adding expense:', err);
      toast.error('Failed to add expense');
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
    setCurrentExpense(expense);
    setIsEditing(true);
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
                className={`mx-1 px-3 py-1 rounded ${
                  pagination.page === 1 
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
                  className={`mx-1 px-3 py-1 rounded ${
                    pagination.page === i + 1
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
                className={`mx-1 px-3 py-1 rounded ${
                  pagination.page === pagination.pages
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GuestBanner />
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-gray-600">
            Manage and track your expenses
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center"
          >
            {showFilters ? (
              <>
                <XMarkIcon className="h-5 w-5 mr-1" />
                Hide Filters
              </>
            ) : (
              <>
                <FunnelIcon className="h-5 w-5 mr-1" />
                Filter
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            New Expense
          </button>
          
          <ExportButton data={expenses} filename="expenses.csv" />
        </div>
      </div>
      
      {/* Filter section */}
      {showFilters && (
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                {categories.filter(c => c !== 'All').map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date range filters */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                From
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                To
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            
            {/* Search input */}
            <div>
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                placeholder="Search by title or notes..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="btn-outline mr-3"
            >
              Reset
            </button>
            <button
              onClick={fetchExpenses}
              className="btn-primary"
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEditing ? 'Edit Expense' : 'Add New Expense'}
                  </h3>
                  <div className="mt-2">
                    <ExpenseForm
                      onSubmit={isEditing ? handleEditExpense : handleAddExpense}
                      initialData={currentExpense}
                      categories={categories.filter(c => c !== 'All')}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setCurrentExpense(null);
                }}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Expenses; 