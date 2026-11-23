/* ============================================
   PÁGINA: Alertas y Calendario Fiscal
   ============================================ */

import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { ChevronLeft, ChevronRight, Calendar, TriangleAlert, Info, Check } from 'lucide-react';
import './Alertas.css';
import { useAlertas } from '../hooks/useAlertas';
import type { AlertaDto } from '../types/alertas';


export const Alertas: React.FC = () => {
  const [filtroPrioridad, setFiltroPrioridad] = useState('TODAS');
  const [mesCalendario, setMesCalendario] = useState(() => {
    const hoy = new Date();
    return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 };
  });

  const { alertas, isLoading, marcarLeida, isMarkingLeida } = useAlertas();
  const prioridades = ['TODAS', 'ALTA', 'MEDIA', 'BAJA'];
  const prioridadMap: Record<number, string> = { 1: 'ALTA', 2: 'MEDIA', 3: 'BAJA' };
  
  const getPrioridadString = (prioridad: number) => prioridadMap[prioridad] || 'BAJA';

  const alertasFiltradas = filtroPrioridad === 'TODAS' 
    ? alertas 
    : alertas.filter((a: AlertaDto) => getPrioridadString(a.prioridad) === filtroPrioridad);

  // --- Calendar logic ---
  const { anio, mes } = mesCalendario;
  const primerDiaMes = new Date(anio, mes - 1, 1);
  const ultimoDiaMes = new Date(anio, mes, 0);
  const diasEnMes = ultimoDiaMes.getDate();
  // getDay: 0=Dom, 1=Lun...6=Sab. Queremos 0=Lun...6=Dom
  const offsetPrimerDia = (primerDiaMes.getDay() + 6) % 7;
  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() + 1 === mes;

  // Build alerts map by date for quick lookup
  const alertasPorFecha = useMemo(() => {
    const map: Record<string, AlertaDto[]> = {};
    alertas.forEach(a => {
      if (a.fechaProgramada) {
        const fecha = new Date(a.fechaProgramada).toISOString().split('T')[0];
        if (!map[fecha]) map[fecha] = [];
        map[fecha].push(a);
      }
    });
    return map;
  }, [alertas]);

  const renderCalendario = () => {
    const celdas: React.ReactNode[] = [];
    // Empty cells before 1st day
    for (let i = 0; i < offsetPrimerDia; i++) {
      celdas.push(<div key={`empty-${i}`} className="calendario-date empty" />);
    }
    // Days of month
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaISO = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const alertasDelDia = alertasPorFecha[fechaISO] || [];
      const tieneVencimiento = alertasDelDia.some(a => a.tipoAlerta === 1);
      const tieneRecordatorio = alertasDelDia.some(a => a.tipoAlerta === 2);
      const esHoy = esMesActual && dia === hoy.getDate();

      celdas.push(
        <div
          key={dia}
          className={`calendario-date ${esHoy ? 'hoy' : ''} ${tieneVencimiento ? 'tiene-vencimiento' : ''} ${tieneRecordatorio ? 'tiene-recordatorio' : ''}`}
          title={alertasDelDia.length > 0 ? alertasDelDia.map(a => a.titulo).join('\n') : undefined}
        >
          <span>{dia}</span>
          {tieneVencimiento && <span className="date-dot date-dot-vencimiento" />}
          {tieneRecordatorio && <span className="date-dot date-dot-recordatorio" />}
        </div>
      );
    }
    return celdas;
  };

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
            <button className="calendario-nav" onClick={() => setMesCalendario(p => ({ ...p, mes: p.mes - 1 || 12, anio: p.mes === 1 ? p.anio - 1 : p.anio }))}>
              <ChevronLeft size={18} />
            </button>
            <span>{new Date(anio, mes - 1).toLocaleDateString('es-CR', { month: 'long', year: 'numeric' })}</span>
            <button className="calendario-nav" onClick={() => setMesCalendario(p => ({ ...p, mes: p.mes + 1 > 12 ? 1 : p.mes + 1, anio: p.mes === 12 ? p.anio + 1 : p.anio }))}>
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
              {renderCalendario()}
            </div>
          </div>
          <div className="calendario-legend">
            <span className="legend-item"><span className="legend-dot legend-dot-vencimiento" /> Vencimiento</span>
            <span className="legend-item"><span className="legend-dot legend-dot-recordatorio" /> Recordatorio</span>
            <span className="legend-item"><span className="legend-dot legend-dot-hoy" /> Hoy</span>
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
