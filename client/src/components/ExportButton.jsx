import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const ExportButton = ({ filters = {}, className = '' }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Build query parameters based on filters
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'All') {
        params.append('category', filters.category);
      }
      
      if (filters.startDate) {
        params.append('startDate', new Date(filters.startDate).toISOString());
      }
      
      if (filters.endDate) {
        params.append('endDate', new Date(filters.endDate).toISOString());
      }

      const paramsString = params.toString() ? `?${params.toString()}` : '';
      
      // Make API request with proper headers for file download
      const response = await axios.get(`/api/expenses/export${paramsString}`, {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Expenses exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`flex items-center ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
          Exporting...
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export CSV
        </>
      )}
    </button>
  );
};

export default ExportButton; 