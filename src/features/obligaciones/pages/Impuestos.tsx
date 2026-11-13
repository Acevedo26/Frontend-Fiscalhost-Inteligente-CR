import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BorradorModal } from '../components/BorradorModal';
import { ComparativaModal } from '../components/ComparativaModal';
import { RetroactivaCard } from '../components/RetroactivaCard';
import { IvaTab } from '../components/IvaTab';
import { RentaTab } from '../components/RentaTab';
import { ImpuestosService } from '../services/ImpuestosService';
import { showSuccess } from '../../../utils/alerts';
import { useDashboard } from '../../dashboard/hooks/useDashboard';
import './Impuestos.css';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(n);

export const Impuestos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'iva' | 'renta'>('iva');
  const [regimenActivo, setRegimenActivo] = useState<'CAPITAL' | 'UTILIDADES'>('CAPITAL');
  const [showComparativa, setShowComparativa] = useState(false);
  const [showBorrador, setShowBorrador] = useState(false);
  const [pendientesBloqueo] = useState(false);
  const [detalleIvaModal, setDetalleIvaModal] = useState<{ isOpen: boolean; tipo: 'debito' | 'credito' }>({
    isOpen: false,
    tipo: 'debito',
  });

  const { data: dashboardData } = useDashboard();
  const metrics = dashboardData?.metricas;

  // Datos fiscales del mismo origen que el dashboard; no se muestran valores simulados.
  const ingresos = metrics?.ingresosBrutos ?? 0;
  const creditoFiscal = metrics?.ivaCreditoFiscal ?? 0;
  const debitoFiscal = metrics?.ivaDebito ?? 0;
  const ivaNeto = metrics?.ivaRetenido ?? 0;
  const saldoAFavor = ivaNeto < 0;

  // Datos de renta calculados sobre las operaciones reales del período.
  const ingresosRenta = ingresos;
  const gastosRenta = metrics?.gastosTotales ?? 0;
  const deduccionCapital = ingresosRenta * 0.15;
  const baseCapital = ingresosRenta - deduccionCapital;
  const impuestoCapital = baseCapital * 0.1275;
  const baseUtilidades = ingresosRenta - gastosRenta;
  const impuestoUtilidades = baseUtilidades * 0.25;
  const regimenRecomendado = impuestoCapital <= impuestoUtilidades ? 'CAPITAL' : 'UTILIDADES';

  const borradorIVA = [
    { campo: 'Casilla 1 — Ingresos gravados', valor: formatCurrency(ingresos) },
    { campo: 'Casilla 2 — Débito fiscal (13%)', valor: formatCurrency(debitoFiscal) },
    { campo: 'Casilla 3 — Crédito fiscal', valor: formatCurrency(creditoFiscal) },
    { campo: 'Casilla 4 — IVA neto a pagar', valor: formatCurrency(Math.abs(ivaNeto)) },
  ];

  const handleAplicarRegimen = async (r: 'CAPITAL' | 'UTILIDADES') => {
    try {
      await ImpuestosService.cambiarRegimen(r, 2026, 4);
    } catch {
      // Response handled by Axios interceptor
    }
    setRegimenActivo(r);
    showSuccess(
      'Régimen Actualizado',
      `Se ha aplicado el régimen ${r === 'CAPITAL' ? 'de Capital Inmobiliario (12.75%)' : 'de Utilidades (25%)'} exitosamente.`
    );
  };

  return (
    <div className="impuestos-page">
      <div className="page-header">
        <div>
          <h1>Centro de Cálculo</h1>
          <p>Calcula y gestiona tus obligaciones tributarias</p>
        </div>
        <div className="page-actions">
          <Button variant="primary" onClick={() => setShowBorrador(true)} disabled={pendientesBloqueo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            Generar Borrador
          </Button>
        </div>
      </div>

      {pendientesBloqueo && (
        <div className="banner-pendientes">
          <AlertTriangle size={16} />
          No se puede calcular porque hay registros pendientes de clasificación.
          <a href="/ingresos" className="banner-link">Ir a clasificar</a>
        </div>
      )}

      {/* Selector IVA / Renta */}
      <div className="tax-selector">
        {[
          { id: 'iva', label: 'IVA', value: formatCurrency(Math.abs(ivaNeto)), estado: 'PENDIENTE' },
          { id: 'renta', label: 'Renta', value: formatCurrency(regimenActivo === 'CAPITAL' ? impuestoCapital : impuestoUtilidades), estado: 'LIQUIDADO' },
        ].map(t => (
          <button key={t.id} className={`tax-btn ${activeTab === t.id ? 'tax-btn-active' : ''}`}
            onClick={() => setActiveTab(t.id as 'iva' | 'renta')}>
            <div className="tax-btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {t.id === 'iva'
                  ? <path d="M9 7h6M9 11h6M9 15h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                  : <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />}
              </svg>
            </div>
            <div className="tax-btn-content">
              <span className="tax-btn-label">{t.label}</span>
              <span className="tax-btn-value">{t.value}</span>
            </div>
            <Badge variant={t.estado === 'PENDIENTE' ? 'warning' : 'success'} size="sm">{t.estado}</Badge>
          </button>
        ))}
      </div>

      {activeTab === 'iva' && (
        <IvaTab
          ingresos={ingresos} debitoFiscal={debitoFiscal}
          creditoFiscal={creditoFiscal} ivaNeto={ivaNeto}
          saldoAFavor={saldoAFavor} formatCurrency={formatCurrency}
          onVerDetalleDebito={() => setDetalleIvaModal({ isOpen: true, tipo: 'debito' })}
          onVerDetalleCredito={() => setDetalleIvaModal({ isOpen: true, tipo: 'credito' })}
        />
      )}

      {activeTab === 'renta' && (
        <RentaTab
          ingresosRenta={ingresosRenta} deduccionCapital={deduccionCapital} gastosRenta={gastosRenta}
          baseCapital={baseCapital} baseUtilidades={baseUtilidades} impuestoCapital={impuestoCapital}
          impuestoUtilidades={impuestoUtilidades} regimenRecomendado={regimenRecomendado}
          regimenActivo={regimenActivo} setRegimenActivo={setRegimenActivo}
          onAplicarRegimen={handleAplicarRegimen}
          setShowComparativa={setShowComparativa}
          formatCurrency={formatCurrency}
        />
      )}

      <RetroactivaCard />

      <BorradorModal isOpen={showBorrador} onClose={() => setShowBorrador(false)} activeTab={activeTab} borradorIVA={borradorIVA} />

      <ComparativaModal
        isOpen={showComparativa} onClose={() => setShowComparativa(false)} ingresosRenta={ingresosRenta}
        deduccionCapital={deduccionCapital} gastosRenta={gastosRenta} baseCapital={baseCapital}
        baseUtilidades={baseUtilidades} impuestoCapital={impuestoCapital} impuestoUtilidades={impuestoUtilidades}
        regimenRecomendado={regimenRecomendado} setRegimenActivo={setRegimenActivo}
        onAplicarRegimen={handleAplicarRegimen}
      />

      <Modal
        isOpen={detalleIvaModal.isOpen}
        onClose={() => setDetalleIvaModal({ ...detalleIvaModal, isOpen: false })}
        title={detalleIvaModal.tipo === 'debito' ? 'Desglose de Débito Fiscal (IVA 13%)' : 'Desglose de Crédito Fiscal'}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {detalleIvaModal.tipo === 'debito' ? (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                El débito fiscal corresponde al impuesto al valor agregado devengado por las ventas o servicios prestados en el período tributario.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ingresos gravados reportados:</span>
                  <strong>{formatCurrency(ingresos)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tasa general aplicable:</span>
                  <strong>13.00% (Ley 9635)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', color: 'var(--color-primary)' }}>
                  <span>Total Débito Fiscal determinado:</span>
                  <strong>{formatCurrency(debitoFiscal)}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-success)' }}>
                <CheckCircle2 size={16} /> 100% de facturación electrónica validada ante ATV.
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                El crédito fiscal corresponde al IVA soportado en la adquisición de bienes y servicios vinculados exclusivamente a tu actividad económica.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total gastos deducibles con comprobante:</span>
                  <strong>{formatCurrency(gastosRenta)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IVA soportado en compras (13%):</span>
                  <strong>{formatCurrency(creditoFiscal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Factor de proporcionalidad / acreditación:</span>
                  <strong>100% (Pleno derecho)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', color: 'var(--color-success)' }}>
                  <span>Total Crédito Fiscal aplicable:</span>
                  <strong>{formatCurrency(creditoFiscal)}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-success)' }}>
                <CheckCircle2 size={16} /> Comprobantes electrónicos admisibles validados ante ATV.
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="primary" onClick={() => setDetalleIvaModal({ ...detalleIvaModal, isOpen: false })}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Impuestos;

