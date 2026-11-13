import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { Info } from 'lucide-react';
import { showSuccess, showWarning } from '../../../utils/alerts';
import { ConfiguracionService } from '../services/ConfiguracionService';

export const NotificacionesTab: React.FC = () => {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifApp, setNotifApp] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [frecuencia, setFrecuencia] = useState('REAL');
  const [isSaving, setIsSaving] = useState(false);

  const handleGuardarPreferencias = async () => {
    if (!notifEmail && !notifApp && !notifSMS) {
      showWarning('Canal Requerido', 'Debe seleccionar al menos un canal activo para recibir notificaciones fiscales.');
      return;
    }

    let canal: 'CORREO' | 'PLATAFORMA' | 'AMBOS' = 'AMBOS';
    if (notifEmail && !notifApp) canal = 'CORREO';
    else if (!notifEmail && notifApp) canal = 'PLATAFORMA';
    else canal = 'AMBOS';

    setIsSaving(true);
    try {
      await ConfiguracionService.guardarPreferenciasNotificacion(canal);
    } catch {
      // Handled by global Axios interceptor
    } finally {
      setIsSaving(false);
    }

    showSuccess(
      'Preferencias Guardadas',
      'Tus preferencias de notificación fueron guardadas exitosamente en el servidor.'
    );
  };

  return (
    <Card variant="outlined" padding="md">
      <h3>Preferencias de Notificaciones</h3>
      <div className="notifications-options">
        {[
          { label: 'Notificaciones por Email', desc: 'Alertas y recordatorios por correo', value: notifEmail, set: setNotifEmail },
          { label: 'Notificaciones in-app', desc: 'Notificaciones dentro de la aplicación', value: notifApp, set: setNotifApp },
          { label: 'Notificaciones por SMS', desc: 'Mensajes de texto para alertas urgentes', value: notifSMS, set: setNotifSMS },
        ].map(opt => (
          <div key={opt.label} className="notification-option">
            <div className="option-info">
              <span className="option-label">{opt.label}</span>
              <span className="option-desc">{opt.desc}</span>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={opt.value} onChange={e => opt.set(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
        <div className="notification-option">
          <div className="option-info">
            <span className="option-label">Frecuencia de Alertas</span>
            <span className="option-desc">¿Con qué frecuencia quieres recibir alertas?</span>
          </div>
          <Select options={[{ label: 'Tiempo Real', value: 'REAL' }, { label: 'Diaria', value: 'DIARIA' }, { label: 'Semanal', value: 'SEMANAL' }]}
            value={frecuencia} onChange={setFrecuencia} />
        </div>
      </div>
      <div className="notif-resumen">
        <Info size={14} />
        <span>Canales activos: {[notifEmail && 'Email', notifApp && 'In-app', notifSMS && 'SMS'].filter(Boolean).join(', ') || 'Ninguno'}</span>
      </div>
      <div className="form-actions">
        <Button variant="primary" onClick={handleGuardarPreferencias} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
        </Button>
      </div>
    </Card>
  );
};

