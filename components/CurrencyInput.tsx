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
  const [displayValue, setDisplayValue] = useState(() => (value > 0 ? String(value) : ''));

  useEffect(() => {
    setDisplayValue(value > 0 ? String(value) : '');
  }, [value]);

  const parseValue = (str: string): number => {
    const cleaned = str.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
    if (cleaned === '' || cleaned === '-' || cleaned === ',') {
      return 0;
    }
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    const numericValue = parseValue(inputValue);
    if (!Number.isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    if (value > 0) {
      setDisplayValue(value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }));
    } else {
      setDisplayValue('');
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
          R$
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0"
          required={required}
          className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

