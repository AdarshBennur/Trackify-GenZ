import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ type, onAddNew }) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No {type} yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating your first {type.toLowerCase()}.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2E8B57] hover:bg-[#246B42] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add {type}
        </button>
      </div>
    </div>
  );
};

export default EmptyState; 