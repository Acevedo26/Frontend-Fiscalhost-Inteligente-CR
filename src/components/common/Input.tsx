/* ============================================
   COMPONENTE: Input
   Descripción: Campo de entrada de texto con validación y estados
   ============================================ */

import React, { forwardRef, useState } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Etiqueta del campo */
  label?: string;
  /** Mensaje de ayuda */
  helperText?: string;
  /** Mensaje de error */
  error?: string;
  /** Icono a la izquierda */
  leftIcon?: React.ReactNode;
  /** Icono a la derecha */
  rightIcon?: React.ReactNode;
  /** Si es un campo de contraseña */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const containerClasses = [
    'input-container',
    error && 'input-error',
    focused && 'input-focused',
    leftIcon && 'input-has-left-icon',
    rightIcon && 'input-has-right-icon',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className="input-field"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
      </div>
      {(helperText || error) && (
        <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;