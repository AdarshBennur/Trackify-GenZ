import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExpenseTable from '../components/ExpenseTable';
import ExportButton from '../components/ExportButton';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Search = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // Available expense categories (should match with backend)
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

  // Handle search and filters
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    try {
      // Build query params
      const params = {};
      
      // Add search term if exists
      if (searchTerm.trim()) {
        params.searchTerm = searchTerm.trim();
      }
      
      // Add filters if they exist
      if (filters.category && filters.category !== 'All') {
        params.category = filters.category;
      }
      if (filters.startDate) {
        params.startDate = new Date(filters.startDate).toISOString();
      }
      if (filters.endDate) {
        params.endDate = new Date(filters.endDate).toISOString();
      }
      if (filters.minAmount) {
        params.minAmount = parseFloat(filters.minAmount);
      }
      if (filters.maxAmount) {
        params.maxAmount = parseFloat(filters.maxAmount);
      }
      
      // Make API call
      const response = await axios.get('/api/expenses', { params });
      setExpenses(response.data.data);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching expenses:', error);
      toast.error('Failed to search expenses. Please try again.');
    } finally {
      setLoading(false);
    }
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
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
  };

  // Handle expense editing
  const handleEditExpense = (expense) => {
    toast.info(`Navigate to the Expenses page to edit ${expense.title}`);
  };

  // Handle expense deletion
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/${id}`);
        setExpenses(expenses.filter((expense) => expense._id !== id));
        toast.success('Expense deleted successfully!');
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense. Please try again.');
      }
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Expenses</h1>
          <p className="mt-1 text-gray-600">
            Find specific expenses using various search criteria.
          </p>
        </div>

        {/* Search Form */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="searchTerm" className="sr-only">
                  Search
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="searchTerm"
                    id="searchTerm"
                    className="form-input pl-10 py-3"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-none">
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg font-medium rounded-lg h-full py-3 px-6 w-full md:w-auto transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-input"
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
                  <label htmlFor="startDate" className="form-label">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="form-input"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="form-label">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="form-input"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="minAmount" className="form-label">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    id="minAmount"
                    name="minAmount"
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="maxAmount" className="form-label">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    id="maxAmount"
                    name="maxAmount"
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50 font-medium rounded-lg px-6 py-2.5 transition-all duration-300"
                >
                  Clear Filters
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg font-medium rounded-lg px-6 py-2.5 transition-all duration-300"
                  disabled={loading}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
            {searchPerformed && expenses.length > 0 && (
              <ExportButton 
                data={expenses} 
                filters={filters} 
                filename="search-results" 
                className="btn-outline text-sm" 
              />
            )}
          </div>
          
          {searchPerformed ? (
            <ExpenseTable
              expenses={expenses}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              loading={loading}
            />
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-600">Enter search criteria and click Search to find expenses.</p>
            </div>
          )}
        </div>
      </motion.div>
  );
};

export default Search; 