/* ============================================
   PÁGINA: Alertas y Calendario Fiscal
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { ChevronLeft, ChevronRight, Calendar, TriangleAlert, Info, Check } from 'lucide-react';
import './Alertas.css';
import { useAlertas } from '../hooks/useAlertas';
import type { AlertaDto } from '../types/alertas';


export const Alertas: React.FC = () => {
  const [filtroPrioridad, setFiltroPrioridad] = useState('TODAS');

  const { alertas, isLoading, marcarLeida, isMarkingLeida } = useAlertas();
  const prioridades = ['TODAS', 'ALTA', 'MEDIA', 'BAJA'];
    // Map the numeric priority from DTO to string if needed, but our DB has Prioridad = 1, 2, 3
  // Assuming: 1 = ALTA, 2 = MEDIA, 3 = BAJA
  const prioridadMap: Record<number, string> = { 1: 'ALTA', 2: 'MEDIA', 3: 'BAJA' };
  
  const getPrioridadString = (prioridad: number) => prioridadMap[prioridad] || 'BAJA';

  const alertasFiltradas = filtroPrioridad === 'TODAS' 
    ? alertas 
    : alertas.filter((a: AlertaDto) => getPrioridadString(a.prioridad) === filtroPrioridad);

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
                return (
                  <div key={dia} className={`calendario-date ${dia === 15 ? 'active' : ''}`}>
                    <span>{dia}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="calendario-legend">
            <span className="legend-item"><span className="legend-dot legend-dot-vencimiento" /> Vencimiento</span>
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
            {isLoading && <p className="p-4 text-center">Cargando alertas...</p>}
            {!isLoading && alertasFiltradas.length === 0 && <p className="p-4 text-center">No hay alertas activas.</p>}
            {alertasFiltradas.map((a: AlertaDto) => {
              const prio = getPrioridadString(a.prioridad);
              
              return (
                <div key={a.alertaId} className={`alerta-item alerta-prioridad-${prio.toLowerCase()} ${a.fechaLectura ? 'alerta-leida' : ''}`}>
                  <div className="alerta-icon">
                    {a.tipoAlerta === 1 && <Calendar size={20} />}
                    {a.tipoAlerta === 2 && <TriangleAlert size={20} />}
                    {a.tipoAlerta !== 1 && a.tipoAlerta !== 2 && <Info size={20} />}
                  </div>
                       <div className="alerta-content">
                    <div className="alerta-top">
                      <span className="alerta-titulo" style={a.fechaLectura ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>
                        {a.titulo}
                      </span>
                      <Badge variant={
                        prio === 'ALTA' ? 'danger' :
                        prio === 'MEDIA' ? 'warning' : 'default'
                      } size="sm">
                        {prio}
                      </Badge>
                    </div>
                    <p className="alerta-mensaje" style={a.fechaLectura ? { opacity: 0.6 } : {}}>{a.mensaje}</p>
                    {a.fechaProgramada && (
                      <span className="alerta-fecha">Vence: {new Date(a.fechaProgramada).toLocaleDateString('es-CR')}</span>
                    )}
                  </div>
                  {!a.fechaLectura && (
                    <Button variant="outline" size="sm" onClick={() => marcarLeida(a.alertaId)} disabled={isMarkingLeida}>
                      <Check size={16} /> Marcar Leída
                    </Button>
                  )}
              </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Alertas;
