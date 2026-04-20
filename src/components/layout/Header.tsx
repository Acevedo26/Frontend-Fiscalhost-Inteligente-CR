/* ============================================
   COMPONENTE: Header
   Descripción: Barra de navegación superior
   ============================================ */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, title: 'D-104 vence en 3 días', message: 'Genera tu borrador antes del vencimiento', time: '2h ago' },
    { id: 2, title: 'IVA Pendiente', message: 'Tienes ₡125,000 por pagar', time: '1d ago' },
  ];

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-item">Dashboard</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Buscar..." />
        </div>

        <div className="header-actions">
          <button 
            className="header-action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="header-action-badge">2</span>
          </button>

          <div className="header-profile">
            <button 
              className="header-action-btn"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="header-avatar">
                <span>LF</span>
              </div>
            </button>

            {showProfile && (
              <div className="header-dropdown">
                <div className="header-dropdown-header">
                  <span className="header-dropdown-name">Lisbeth Fallas</span>
                  <span className="header-dropdown-email">lisbeth@email.com</span>
                </div>
                <div className="header-dropdown-divider" />
                <Link to="/configuracion" className="header-dropdown-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
                  </svg>
                  Configuración
                </Link>
                <Link to="/login" className="header-dropdown-item header-dropdown-item-danger">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Cerrar Sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="header-notifications">
          <div className="header-notifications-header">
            <span>Notificaciones</span>
            <button>Marcar todo como leído</button>
          </div>
          <div className="header-notifications-list">
            {notifications.map((notif) => (
              <div key={notif.id} className="header-notification-item">
                <div className="header-notification-content">
                  <span className="header-notification-title">{notif.title}</span>
                  <span className="header-notification-message">{notif.message}</span>
                </div>
                <span className="header-notification-time">{notif.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;