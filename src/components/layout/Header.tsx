/* ============================================
   COMPONENTE: Header
   Descripción: Barra de navegación superior
   FiscalHost Inteligente CR
   ============================================ */

import { useState } from 'react';
import type { FC, KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { showToast, showConfirm } from '../../utils/alerts';
import './Header.css';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: FC<HeaderProps> = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const { logout } = useAuth();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'D-104 vence en 3 días', message: 'Genera tu borrador antes del vencimiento', time: '2h ago' },
    { id: 2, title: 'IVA Pendiente', message: 'Tienes ₡125,000 por pagar', time: '1d ago' },
  ]);

  let usuario: any = null;
  try {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  } catch {
    usuario = null;
  }

  const getInitials = (name?: string): string => {
    if (!name) return 'UF';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getBreadcrumbTitle = (pathname: string): string => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/ingresos': return 'Mis Ingresos';
      case '/impuestos': return 'Centro de Cálculo';
      case '/alertas': return 'Alertas & Calendario';
      case '/reportes': return 'Reportes Fiscales';
      case '/simulador': return 'Simulador de Escenarios';
      case '/comprobantes': return 'Comprobantes de Gastos';
      case '/autoliquidacion': return 'Autoliquidación de Sanciones';
      case '/mora': return 'Mora e Intereses';
      case '/help': return 'Guía Educativa';
      case '/configuracion': return 'Configuración';
      default: return 'FiscalHost CR';
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchTerm.trim();
      if (query) {
        showToast(`Búsqueda: "${query}"`, 'info');
      }
    }
  };

  const handleMarkAllRead = () => {
    if (notifications.length === 0) {
      showToast('No tiene notificaciones pendientes', 'info');
      return;
    }
    setNotifications([]);
    showToast('Todas las notificaciones han sido marcadas como leídas', 'success');
  };

  const handleLogoutClick = async () => {
    setShowProfile(false);
    const result = await showConfirm(
      '¿Cerrar Sesión?',
      '¿Está seguro de que desea salir del sistema tributario?',
      'Sí, salir'
    );
    if (result.isConfirmed) {
      logout();
    }
  };

  const displayName = usuario?.nombreCompleto || usuario?.nombre || 'Contribuyente';
  const displayEmail = usuario?.correoElectronico || usuario?.correo || 'usuario@fiscalhost.cr';
  const initials = getInitials(displayName);

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick} type="button" aria-label="Abrir menú">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-item">{getBreadcrumbTitle(location.pathname)}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <div className="header-actions">
          <button 
            className="header-action-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            type="button"
            title="Notificaciones"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {notifications.length > 0 && (
              <span className="header-action-badge">{notifications.length}</span>
            )}
          </button>

          <div className="header-profile">
            <button 
              className="header-action-btn"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              type="button"
              title="Perfil de usuario"
            >
              <div className="header-avatar">
                <span>{initials}</span>
              </div>
            </button>

            {showProfile && (
              <div className="header-dropdown">
                <div className="header-dropdown-header">
                  <span className="header-dropdown-name">{displayName}</span>
                  <span className="header-dropdown-email">{displayEmail}</span>
                </div>
                <div className="header-dropdown-divider" />
                <Link
                  to="/configuracion"
                  className="header-dropdown-item"
                  onClick={() => setShowProfile(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
                  </svg>
                  Configuración
                </Link>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="header-dropdown-item header-dropdown-item-danger" 
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="header-notifications">
          <div className="header-notifications-header">
            <span>Notificaciones</span>
            <button type="button" onClick={handleMarkAllRead}>
              Marcar todo como leído
            </button>
          </div>
          <div className="header-notifications-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                No hay notificaciones pendientes
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="header-notification-item">
                  <div className="header-notification-content">
                    <span className="header-notification-title">{notif.title}</span>
                    <span className="header-notification-message">{notif.message}</span>
                  </div>
                  <span className="header-notification-time">{notif.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;