import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';

const Currencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      code: '',
      name: '',
      symbol: '',
      rate: 1,
      isActive: true,
      isBase: false
    }
  });

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      setLoading(true);
      try {
        // Admin can see all currencies, users only see active ones
        const url = isAdmin ? '/api/currencies?active=all' : '/api/currencies';
        const response = await axios.get(url);
        setCurrencies(response.data.data);
      } catch (error) {
        console.error('Error fetching currencies:', error);
        toast.error('Failed to load currencies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, [isAdmin]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Ensure rate is a number
      data.rate = parseFloat(data.rate);
      
      let response;
      if (isEditing) {
        response = await axios.put(`/api/currencies/${currentCurrency.code}`, data);
        setCurrencies(currencies.map(item => (
          item.code === currentCurrency.code ? response.data.data : item
        )));
        toast.success('Currency updated successfully!');
      } else {
        response = await axios.post('/api/currencies', data);
        setCurrencies([...currencies, response.data.data]);
        toast.success('Currency added successfully!');
      }

      // Reset form and state
      reset();
      setShowForm(false);
      setIsEditing(false);
      setCurrentCurrency(null);
    } catch (error) {
      console.error('Error saving currency:', error);
      toast.error(error.response?.data?.message || 'Failed to save currency. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (code) => {
    if (window.confirm(`Are you sure you want to delete ${code}?`)) {
      try {
        await axios.delete(`/api/currencies/${code}`);
        setCurrencies(currencies.filter(currency => currency.code !== code));
        toast.success('Currency deleted successfully!');
      } catch (error) {
        console.error('Error deleting currency:', error);
        toast.error(error.response?.data?.message || 'Failed to delete currency. Please try again.');
      }
    }
  };

  // Handle edit setup
  const handleEdit = (currency) => {
    setCurrentCurrency(currency);
    setValue('name', currency.name);
    setValue('symbol', currency.symbol);
    setValue('rate', currency.rate);
    setValue('isActive', currency.isActive);
    setValue('isBase', currency.isBase);
    setIsEditing(true);
    setShowForm(true);
  };

  // Handle sync with exchange rate API
  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const response = await axios.post('/api/currencies/sync');
      
      if (response.data.success) {
        toast.success('Currency rates synced successfully!');
        
        // Refresh currencies list
        const updatedResponse = await axios.get('/api/currencies?active=all');
        setCurrencies(updatedResponse.data.data);
      } else {
        toast.error(response.data.message || 'Failed to sync currency rates. Please try again.');
      }
    } catch (error) {
      console.error('Error syncing currency rates:', error);
      toast.error(error.response?.data?.message || 'Failed to sync currency rates. Please try again.');
    } finally {
      setSyncLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Currency Management</h1>
            <p className="mt-1 text-gray-600">
              Manage currencies and exchange rates for your financial records.
            </p>
          </div>
          {isAdmin && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={handleSync}
                disabled={syncLoading}
                className="btn-outline flex items-center"
              >
                {syncLoading ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Sync Rates
                  </>
                )}
              </button>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Currency
                </button>
              )}
            </div>
          )}
        </div>

        {/* Currency Form (Admin Only) */}
        {isAdmin && showForm && (
          <div className="mb-8 card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? `Edit ${currentCurrency.code}` : 'Add New Currency'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setCurrentCurrency(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isEditing && (
                  <div>
                    <label htmlFor="code" className="form-label">
                      Currency Code (3 letters)
                    </label>
                    <input
                      id="code"
                      type="text"
                      className="form-input uppercase"
                      placeholder="e.g., USD, EUR, GBP"
                      maxLength={3}
                      {...register('code', { 
                        required: 'Code is required',
                        pattern: {
                          value: /^[A-Za-z]{3}$/,
                          message: 'Code must be exactly 3 letters'
                        }
                      })}
                    />
                    {errors.code && (
                      <p className="form-error">{errors.code.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="form-label">
                    Currency Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g., US Dollar, Euro"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="symbol" className="form-label">
                    Currency Symbol
                  </label>
                  <input
                    id="symbol"
                    type="text"
                    className="form-input"
                    placeholder="e.g., $, €, £"
                    {...register('symbol', { required: 'Symbol is required' })}
                  />
                  {errors.symbol && (
                    <p className="form-error">{errors.symbol.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="rate" className="form-label">
                    Exchange Rate (relative to base currency)
                  </label>
                  <input
                    id="rate"
                    type="number"
                    step="0.0001"
                    min="0"
                    className="form-input"
                    placeholder="1.0"
                    {...register('rate', {
                      required: 'Rate is required',
                      min: {
                        value: 0,
                        message: 'Rate must be positive'
                      }
                    })}
                  />
                  {errors.rate && (
                    <p className="form-error">{errors.rate.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-primary-600"
                      {...register('isActive')}
                    />
                    <label htmlFor="isActive" className="ml-2 form-label mb-0">
                      Active
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="isBase"
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-primary-600"
                      {...register('isBase')}
                    />
                    <label htmlFor="isBase" className="ml-2 form-label mb-0">
                      Base Currency
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setCurrentCurrency(null);
                    reset();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? `Update ${currentCurrency.code}` : 'Add Currency'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Currencies List */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : currencies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {isAdmin && (
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currencies.map((currency) => (
                    <tr key={currency.code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {currency.code}
                          {currency.isBase && (
                            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Base
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currency.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currency.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {currency.rate.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {currency.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(currency)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            {!currency.isBase && (
                              <button
                                onClick={() => handleDelete(currency.code)}
                                className="text-danger-600 hover:text-danger-900"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No currencies found</h3>
              {isAdmin ? (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Currency
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Contact an administrator to add currencies.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
  );
};

export default Currencies; 