import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/apiClient';

const CurrencySelector = ({
  selectedCurrency,
  onCurrencyChange,
  setAsDefault = false,
  showLabel = true,
  className = ''
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPreference, setUserPreference] = useState(null);

  // Default INR currency as fallback
  const defaultCurrency = {
    code: 'INR',
    symbol: '₹',
    rate: 1
  };

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await api.get('/currencies');
        setCurrencies(response.data.data || []);

        // Get user's currency preference - but we'll still default to INR
        try {
          const preferenceResponse = await api.get('/currencies/preference');
          setUserPreference(preferenceResponse.data.data);
        } catch (prefError) {
          console.error('Error getting currency preference:', prefError);
        }

        // Use INR by default regardless of user preference
        const inrCurrency = response.data.data?.find(c => c.code === 'INR') || defaultCurrency;
        onCurrencyChange(inrCurrency);

      } catch (error) {
        console.error('Error fetching currencies:', error);
        toast.error('Failed to load currencies. Using default INR.');

        // Fallback to INR
        setCurrencies([defaultCurrency]);

        // Always use INR
        onCurrencyChange(defaultCurrency);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Handle currency change
  const handleCurrencyChange = async (e) => {
    const currencyCode = e.target.value;
    const selectedCurrency = currencies.find(c => c.code === currencyCode) || defaultCurrency;

    onCurrencyChange(selectedCurrency);

    // If setAsDefault is true, update user preference
    if (setAsDefault) {
      try {
        await api.put('/currencies/preference', { currencyCode });
        toast.success(`${currencyCode} set as your default currency`);
        setUserPreference(selectedCurrency);
      } catch (error) {
        console.error('Error setting currency preference:', error);
        toast.error('Failed to update currency preference');
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    );
  }

  // Ensure we have at least one currency
  if (currencies.length === 0) {
    setCurrencies([defaultCurrency]);
    if (!selectedCurrency) {
      onCurrencyChange(defaultCurrency);
    }
  }

  // Find INR in the currencies list
  const inrCurrency = currencies.find(c => c.code === 'INR');
  const displayValue = inrCurrency ? inrCurrency.code : (selectedCurrency?.code || defaultCurrency.code);

  return (
    <div className={`flex items-center ${className}`}>
      {showLabel && (
        <label htmlFor="currency" className="mr-2 text-sm font-medium text-gray-700">
          Currency:
        </label>
      )}
      <select
        id="currency"
        value={displayValue}
        onChange={handleCurrencyChange}
        className="form-select text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
        {currencies.map(currency => (
          <option key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol})
          </option>
        ))}
      </select>

      {setAsDefault && userPreference && selectedCurrency?.code !== userPreference.code && (
        <button
          onClick={async () => {
            try {
              await api.put('/currencies/preference', { currencyCode: selectedCurrency.code });
              toast.success(`${selectedCurrency.code} set as your default currency`);
              setUserPreference(selectedCurrency);
            } catch (error) {
              console.error('Error setting currency preference:', error);
              toast.error('Failed to update currency preference');
            }
          }}
          className="ml-2 text-xs text-primary-600 hover:text-primary-800"
        >
          Set as default
        </button>
      )}
    </div>
  );
};

export default CurrencySelector; 