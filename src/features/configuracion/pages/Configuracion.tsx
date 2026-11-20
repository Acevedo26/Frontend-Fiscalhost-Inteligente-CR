/* ============================================
   PÁGINA: Configuración — HU-002, HU-003, HU-013, HU-020
   ============================================ */

import React, { useState } from 'react';
import { User, Bell, Shield, ClipboardList } from 'lucide-react';
import './Configuracion.css';
import { useConfiguracion, useAuditoriaLogs, useActividades } from '../hooks/useConfiguracion';

import { PerfilTab } from '../components/PerfilTab';
import { NotificacionesTab } from '../components/NotificacionesTab';
import { SeguridadTab } from '../components/SeguridadTab';
import { AuditoriaTab } from '../components/AuditoriaTab';

const USER_ROLE: 'admin' | 'viewer' = 'admin';

export const Configuracion: React.FC = () => {
  const [activeSection, setActiveSection] = useState('perfil');

  // Cargar cada recurso solo cuando su sección está visible para evitar que una
  // configuración tributaria aún inexistente bloquee la bitácora de auditoría.
  const isPerfilActivo = activeSection === 'perfil';
  const { data: configuracionData } = useConfiguracion(isPerfilActivo);
  const { data: logsData } = useAuditoriaLogs(activeSection === 'auditoria');
  const { data: actividadesData } = useActividades(isPerfilActivo);

  const ACTIVIDADES = actividadesData ?? [];
  const logsToDisplay = logsData ?? [];

  const sections = [
    { id: 'perfil', label: 'Perfil Tributario', icon: <User size={18} /> },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell size={18} /> },
    { id: 'seguridad', label: 'Seguridad', icon: <Shield size={18} /> },
    { id: 'auditoria', label: 'Log de Auditoría', icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className="configuracion-page">
      <div className="page-header">
        <div><h1>Configuración</h1><p>Gestiona tu perfil y preferencias</p></div>
      </div>

      <div className="config-layout">
        <div className="config-sidebar">
          {sections.map(s => (
            <button key={s.id} className={`config-section-btn ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}>
              <span className="section-icon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="config-content">
          {activeSection === 'perfil' && <PerfilTab configuracionData={configuracionData} ACTIVIDADES={ACTIVIDADES} />}
          {activeSection === 'notificaciones' && <NotificacionesTab />}
          {activeSection === 'seguridad' && <SeguridadTab />}
          {activeSection === 'auditoria' && <AuditoriaTab logsToDisplay={logsToDisplay} USER_ROLE={USER_ROLE} />}
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
