import React from 'react';
import { motion } from 'framer-motion';

const BudgetProgress = ({ 
  category, 
  spent, 
  budget, 
  period = 'monthly', 
  onEdit = () => {}, 
  onDelete = () => {} 
}) => {
  // Calculate utilization percentage
  const percentage = Math.min(Math.round((spent / budget) * 100), 100);
  
  // Determine color based on percentage
  const getColorClass = () => {
    if (percentage < 50) return 'bg-success-500';
    if (percentage < 75) return 'bg-accent-500';
    if (percentage < 90) return 'bg-accent-600';
    return 'bg-danger-500';
  };

  // Format period for display
  const formatPeriod = (period) => {
    switch (period) {
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      default:
        return period;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
          <p className="text-sm text-gray-500">{formatPeriod(period)} Budget</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit()}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete()}
            className="text-gray-500 hover:text-danger-600 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">₹{spent.toFixed(2)}</span> of ₹{budget.toFixed(2)}
          </div>
          <div className="text-sm font-medium" style={{ color: percentage >= 90 ? '#DC2626' : '#111827' }}>
            {percentage}%
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
          <motion.div 
            className={`h-2.5 rounded-full ${getColorClass()}`} 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          ></motion.div>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">₹{(budget - spent).toFixed(2)}</span> remaining
          </div>
          {percentage >= 90 && (
            <div className="text-xs font-medium text-danger-600 bg-danger-100 px-2 py-0.5 rounded-full">
              Approaching limit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress; 