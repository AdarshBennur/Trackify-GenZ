import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CurrencySelector from './CurrencySelector';

const ExpenseForm = ({ onSubmit, onCancel, initialValues = null, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    defaultValues: initialValues || {
      title: '',
      amount: '',
      category: '',
      notes: ''
    }
  });

  const [selectedDate, setSelectedDate] = useState(
    initialValues?.date ? new Date(initialValues.date) : new Date()
  );
  
  const [selectedCurrency, setSelectedCurrency] = useState(
    initialValues?.currency || null
  );

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

  // Handle date change from date picker
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setValue('date', date);
  };
  
  // Handle currency change
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  // Handle form submission
  const handleFormSubmit = (data) => {
    // Ensure date is included in the submission
    const expenseData = {
      ...data,
      date: selectedDate,
      // Convert amount to number
      amount: parseFloat(data.amount),
      // Add currency information
      currency: selectedCurrency
    };
    
    onSubmit(expenseData);
    
    if (!isEdit) {
      reset();
      setSelectedDate(new Date());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-ivoryWhite shadow-luxe rounded-xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary-500">
          {isEdit ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-pewterGray hover:text-primary-500 transition-colors duration-300"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-pewterGray mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full px-4 py-2 bg-white border border-warmAlabaster rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-champagneGold focus:border-transparent transition-all duration-300"
            placeholder="Expense title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-pewterGray mb-1">
              Amount
            </label>
            <div className="flex items-center">
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-white border border-warmAlabaster rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-champagneGold focus:border-transparent transition-all duration-300"
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
              <div className="inline-flex">
                {selectedCurrency && (
                  <span className="inline-flex items-center px-3 py-2 text-sm border border-l-0 border-warmAlabaster bg-champagneGold bg-opacity-10 text-champagneGold font-medium rounded-r-md">
                    {selectedCurrency.symbol}
                  </span>
                )}
              </div>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-pewterGray mb-1">Currency</label>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
              showLabel={false}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-pewterGray mb-1">
              Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              className="w-full px-4 py-2 bg-white border border-warmAlabaster rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-champagneGold focus:border-transparent transition-all duration-300"
              dateFormat="MMMM d, yyyy"
              maxDate={new Date()}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-pewterGray mb-1">
              Category
            </label>
            <select
              id="category"
              className="w-full px-4 py-2 bg-white border border-warmAlabaster rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-champagneGold focus:border-transparent transition-all duration-300"
              {...register('category', { required: 'Please select a category' })}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-pewterGray mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows="3"
            className="w-full px-4 py-2 bg-white border border-warmAlabaster rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-champagneGold focus:border-transparent transition-all duration-300"
            placeholder="Add any additional details..."
            {...register('notes')}
          ></textarea>
        </div>

        <div className="flex items-center justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-champagneGold text-pewterGray rounded-md hover:text-primary-500 hover:shadow-luxe transition-all duration-300"
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="px-4 py-2 bg-champagneGold text-white rounded-md hover:bg-opacity-90 hover:shadow-luxe-hover transition-all duration-300"
            disabled={!selectedCurrency}
          >
            {isEdit ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ExpenseForm; 