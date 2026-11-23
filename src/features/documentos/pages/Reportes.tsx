import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';

import { ChevronRight, BarChart2, ClipboardList, DollarSign, FileText, Upload } from 'lucide-react';
import { ExportarModal } from '../components/ExportarModal';

import './Reportes.css';

export const getTipoReporteLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    RESUMEN_MENSUAL: 'Resumen Mensual', DECLARACION_IVA: 'Declaración IVA',
    DECLARACION_RENTA: 'Declaración Renta', DETALLE_GASTOS: 'Detalle de Gastos', EXPORTACION_ATV: 'Exportación ATV',
  };
  return labels[tipo] || tipo;
};

export const Reportes: React.FC = () => {
  // HU-015: exportar
  const [showExportModal, setShowExportModal] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string | null>(null);

  return (
    <div className="reportes-page">
      <div className="page-header">
        <div>
          <h1>Reportes</h1>
          <p>Genera y exporta tus reportes fiscales</p>
        </div>
      </div>

      <div className="reportes-grid">
        <Card variant="outlined" padding="md">
          <div className="card-header"><h3>Generar Reportes</h3></div>
          <div className="report-types">
            {[
              { tipo: 'RESUMEN_MENSUAL', icono: <BarChart2 size={22} />, desc: 'Resumen de ingresos y gastos del mes' },
              { tipo: 'DECLARACION_IVA', icono: <ClipboardList size={22} />, desc: 'Formulario de declaración de IVA' },
              { tipo: 'DECLARACION_RENTA', icono: <DollarSign size={22} />, desc: 'Declaración anual de renta' },
              { tipo: 'DETALLE_GASTOS', icono: <FileText size={22} />, desc: 'Listado detallado de gastos' },
              { tipo: 'EXPORTACION_ATV', icono: <Upload size={22} />, desc: 'Exportación en formato ATV' },
            ].map(r => (
              <button type="button" key={r.tipo} className="report-type-card"
                onClick={() => { setReporteSeleccionado(r.tipo); setShowExportModal(true); }}>
                <span className="report-type-icon">{r.icono}</span>
                <div className="report-type-info">
                  <span className="report-type-name">{getTipoReporteLabel(r.tipo)}</span>
                  <span className="report-type-desc">{r.desc}</span>
                </div>
                <ChevronRight size={20} color="var(--color-text-muted)" />
              </button>
            ))}
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <div className="card-header"><h3>Reportes Recientes</h3></div>
          <div className="reportes-list">
            {[]}
          </div>
        </Card>
      </div>

      <ExportarModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        reporteSeleccionado={reporteSeleccionado}
        getTipoReporteLabel={getTipoReporteLabel}
      />
    </div>
  );
};

export default Reportes;