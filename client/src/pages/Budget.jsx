import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { PlusIcon, XMarkIcon, CurrencyDollarIcon, CalendarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import BudgetForm from '../components/BudgetForm';
import BudgetProgress from '../components/BudgetProgress';
import api from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalUtilization: 0,
    avgUtilization: 0,
    topCategory: null
  });
  const { isAuthenticated, isGuestUser } = useAuth();

  // StatCard component for budget stats
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

  // Fetch budgets and their utilization
  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        // Only fetch real data for authenticated non-guest users
        if (isAuthenticated && !isGuestUser()) {
          // Get all budgets
          const budgetsResponse = await api.get('/budgets');

          // Get budget utilization
          const utilizationResponse = await api.get('/budgets/utilization');

          setBudgets(budgetsResponse.data.data || []);
          setUtilization(utilizationResponse.data.data || []);

          // Calculate stats
          calculateStats(budgetsResponse.data.data || [], utilizationResponse.data.data || []);
        } else {
          // For guests or unauthenticated users, show empty state
          setBudgets([]);
          setUtilization([]);
        }
      } catch (error) {
        console.error('Error fetching budgets:', error);
        toast.error('Failed to load budgets. Please try again.');
        setBudgets([]);
        setUtilization([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Calculate budget statistics
  const calculateStats = (budgetData, utilizationData) => {
    if (!budgetData || budgetData.length === 0) {
      setStats({
        totalBudget: 0,
        totalUtilization: 0,
        avgUtilization: 0,
        topCategory: null
      });
      return;
    }

    // Calculate total budget amount
    const totalBudget = budgetData.reduce((sum, budget) => sum + budget.amount, 0);

    // Calculate total utilization
    const totalUtilization = utilizationData.reduce((sum, item) => sum + item.spent, 0);

    // Calculate average utilization percentage
    const avgUtilization = (totalUtilization / totalBudget) * 100;

    // Find top category by amount
    const categoryMap = {};
    budgetData.forEach(budget => {
      if (!categoryMap[budget.category]) {
        categoryMap[budget.category] = 0;
      }
      categoryMap[budget.category] += budget.amount;
    });

    // Convert to array and sort
    const categories = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = categories.length > 0 ? categories[0] : null;

    setStats({
      totalBudget,
      totalUtilization,
      avgUtilization,
      topCategory
    });
  };

  // Add a new budget
  const handleAddBudget = async (budgetData) => {
    try {
      const response = await api.post('/budgets', budgetData);
      setBudgets([...budgets, response.data.data]);
      toast.success('Budget created successfully!');
      setShowForm(false);

      // Refresh utilization after adding budget
      const utilizationResponse = await api.get('/budgets/utilization');
      setUtilization(utilizationResponse.data.data);

      // Recalculate stats
      calculateStats([...budgets, response.data.data], utilizationResponse.data.data);
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
      const response = await api.put(`/budgets/${currentBudget._id}`, budgetData);
      const updatedBudgets = budgets.map((budget) =>
        budget._id === currentBudget._id ? response.data.data : budget
      );

      setBudgets(updatedBudgets);
      toast.success('Budget updated successfully!');
      setIsEditing(false);
      setCurrentBudget(null);

      // Refresh utilization after editing budget
      const utilizationResponse = await api.get('/budgets/utilization');
      setUtilization(utilizationResponse.data.data);

      // Recalculate stats
      calculateStats(updatedBudgets, utilizationResponse.data.data);
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
        await api.delete(`/budgets/${id}`);
        const updatedBudgets = budgets.filter((budget) => budget._id !== id);
        setBudgets(updatedBudgets);
        setUtilization(utilization.filter((item) => item.budgetId !== id));
        toast.success('Budget deleted successfully!');

        // Recalculate stats
        calculateStats(
          updatedBudgets,
          utilization.filter((item) => item.budgetId !== id)
        );
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

  // Prepare budget timeline data
  const prepareBudgetTimelineData = () => {
    if (!budgets || budgets.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Budget',
            data: [0],
            borderColor: '#2E8B57',
            backgroundColor: 'rgba(46, 139, 87, 0.1)',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Spent',
            data: [0],
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            fill: false,
            tension: 0.4,
          },
        ],
      };
    }

    // Group budgets by category
    const categories = [...new Set(budgets.map(budget => budget.category))];

    // Map budget and spent amounts by category
    const budgetAmounts = categories.map(category => {
      const categoryBudgets = budgets.filter(b => b.category === category);
      return categoryBudgets.reduce((sum, b) => sum + b.amount, 0);
    });

    const spentAmounts = categories.map(category => {
      const categoryBudgets = budgets.filter(b => b.category === category);
      return categoryBudgets.reduce((sum, b) => {
        const util = getBudgetUtilization(b._id);
        return sum + util.spent;
      }, 0);
    });

    return {
      labels: categories,
      datasets: [
        {
          label: 'Budget',
          data: budgetAmounts,
          borderColor: '#2E8B57',
          backgroundColor: 'rgba(46, 139, 87, 0.1)',
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Spent',
          data: spentAmounts,
          borderColor: '#D4AF37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          fill: false,
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
        display: true,
        position: 'top',
        labels: {
          color: '#A0A0A0',
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₹${context.raw.toFixed(2)}`;
          }
        }
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
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="mt-1 text-[#A0A0A0]">
            Set and monitor your spending limits across different categories
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {!isEditing && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg font-medium rounded-lg px-6 py-2.5 flex items-center transition-all duration-300"
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Budget"
          value={`₹${stats.totalBudget.toFixed(2)}`}
          subtitle={`Across ${budgets.length} budget categories`}
          icon={CurrencyDollarIcon}
          color="primary"
        />
        <StatCard
          title="Total Spent"
          value={`₹${stats.totalUtilization.toFixed(2)}`}
          subtitle={`${stats.avgUtilization.toFixed(1)}% of total budget used`}
          icon={CalendarIcon}
          color="secondary"
        />
        <StatCard
          title="Top Category"
          value={stats.topCategory ? stats.topCategory.category : 'None'}
          subtitle={stats.topCategory
            ? `₹${stats.topCategory.amount.toFixed(2)}`
            : 'No budget categories yet'}
          icon={ArrowTrendingUpIcon}
          color="accent"
        />
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

      {/* Budget Timeline Chart */}
      <div className="mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Over Time</h3>
          <div className="h-64">
            {budgets.length > 0 ? (
              <Line data={prepareBudgetTimelineData()} options={lineChartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 rounded-lg text-center h-full">
                <div className="text-gray-400 mb-4">
                  <CurrencyDollarIcon className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No budget data yet</h3>
                <p className="text-gray-500 mb-4">Create your first budget to see timeline</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Progress Cards */}
      <div className="mb-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Budgets</h2>
            <p className="text-sm text-gray-600">Track your spending against your budget limits</p>
          </div>
        </div>

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
      </div>
    </motion.div>
  );
};

export default Budget; 