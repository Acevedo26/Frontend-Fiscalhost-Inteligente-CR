/* ============================================
   PÁGINA: Centro de Cálculo — HU-008, HU-009, HU-010, HU-014
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AlertTriangle, Copy, Check, Info } from 'lucide-react';
import './Impuestos.css';

const TARIFAS_HISTORICAS: Record<number, { iva: number; renta: number; nota: string }> = {
  2024: { iva: 0.13, renta: 0.1275, nota: 'Tarifa vigente desde Ley 9635' },
  2025: { iva: 0.13, renta: 0.1275, nota: 'Sin cambios normativos' },
  2026: { iva: 0.13, renta: 0.1275, nota: 'Tarifa actual' },
};

const mockHistorial: Record<number, (boolean | null)[]> = {
  2026: [true, true, true, true, false, null, null, null, null, null, null, null],
  2025: [true, true, true, true, true, true, true, true, true, true, true, true],
  2024: [true, true, true, true, true, true, true, true, true, true, true, true],
};

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(n);

export const Impuestos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'iva' | 'renta'>('iva');
  const [regimenActivo, setRegimenActivo] = useState<'CAPITAL' | 'UTILIDADES'>('CAPITAL');
  const [showComparativa, setShowComparativa] = useState(false);
  const [showBorrador, setShowBorrador] = useState(false);
  const [anoRetro, setAnoRetro] = useState(2026);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pendientesBloqueo] = useState(false); // simula si hay registros sin clasificar

  // Datos IVA
  const ingresos = 245000;
  const creditoFiscal = 45000 * 0.13;
  const debitoFiscal = ingresos * 0.13;
  const ivaNeto = debitoFiscal - creditoFiscal;
  const saldoAFavor = ivaNeto < 0;

  // Datos Renta
  const ingresosRenta = 2845000;
  const gastosRenta = 520000;
  const deduccionCapital = ingresosRenta * 0.15;
  const baseCapital = ingresosRenta - deduccionCapital;
  const impuestoCapital = baseCapital * 0.1275;
  const baseUtilidades = ingresosRenta - gastosRenta;
  const impuestoUtilidades = baseUtilidades * 0.25;
  const regimenRecomendado = impuestoCapital <= impuestoUtilidades ? 'CAPITAL' : 'UTILIDADES';

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const borradorIVA = [
    { campo: 'Casilla 1 — Ingresos gravados', valor: formatCurrency(ingresos) },
    { campo: 'Casilla 2 — Débito fiscal (13%)', valor: formatCurrency(debitoFiscal) },
    { campo: 'Casilla 3 — Crédito fiscal', valor: formatCurrency(creditoFiscal) },
    { campo: 'Casilla 4 — IVA neto a pagar', valor: formatCurrency(Math.abs(ivaNeto)) },
  ];

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

      {/* ── HU-008: Tarjetas IVA separadas ── */}
      {activeTab === 'iva' && (
        <div className="iva-cards">
          <Card variant="outlined" padding="md">
            <div className="iva-card-content">
              <span className="iva-card-label">Ingresos gravados</span>
              <span className="iva-card-value">{formatCurrency(ingresos)}</span>
              <span className="iva-card-sub">Período: Abril 2026</span>
            </div>
          </Card>
          <Card variant="outlined" padding="md">
            <div className="iva-card-content">
              <span className="iva-card-label">Débito fiscal (13%)</span>
              <span className="iva-card-value">{formatCurrency(debitoFiscal)}</span>
              <Button variant="ghost" size="sm">Ver detalle</Button>
            </div>
          </Card>
          <Card variant="outlined" padding="md">
            <div className="iva-card-content">
              <span className="iva-card-label">Crédito fiscal</span>
              <span className="iva-card-value">{formatCurrency(creditoFiscal)}</span>
              <Button variant="ghost" size="sm">Ver detalle</Button>
            </div>
          </Card>
          <Card variant={saldoAFavor ? 'elevated' : 'outlined'} padding="md">
            <div className="iva-card-content">
              <span className="iva-card-label">IVA neto {saldoAFavor ? '— Saldo a favor' : 'a pagar'}</span>
              <span className={`iva-card-value ${saldoAFavor ? 'text-success' : 'text-danger'}`}>
                {saldoAFavor ? '-' : ''}{formatCurrency(Math.abs(ivaNeto))}
              </span>
              {saldoAFavor && (
                <div className="saldo-favor-banner">
                  <Info size={14} /> Este saldo se aplicará automáticamente al próximo período
                </div>
              )}
              {!saldoAFavor && <Badge variant="success" size="sm">Período calculado correctamente</Badge>}
            </div>
          </Card>
        </div>
      )}

      {/* ── HU-009: Renta con comparativa ── */}
      {activeTab === 'renta' && (
        <>
          <div className="regimen-comparativa">
            {[
              { id: 'CAPITAL', label: 'Capital Inmobiliario', tasa: '12.75%', impuesto: impuestoCapital,
                detalle: [`Ingresos: ${formatCurrency(ingresosRenta)}`, `Deducción 15%: -${formatCurrency(deduccionCapital)}`, `Base: ${formatCurrency(baseCapital)}`] },
              { id: 'UTILIDADES', label: 'Régimen de Utilidades', tasa: '25%', impuesto: impuestoUtilidades,
                detalle: [`Ingresos: ${formatCurrency(ingresosRenta)}`, `Gastos reales: -${formatCurrency(gastosRenta)}`, `Base: ${formatCurrency(baseUtilidades)}`] },
            ].map(r => (
              <Card key={r.id} variant={regimenActivo === r.id ? 'elevated' : 'outlined'} padding="md">
                <div className="regimen-card">
                  <div className="regimen-card-header">
                    <span className="regimen-name">{r.label}</span>
                    {regimenRecomendado === r.id && <Badge variant="success" size="sm">Recomendado</Badge>}
                  </div>
                  <span className="regimen-rate">{r.tasa}</span>
                  <div className="regimen-detalle">
                    {r.detalle.map((d, i) => <span key={i} className="regimen-detalle-item">{d}</span>)}
                  </div>
                  <span className={`regimen-impuesto ${regimenRecomendado === r.id ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(r.impuesto)}
                  </span>
                  <Button variant={regimenActivo === r.id ? 'primary' : 'outline'} size="sm"
                    onClick={() => setRegimenActivo(r.id as 'CAPITAL' | 'UTILIDADES')}>
                    {regimenActivo === r.id ? 'Régimen activo' : 'Aplicar régimen'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="comparativa-action">
            <Button variant="outline" onClick={() => setShowComparativa(true)}>Ver comparativa detallada</Button>
          </div>
        </>
      )}

      {/* ── HU-010: Reconstrucción retroactiva ── */}
      <Card variant="outlined" padding="md">
        <div className="retro-header">
          <h3>Reconstrucción Retroactiva</h3>
          <div className="ano-selector">
            {[2024, 2025, 2026].map(a => (
              <button key={a} className={`ano-btn ${anoRetro === a ? 'active' : ''}`} onClick={() => setAnoRetro(a)}>{a}</button>
            ))}
          </div>
        </div>
        <div className="historial-timeline">
          <div className="timeline-months-labels">
            {['E','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
              <span key={i} className="timeline-month-label">{m}</span>
            ))}
          </div>
          {[anoRetro].map(ano => {
            const meses = mockHistorial[ano] || Array(12).fill(null);
            const incompletos = meses.filter(m => m === false).length;
            return (
              <div key={ano}>
                {incompletos > 0 && (
                  <div className="banner-incompleto">
                    <AlertTriangle size={14} />
                    {incompletos} meses incompletos.
                    <button className="link-btn-retro">Completar ahora</button>
                    <button className="link-btn-retro">Continuar con disponibles</button>
                  </div>
                )}
                <div className="timeline-year">
                  <div className="timeline-year-header">
                    <span className="timeline-year-label">{ano}</span>
                    <Badge variant={incompletos === 0 ? 'success' : 'warning'} size="sm">
                      {incompletos === 0 ? 'COMPLETO' : 'INCOMPLETO'}
                    </Badge>
                  </div>
                  <div className="timeline-months">
                    {meses.map((completo, idx) => (
                      <div key={idx}
                        className={`timeline-month ${completo === true ? 'complete' : completo === false ? 'incomplete' : 'empty'}`}
                        title={`${MESES[idx]} ${ano} — IVA: ${(TARIFAS_HISTORICAS[ano]?.iva * 100).toFixed(0)}% | ${TARIFAS_HISTORICAS[ano]?.nota}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="retro-tarifa-nota">
          <Info size={14} />
          <span>Tarifa aplicada {anoRetro}: IVA {(TARIFAS_HISTORICAS[anoRetro]?.iva * 100).toFixed(0)}% · Renta {(TARIFAS_HISTORICAS[anoRetro]?.renta * 100).toFixed(2)}% — {TARIFAS_HISTORICAS[anoRetro]?.nota}</span>
        </div>
      </Card>

      {/* ── Modal Borrador (HU-014) ── */}
      <Modal isOpen={showBorrador} onClose={() => setShowBorrador(false)} title={`Borrador ${activeTab === 'iva' ? 'D-104' : 'D-125'}`} size="md">
        <div className="borrador-modal">
          <div className="borrador-estado">
            <Badge variant="success">Datos completos</Badge>
            <span>Período: Abril 2026</span>
          </div>
          <p className="borrador-instruccion">Copia cada sección y pégala directamente en OVi (ATV).</p>
          <div className="borrador-campos">
            {borradorIVA.map(item => (
              <div key={item.campo} className="borrador-campo">
                <div className="borrador-campo-info">
                  <span className="borrador-campo-label">{item.campo}</span>
                  <span className="borrador-campo-valor">{item.valor}</span>
                </div>
                <button className="copy-btn" onClick={() => handleCopy(item.campo, item.valor)}
                  title="Copiar al portapapeles">
                  {copiedField === item.campo ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowBorrador(false)}>Cerrar</Button>
            <Button variant="primary">Descargar borrador PDF</Button>
          </div>
        </div>
      </Modal>

      {/* Modal comparativa regímenes */}
      <Modal isOpen={showComparativa} onClose={() => setShowComparativa(false)} title="Comparativa de Regímenes" size="md">
        <div className="comparativa-modal">
          <table className="comparativa-table">
            <thead>
              <tr><th>Concepto</th><th>Capital Inmobiliario</th><th>Utilidades</th></tr>
            </thead>
            <tbody>
              <tr><td>Ingresos</td><td>{formatCurrency(ingresosRenta)}</td><td>{formatCurrency(ingresosRenta)}</td></tr>
              <tr><td>Deducción</td><td>15% fija ({formatCurrency(deduccionCapital)})</td><td>Gastos reales ({formatCurrency(gastosRenta)})</td></tr>
              <tr><td>Base imponible</td><td>{formatCurrency(baseCapital)}</td><td>{formatCurrency(baseUtilidades)}</td></tr>
              <tr><td>Tasa</td><td>12.75%</td><td>25%</td></tr>
              <tr className="comparativa-total">
                <td>Impuesto</td>
                <td className={regimenRecomendado === 'CAPITAL' ? 'text-success' : ''}>{formatCurrency(impuestoCapital)}</td>
                <td className={regimenRecomendado === 'UTILIDADES' ? 'text-success' : ''}>{formatCurrency(impuestoUtilidades)}</td>
              </tr>
            </tbody>
          </table>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowComparativa(false)}>Cerrar</Button>
            <Button variant="primary" onClick={() => { setRegimenActivo(regimenRecomendado); setShowComparativa(false); }}>
              Aplicar régimen recomendado
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Impuestos;
