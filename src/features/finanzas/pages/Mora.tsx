/* ============================================
   PÁGINA: Mora e Intereses
   Descripción: Cálculo de mora e intereses acumulados (HU-012)
   ============================================ */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FinanzasService } from '../services/FinanzasService';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { AlertTriangle, Download, Clock, Eye, PhoneCall } from 'lucide-react';
import { showSuccess, showInfo } from '../../../utils/alerts';
import './Mora.css';

interface ObligacionDisplay {
  id: string | number;
  formulario: string;
  periodo: string;
  capital: number;
  fechaVencimiento: string | null;
  tasaMensual: number;
  multa: number;
  interesesCalculados: number;
  totalActualizado: number;
  diasVencido: number;
}

const mockObligaciones: ObligacionDisplay[] = [
  {
    id: 1,
    formulario: 'D-104',
    periodo: 'Febrero 2026',
    capital: 85000,
    fechaVencimiento: '2026-03-15',
    tasaMensual: 0.018,
    multa: 0,
    interesesCalculados: 3060,
    totalActualizado: 88060,
    diasVencido: 45,
  },
  {
    id: 2,
    formulario: 'D-104',
    periodo: 'Enero 2026',
    capital: 62000,
    fechaVencimiento: '2026-02-15',
    tasaMensual: 0.018,
    multa: 0,
    interesesCalculados: 3348,
    totalActualizado: 65348,
    diasVencido: 75,
  },
  {
    id: 3,
    formulario: 'D-125',
    periodo: '2025',
    capital: 296138,
    fechaVencimiento: null,
    tasaMensual: 0.018,
    multa: 0,
    interesesCalculados: 0,
    totalActualizado: 296138,
    diasVencido: 0,
  },
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
  const [selectedObligacion, setSelectedObligacion] = useState<ObligacionDisplay | null>(null);

  // Live obligations query from backend GET /api/obligaciones
  const { data: apiObligaciones, isLoading } = useQuery({
    queryKey: ['obligaciones', fechaCorte],
    queryFn: () => FinanzasService.getObligaciones(fechaCorte),
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);

  const getIntereses = (ob: ObligacionDisplay) => {
    if (!ob.fechaVencimiento) return 0;
    const meses = calcularMesesVencidos(ob.fechaVencimiento, fechaCorte);
    return Math.round(ob.capital * ob.tasaMensual * meses);
  };

  const getTotal = (ob: ObligacionDisplay) => ob.capital + getIntereses(ob) + (ob.multa || 0);

  // Combine live data or fallback to initial records
  const listaObligaciones: ObligacionDisplay[] = useMemo(() => {
    if (apiObligaciones && Array.isArray(apiObligaciones) && apiObligaciones.length > 0) {
      return apiObligaciones.map((ob, idx) => {
        let formName = 'D-104';
        if (typeof ob.tipoFormulario === 'string') {
          formName = ob.tipoFormulario.replace('_', '-');
        } else if (ob.tipoFormulario === 2) {
          formName = 'D-125';
        } else if (ob.tipoFormulario === 3) {
          formName = 'D-101';
        } else if (ob.descripcion?.includes('D-125')) {
          formName = 'D-125';
        }

        const vDate = ob.fechaVencimiento ? ob.fechaVencimiento.split('T')[0] : null;

        return {
          id: ob.obligacionId || idx + 1,
          formulario: formName,
          periodo: ob.descripcion || `Período Fiscal ${vDate ? vDate.substring(0, 7) : '2026'}`,
          capital: Number(ob.montoCapital || 0),
          fechaVencimiento: vDate,
          tasaMensual: Number(ob.tasaInteresAplicada || 0.018),
          multa: Number(ob.montoMulta || 0),
          interesesCalculados: Number(ob.montoInteresesAcumulados || 0),
          totalActualizado: Number(ob.montoTotalActualizado || ob.montoCapital),
          diasVencido: ob.diasVencido || 0,
        };
      });
    }
    return mockObligaciones;
  }, [apiObligaciones]);

  const totalDeuda = listaObligaciones
    .filter(o => o.fechaVencimiento)
    .reduce((sum, o) => sum + getTotal(o), 0);

  // Wire support action
  const handleContactSupport = () => {
    showInfo(
      'Soporte Fiscal Especializado',
      'Para regularizar obligaciones sin fecha de vencimiento o presentar consultas sobre liquidaciones de mora ante la DGT, acuda a las oficinas de la Administración Tributaria o comuníquese por los canales oficiales habilitados.'
    );
  };

  // Wire export detail to CSV
  const handleExportDetail = (ob: ObligacionDisplay) => {
    const dias = ob.fechaVencimiento ? calcularDiasVencidos(ob.fechaVencimiento, fechaCorte) : 0;
    const intereses = getIntereses(ob);
    const total = getTotal(ob);

    const csvContent = [
      'Reporte,Detalle de Liquidacion de Mora e Intereses',
      'Normativa,Articulo 57 y 58 del Codigo de Normas y Procedimientos Tributarios de Costa Rica',
      `Formulario,${ob.formulario}`,
      `Periodo Fiscal,${ob.periodo}`,
      `Fecha de Vencimiento Original,${ob.fechaVencimiento || 'Sin Registrar'}`,
      `Fecha de Corte Calculada,${fechaCorte}`,
      `Dias de Mora Acumulados,${dias}`,
      `Tasa de Interes Legal Mensual,${(ob.tasaMensual * 100).toFixed(2)}%`,
      `Monto de Capital Adeudado (CRC),${ob.capital}`,
      `Intereses Moratorios Calculados (CRC),${intereses}`,
      `Monto Total a Liquidar (CRC),${total}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `detalle_mora_${ob.formulario}_${fechaCorte}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess(
      'Archivo Exportado',
      `Se ha descargado el archivo CSV con la liquidación detallada del formulario ${ob.formulario}.`
    );
  };

  return (
    <div className="mora-page">
      <div className="page-header">
        <div>
          <h1>Mora e Intereses</h1>
          <p>Consulta tus obligaciones tributarias vencidas y el cálculo oficial de intereses moratorios (HU-012)</p>
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
              <Clock size={12} /> Actualizado al corte — {new Date(fechaCorte).toLocaleDateString('es-CR')}
            </span>
          </div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="resumen-item">
            <span className="resumen-label">Obligaciones vencidas</span>
            <span className="resumen-value">
              {listaObligaciones.filter(o => o.fechaVencimiento).length}
            </span>
          </div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="resumen-item">
            <span className="resumen-label">Sin fecha de vencimiento</span>
            <span className="resumen-value resumen-warning">
              {listaObligaciones.filter(o => !o.fechaVencimiento).length}
            </span>
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
              {isLoading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    Consultando obligaciones en Hacienda...
                  </td>
                </tr>
              )}
              {!isLoading &&
                listaObligaciones.map(ob => {
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
                        {sinFecha ? (
                          <span className="sin-fecha">—</span>
                        ) : (
                          <span className="dias-vencido">{dias} días</span>
                        )}
                      </td>
                      <td className="cell-amount mora-intereses">
                        {sinFecha ? '—' : formatCurrency(intereses)}
                      </td>
                      <td className="cell-amount mora-total">
                        {sinFecha ? '—' : formatCurrency(total)}
                      </td>
                      <td>
                        {sinFecha ? (
                          <div className="sin-fecha-warning">
                            <AlertTriangle size={14} />
                            <span>Sin vencimiento</span>
                          </div>
                        ) : (
                          <Badge variant="danger" size="sm">
                            Vencido
                          </Badge>
                        )}
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
        title={`Detalle de Liquidación — ${selectedObligacion?.formulario} ${selectedObligacion?.periodo}`}
        size="md"
      >
        {selectedObligacion && (
          <div className="detalle-modal">
            {!selectedObligacion.fechaVencimiento ? (
              <div className="banner-warning-mora">
                <AlertTriangle size={16} />
                <span>No se puede calcular morosidad porque falta la fecha de vencimiento.</span>
                <button
                  type="button"
                  className="soporte-link"
                  onClick={handleContactSupport}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <PhoneCall size={14} /> Contactar soporte
                </button>
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
                    <span>Capital adeudado</span>
                    <span>{formatCurrency(selectedObligacion.capital)}</span>
                  </div>
                  <div className="detalle-row">
                    <span>
                      Intereses moratorios (
                      {calcularDiasVencidos(selectedObligacion.fechaVencimiento, fechaCorte)} días ×{' '}
                      {((selectedObligacion.tasaMensual / 30) * 100).toFixed(4)}%/día)
                    </span>
                    <span className="mora-intereses">
                      {formatCurrency(getIntereses(selectedObligacion))}
                    </span>
                  </div>
                  <div className="detalle-divider" />
                  <div className="detalle-row detalle-total">
                    <span>Total liquidado al {new Date(fechaCorte).toLocaleDateString('es-CR')}</span>
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
              <Button variant="secondary" onClick={() => setSelectedObligacion(null)}>
                Cerrar
              </Button>
              {selectedObligacion.fechaVencimiento && (
                <Button variant="outline" onClick={() => handleExportDetail(selectedObligacion)}>
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
