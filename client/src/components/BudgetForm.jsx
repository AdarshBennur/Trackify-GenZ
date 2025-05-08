import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BudgetForm = ({ onSubmit, onCancel, initialValues = null, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: initialValues || {
      category: '',
      amount: '',
      period: 'monthly'
    }
  });

  // Available expense categories
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

  // Handle form submission
  const handleFormSubmit = (data) => {
    // Convert amount to number
    const budgetData = {
      ...data,
      amount: parseFloat(data.amount)
    };
    
    onSubmit(budgetData);
    
    if (!isEdit) {
      reset();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="card p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? 'Edit Budget' : 'Create New Budget'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            className="form-input"
            {...register('category', { required: 'Please select a category' })}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="form-error">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="form-label">
            Budget Amount ($)
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
                value: 0.01,
                message: 'Amount must be greater than 0'
              },
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: 'Please enter a valid amount'
              }
            })}
          />
          {errors.amount && (
            <p className="form-error">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="period" className="form-label">
            Budget Period
          </label>
          <select
            id="period"
            className="form-input"
            {...register('period', { required: 'Please select a period' })}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.period && (
            <p className="form-error">{errors.period.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary">
            {isEdit ? 'Update Budget' : 'Create Budget'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BudgetForm; 