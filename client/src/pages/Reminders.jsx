import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  XMarkIcon, 
  BellAlertIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from 'react-hook-form';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewType, setViewType] = useState('all'); // 'all', 'upcoming', 'completed'

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
      category: '',
      dueDate: new Date(),
      recurringType: 'none',
      notes: ''
    }
  });

  // Available categories (should match with backend)
  const categories = [
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

  // Recurring options
  const recurringOptions = [
    { value: 'none', label: 'One-time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Fetch reminders
  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      try {
        // Fetch all reminders
        const allRemindersResponse = await api.get('/reminders', {
          params: {
            isCompleted: viewType === 'completed' ? true : undefined,
            upcoming: viewType === 'upcoming' ? true : undefined
          }
        });

        // Fetch upcoming reminders (always need this for notifications)
        if (viewType !== 'upcoming') {
          const upcomingResponse = await api.get('/reminders', {
            params: {
              upcoming: true
            }
          });
          setUpcomingReminders(upcomingResponse.data.data);
        } else {
          setUpcomingReminders(allRemindersResponse.data.data);
        }

        setReminders(allRemindersResponse.data.data);
      } catch (error) {
        console.error('Error fetching reminders:', error);
        toast.error('Failed to load reminders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [viewType]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Format date if needed
      const formattedData = {
        ...data,
        dueDate: data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate)
      };

      let response;
      if (isEditing) {
        response = await api.put(`/reminders/${currentReminder._id}`, formattedData);
        setReminders(reminders.map(item => (item._id === currentReminder._id ? response.data.data : item)));
        toast.success('Reminder updated successfully!');
      } else {
        response = await api.post('/reminders', formattedData);
        setReminders([response.data.data, ...reminders]);
        toast.success('Reminder created successfully!');
      }

      // Reset form and state
      reset();
      setShowForm(false);
      setIsEditing(false);
      setCurrentReminder(null);
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await api.delete(`/reminders/${id}`);
        setReminders(reminders.filter(reminder => reminder._id !== id));
        toast.success('Reminder deleted successfully!');
      } catch (error) {
        console.error('Error deleting reminder:', error);
        toast.error('Failed to delete reminder. Please try again.');
      }
    }
  };

  // Handle marking as complete/incomplete
  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const response = await api.put(`/reminders/${id}/complete`);
      setReminders(reminders.map(item => (item._id === id ? response.data.data : item)));
      toast.success(`Reminder marked as ${currentStatus ? 'incomplete' : 'complete'}!`);
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast.error('Failed to update reminder status. Please try again.');
    }
  };

  // Handle edit setup
  const handleEdit = (reminder) => {
    setCurrentReminder(reminder);
    setValue('title', reminder.title);
    setValue('amount', reminder.amount);
    setValue('category', reminder.category);
    setValue('dueDate', new Date(reminder.dueDate));
    setValue('recurringType', reminder.recurringType);
    setValue('notes', reminder.notes || '');
    setIsEditing(true);
    setShowForm(true);
  };

  // Format due date comparison
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() ? 'text-danger-600' : 'text-gray-900';
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
            <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
            <p className="mt-1 text-gray-600">
              Never miss a payment or bill with reminders and notifications.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
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
                    Add Reminder
                  </>
                )}
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
            All Reminders
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${
              viewType === 'upcoming'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewType('upcoming')}
          >
            Upcoming (7 Days)
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm ${
              viewType === 'completed'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewType('completed')}
          >
            Completed
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Reminder' : 'Add New Reminder'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setCurrentReminder(null);
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
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Rent Payment"
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
                  <label htmlFor="dueDate" className="form-label">
                    Due Date
                  </label>
                  <DatePicker
                    selected={watch('dueDate')}
                    onChange={(date) => setValue('dueDate', date)}
                    className="form-input w-full"
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                  />
                </div>

                <div>
                  <label htmlFor="recurringType" className="form-label">
                    Recurring
                  </label>
                  <select
                    id="recurringType"
                    className="form-input"
                    {...register('recurringType')}
                  >
                    {recurringOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
                    setCurrentReminder(null);
                    reset();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update Reminder' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Reminders Alert */}
        {viewType !== 'upcoming' && upcomingReminders.length > 0 && (
          <div className="mb-8 bg-primary-50 border-l-4 border-primary-400 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <BellAlertIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary-800">
                  You have {upcomingReminders.length} upcoming {upcomingReminders.length === 1 ? 'reminder' : 'reminders'}
                </h3>
                <div className="mt-2 text-sm text-primary-700">
                  <p>
                    {upcomingReminders.slice(0, 2).map((reminder, index) => (
                      <span key={reminder._id}>
                        {index > 0 && ', '}
                        {reminder.title} (due {format(new Date(reminder.dueDate), 'MMM dd')})
                      </span>
                    ))}
                    {upcomingReminders.length > 2 && ', and more...'}
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={() => setViewType('upcoming')}
                      className="rounded-md bg-primary-50 px-2 py-1.5 text-sm font-medium text-primary-800 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-primary-50"
                    >
                      View all upcoming
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reminders List */}
        <div className="card p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : reminders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurring
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
                  {reminders.map((reminder) => (
                    <tr key={reminder._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => handleToggleComplete(reminder._id, reminder.isCompleted)}
                          className={`p-1 rounded-full ${reminder.isCompleted ? 'text-success-600 hover:text-success-800' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {reminder.isCompleted ? (
                            <CheckCircleIcon className="h-6 w-6" />
                          ) : (
                            <ClockIcon className="h-6 w-6" />
                          )}
                        </button>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isOverdue(reminder.dueDate) && !reminder.isCompleted ? 'text-danger-600' : 'text-gray-900'}`}>
                        {reminder.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {reminder.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue(reminder.dueDate) && !reminder.isCompleted ? 'text-danger-600 font-medium' : 'text-gray-500'}`}>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {format(new Date(reminder.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reminder.recurringType === 'none' ? 'One-time' : 
                          reminder.recurringType.charAt(0).toUpperCase() + reminder.recurringType.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        ${parseFloat(reminder.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(reminder)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(reminder._id)}
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
              <BellAlertIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reminders</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new reminder.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Reminder
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
  );
};

export default Reminders; 