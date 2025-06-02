import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/currency';

const StackedProgressBar = ({ 
  categoryStats = [], 
  totalBudget = 100000, 
  loading = false,
  className = '' 
}) => {
  const [animatedWidths, setAnimatedWidths] = useState({});
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate total spent across all categories
  const totalSpent = categoryStats.reduce((sum, category) => sum + (category.totalAmount || 0), 0);
  const remaining = Math.max(totalBudget - totalSpent, 0);
  const isOverBudget = totalSpent > totalBudget;
  const overBudgetAmount = isOverBudget ? totalSpent - totalBudget : 0;

  // Define consistent colors for categories (matching pie chart)
  const categoryColors = [
    '#D4AF37', // Champagne Gold
    '#2E8B57', // Emerald Green
    '#8D7B8E', // Muted Mauve
    '#1C2541', // Royal Navy
    '#A0A0A0', // Pewter Gray
    '#C39E2D', // Darker Gold
    '#207346', // Darker Green
    '#755F77', // Darker Mauve
    '#0F142B', // Darker Navy
    '#878787', // Darker Gray
  ];

  // Prepare segments data
  const segments = React.useMemo(() => {
    if (!categoryStats || categoryStats.length === 0) {
      return [];
    }

    const baseTotal = isOverBudget ? totalSpent : totalBudget;
    const segments = [];

    // Add category segments
    categoryStats.forEach((category, index) => {
      const percentage = (category.totalAmount / baseTotal) * 100;
      segments.push({
        id: category._id,
        label: category._id,
        amount: category.totalAmount,
        percentage: percentage,
        color: categoryColors[index % categoryColors.length],
        type: 'category'
      });
    });

    // Add remaining budget segment (only if not over budget)
    if (!isOverBudget && remaining > 0) {
      const remainingPercentage = (remaining / totalBudget) * 100;
      segments.push({
        id: 'remaining',
        label: 'Remaining Budget',
        amount: remaining,
        percentage: remainingPercentage,
        color: '#F3F4F6', // Light gray
        type: 'remaining'
      });
    }

    // Add overflow segment (if over budget)
    if (isOverBudget && overBudgetAmount > 0) {
      const overflowPercentage = (overBudgetAmount / totalSpent) * 100;
      segments.push({
        id: 'overflow',
        label: 'Over Budget',
        amount: overBudgetAmount,
        percentage: overflowPercentage,
        color: '#EF4444', // Red
        type: 'overflow'
      });
    }

    return segments;
  }, [categoryStats, totalBudget, totalSpent, remaining, isOverBudget, overBudgetAmount]);

  // Animate segments on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const widths = {};
      segments.forEach(segment => {
        widths[segment.id] = segment.percentage;
      });
      setAnimatedWidths(widths);
    }, 300);

    return () => clearTimeout(timer);
  }, [segments]);

  // Handle mouse events for tooltip
  const handleMouseEnter = (e, segment) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setTooltipData(segment);
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // No data state
  if (!categoryStats || categoryStats.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Budget Utilization</h3>
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-500">No expenses recorded yet</p>
          <p className="text-sm text-gray-400 mt-1">Start adding expenses to see budget breakdown</p>
        </div>
      </div>
    );
  }

  // No budget defined
  if (totalBudget <= 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Budget Utilization</h3>
        <div className="bg-yellow-50 rounded-lg p-6 text-center border border-yellow-200">
          <p className="text-yellow-700">No budget defined</p>
          <p className="text-sm text-yellow-600 mt-1">Set up budgets to track your spending</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Budget Utilization</h3>
        <div className="text-sm text-gray-600">
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            {formatINR(totalSpent)}
          </span>
          <span className="mx-1">of</span>
          <span className="font-medium text-gray-900">{formatINR(totalBudget)}</span>
          <span className="ml-1">spent</span>
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
            isOverBudget 
              ? 'bg-red-100 text-red-700' 
              : totalSpent / totalBudget >= 0.9 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-green-100 text-green-700'
          }`}>
            {((totalSpent / totalBudget) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="relative">
        <div className="flex w-full h-6 rounded-lg overflow-hidden shadow-sm border border-gray-200">
          {segments.map((segment) => (
            <motion.div
              key={segment.id}
              className="h-full cursor-pointer transition-opacity hover:opacity-80"
              style={{ 
                backgroundColor: segment.color,
                width: `${animatedWidths[segment.id] || 0}%`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${segment.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              onMouseEnter={(e) => handleMouseEnter(e, segment)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
          {segments.slice(0, 5).map((segment) => ( // Show max 5 to prevent overflow
            <div key={segment.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-1.5"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-600">
                {segment.label}: {formatINR(segment.amount)}
              </span>
            </div>
          ))}
          {segments.length > 5 && (
            <span className="text-gray-400">+{segments.length - 5} more</span>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="font-medium">{tooltipData.label}</div>
          <div className="text-gray-300">
            {formatINR(tooltipData.amount)} ({tooltipData.percentage.toFixed(1)}%)
          </div>
          {tooltipData.type === 'overflow' && (
            <div className="text-red-300 text-xs">Over budget!</div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Status Messages */}
      {isOverBudget && (
        <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-medium">Budget exceeded!</span> You've spent {formatINR(overBudgetAmount)} more than planned.
            </p>
          </div>
        </div>
      )}

      {!isOverBudget && (totalSpent / totalBudget) >= 0.9 && (
        <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Approaching budget limit!</span> You've used {((totalSpent / totalBudget) * 100).toFixed(1)}% of your budget.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StackedProgressBar; 