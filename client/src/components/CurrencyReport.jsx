import React, { useState, useEffect } from 'react';
import api from '../utils/apiClient';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import CurrencySelector from './CurrencySelector';

const CurrencyReport = ({
  expenseData,
  incomeData,
  period = 'month',
  showIncomeExpenseComparison = true
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/currencies');
        setCurrencies(response.data.data);

        // Get user's currency preference
        const preferenceResponse = await api.get('/api/currencies/preference');
        setSelectedCurrency(preferenceResponse.data.data);
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
        setSelectedCurrency(usdCurrency);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Process data when currency or data changes
  useEffect(() => {
    if (selectedCurrency && (expenseData || incomeData)) {
      processReportData();
    }
  }, [selectedCurrency, expenseData, incomeData]);

  // Process and convert the data based on selected currency
  const processReportData = () => {
    // Skip if missing data
    if (!selectedCurrency) return;

    const baseCurrency = currencies.find(c => c.isBase) || { code: 'USD', rate: 1 };
    const conversionRate = selectedCurrency.rate / baseCurrency.rate;

    // Process expense data
    const processedExpenses = expenseData
      ? processFinancialData(expenseData, conversionRate)
      : [];

    // Process income data
    const processedIncome = incomeData
      ? processFinancialData(incomeData, conversionRate)
      : [];

    // Create comparison data if both datasets exist
    const comparison =
      showIncomeExpenseComparison &&
        expenseData &&
        incomeData
        ? createComparisonData(processedIncome, processedExpenses)
        : [];

    setReportData({
      expenses: processedExpenses,
      income: processedIncome,
      comparison
    });
  };

  // Process financial data with conversion
  const processFinancialData = (data, conversionRate) => {
    return data.map(item => {
      // Get the original amount in base currency
      const baseAmount = item.amountInBaseCurrency || item.amount;

      // Calculate amount in selected currency
      const convertedAmount = baseAmount / conversionRate;

      return {
        ...item,
        originalAmount: item.amount,
        convertedAmount
      };
    });
  };

  // Create data for income vs expense comparison
  const createComparisonData = (incomeData, expenseData) => {
    // Group and sum by time period (month, day, etc.)
    const incomeByPeriod = groupByTimePeriod(incomeData, period);
    const expensesByPeriod = groupByTimePeriod(expenseData, period);

    // Combine into a single dataset for comparison
    const timeKeys = new Set([
      ...Object.keys(incomeByPeriod),
      ...Object.keys(expensesByPeriod)
    ]);

    return Array.from(timeKeys).map(key => {
      const incomeAmount = incomeByPeriod[key] || 0;
      const expenseAmount = expensesByPeriod[key] || 0;

      return {
        period: key,
        income: incomeAmount,
        expenses: expenseAmount,
        net: incomeAmount - expenseAmount
      };
    }).sort((a, b) => {
      // Sort by period
      if (period === 'month') {
        // For months, convert to numbers (1-12)
        const months = {
          'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
          'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };
        return months[a.period] - months[b.period];
      } else if (period === 'day') {
        // For days, already numeric
        return parseInt(a.period.replace('Day ', '')) - parseInt(b.period.replace('Day ', ''));
      }

      return a.period.localeCompare(b.period);
    });
  };

  // Group and sum financial data by time period
  const groupByTimePeriod = (data, period) => {
    const result = {};

    data.forEach(item => {
      let key;

      if (period === 'month') {
        // Use month name
        const date = new Date(item.date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        key = months[date.getMonth()];
      } else if (period === 'day') {
        // Use day number
        const date = new Date(item.date);
        key = `Day ${date.getDate()}`;
      } else {
        // Default to ISO date
        key = new Date(item.date).toISOString().split('T')[0];
      }

      if (!result[key]) {
        result[key] = 0;
      }

      result[key] += item.convertedAmount;
    });

    return result;
  };

  // Handle currency change
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Currency selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Multi-Currency Report</h3>
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={handleCurrencyChange}
          setAsDefault={true}
        />
      </div>

      {reportData && (
        <div className="space-y-8">
          {/* Income and expense comparison */}
          {showIncomeExpenseComparison && reportData.comparison?.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">
                Income vs. Expenses ({selectedCurrency.code})
              </h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData.comparison}
                    margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `${selectedCurrency.symbol}${value.toFixed(2)}`,
                        value >= 0 ? 'Amount' : 'Deficit'
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="income"
                      name={`Income (${selectedCurrency.code})`}
                      fill="#4caf50"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      name={`Expenses (${selectedCurrency.code})`}
                      fill="#f44336"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Net chart */}
              <div className="h-72 mt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  Net Income ({selectedCurrency.code})
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reportData.comparison}
                    margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `${selectedCurrency.symbol}${value.toFixed(2)}`,
                        value >= 0 ? 'Profit' : 'Deficit'
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="net"
                      name={`Net Income (${selectedCurrency.code})`}
                      stroke="#2196f3"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Summary statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportData.income?.length > 0 && (
              <div className="card bg-green-50 p-4">
                <div className="text-sm text-green-600 font-medium">Total Income</div>
                <div className="mt-2 text-2xl font-bold text-green-900">
                  {selectedCurrency.symbol}
                  {reportData.income
                    .reduce((sum, item) => sum + item.convertedAmount, 0)
                    .toFixed(2)
                  }
                </div>
                <div className="text-xs text-green-500">
                  {period === 'month' ? 'This Month' : 'Period Total'}
                </div>
              </div>
            )}

            {reportData.expenses?.length > 0 && (
              <div className="card bg-red-50 p-4">
                <div className="text-sm text-red-600 font-medium">Total Expenses</div>
                <div className="mt-2 text-2xl font-bold text-red-900">
                  {selectedCurrency.symbol}
                  {reportData.expenses
                    .reduce((sum, item) => sum + item.convertedAmount, 0)
                    .toFixed(2)
                  }
                </div>
                <div className="text-xs text-red-500">
                  {period === 'month' ? 'This Month' : 'Period Total'}
                </div>
              </div>
            )}

            {reportData.income?.length > 0 && reportData.expenses?.length > 0 && (
              <div className="card bg-blue-50 p-4">
                <div className="text-sm text-blue-600 font-medium">Net Balance</div>
                <div className="mt-2 text-2xl font-bold text-blue-900">
                  {selectedCurrency.symbol}
                  {(
                    reportData.income.reduce((sum, item) => sum + item.convertedAmount, 0) -
                    reportData.expenses.reduce((sum, item) => sum + item.convertedAmount, 0)
                  ).toFixed(2)}
                </div>
                <div className="text-xs text-blue-500">
                  {period === 'month' ? 'This Month' : 'Period Net'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(!reportData ||
        (!reportData.income?.length && !reportData.expenses?.length)) && (
          <div className="text-center py-6 text-gray-500">
            No financial data available for this period.
          </div>
        )}
    </div>
  );
};

export default CurrencyReport; 