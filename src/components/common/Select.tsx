/* ============================================
   COMPONENTE: Select
   Descripción: Campo de selección desplegable
   ============================================ */

import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="select-container" ref={selectRef}>
      {label && <label className="select-label">{label}</label>}
      <div className="select-wrapper">
        <button
          type="button"
          className={`select-trigger ${isOpen ? 'select-open' : ''} ${error ? 'select-error' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={`select-value ${!selectedOption ? 'select-placeholder' : ''}`}>
            {selectedOption?.label || placeholder}
          </span>
          <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {isOpen && (
          <div className="select-dropdown">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`select-option ${option.value === value ? 'select-option-selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
};

export default Select;