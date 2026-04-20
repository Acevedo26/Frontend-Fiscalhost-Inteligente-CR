/* ============================================
   COMPONENTE: Card
   Descripción: Tarjeta contenedor con variantes y efectos
   ============================================ */

import React from 'react';
import './Card.css';

interface CardProps {
  /** Variante de la tarjeta */
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  /** Si la tarjeta tiene padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** children es obligatorio */
  children: React.ReactNode;
  /** Clases adicionales */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  onClick,
}) => {
  const classes = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    onClick && 'card-clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;