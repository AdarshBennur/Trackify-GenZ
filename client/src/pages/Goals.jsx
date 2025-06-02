import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';
import GoalProgress from '../components/GoalProgress';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [viewType, setViewType] = useState('all'); // 'all', 'active', 'completed'

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
      targetAmount: '',
      currentAmount: 0,
      category: '',
      priority: 'Medium',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      notes: ''
    }
  });

  const {
    register: registerProgress,
    handleSubmit: handleSubmitProgress,
    formState: { errors: progressErrors },
    reset: resetProgress
  } = useForm({
    defaultValues: {
      amount: '',
      notes: ''
    }
  });

  // Available categories
  const categories = [
    'Housing',
    'Transportation',
    'Education',
    'Investment',
    'Savings',
    'Emergency Fund',
    'Vacation',
    'Retirement',
    'Debt Payoff',
    'Major Purchase',
    'Other'
  ];

  // Priority options
  const priorities = [
    { value: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'High', color: 'bg-red-100 text-red-800' }
  ];

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/goals', {
          params: {
            isCompleted: viewType === 'completed' ? true : viewType === 'active' ? false : undefined
          }
        });
        setGoals(response.data.data);
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast.error('Failed to load goals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [viewType]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Format dates if needed
      const formattedData = {
        ...data,
        startDate: data.startDate instanceof Date ? data.startDate : new Date(data.startDate),
        endDate: data.endDate instanceof Date ? data.endDate : new Date(data.endDate)
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/api/goals/${currentGoal._id}`, formattedData);
        setGoals(goals.map(item => (item._id === currentGoal._id ? response.data.data : item)));
        toast.success('Goal updated successfully!');
      } else {
        response = await axios.post('/api/goals', formattedData);
        setGoals([response.data.data, ...goals]);
        toast.success('Goal created successfully!');
      }

      // Reset form and state
      reset();
      setShowForm(false);
      setIsEditing(false);
      setCurrentGoal(null);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal. Please try again.');
    }
  };

  // Handle progress update submission
  const onProgressSubmit = async (data) => {
    try {
      const response = await axios.put(`/api/goals/${currentGoal._id}/progress`, {
        amount: parseFloat(data.amount)
      });
      
      setGoals(goals.map(item => (item._id === currentGoal._id ? response.data.data : item)));
      
      // Check if goal is completed
      if (response.data.data.isCompleted && !currentGoal.isCompleted) {
        toast.success('🎉 Congratulations! You\'ve reached your goal!');
      } else {
        toast.success('Progress updated successfully!');
      }
      
      // Reset form and state
      resetProgress();
      setShowProgressForm(false);
      setCurrentGoal(null);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await axios.delete(`/api/goals/${id}`);
        setGoals(goals.filter(goal => goal._id !== id));
        toast.success('Goal deleted successfully!');
      } catch (error) {
        console.error('Error deleting goal:', error);
        toast.error('Failed to delete goal. Please try again.');
      }
    }
  };

  // Handle edit setup
  const handleEdit = (goal) => {
    setCurrentGoal(goal);
    setValue('title', goal.title);
    setValue('targetAmount', goal.targetAmount);
    setValue('currentAmount', goal.currentAmount);
    setValue('category', goal.category);
    setValue('priority', goal.priority);
    setValue('startDate', new Date(goal.startDate));
    setValue('endDate', new Date(goal.endDate));
    setValue('notes', goal.notes || '');
    setIsEditing(true);
    setShowForm(true);
  };

  // Handle progress update setup
  const handleProgressUpdate = (goal) => {
    setCurrentGoal(goal);
    setShowProgressForm(true);
  };

  // Get priority color class
  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
            <p className="mt-1 text-gray-600">
              Set, track, and achieve your financial goals with visual progress tracking.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {!showForm && !showProgressForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg font-medium rounded-lg px-6 py-2.5 flex items-center transition-all duration-300"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Goal
              </button>
            )}
          </div>
        </div>

        {/* View Type Selector */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-4 px-6 font-medium text-sm ${
              viewType === 'all'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewType('all')}
          >
            All Goals
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${
              viewType === 'active'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewType('active')}
          >
            Active Goals
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${
              viewType === 'completed'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewType('completed')}
          >
            Completed Goals
          </button>
        </div>

        {/* Goal Form */}
        {showForm && (
          <div className="mb-8 card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Goal' : 'Add New Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setCurrentGoal(null);
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
                    Goal Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Emergency Fund, Down Payment"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="targetAmount" className="form-label">
                    Target Amount ($)
                  </label>
                  <input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    {...register('targetAmount', {
                      required: 'Target amount is required',
                      min: {
                        value: 0,
                        message: 'Target amount must be positive'
                      }
                    })}
                  />
                  {errors.targetAmount && (
                    <p className="form-error">{errors.targetAmount.message}</p>
                  )}
                </div>

                {isEditing && (
                  <div>
                    <label htmlFor="currentAmount" className="form-label">
                      Current Amount ($)
                    </label>
                    <input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="0.00"
                      {...register('currentAmount', {
                        min: {
                          value: 0,
                          message: 'Current amount must be positive'
                        }
                      })}
                    />
                    {errors.currentAmount && (
                      <p className="form-error">{errors.currentAmount.message}</p>
                    )}
                  </div>
                )}

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
                  <label htmlFor="priority" className="form-label">
                    Priority
                  </label>
                  <select
                    id="priority"
                    className="form-input"
                    {...register('priority')}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="startDate" className="form-label">
                    Start Date
                  </label>
                  <DatePicker
                    selected={watch('startDate')}
                    onChange={(date) => setValue('startDate', date)}
                    className="form-input w-full"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="form-label">
                    Target Date
                  </label>
                  <DatePicker
                    selected={watch('endDate')}
                    onChange={(date) => setValue('endDate', date)}
                    className="form-input w-full"
                    dateFormat="MMMM d, yyyy"
                    minDate={watch('startDate')}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="form-label">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows="3"
                    className="form-input"
                    placeholder="Add any additional details about your goal..."
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
                    setCurrentGoal(null);
                    reset();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Progress Update Form */}
        {showProgressForm && currentGoal && (
          <div className="mb-8 card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Update Progress for: {currentGoal.title}
              </h2>
              <button
                onClick={() => {
                  setShowProgressForm(false);
                  setCurrentGoal(null);
                  resetProgress();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <GoalProgress goal={currentGoal} />
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <span>Current: ${parseFloat(currentGoal.currentAmount).toFixed(2)}</span>
                <span>Target: ${parseFloat(currentGoal.targetAmount).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitProgress(onProgressSubmit)} className="space-y-6">
              <div>
                <label htmlFor="amount" className="form-label">
                  Amount to Add ($)
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  {...registerProgress('amount', {
                    required: 'Amount is required',
                    min: {
                      value: 0.01,
                      message: 'Amount must be greater than zero'
                    }
                  })}
                />
                {progressErrors.amount && (
                  <p className="form-error">{progressErrors.amount.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="progressNotes" className="form-label">
                  Notes (optional)
                </label>
                <textarea
                  id="progressNotes"
                  rows="2"
                  className="form-input"
                  placeholder="Add any notes about this progress update..."
                  {...registerProgress('notes')}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProgressForm(false);
                    setCurrentGoal(null);
                    resetProgress();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Progress
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal._id} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)} mt-1`}>
                      {goal.priority} Priority
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${goal.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {goal.isCompleted ? (
                      <CheckCircleIcon className="mr-1 h-4 w-4" />
                    ) : (
                      <ClockIcon className="mr-1 h-4 w-4" />
                    )}
                    {goal.isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <GoalProgress goal={goal} />
                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span>${parseFloat(goal.currentAmount).toFixed(2)}</span>
                    <span>${parseFloat(goal.targetAmount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="block font-medium text-gray-700">Category</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {goal.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="block font-medium text-gray-700">Target Date</span>
                    <span className="flex items-center mt-1">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {format(new Date(goal.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>

                {goal.notes && (
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="block font-medium text-gray-700">Notes</span>
                    <p className="mt-1 line-clamp-2">{goal.notes}</p>
                  </div>
                )}

                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  {!goal.isCompleted && (
                    <button
                      onClick={() => handleProgressUpdate(goal)}
                      className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium"
                    >
                      <FlagIcon className="h-4 w-4 mr-1" />
                      Update Progress
                    </button>
                  )}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="text-danger-500 hover:text-danger-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FlagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No goals</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set financial goals to track your progress towards savings targets
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Goal
              </button>
            </div>
          </div>
        )}
      </motion.div>
  );
};

export default Goals; 