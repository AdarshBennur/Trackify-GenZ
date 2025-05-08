import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BudgetForm from '../components/BudgetForm';
import BudgetProgress from '../components/BudgetProgress';
import { motion } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch budgets and their utilization
  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        // Get all budgets
        const budgetsResponse = await axios.get('/api/budgets');
        
        // Get budget utilization
        const utilizationResponse = await axios.get('/api/budgets/utilization');
        
        setBudgets(budgetsResponse.data.data);
        setUtilization(utilizationResponse.data.data);
      } catch (error) {
        console.error('Error fetching budgets:', error);
        toast.error('Failed to load budgets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  // Add a new budget
  const handleAddBudget = async (budgetData) => {
    try {
      const response = await axios.post('/api/budgets', budgetData);
      setBudgets([...budgets, response.data.data]);
      toast.success('Budget created successfully!');
      setShowForm(false);
      
      // Refresh utilization after adding budget
      const utilizationResponse = await axios.get('/api/budgets/utilization');
      setUtilization(utilizationResponse.data.data);
    } catch (error) {
      console.error('Error adding budget:', error);
      if (error.response?.data?.message === 'You already have a budget for this category and period') {
        toast.error('You already have a budget for this category and period.');
      } else {
        toast.error('Failed to create budget. Please try again.');
      }
    }
  };

  // Edit a budget
  const handleEditBudget = async (budgetData) => {
    try {
      const response = await axios.put(`/api/budgets/${currentBudget._id}`, budgetData);
      setBudgets(
        budgets.map((budget) =>
          budget._id === currentBudget._id ? response.data.data : budget
        )
      );
      toast.success('Budget updated successfully!');
      setIsEditing(false);
      setCurrentBudget(null);
      
      // Refresh utilization after editing budget
      const utilizationResponse = await axios.get('/api/budgets/utilization');
      setUtilization(utilizationResponse.data.data);
    } catch (error) {
      console.error('Error updating budget:', error);
      if (error.response?.data?.message === 'You already have a budget for this category and period') {
        toast.error('You already have a budget for this category and period.');
      } else {
        toast.error('Failed to update budget. Please try again.');
      }
    }
  };

  // Delete a budget
  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`/api/budgets/${id}`);
        setBudgets(budgets.filter((budget) => budget._id !== id));
        setUtilization(utilization.filter((item) => item.budgetId !== id));
        toast.success('Budget deleted successfully!');
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast.error('Failed to delete budget. Please try again.');
      }
    }
  };

  // Set up budget for editing
  const handleSetupEdit = (budget) => {
    setCurrentBudget(budget);
    setIsEditing(true);
    setShowForm(false);
  };

  // Get utilization data for a given budget ID
  const getBudgetUtilization = (budgetId) => {
    return utilization.find(item => item.budgetId === budgetId) || {
      spent: 0,
      budgetAmount: 0, 
      utilizationPercentage: 0,
      remaining: 0
    };
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
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="mt-1 text-gray-600">
            Set and monitor your spending limits across different categories.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
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
                  Create Budget
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Budget Form */}
      {(showForm || isEditing) && (
        <div className="mb-8">
          <BudgetForm
            onSubmit={isEditing ? handleEditBudget : handleAddBudget}
            onCancel={() => {
              setShowForm(false);
              setIsEditing(false);
              setCurrentBudget(null);
            }}
            initialValues={currentBudget}
            isEdit={isEditing}
          />
        </div>
      )}

      {/* Budget Progress Cards */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const util = getBudgetUtilization(budget._id);
            return (
              <BudgetProgress
                key={budget._id}
                category={budget.category}
                spent={util.spent}
                budget={budget.amount}
                period={budget.period}
                onEdit={() => handleSetupEdit(budget)}
                onDelete={() => handleDeleteBudget(budget._id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="card p-6 text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-500 mb-6">
            Start setting budgets to track your spending limits across categories.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Budget
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Budget; 