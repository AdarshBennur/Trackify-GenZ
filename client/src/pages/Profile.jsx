import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { UserCircleIcon, KeyIcon, UserIcon, EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState({
    account: false,
    password: false,
    delete: false
  });

  // Account information form
  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    formState: { errors: errorsAccount }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Update user profile
  const updateProfile = async (data) => {
    setLoading({ ...loading, account: true });
    try {
      const response = await axios.put('/api/users/profile', data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading({ ...loading, account: false });
    }
  };

  // Update password
  const updatePassword = async (data) => {
    setLoading({ ...loading, password: true });
    try {
      const response = await axios.put('/api/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully!');
      resetPassword();
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.status === 401) {
        toast.error('Current password is incorrect.');
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading({ ...loading, delete: true });
      try {
        await axios.delete('/api/users');
        toast.success('Account deleted successfully!');
        logout();
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account. Please try again.');
      } finally {
        setLoading({ ...loading, delete: false });
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
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tabs Navigation */}
          <div className="col-span-1">
            <div className="sticky top-24 card p-4">
              <nav className="space-y-1" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                    activeTab === 'account'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="h-5 w-5 mr-3" aria-hidden="true" />
                  Account Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                    activeTab === 'password'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <KeyIcon className="h-5 w-5 mr-3" aria-hidden="true" />
                  Change Password
                </button>
                <button
                  onClick={() => setActiveTab('delete')}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                    activeTab === 'delete'
                      ? 'bg-danger-50 text-danger-700'
                      : 'text-gray-700 hover:text-danger-700 hover:bg-danger-50'
                  }`}
                >
                  <TrashIcon className="h-5 w-5 mr-3" aria-hidden="true" />
                  Delete Account
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-span-1 md:col-span-3">
            {/* Account Information Tab */}
            {activeTab === 'account' && (
              <div className="card p-6">
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <UserCircleIcon className="h-24 w-24 text-gray-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600">
                        {user?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmitAccount(updateProfile)} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        className="form-input pl-10"
                        {...registerAccount('name', { 
                          required: 'Name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters'
                          }
                        })}
                      />
                    </div>
                    {errorsAccount.name && (
                      <p className="form-error">{errorsAccount.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        className="form-input pl-10"
                        {...registerAccount('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                    </div>
                    {errorsAccount.email && (
                      <p className="form-error">{errorsAccount.email.message}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading.account}
                    >
                      {loading.account ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                
                <form onSubmit={handleSubmitPassword(updatePassword)} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      className="form-input"
                      {...registerPassword('currentPassword', { 
                        required: 'Current password is required'
                      })}
                    />
                    {errorsPassword.currentPassword && (
                      <p className="form-error">{errorsPassword.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      className="form-input"
                      {...registerPassword('newPassword', { 
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    {errorsPassword.newPassword && (
                      <p className="form-error">{errorsPassword.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-input"
                      {...registerPassword('confirmPassword', { 
                        validate: (value, formValues) => value === formValues.newPassword || 'Passwords do not match'
                      })}
                    />
                    {errorsPassword.confirmPassword && (
                      <p className="form-error">{errorsPassword.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading.password}
                    >
                      {loading.password ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Delete Account Tab */}
            {activeTab === 'delete' && (
              <div className="card p-6 border-danger-200">
                <div className="text-center py-6">
                  <TrashIcon className="h-12 w-12 text-danger-500 mx-auto" />
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">Delete Account</h2>
                  <p className="mt-2 text-gray-600 max-w-md mx-auto">
                    This action cannot be undone. All your data, including expenses, budgets, and profile information will be permanently deleted.
                  </p>
                  <div className="mt-8">
                    <button
                      onClick={deleteAccount}
                      className="btn-danger"
                      disabled={loading.delete}
                    >
                      {loading.delete ? 'Deleting Account...' : 'Delete My Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
  );
};

export default Profile; 