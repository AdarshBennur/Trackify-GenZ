import React from 'react';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon, CalendarIcon, TagIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { formatINR } from '../utils/currency';

const ExpenseTable = ({ expenses, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37] mx-auto"></div>
        <p className="mt-4 text-[#A0A0A0]">Loading expenses...</p>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#A0A0A0]">No expenses found. Start adding your expenses to track them.</p>
      </div>
    );
  }

  // Mobile card view component
  const MobileExpenseCard = ({ expense }) => (
    <div className="bg-[#F8F6F0] rounded-lg shadow-luxe p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-900 truncate max-w-[200px]">{expense.title}</h3>
        <span className="font-medium text-[#2E8B57]">{formatINR(parseFloat(expense.amount))}</span>
      </div>
      
      {expense.notes && (
        <p className="text-[#A0A0A0] text-sm mb-3 truncate">{expense.notes}</p>
      )}
      
      <div className="flex flex-wrap gap-y-2 mb-3">
        <div className="flex items-center w-1/2">
          <TagIcon className="h-4 w-4 text-[#D4AF37] mr-2" />
          <span className="text-sm text-[#A0A0A0]">{expense.category}</span>
        </div>
        <div className="flex items-center w-1/2">
          <CalendarIcon className="h-4 w-4 text-[#D4AF37] mr-2" />
          <span className="text-sm text-[#A0A0A0]">{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-2 pt-2 border-t border-[#F4F1EB]">
        <button
          onClick={() => onEdit(expense)}
          className="text-[#2E8B57] hover:text-[#207346] focus:outline-none p-1"
          title="Edit"
        >
          <PencilIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          onClick={() => onDelete(expense._id)}
          className="text-danger-600 hover:text-danger-900 focus:outline-none p-1"
          title="Delete"
        >
          <TrashIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile View (Card Layout) */}
      <div className="block md:hidden">
        {expenses.map((expense) => (
          <MobileExpenseCard key={expense._id} expense={expense} />
        ))}
      </div>
      
      {/* Desktop/Tablet View (Table Layout) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-[#F4F1EB] table-fixed">
          <thead className="bg-[#F4F1EB] bg-opacity-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider w-4/12">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider w-2/12">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider w-2/12">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#A0A0A0] uppercase tracking-wider w-2/12">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#A0A0A0] uppercase tracking-wider w-2/12">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#F4F1EB]">
            {expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-[#F8F6F0] transition-colors duration-150">
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium text-gray-900 truncate max-w-[250px]">{expense.title}</div>
                  {expense.notes && (
                    <div className="text-[#A0A0A0] truncate max-w-[250px] mt-1">{expense.notes}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0A0]">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4F1EB] text-[#2E8B57]">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0A0]">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[#2E8B57]">
                  {formatINR(parseFloat(expense.amount))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-[#2E8B57] hover:text-[#207346] focus:outline-none"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onDelete(expense._id)}
                      className="text-danger-600 hover:text-danger-900 focus:outline-none"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ExpenseTable; 