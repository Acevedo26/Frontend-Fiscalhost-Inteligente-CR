/* ============================================
   PÁGINA: Mora e Intereses
   Descripción: Cálculo de mora e intereses acumulados (HU-012)
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AlertTriangle, Download, Clock, Eye } from 'lucide-react';
import './Mora.css';

interface ObligacionVencida {
  id: number;
  formulario: string;
  periodo: string;
  capital: number;
  fechaVencimiento: string | null;
  tasaMensual: number;
}

const mockObligaciones: ObligacionVencida[] = [
  { id: 1, formulario: 'D-104', periodo: 'Febrero 2026', capital: 85000, fechaVencimiento: '2026-03-15', tasaMensual: 0.018 },
  { id: 2, formulario: 'D-104', periodo: 'Enero 2026', capital: 62000, fechaVencimiento: '2026-02-15', tasaMensual: 0.018 },
  { id: 3, formulario: 'D-125', periodo: '2025', capital: 296138, fechaVencimiento: null, tasaMensual: 0.018 },
];

const calcularMesesVencidos = (fechaVenc: string, corte: string): number => {
  const d = new Date(fechaVenc);
  const c = new Date(corte);
  if (c <= d) return 0;
  return Math.max(0, (c.getFullYear() - d.getFullYear()) * 12 + (c.getMonth() - d.getMonth()));
};

const calcularDiasVencidos = (fechaVenc: string, corte: string): number => {
  const d = new Date(fechaVenc);
  const c = new Date(corte);
  return Math.max(0, Math.floor((c.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
};

export const Mora: React.FC = () => {
  const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split('T')[0]);
  const [selectedObligacion, setSelectedObligacion] = useState<ObligacionVencida | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);

  const getIntereses = (ob: ObligacionVencida) => {
    if (!ob.fechaVencimiento) return 0;
    const meses = calcularMesesVencidos(ob.fechaVencimiento, fechaCorte);
    return ob.capital * ob.tasaMensual * meses;
  };

  const getTotal = (ob: ObligacionVencida) => ob.capital + getIntereses(ob);

  const totalDeuda = mockObligaciones
    .filter(o => o.fechaVencimiento)
    .reduce((sum, o) => sum + getTotal(o), 0);

  return (
    <div className="mora-page">
      <div className="page-header">
        <div>
          <h1>Mora e Intereses</h1>
          <p>Consulta tus obligaciones vencidas y el cálculo de intereses acumulados</p>
        </div>
        <div className="corte-selector">
          <label>Fecha de corte</label>
          <input
            type="date"
            value={fechaCorte}
            onChange={e => setFechaCorte(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {/* Resumen total */}
      <div className="mora-resumen">
        <Card variant="elevated" padding="md">
          <div className="resumen-item">
            <span className="resumen-label">Total deuda acumulada</span>
            <span className="resumen-value resumen-danger">{formatCurrency(totalDeuda)}</span>
            <span className="resumen-sub">
              <Clock size={12} /> Actualizado hoy — {new Date().toLocaleDateString('es-CR')}
            </span>
          </div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="resumen-item">
            <span className="resumen-label">Obligaciones vencidas</span>
            <span className="resumen-value">{mockObligaciones.filter(o => o.fechaVencimiento).length}</span>
          </div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="resumen-item">
            <span className="resumen-label">Sin fecha de vencimiento</span>
            <span className="resumen-value resumen-warning">{mockObligaciones.filter(o => !o.fechaVencimiento).length}</span>
          </div>
        </Card>
      </div>

      {/* Lista de obligaciones */}
      <Card variant="outlined" padding="none">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Formulario</th>
                <th>Período</th>
                <th>Capital</th>
                <th>Días vencido</th>
                <th>Intereses</th>
                <th>Total a pagar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockObligaciones.map(ob => {
                const sinFecha = !ob.fechaVencimiento;
                const dias = sinFecha ? null : calcularDiasVencidos(ob.fechaVencimiento!, fechaCorte);
                const intereses = getIntereses(ob);
                const total = getTotal(ob);

                return (
                  <tr key={ob.id}>
                    <td className="cell-concept">{ob.formulario}</td>
                    <td>{ob.periodo}</td>
                    <td className="cell-amount">{formatCurrency(ob.capital)}</td>
                    <td>
                      {sinFecha
                        ? <span className="sin-fecha">—</span>
                        : <span className="dias-vencido">{dias} días</span>
                      }
                    </td>
                    <td className="cell-amount mora-intereses">
                      {sinFecha ? '—' : formatCurrency(intereses)}
                    </td>
                    <td className="cell-amount mora-total">
                      {sinFecha ? '—' : formatCurrency(total)}
                    </td>
                    <td>
                      {sinFecha
                        ? (
                          <div className="sin-fecha-warning">
                            <AlertTriangle size={14} />
                            <span>Sin vencimiento</span>
                          </div>
                        )
                        : <Badge variant="danger" size="sm">Vencido</Badge>
                      }
                    </td>
                    <td className="cell-actions">
                      <button
                        className="action-btn"
                        title="Ver detalle"
                        onClick={() => setSelectedObligacion(ob)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal detalle */}
      <Modal
        isOpen={!!selectedObligacion}
        onClose={() => setSelectedObligacion(null)}
        title={`Detalle — ${selectedObligacion?.formulario} ${selectedObligacion?.periodo}`}
        size="md"
      >
        {selectedObligacion && (
          <div className="detalle-modal">
            {!selectedObligacion.fechaVencimiento ? (
              <div className="banner-warning-mora">
                <AlertTriangle size={16} />
                No se puede calcular morosidad porque falta la fecha de vencimiento.
                <button className="soporte-link">Contactar soporte</button>
              </div>
            ) : (
              <>
                <div className="detalle-corte">
                  <span>Fecha de corte:</span>
                  <input
                    type="date"
                    value={fechaCorte}
                    onChange={e => setFechaCorte(e.target.value)}
                    className="date-input"
                  />
                </div>

                <div className="detalle-desglose">
                  <div className="detalle-row">
                    <span>Capital original</span>
                    <span>{formatCurrency(selectedObligacion.capital)}</span>
                  </div>
                  <div className="detalle-row">
                    <span>
                      Intereses diarios ({calcularDiasVencidos(selectedObligacion.fechaVencimiento, fechaCorte)} días × {(selectedObligacion.tasaMensual / 30 * 100).toFixed(4)}%/día)
                    </span>
                    <span className="mora-intereses">{formatCurrency(getIntereses(selectedObligacion))}</span>
                  </div>
                  <div className="detalle-divider" />
                  <div className="detalle-row detalle-total">
                    <span>Total a pagar al {new Date(fechaCorte).toLocaleDateString('es-CR')}</span>
                    <span>{formatCurrency(getTotal(selectedObligacion))}</span>
                  </div>
                </div>

                <div className="detalle-vencimiento">
                  <span>Fecha de vencimiento original:</span>
                  <Badge variant="danger" size="sm">
                    {new Date(selectedObligacion.fechaVencimiento).toLocaleDateString('es-CR')}
                  </Badge>
                </div>
              </>
            )}

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setSelectedObligacion(null)}>Cerrar</Button>
              {selectedObligacion.fechaVencimiento && (
                <Button variant="outline">
                  <Download size={16} />
                  Exportar detalle
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Mora;
