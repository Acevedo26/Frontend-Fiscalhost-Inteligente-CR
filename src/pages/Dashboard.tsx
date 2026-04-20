/* ============================================
   PÁGINA: Dashboard Principal — HU-017
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TriangleAlert, Upload, Info, TrendingUp, TrendingDown, AlertCircle, DollarSign, Receipt, FileText, Wallet } from 'lucide-react';
import './Dashboard.css';

const LIMITE_EXENCION = 4200000;

const kpiData = [
  { id: 'brutos',  label: 'Ingresos Brutos',  value: '₡1,850,000', rawValue: 1850000, status: 'neutral', subtitle: 'Acumulado 2026',       icon: <DollarSign size={18} /> },
  { id: 'iva',     label: 'IVA Retenido',      value: '₡125,000',   rawValue: 125000,  status: 'danger',  subtitle: 'Vence en 3 días',       icon: <Receipt size={18} /> },
  { id: 'renta',   label: 'Renta Estimada',    value: '₡210,375',   rawValue: 210375,  status: 'warning', subtitle: 'Proyección anual',       icon: <FileText size={18} /> },
  { id: 'neto',    label: 'Neto Disponible',   value: '₡1,514,625', rawValue: 1514625, status: 'success', subtitle: 'Después de impuestos',   icon: <Wallet size={18} /> },
];

const recentTransactions = [
  { id: 1, date: '15/04/2026', concept: 'Reserva Airbnb #2847',   amount: 45000,  type: 'income',  classification: 'GRAVADO_13' },
  { id: 2, date: '14/04/2026', concept: 'Reserva Booking #B3921', amount: 32000,  type: 'income',  classification: 'GRAVADO_13' },
  { id: 3, date: '12/04/2026', concept: 'Limpieza Villa Sol',      amount: -15000, type: 'expense', classification: 'GASTO' },
  { id: 4, date: '10/04/2026', concept: 'Reserva Directa',        amount: 28000,  type: 'income',  classification: 'EXENTO' },
  { id: 5, date: '08/04/2026', concept: 'Mantenimiento AC',       amount: -35000, type: 'expense', classification: 'GASTO' },
];

const alerts = [
  { id: 1, title: 'D-104 vence pronto',       message: 'Genera tu borrador antes del 15 de mayo', priority: 'high' },
  { id: 2, title: 'Clasificación pendiente',  message: '2 ingresos requieren revisión manual',     priority: 'medium' },
];

const chartData = [
  { mes: 'Ene', ingresos: 185000, gastos: 42000, obligaciones: 24050 },
  { mes: 'Feb', ingresos: 142000, gastos: 38000, obligaciones: 18460 },
  { mes: 'Mar', ingresos: 256000, gastos: 61000, obligaciones: 33280 },
  { mes: 'Abr', ingresos: 198000, gastos: 45000, obligaciones: 25740 },
  { mes: 'May', ingresos: 312000, gastos: 72000, obligaciones: 40560 },
  { mes: 'Jun', ingresos: 245000, gastos: 58000, obligaciones: 31850 },
];

// ── Gráfico: dimensiones con padding ──
const W = 500;          // ancho total del viewBox
const H = 200;          // alto total del viewBox
const PAD_L = 52;       // espacio para eje Y
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 28;       // espacio para etiquetas X
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const MAX_VAL = 340000;
const Y_TICKS = [0, 100000, 200000, 300000];

const toX = (i: number) => PAD_L + (i / (chartData.length - 1)) * PLOT_W;
const toY = (v: number) => PAD_T + PLOT_H - (v / MAX_VAL) * PLOT_H;

const buildPath = (key: 'ingresos' | 'gastos' | 'obligaciones') =>
  chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d[key]).toFixed(1)}`).join(' ');

const acumuladoAnual = 1850000;
const semaforoRatio = acumuladoAnual / LIMITE_EXENCION;
const semaforoColor = semaforoRatio >= 1 ? 'danger' : semaforoRatio >= 0.75 ? 'warning' : 'success';
const semaforoLabel = semaforoRatio >= 1 ? 'Límite alcanzado' : semaforoRatio >= 0.75 ? 'Cerca del límite' : 'Seguro';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(n);

const formatK = (n: number) => n >= 1000 ? `₡${(n / 1000).toFixed(0)}k` : `₡${n}`;

interface DashboardProps { userName?: string; hasData?: boolean; }

export const Dashboard: React.FC<DashboardProps> = ({ userName = 'Lisbeth Fallas', hasData = true }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const [showTooltipSemaforo, setShowTooltipSemaforo] = useState(false);

  const toggleLine = (line: string) => {
    const next = new Set(hiddenLines);
    next.has(line) ? next.delete(line) : next.add(line);
    setHiddenLines(next);
  };

  const lines = [
    { key: 'ingresos',    label: 'Ingresos',             color: 'var(--color-accent)' },
    { key: 'gastos',      label: 'Gastos',               color: 'var(--color-danger)' },
    { key: 'obligaciones',label: 'Obligaciones fiscales', color: 'var(--color-info)' },
  ] as const;

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <h1>Hola, {userName} 👋</h1>
          <p>Este es tu centro de tranquilidad fiscal</p>
        </div>
        <div className="dashboard-actions">
          <Button variant="primary"><Upload size={18} /> Importar Datos</Button>
        </div>
      </div>

      {/* ── Semáforo ── */}
      <div className={`dashboard-semaphore semaphore-${semaforoColor}`}>
        <div className={`semaphore-icon-wrap semaphore-icon-${semaforoColor}`}>
          {semaforoColor === 'danger'  ? <AlertCircle size={26} /> :
           semaforoColor === 'warning' ? <TriangleAlert size={26} /> :
           <TrendingUp size={26} />}
        </div>
        <div className="semaphore-content">
          <h3>{semaforoLabel}: Riesgo fiscal</h3>
          <p>
            {semaforoColor === 'danger'
              ? 'Has superado el límite de exención. Debes declarar renta.'
              : semaforoColor === 'warning'
              ? 'Estás cerca del límite de exención anual. Monitorea tus ingresos.'
              : 'Tus ingresos están dentro del límite de exención anual.'}
          </p>
          <div className="semaphore-bar-row">
            <div className="semaphore-bar">
              <div className={`semaphore-fill semaphore-fill-${semaforoColor}`}
                style={{ width: `${Math.min(semaforoRatio * 100, 100)}%` }} />
            </div>
            <span className="semaphore-pct">{Math.round(semaforoRatio * 100)}%</span>
            <div className="semaphore-info-btn"
              onMouseEnter={() => setShowTooltipSemaforo(true)}
              onMouseLeave={() => setShowTooltipSemaforo(false)}>
              <Info size={14} />
              {showTooltipSemaforo && (
                <div className="semaphore-tooltip">
                  Acumulado: {formatCurrency(acumuladoAnual)}<br />
                  Límite de exención: {formatCurrency(LIMITE_EXENCION)}
                </div>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline">Generar Borrador</Button>
      </div>

      {/* ── KPIs ── */}
      <div className="dashboard-kpis">
        {kpiData.map((kpi) => (
          <Card key={kpi.id} variant="elevated" padding="md">
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">{kpi.label}</span>
                <span className="kpi-icon">{kpi.icon}</span>
              </div>
              <span className={`kpi-value kpi-value-${kpi.status}`}>{kpi.value}</span>
              <span className={`kpi-subtitle kpi-subtitle-${kpi.status}`}>{kpi.subtitle}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Grid: Transacciones + Alertas ── */}
      <div className="dashboard-grid">
        <Card variant="outlined" padding="md">
          <div className="card-header">
            <h3>Ingresos Recientes</h3>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </div>
          <div className="transactions-list">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-date">{tx.date}</span>
                  <span className="transaction-concept">{tx.concept}</span>
                </div>
                <div className="transaction-right">
                  <span className={`transaction-amount ${tx.type === 'expense' ? 'expense' : 'income'}`}>
                    {tx.type === 'expense' ? '-' : '+'}₡{Math.abs(tx.amount).toLocaleString()}
                  </span>
                  {tx.classification !== 'GASTO' && (
                    <Badge variant={tx.classification === 'GRAVADO_13' ? 'info' : 'success'} size="sm">
                      {tx.classification === 'GRAVADO_13' ? '13%' : 'Exento'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <div className="card-header">
            <h3>Alertas Activas</h3>
            <Badge variant="warning">{alerts.length}</Badge>
          </div>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-item alert-item-${alert.priority}`}>
                <div className={`alert-icon-wrap alert-icon-${alert.priority}`}>
                  {alert.priority === 'high' ? <AlertCircle size={20} /> : <Info size={20} />}
                </div>
                <div className="alert-content">
                  <span className="alert-title">{alert.title}</span>
                  <span className="alert-message">{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Gráfico de líneas ── */}
      <Card variant="outlined" padding="md">
        <div className="card-header">
          <h3>Evolución Mensual</h3>
          <select className="chart-period">
            <option>Últimos 6 meses</option>
            <option>Último año</option>
          </select>
        </div>

        {!hasData ? (
          <div className="chart-empty">
            <TrendingDown size={48} strokeWidth={1.5} color="var(--color-text-muted)" />
            <p>No hay datos disponibles para este período.</p>
            <p className="chart-empty-sub">Importe o registre información para ver la evolución.</p>
            <div className="chart-empty-actions">
              <Button variant="outline" size="sm"><Upload size={16} /> Importar datos</Button>
              <Button variant="primary" size="sm">Registrar manualmente</Button>
            </div>
          </div>
        ) : (
          <div className="chart-section">
            {/* SVG */}
            <div className="chart-svg-wrap" onMouseLeave={() => setHoveredIdx(null)}>
              <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">

                {/* Grid horizontales */}
                {Y_TICKS.map(v => (
                  <g key={v}>
                    <line
                      x1={PAD_L} y1={toY(v)}
                      x2={W - PAD_R} y2={toY(v)}
                      stroke="var(--color-border-light)" strokeWidth="1" strokeDasharray="4 4"
                    />
                    <text x={PAD_L - 6} y={toY(v) + 4}
                      textAnchor="end" fontSize="11" fill="var(--color-text-muted)">
                      {formatK(v)}
                    </text>
                  </g>
                ))}

                {/* Líneas de datos */}
                {lines.map(l => !hiddenLines.has(l.key) && (
                  <path key={l.key}
                    d={buildPath(l.key)}
                    fill="none"
                    stroke={l.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Área de hover invisible por columna */}
                {chartData.map((_, i) => (
                  <rect key={i}
                    x={toX(i) - PLOT_W / (chartData.length - 1) / 2}
                    y={PAD_T}
                    width={PLOT_W / (chartData.length - 1)}
                    height={PLOT_H}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIdx(i)}
                  />
                ))}

                {/* Línea vertical de hover */}
                {hoveredIdx !== null && (
                  <line
                    x1={toX(hoveredIdx)} y1={PAD_T}
                    x2={toX(hoveredIdx)} y2={PAD_T + PLOT_H}
                    stroke="var(--color-border-dark)" strokeWidth="1" strokeDasharray="3 3"
                  />
                )}

                {/* Puntos en las 3 líneas */}
                {lines.map(l => !hiddenLines.has(l.key) && chartData.map((d, i) => (
                  <circle key={`${l.key}-${i}`}
                    cx={toX(i)} cy={toY(d[l.key as keyof typeof d] as number)}
                    r={hoveredIdx === i ? 5 : 3}
                    fill={l.color}
                    stroke="white" strokeWidth="1.5"
                    style={{ transition: 'r 0.1s' }}
                  />
                )))}

                {/* Etiquetas eje X */}
                {chartData.map((d, i) => (
                  <text key={i}
                    x={toX(i)} y={H - 6}
                    textAnchor="middle" fontSize="12" fill="var(--color-text-muted)"
                    fontWeight={hoveredIdx === i ? '600' : '400'}>
                    {d.mes}
                  </text>
                ))}
              </svg>

              {/* Tooltip flotante */}
              {hoveredIdx !== null && (() => {
                const d = chartData[hoveredIdx];
                const x = toX(hoveredIdx);
                const pct = (x / W) * 100;
                const alignRight = pct > 65;
                return (
                  <div className="chart-tooltip" style={{
                    left: alignRight ? 'auto' : `${pct}%`,
                    right: alignRight ? `${100 - pct}%` : 'auto',
                  }}>
                    <span className="chart-tooltip-mes">{d.mes} 2026</span>
                    {!hiddenLines.has('ingresos') && (
                      <span className="chart-tooltip-row">
                        <span className="chart-tooltip-dot" style={{ background: 'var(--color-accent)' }} />
                        Ingresos: <strong>{formatCurrency(d.ingresos)}</strong>
                      </span>
                    )}
                    {!hiddenLines.has('gastos') && (
                      <span className="chart-tooltip-row">
                        <span className="chart-tooltip-dot" style={{ background: 'var(--color-danger)' }} />
                        Gastos: <strong>{formatCurrency(d.gastos)}</strong>
                      </span>
                    )}
                    {!hiddenLines.has('obligaciones') && (
                      <span className="chart-tooltip-row">
                        <span className="chart-tooltip-dot" style={{ background: 'var(--color-info)' }} />
                        Obligaciones: <strong>{formatCurrency(d.obligaciones)}</strong>
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Leyenda */}
            <div className="chart-legend">
              {lines.map(l => (
                <button key={l.key}
                  className={`chart-legend-btn ${hiddenLines.has(l.key) ? 'legend-hidden' : ''}`}
                  onClick={() => toggleLine(l.key)}>
                  <span className="chart-legend-dot" style={{ background: l.color }} />
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
