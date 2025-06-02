import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import { formatINR } from '../utils/currency';
import { format } from 'date-fns';

const ExportButton = ({ data = [], filters = {}, filename = 'expense-report', className = '', stats = {}, recentExpenses = [] }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    console.log('Export started - creating dashboard-style PDF');
    
    try {
      // Create new jsPDF instance
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: 'Dashboard Report',
        subject: 'Financial Dashboard Export',
        author: 'Expense Tracker',
        creator: 'Expense Tracker App'
      });

      let yPosition = 20;

      // HEADER SECTION - Match dashboard title
      doc.setFontSize(24);
      doc.setTextColor(17, 24, 39); // gray-900
      doc.text('Dashboard', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(160, 160, 160); // gray-500
      doc.text('Overview of your financial activity for the selected period', 20, yPosition);
      yPosition += 8;
      
      // Add generation date
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 20, yPosition);
      yPosition += 20;

      // STATS GRID SECTION - Recreate the 3-card layout
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text('Financial Overview', 20, yPosition);
      yPosition += 15;

      // Calculate stats if not provided
      const calculatedStats = stats.totalExpenses !== undefined ? stats : calculateStatsFromData(data);

      // Draw stat cards in a grid layout
      const cardWidth = 55;
      const cardHeight = 25;
      const cardSpacing = 10;

      // Card 1: Total Expenses
      drawStatCard(doc, 20, yPosition, cardWidth, cardHeight, 
        'Total Expenses', 
        formatINR(calculatedStats.totalExpenses || 0),
        `${calculatedStats.categoryStats?.length || 0} categories`,
        [212, 175, 55] // Gold color
      );

      // Card 2: Average Daily
      drawStatCard(doc, 20 + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight,
        'Average Daily',
        formatINR(calculatedStats.avgDailyExpense || 0),
        'Per day average spending',
        [46, 139, 87] // Green color
      );

      // Card 3: Top Category
      const topCategory = calculatedStats.categoryStats?.length > 0 ? calculatedStats.categoryStats[0] : null;
      drawStatCard(doc, 20 + (cardWidth + cardSpacing) * 2, yPosition, cardWidth, cardHeight,
        'Top Category',
        topCategory ? topCategory._id : 'None',
        topCategory ? formatINR(topCategory.totalAmount) : 'No data yet',
        [139, 69, 19] // Orange color
      );

      yPosition += cardHeight + 20;

      // CHARTS SECTION - Visual representation
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text('Expense Analysis', 20, yPosition);
      yPosition += 15;

      // Expense Breakdown (Pie Chart representation)
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text('Expense Distribution by Category', 20, yPosition);
      yPosition += 10;

      if (calculatedStats.categoryStats && calculatedStats.categoryStats.length > 0) {
        // Create a visual representation of the pie chart
        drawCategoryBreakdown(doc, 20, yPosition, calculatedStats.categoryStats, calculatedStats.totalExpenses);
        yPosition += 40;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text('No expense data to visualize', 20, yPosition);
        yPosition += 20;
      }

      // Spending Timeline (Line Chart representation)
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text('Spending Timeline', 20, yPosition);
      yPosition += 10;

      if (calculatedStats.timelineStats && calculatedStats.timelineStats.length > 0) {
        drawSpendingTimeline(doc, 20, yPosition, calculatedStats.timelineStats);
        yPosition += 35;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text('No timeline data to show', 20, yPosition);
        yPosition += 20;
      }

      // BUDGET UTILIZATION SECTION - Stacked Progress Bar
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text('Budget Utilization', 20, yPosition);
      yPosition += 15;

      if (calculatedStats.categoryStats && calculatedStats.categoryStats.length > 0) {
        drawBudgetUtilization(doc, 20, yPosition, calculatedStats.categoryStats, calculatedStats.totalExpenses);
        yPosition += 25;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text('No budget data available', 20, yPosition);
        yPosition += 15;
      }

      // RECENT EXPENSES SECTION
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text('Recent Expenses', 20, yPosition);
      yPosition += 15;

      const expensesToShow = recentExpenses && recentExpenses.length > 0 ? recentExpenses : data.slice(0, 5);
      
      if (expensesToShow && expensesToShow.length > 0) {
        drawRecentExpenses(doc, 20, yPosition, expensesToShow);
      } else {
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text('No recent expenses to show', 20, yPosition);
      }

      // Generate filename with timestamp
      const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
      const fileName = `dashboard-report-${timestamp}.pdf`;
      
      // Save the PDF
      console.log('Saving dashboard PDF:', fileName);
      doc.save(fileName);
      
      toast.success('Dashboard PDF exported successfully!');
      
    } catch (error) {
      console.error('Dashboard PDF export error:', error);
      toast.error('Failed to export dashboard PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate stats from data if not provided
  const calculateStatsFromData = (expenses) => {
    if (!expenses || expenses.length === 0) {
      return {
        totalExpenses: 0,
        avgDailyExpense: 0,
        categoryStats: [],
        timelineStats: []
      };
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const uniqueDates = new Set(expenses.map(exp => new Date(exp.date).toDateString()));
    const avgDailyExpense = totalExpenses / Math.max(uniqueDates.size, 1);

    // Group by category
    const categoryMap = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
    });

    const categoryStats = Object.keys(categoryMap)
      .map(category => ({
        _id: category,
        totalAmount: categoryMap[category]
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Group by date for timeline
    const timelineMap = {};
    expenses.forEach(expense => {
      const dateStr = new Date(expense.date).toISOString().split('T')[0];
      timelineMap[dateStr] = (timelineMap[dateStr] || 0) + (expense.amount || 0);
    });

    const timelineStats = Object.keys(timelineMap)
      .map(date => ({
        _id: date,
        totalAmount: timelineMap[date]
      }))
      .sort((a, b) => new Date(a._id) - new Date(b._id));

    return {
      totalExpenses,
      avgDailyExpense,
      categoryStats,
      timelineStats
    };
  };

  // Helper function to draw stat cards
  const drawStatCard = (doc, x, y, width, height, title, value, subtitle, color) => {
    // Draw card background
    doc.setFillColor(248, 250, 252); // bg-slate-50
    doc.rect(x, y, width, height, 'F');
    
    // Draw border
    doc.setDrawColor(226, 232, 240); // border-slate-200
    doc.rect(x, y, width, height);

    // Draw icon circle
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x + 6, y + 8, 3, 'F');

    // Add title
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(title, x + 12, y + 6);

    // Add value
    doc.setFontSize(14);
    doc.setTextColor(46, 139, 87);
    doc.text(value, x + 12, y + 12);

    // Add subtitle
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(subtitle.substring(0, 25), x + 12, y + 17);
  };

  // Helper function to draw category breakdown
  const drawCategoryBreakdown = (doc, x, y, categoryStats, totalExpenses) => {
    const colors = [
      [212, 175, 55], // Gold
      [46, 139, 87],  // Green
      [141, 123, 142], // Mauve
      [28, 37, 65],   // Navy
      [160, 160, 160] // Gray
    ];

    categoryStats.slice(0, 5).forEach((category, index) => {
      const percentage = ((category.totalAmount / totalExpenses) * 100).toFixed(1);
      const color = colors[index % colors.length];
      
      // Draw color indicator
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y + (index * 6), 3, 3, 'F');
      
      // Add category info
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      doc.text(`${category._id}: ${formatINR(category.totalAmount)} (${percentage}%)`, x + 6, y + (index * 6) + 2);
    });
  };

  // Helper function to draw spending timeline
  const drawSpendingTimeline = (doc, x, y, timelineStats) => {
    if (timelineStats.length === 0) return;

    const chartWidth = 160;
    const chartHeight = 25;
    const maxAmount = Math.max(...timelineStats.map(item => item.totalAmount));
    
    // Draw chart background
    doc.setFillColor(248, 250, 252);
    doc.rect(x, y, chartWidth, chartHeight, 'F');
    
    // Draw border
    doc.setDrawColor(226, 232, 240);
    doc.rect(x, y, chartWidth, chartHeight);

    // Draw data points
    const pointSpacing = chartWidth / Math.max(timelineStats.length - 1, 1);
    
    timelineStats.forEach((item, index) => {
      const pointX = x + (index * pointSpacing);
      const pointHeight = (item.totalAmount / maxAmount) * (chartHeight - 4);
      const pointY = y + chartHeight - pointHeight - 2;
      
      // Draw bar
      doc.setFillColor(212, 175, 55);
      doc.rect(pointX, pointY, 2, pointHeight, 'F');
    });

    // Add amount labels
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Max: ${formatINR(maxAmount)}`, x + chartWidth - 30, y - 2);
  };

  // Helper function to draw budget utilization
  const drawBudgetUtilization = (doc, x, y, categoryStats, totalExpenses) => {
    const barWidth = 160;
    const barHeight = 8;
    const totalBudget = totalExpenses * 1.2; // 20% buffer

    // Draw background bar
    doc.setFillColor(243, 244, 246);
    doc.rect(x, y, barWidth, barHeight, 'F');

    // Draw category segments
    let currentX = x;
    const colors = [
      [212, 175, 55], [46, 139, 87], [141, 123, 142], [28, 37, 65], [160, 160, 160]
    ];

    categoryStats.forEach((category, index) => {
      const segmentWidth = (category.totalAmount / totalBudget) * barWidth;
      const color = colors[index % colors.length];
      
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(currentX, y, segmentWidth, barHeight, 'F');
      currentX += segmentWidth;
    });

    // Add labels
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(`${formatINR(totalExpenses)} of ${formatINR(totalBudget)} spent (${((totalExpenses / totalBudget) * 100).toFixed(1)}%)`, x, y + 15);
  };

  // Helper function to draw recent expenses
  const drawRecentExpenses = (doc, x, y, expenses) => {
    expenses.slice(0, 5).forEach((expense, index) => {
      const itemY = y + (index * 12);
      
      // Draw expense item background
      doc.setFillColor(244, 241, 235); // bg-[#F4F1EB]
      doc.rect(x, itemY, 170, 10, 'F');
      
      // Draw icon circle
      doc.setFillColor(212, 175, 55);
      doc.circle(x + 5, itemY + 5, 2, 'F');
      
      // Add expense details
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      doc.text(expense.title || 'N/A', x + 10, itemY + 4);
      
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(`${expense.category || 'N/A'} • ${format(new Date(expense.date), 'MMM dd, yyyy')}`, x + 10, itemY + 8);
      
      // Add amount
      doc.setFontSize(9);
      doc.setTextColor(46, 139, 87);
      doc.text(formatINR(expense.amount || 0), x + 130, itemY + 5);
    });
  };

  const defaultClass = 'flex items-center';
  const buttonClassName = className || defaultClass;

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={buttonClassName}
      title="Export dashboard as PDF"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
          Generating PDF...
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export PDF
        </>
      )}
    </button>
  );
};

export default ExportButton; 