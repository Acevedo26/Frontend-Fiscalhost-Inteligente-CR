/* ============================================
   COMPONENTE: Layout
   Descripción: Contenedor principal de la aplicación
   FiscalHost Inteligente CR
   ============================================ */

import { useState } from 'react';
import type { FC } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FisCal } from '../common/FisCal';
import './Layout.css';

export const Layout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <FisCal />
    </div>
  );
};

export default Layout;