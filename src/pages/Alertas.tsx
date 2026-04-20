/* ============================================
   PÁGINA: Alertas y Calendario Fiscal
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ChevronLeft, ChevronRight, Calendar, TriangleAlert, Eye, Info } from 'lucide-react';
import './Alertas.css';

const mockAlertas = [
  { id: 1, tipo: 'VENCIMIENTO', titulo: 'D-104 vence pronto', mensaje: 'El formulario D-104 vence el 15 de mayo. Genera tu borrador ahora.', prioridad: 'ALTA', fecha: '2026-05-15', accion: 'Generar Borrador' },
  { id: 2, tipo: 'SANCION', titulo: 'Riesgo de sanción (Art. 88)', mensaje: 'Si no declaras antes del vencimiento, se aplicará una multa base de ₡100,000.', prioridad: 'MEDIA', fecha: '2026-05-20', accion: 'Ver Detalle' },
  { id: 3, tipo: 'INFORMACION', titulo: 'IVA pendiente de pagar', mensaje: 'Tienes ₡26,000 en IVA pendiente del período abril 2026.', prioridad: 'BAJA', fecha: '2026-05-01', accion: 'Pagar Ahora' },
  { id: 4, tipo: 'REVISION', titulo: 'Clasificación pendiente', mensaje: '2 ingresos requieren revisión manual para correcta clasificación.', prioridad: 'MEDIA', fecha: null, accion: 'Revisar' },
];

const mockCalendario = [
  { dia: 1, mes: 'May', label: 'IVA', tipo: 'vencimiento' },
  { dia: 5, mes: 'May', label: 'Pago', tipo: 'recordatorio' },
  { dia: 15, mes: 'May', label: 'D-104', tipo: 'vencimiento' },
  { dia: 20, mes: 'May', label: 'D-125', tipo: 'vencimiento' },
  { dia: 1, mes: 'Jun', label: 'IVA', tipo: 'vencimiento' },
  { dia: 30, mes: 'Jun', label: 'Renta', tipo: 'vencimiento' },
];

export const Alertas: React.FC = () => {
  const [filtroPrioridad, setFiltroPrioridad] = useState('TODAS');

  const prioridades = ['TODAS', 'ALTA', 'MEDIA', 'BAJA'];
  const alertasFiltradas = filtroPrioridad === 'TODAS' 
    ? mockAlertas 
    : mockAlertas.filter(a => a.prioridad === filtroPrioridad);

  return (
    <div className="alertas-page">
      <div className="page-header">
        <div>
          <h1>Alertas y Calendario</h1>
          <p>Mantente al día con tus obligaciones fiscales</p>
        </div>
      </div>

      <div className="alertas-layout">
        <Card variant="outlined" padding="md" className="calendario-card">
          <h3>Calendario Fiscal</h3>
          <div className="calendario-header">
            <button className="calendario-nav">
              <ChevronLeft size={18} />
            </button>
            <span>Mayo 2026</span>
            <button className="calendario-nav">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="calendario-grid">
            <div className="calendario-days">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="calendario-dates">
              {[...Array(30)].map((_, i) => {
                const dia = i + 1;
                const evento = mockCalendario.find(c => c.dia === dia);
                return (
                  <div key={dia} className={`calendario-date ${evento ? `calendario-date-${evento.tipo}` : ''} ${dia === 15 ? 'active' : ''}`}>
                    <span>{dia}</span>
                    {evento && <span className="date-label">{evento.label}</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="calendario-legend">
            <span className="legend-item"><span className="legend-dot legend-dot-vencimiento" /> Venimiento</span>
            <span className="legend-item"><span className="legend-dot legend-dot-recordatorio" /> Recordatorio</span>
          </div>
        </Card>

        <Card variant="outlined" padding="md" className="alertas-card">
          <div className="alertas-header">
            <h3>Alertas Activas</h3>
            <div className="filtro-prioridad">
              {prioridades.map(p => (
                <button 
                  key={p}
                  className={`filtro-btn ${filtroPrioridad === p ? 'filtro-btn-active' : ''}`}
                  onClick={() => setFiltroPrioridad(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="alertas-list">
            {alertasFiltradas.map(alerta => (
              <div key={alerta.id} className={`alerta-item alerta-prioridad-${alerta.prioridad.toLowerCase()}`}>
                <div className="alerta-icon">
                  {alerta.tipo === 'VENCIMIENTO' && <Calendar size={20} />}
                  {alerta.tipo === 'SANCION' && <TriangleAlert size={20} />}
                  {alerta.tipo === 'REVISION' && <Eye size={20} />}
                  {alerta.tipo === 'INFORMACION' && <Info size={20} />}
                </div>
                <div className="alerta-content">
                  <div className="alerta-top">
                    <span className="alerta-titulo">{alerta.titulo}</span>
                    <Badge variant={
                      alerta.prioridad === 'ALTA' ? 'danger' :
                      alerta.prioridad === 'MEDIA' ? 'warning' : 'default'
                    } size="sm">
                      {alerta.prioridad}
                    </Badge>
                  </div>
                  <p className="alerta-mensaje">{alerta.mensaje}</p>
                  {alerta.fecha && <span className="alerta-fecha">Fecha límite: {alerta.fecha}</span>}
                </div>
                {alerta.accion && (
                  <Button variant="outline" size="sm">{alerta.accion}</Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Alertas;