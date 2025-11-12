'use client';

import { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  required?: boolean;
  className?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  label,
  required = false,
  className = '',
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(value > 0 ? formatCurrency(value) : '');
  }, [value]);

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const parseCurrency = (str: string): number => {
    // Remove tudo exceto números
    const numbers = str.replace(/\D/g, '');
    if (!numbers) return 0;
    // Divide por 100 para converter centavos em reais
    return parseFloat(numbers) / 100;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrency(inputValue);
    
    if (numericValue >= 0) {
      onChange(numericValue);
      if (numericValue > 0) {
        setDisplayValue(formatCurrency(numericValue));
      } else {
        setDisplayValue('');
      }
    }
  };

  const handleBlur = () => {
    if (value > 0) {
      setDisplayValue(formatCurrency(value));
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="R$ 0,00"
        required={required}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );
}

