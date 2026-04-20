/* ============================================
   COMPONENTE: Badge
   Descripción: Etiqueta estados
   ============================================ */

import React from 'react';
import './Badge.css';

interface BadgeProps {
  /** Variante de color */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Tamaño */
  size?: 'sm' | 'md';
  /** children */
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}) => {
  const classes = ['badge', `badge-${variant}`, `badge-${size}`, className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};

export default Badge;