import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get('/api/currencies');
        setCurrencies(response.data.data);
        
        // Get user's currency preference
        const preferenceResponse = await axios.get('/api/currencies/preference');
        setUserPreference(preferenceResponse.data.data);
        
        // If no currency is selected and we have user preference, use it
        if (!selectedCurrency && preferenceResponse.data.data) {
          onCurrencyChange(preferenceResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
        toast.error('Failed to load currencies. Using default USD.');
        
        // Fallback to USD
        const usdCurrency = {
          code: 'USD',
          symbol: '$',
          rate: 1
        };
        setCurrencies([usdCurrency]);
        onCurrencyChange(usdCurrency);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Handle currency change
  const handleCurrencyChange = async (e) => {
    const currencyCode = e.target.value;
    const selectedCurrency = currencies.find(c => c.code === currencyCode);
    
    if (selectedCurrency) {
      onCurrencyChange(selectedCurrency);
      
      // If setAsDefault is true, update user preference
      if (setAsDefault) {
        try {
          await axios.put('/api/currencies/preference', { currencyCode });
          toast.success(`${currencyCode} set as your default currency`);
          setUserPreference(selectedCurrency);
        } catch (error) {
          console.error('Error setting currency preference:', error);
          toast.error('Failed to update currency preference');
        }
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

  return (
    <div className={`flex items-center ${className}`}>
      {showLabel && (
        <label htmlFor="currency" className="mr-2 text-sm font-medium text-gray-700">
          Currency:
        </label>
      )}
      <select
        id="currency"
        value={selectedCurrency?.code || (userPreference ? userPreference.code : '')}
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
              await axios.put('/api/currencies/preference', { currencyCode: selectedCurrency.code });
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