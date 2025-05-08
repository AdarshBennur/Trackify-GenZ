import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseTable from '../components/ExpenseTable';
import ExportButton from '../components/ExportButton';
import { motion } from 'framer-motion';
import { FunnelIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  // State for expenses
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
    total: MOCK_EXPENSES.length
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

  // Load mock expenses
  useEffect(() => {
    fetchExpenses();
  }, [pagination.page, filters]);

  const fetchExpenses = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      // Filter expenses based on criteria
      let filteredExpenses = [...MOCK_EXPENSES];
      
      if (filters.category && filters.category !== 'All') {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.category === filters.category
        );
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredExpenses = filteredExpenses.filter(expense => 
          new Date(expense.date) >= startDate
        );
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredExpenses = filteredExpenses.filter(expense => 
          new Date(expense.date) <= endDate
        );
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.title.toLowerCase().includes(searchLower) || 
          (expense.description && expense.description.toLowerCase().includes(searchLower))
        );
      }
      
      setExpenses(filteredExpenses);
      setPagination({
        ...pagination,
        total: filteredExpenses.length
      });
      setLoading(false);
    }, 500);
  };

  // Add a new expense
  const handleAddExpense = (expenseData) => {
    const newExpense = {
      _id: Date.now().toString(),
      ...expenseData,
      date: new Date(expenseData.date).toISOString()
    };
    
    setExpenses([newExpense, ...expenses]);
    toast.success('Expense added successfully!');
    setShowForm(false);
  };

  // Edit an expense
  const handleEditExpense = (expenseData) => {
    const updatedExpense = {
      ...currentExpense,
      ...expenseData,
      date: new Date(expenseData.date).toISOString()
    };
    
    setExpenses(
      expenses.map((expense) =>
        expense._id === currentExpense._id ? updatedExpense : expense
      )
    );
    
    toast.success('Expense updated successfully!');
    setIsEditing(false);
    setCurrentExpense(null);
  };

  // Delete an expense
  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter((expense) => expense._id !== id));
      toast.success('Expense deleted successfully!');
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
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
                <XMarkIcon className="h-5 w-5 mr-2" />
                Hide Filters
              </>
            ) : (
              <>
                <FunnelIcon className="h-5 w-5 mr-2" />
                Show Filters
              </>
            )}
          </button>
          
          <ExportButton 
            filters={filters} 
            className="btn-outline"
          />
          
          {!isEditing && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center"
            >
              {showForm ? (
                <>
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Expense
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-8 p-4 card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Expenses</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="form-input w-full"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
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
                className="form-input w-full"
                value={filters.startDate}
                onChange={handleFilterChange}
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
                className="form-input w-full"
                value={filters.endDate}
                onChange={handleFilterChange}
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
                className="form-input w-full"
                placeholder="Search expenses..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="btn-outline"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Expense Form */}
      {(showForm || isEditing) && (
        <div className="mb-8">
          <ExpenseForm
            onSubmit={isEditing ? handleEditExpense : handleAddExpense}
            onCancel={() => {
              setShowForm(false);
              setIsEditing(false);
              setCurrentExpense(null);
            }}
            initialValues={currentExpense}
            isEdit={isEditing}
          />
        </div>
      )}

      {/* Expenses Table */}
      <ExpenseTable
        expenses={expenses}
        loading={loading}
        onEdit={handleSetupEdit}
        onDelete={handleDeleteExpense}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
      />
    </motion.div>
  );
};

export default Expenses; 