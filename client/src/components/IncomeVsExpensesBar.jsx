import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/currency';
import { BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const IncomeVsExpensesBar = ({ 
  incomeData = [], 
  expenseData = [], 
  loading = false,
  className = '' 
}) => {
  const [animatedWidths, setAnimatedWidths] = useState({});
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate totals
  const totalIncome = incomeData.reduce((sum, income) => sum + (income.amount || 0), 0);
  const totalExpenses = expenseData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const netAmount = totalIncome - totalExpenses;
  const isPositive = netAmount >= 0;
  
  // Calculate expense breakdown by category
  const expensesByCategory = React.useMemo(() => {
    const categoryMap = {};
    expenseData.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });
    
    // Convert to array and sort by amount (highest first)
    return Object.keys(categoryMap)
      .map(category => ({
        category,
        amount: categoryMap[category],
        percentage: totalIncome > 0 ? (categoryMap[category] / totalIncome) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseData, totalIncome]);

  // Define consistent colors for categories
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

  // Prepare segments data for the progress bar
  const segments = React.useMemo(() => {
    if (totalIncome === 0) return [];

    const segments = [];
    
    // Add expense category segments
    expensesByCategory.forEach((category, index) => {
      segments.push({
        id: category.category,
        label: category.category,
        amount: category.amount,
        percentage: category.percentage,
        color: categoryColors[index % categoryColors.length],
        type: 'expense'
      });
    });
    
    // Add remaining income segment (if any)
    if (isPositive && netAmount > 0) {
      const remainingPercentage = (netAmount / totalIncome) * 100;
      segments.push({
        id: 'remaining',
        label: 'Remaining Income',
        amount: netAmount,
        percentage: remainingPercentage,
        color: '#F3F4F6', // Light gray
        type: 'remaining'
      });
    }
    
    // If expenses exceed income, show overflow
    if (!isPositive) {
      const overflowAmount = Math.abs(netAmount);
      const overflowPercentage = (overflowAmount / totalIncome) * 100;
      segments.push({
        id: 'overflow',
        label: 'Over Budget',
        amount: overflowAmount,
        percentage: overflowPercentage,
        color: '#EF4444', // Red
        type: 'overflow'
      });
    }

    return segments;
  }, [expensesByCategory, totalIncome, netAmount, isPositive]);

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
  if (totalIncome === 0 && totalExpenses === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-500">No financial data recorded yet</p>
          <p className="text-sm text-gray-400 mt-1">Start adding income and expenses to see the breakdown</p>
        </div>
      </div>
    );
  }

  // Only expenses, no income
  if (totalIncome === 0 && totalExpenses > 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
        <div className="bg-red-50 rounded-lg p-6 text-center border border-red-200">
          <p className="text-red-700 font-medium">Only expenses recorded</p>
          <p className="text-sm text-red-600 mt-1">Add income entries to see how expenses compare to income</p>
          <div className="mt-3 text-red-800 font-bold">
            Total Expenses: {formatINR(totalExpenses)}
          </div>
        </div>
      </div>
    );
  }

  // Only income, no expenses
  if (totalIncome > 0 && totalExpenses === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
        <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
          <p className="text-green-700 font-medium">All income unspent</p>
          <p className="text-sm text-green-600 mt-1">No expenses recorded yet</p>
          <div className="mt-3 text-green-800 font-bold">
            Total Income: {formatINR(totalIncome)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {formatINR(totalExpenses)}
          </span>
          <span className="mx-1">of</span>
          <span className="font-medium text-green-600">{formatINR(totalIncome)}</span>
          <span className="ml-1">spent</span>
          <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${
            isPositive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* Single Segmented Progress Bar */}
      <div className="relative">
        <div className="flex w-full h-6 rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
          {segments.map((segment) => (
            <motion.div
              key={segment.id}
              className="h-full cursor-pointer transition-opacity hover:opacity-80"
              style={{ 
                backgroundColor: segment.color,
                width: `${animatedWidths[segment.id] || 0}%`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(segment.percentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              onMouseEnter={(e) => handleMouseEnter(e, segment)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
          {segments.slice(0, 6).map((segment) => ( // Show max 6 to prevent overflow
            <div key={segment.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-1.5"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-600">
                {segment.label}: {formatINR(segment.amount)}
                {segment.type === 'expense' && ` (${segment.percentage.toFixed(1)}%)`}
              </span>
            </div>
          ))}
          {segments.length > 6 && (
            <span className="text-gray-400">+{segments.length - 6} more</span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center">
            <BanknotesIcon className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-700">Total Income</span>
          </div>
          <div className="mt-1 text-lg font-bold text-green-800">
            {formatINR(totalIncome)}
          </div>
        </div>
        
        <div className={`rounded-lg p-3 border ${
          isPositive 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isPositive ? 'bg-blue-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${
              isPositive ? 'text-blue-700' : 'text-red-700'
            }`}>
              {isPositive ? 'Remaining' : 'Deficit'}
            </span>
          </div>
          <div className={`mt-1 text-lg font-bold ${
            isPositive ? 'text-blue-800' : 'text-red-800'
          }`}>
            {isPositive ? '+' : ''}{formatINR(netAmount)}
          </div>
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
            {formatINR(tooltipData.amount)}
            {tooltipData.type === 'expense' && ` (${tooltipData.percentage.toFixed(1)}% of income)`}
          </div>
          {tooltipData.type === 'overflow' && (
            <div className="text-red-300 text-xs">Exceeds income!</div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Status Messages */}
      {!isPositive && (
        <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-medium">Expenses exceed income!</span> You're spending {formatINR(Math.abs(netAmount))} more than you earn.
            </p>
          </div>
        </div>
      )}

      {isPositive && netAmount > totalIncome * 0.3 && (
        <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <span className="font-medium">Excellent savings rate!</span> You're saving {((netAmount / totalIncome) * 100).toFixed(1)}% of your income.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeVsExpensesBar; 