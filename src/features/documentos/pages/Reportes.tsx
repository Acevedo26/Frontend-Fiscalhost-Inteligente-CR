import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';

import { ChevronRight, BarChart2, ClipboardList, DollarSign, FileText, Upload } from 'lucide-react';
import { ExportarModal } from '../components/ExportarModal';
import { InvitarContadorModal } from '../components/InvitarContadorModal';
import { RevocarContadorModal } from '../components/RevocarContadorModal';
import { AutorizarContadorCard } from '../components/AutorizarContadorCard';

import './Reportes.css';

export interface Contador {
  id: number;
  nombre: string;
  email: string;
  permisos: string;
  expiracion: string;
  estado: 'ACTIVO' | 'EXPIRADO' | 'PENDIENTE';
}

export interface Reporte {
  id: number;
  tipo: string;
  nombre: string;
  fecha: string;
  estado: 'LISTO' | 'ENVIADO' | 'PENDIENTE';
}

export const getTipoReporteLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    RESUMEN_MENSUAL: 'Resumen Mensual', DECLARACION_IVA: 'Declaración IVA',
    DECLARACION_RENTA: 'Declaración Renta', DETALLE_GASTOS: 'Detalle de Gastos', EXPORTACION_ATV: 'Exportación ATV',
  };
  return labels[tipo] || tipo;
};

export const Reportes: React.FC = () => {
  const [contadores, setContadores] = useState<Contador[]>([]);

  // HU-015: exportar
  const [showExportModal, setShowExportModal] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string | null>(null);

  // HU-016: invitar
  const [showModalInvitar, setShowModalInvitar] = useState(false);

  // HU-016: revocar
  const [revocarContador, setRevocarContador] = useState<Contador | null>(null);

  const handleInvitar = (nuevo: Contador) => {
    setContadores([...contadores, nuevo]);
  };

  const handleRevocar = (contador: Contador) => {
    setContadores(contadores.filter(c => c.id !== contador.id));
    setRevocarContador(null);
  };

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

      <AutorizarContadorCard
        contadores={contadores}
        onInvitar={() => setShowModalInvitar(true)}
        onRevocar={setRevocarContador}
      />

      <ExportarModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        reporteSeleccionado={reporteSeleccionado}
        getTipoReporteLabel={getTipoReporteLabel}
      />

      <InvitarContadorModal
        isOpen={showModalInvitar}
        onClose={() => setShowModalInvitar(false)}
        onInvitar={handleInvitar}
      />

      <RevocarContadorModal
        contador={revocarContador}
        onClose={() => setRevocarContador(null)}
        onRevocar={handleRevocar}
      />
    </div>
  );
};

export default Reportes;
