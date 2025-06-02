import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/currency';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ExpenseProgressBar = ({ 
  categoryName, 
  spentAmount = 0, 
  budgetAmount = 10000, 
  color = '#D4AF37',
  loading = false 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const percentage = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;
  const isOverBudget = spentAmount > budgetAmount;
  const remainingAmount = Math.max(budgetAmount - spentAmount, 0);
  const overBudgetAmount = isOverBudget ? spentAmount - budgetAmount : 0;

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-[#F4F1EB] shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Determine progress bar colors
  const getProgressColors = () => {
    if (isOverBudget) {
      return {
        fill: '#EF4444', // Red for over budget
        background: '#FEE2E2' // Light red background
      };
    }
    
    if (percentage >= 90) {
      return {
        fill: '#F59E0B', // Amber for near budget
        background: '#FEF3C7' // Light amber background
      };
    }
    
    return {
      fill: color, // Category color
      background: '#F3F4F6' // Light gray background
    };
  };

  const colors = getProgressColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg p-4 border border-[#F4F1EB] shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: color }}
          ></div>
          <h4 className="font-semibold text-gray-900">{categoryName}</h4>
          {isOverBudget && (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 ml-2" title="Over budget" />
          )}
          {percentage === 100 && !isOverBudget && (
            <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" title="Budget reached" />
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {formatINR(spentAmount)} of {formatINR(budgetAmount)}
          </div>
          <div className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
            {isOverBudget 
              ? `Over by ${formatINR(overBudgetAmount)}`
              : `${formatINR(remainingAmount)} remaining`
            }
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div 
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.background }}
        >
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{ backgroundColor: colors.fill }}
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 1.5, 
                delay: 0.5,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>

        {/* Percentage label */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">0%</span>
          <span className={`text-xs font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-700'}`}>
            {percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">100%</span>
        </div>
      </div>

      {/* Status Message */}
      {spentAmount === 0 && (
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-400 italic">No expenses yet</span>
        </div>
      )}

      {isOverBudget && (
        <div className="mt-3 p-2 bg-red-50 rounded-md border border-red-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-xs text-red-700 font-medium">
              This category has exceeded the allocated budget
            </span>
          </div>
        </div>
      )}

      {percentage >= 90 && percentage < 100 && !isOverBudget && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md border border-amber-200">
          <div className="flex items-center">
            <span className="text-xs text-amber-700 font-medium">
              ⚠️ Nearly at budget limit ({(100 - percentage).toFixed(1)}% remaining)
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ExpenseProgressBar; 