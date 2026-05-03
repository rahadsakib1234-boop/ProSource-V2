/**
 * Currency Page
 * Exchange rates and currency conversion
 */

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { convert, formatCurrency } from '@/services/currency';

const CURRENCIES = ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'PKR', 'CNY', 'JPY'];

export default function Currency() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BDT');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const converted = convert(parseFloat(amount), fromCurrency, toCurrency);
      setResult(converted);
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Currency Converter</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time exchange rates and conversions</p>
        </div>

        {/* Converter Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* From Currency */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">From</label>
              <div className="space-y-2">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwapCurrencies}
                className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                title="Swap currencies"
              >
                ⇄
              </button>
            </div>

            {/* To Currency */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">To</label>
              <div className="space-y-2">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
                <div className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/50 text-foreground font-mono font-bold">
                  {result !== null ? result.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Result Display */}
          {result !== null && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-muted-foreground text-sm">
                {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
              </p>
            </div>
          )}
        </div>

        {/* Quick Conversions */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Common Conversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { from: 'USD', to: 'BDT', amount: 1 },
              { from: 'EUR', to: 'BDT', amount: 1 },
              { from: 'GBP', to: 'BDT', amount: 1 },
              { from: 'INR', to: 'BDT', amount: 100 },
              { from: 'PKR', to: 'BDT', amount: 100 },
              { from: 'CNY', to: 'BDT', amount: 10 },
            ].map((conv) => {
              const result = convert(conv.amount, conv.from, conv.to);
              return (
                <div key={`${conv.from}-${conv.to}`} className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {conv.amount} {conv.from} to {conv.to}
                  </p>
                  <p className="text-lg font-bold text-foreground font-mono">
                    {result.toFixed(2)} {conv.to}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exchange Rates Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Exchange Rates</h3>
          <p className="text-sm text-blue-800">
            Exchange rates are updated daily from reliable sources. Rates may vary slightly from your bank's rates.
            For financial transactions, always verify with your bank.
          </p>
        </div>
      </div>
    </Layout>
  );
}
