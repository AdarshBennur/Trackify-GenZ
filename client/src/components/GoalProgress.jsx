import React from 'react';
import { motion } from 'framer-motion';

const GoalProgress = ({ goal }) => {
  const { currentAmount, targetAmount, isCompleted } = goal;
  
  // Calculate percentage
  const percentage = targetAmount > 0 
    ? Math.min((currentAmount / targetAmount) * 100, 100)
    : 0;
  
  // Determine color based on progress percentage
  const getProgressColor = () => {
    if (isCompleted) return 'bg-success-500';
    if (percentage < 25) return 'bg-danger-500';
    if (percentage < 50) return 'bg-warning-500';
    if (percentage < 75) return 'bg-info-500';
    return 'bg-success-500';
  };

  return (
    <div className="w-full">
      <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getProgressColor()}`}
          style={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1 text-right text-xs font-medium text-gray-500">
        {percentage.toFixed(1)}% Complete
      </div>
    </div>
  );
};

export default GoalProgress; 