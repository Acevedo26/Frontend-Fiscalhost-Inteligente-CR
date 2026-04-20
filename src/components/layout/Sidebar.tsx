/* ============================================
   COMPONENTE: Sidebar
   Descripción: Navegación lateral de la aplicación
   ============================================ */

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Calculator, Bell, FileText, Settings, ChevronRight, ChevronLeft, FlaskConical, BookOpen, Receipt, AlertOctagon, TrendingDown } from 'lucide-react';
import './Sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
 badge?: number;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'ingresos', label: 'Mis Ingresos', icon: <DollarSign size={20} />, path: '/ingresos' },
  { id: 'impuestos', label: 'Centro de Cálculo', icon: <Calculator size={20} />, path: '/impuestos' },
  { id: 'alertas', label: 'Alertas', icon: <Bell size={20} />, path: '/alertas', badge: 2 },
  { id: 'reportes', label: 'Reportes', icon: <FileText size={20} />, path: '/reportes' },
  { id: 'simulador', label: 'Simulador', icon: <FlaskConical size={20} />, path: '/simulador' },
  { id: 'comprobantes', label: 'Comprobantes', icon: <Receipt size={20} />, path: '/comprobantes' },
  { id: 'autoliquidacion', label: 'Autoliquidación', icon: <AlertOctagon size={20} />, path: '/autoliquidacion' },
  { id: 'mora', label: 'Mora e Intereses', icon: <TrendingDown size={20} />, path: '/mora' },
  { id: 'help', label: 'Guía Educativa', icon: <BookOpen size={20} />, path: '/help' },
  { id: 'configuracion', label: 'Configuración', icon: <Settings size={20} />, path: '/configuracion' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path d="M8 22V10l8 6-8 6z" fill="var(--color-background)" />
                <path d="M16 22V10l8 6-8 6z" fill="var(--color-accent)" />
              </svg>
            </div>
            {!collapsed && <span className="sidebar-logo-text">FiscalHost</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="sidebar-link-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-link-badge">{item.badge}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                <span>LF</span>
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">Lisbeth Fallas</span>
                <span className="sidebar-user-email">lisbeth@email.com</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;