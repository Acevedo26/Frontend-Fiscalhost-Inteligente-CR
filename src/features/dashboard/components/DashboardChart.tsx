import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { TrendingDown, Upload, Plus } from 'lucide-react';
import type { DashboardEvolution } from '../types/dashboard';


const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

const W = 500;
const H = 180;
const PAD_L = 52;
const PAD_R = 16;
const PAD_T = 12;
const PAD_B = 24;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(n);

const formatK = (n: number) => (n >= 1000 ? `₡${(n / 1000).toFixed(0)}k` : `₡${n}`);

interface DashboardChartProps {
  hasData?: boolean;
  evolutionData?: DashboardEvolution[];
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ hasData = false, evolutionData }) => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<'12' | '6'>('12');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  const baseData = (evolutionData ?? []).map(d => ({
    mes: MESES[d.mes - 1] || `M${d.mes}`,
    ingresos: d.ingresosBrutos,
    gastos: d.impuestosEstimados,
    obligaciones: d.ivaRetenido + d.rentaEstimada,
  }));

  const chartData = periodo === '6' ? baseData.slice(-6) : baseData;

  const maxFromData = Math.max(
    10000,
    ...chartData.map(d => Math.max(d.ingresos, d.gastos, d.obligaciones))
  );
  const MAX_VAL = Math.ceil(maxFromData / 100000) * 100000 || 450000;
  const Y_TICKS = [0, MAX_VAL * 0.25, MAX_VAL * 0.5, MAX_VAL * 0.75, MAX_VAL];

  const toX = (i: number) =>
    chartData.length > 1 ? PAD_L + (i / (chartData.length - 1)) * PLOT_W : PAD_L + PLOT_W / 2;
  const toY = (v: number) => PAD_T + PLOT_H - (v / MAX_VAL) * PLOT_H;

  const buildPath = (key: 'ingresos' | 'gastos' | 'obligaciones') =>
    chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d[key]).toFixed(1)}`)
      .join(' ');

  const toggleLine = (line: string) => {
    const next = new Set(hiddenLines);
    next.has(line) ? next.delete(line) : next.add(line);
    setHiddenLines(next);
  };

  const lines = [
    { key: 'ingresos', label: 'Ingresos', color: 'var(--color-accent)' },
    { key: 'gastos', label: 'Gastos', color: 'var(--color-danger)' },
    { key: 'obligaciones', label: 'Obligaciones fiscales', color: 'var(--color-info)' },
  ] as const;

  return (
    <Card variant="outlined" padding="md">
      <div className="card-header">
        <h3>Evolución Mensual</h3>
        <select
          className="chart-period"
          value={periodo}
          onChange={e => setPeriodo(e.target.value as '12' | '6')}
        >
          <option value="12">Último año</option>
          <option value="6">Últimos 6 meses</option>
        </select>
      </div>

      {!hasData || chartData.length === 0 ? (
        <div className="chart-empty">
          <TrendingDown size={48} strokeWidth={1.5} color="var(--color-text-muted)" />
          <p>No hay datos disponibles para este período.</p>
          <p className="chart-empty-sub">Importe o registre información para ver la evolución fiscal.</p>
          <div className="chart-empty-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ingresos?import=true')}
            >
              <Upload size={16} /> Importar datos
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/ingresos?add=true')}
            >
              <Plus size={16} /> Registrar manualmente
            </Button>
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
                    x1={PAD_L}
                    y1={toY(v)}
                    x2={W - PAD_R}
                    y2={toY(v)}
                    stroke="var(--color-border-light)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={PAD_L - 6}
                    y={toY(v) + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="var(--color-text-muted)"
                  >
                    {formatK(v)}
                  </text>
                </g>
              ))}

              {/* Líneas de datos */}
              {lines.map(
                l =>
                  !hiddenLines.has(l.key) && (
                    <path
                      key={l.key}
                      d={buildPath(l.key)}
                      fill="none"
                      stroke={l.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )
              )}

              {/* Área de hover invisible por columna */}
              {chartData.map((_, i) => (
                <rect
                  key={i}
                  x={toX(i) - PLOT_W / Math.max(chartData.length - 1, 1) / 2}
                  y={PAD_T}
                  width={PLOT_W / Math.max(chartData.length - 1, 1)}
                  height={PLOT_H}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                />
              ))}

              {/* Línea vertical de hover */}
              {hoveredIdx !== null && (
                <line
                  x1={toX(hoveredIdx)}
                  y1={PAD_T}
                  x2={toX(hoveredIdx)}
                  y2={PAD_T + PLOT_H}
                  stroke="var(--color-border-dark)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Puntos en las 3 líneas */}
              {lines.map(
                l =>
                  !hiddenLines.has(l.key) &&
                  chartData.map((d, i) => (
                    <circle
                      key={`${l.key}-${i}`}
                      cx={toX(i)}
                      cy={toY(d[l.key as keyof typeof d] as number)}
                      r={hoveredIdx === i ? 5 : 3}
                      fill={l.color}
                      stroke="white"
                      strokeWidth="1.5"
                      style={{ transition: 'r 0.1s' }}
                    />
                  ))
              )}

              {/* Etiquetas eje X */}
              {chartData.map((d, i) => (
                <text
                  key={i}
                  x={toX(i)}
                  y={H - 6}
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--color-text-muted)"
                  fontWeight={hoveredIdx === i ? '600' : '400'}
                >
                  {d.mes}
                </text>
              ))}
            </svg>

            {/* Tooltip flotante */}
            {hoveredIdx !== null &&
              (() => {
                const d = chartData[hoveredIdx];
                const x = toX(hoveredIdx);
                const pct = (x / W) * 100;
                const alignRight = pct > 65;
                return (
                  <div
                    className="chart-tooltip"
                    style={{
                      left: alignRight ? 'auto' : `${pct}%`,
                      right: alignRight ? `${100 - pct}%` : 'auto',
                    }}
                  >
                    <span className="chart-tooltip-mes">{d.mes} 2026</span>
                    {!hiddenLines.has('ingresos') && (
                      <span className="chart-tooltip-row">
                        <span
                          className="chart-tooltip-dot"
                          style={{ background: 'var(--color-accent)' }}
                        />
                        Ingresos: <strong>{formatCurrency(d.ingresos)}</strong>
                      </span>
                    )}
                    {!hiddenLines.has('gastos') && (
                      <span className="chart-tooltip-row">
                        <span
                          className="chart-tooltip-dot"
                          style={{ background: 'var(--color-danger)' }}
                        />
                        Gastos: <strong>{formatCurrency(d.gastos)}</strong>
                      </span>
                    )}
                    {!hiddenLines.has('obligaciones') && (
                      <span className="chart-tooltip-row">
                        <span
                          className="chart-tooltip-dot"
                          style={{ background: 'var(--color-info)' }}
                        />
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
              <button
                key={l.key}
                type="button"
                className={`chart-legend-btn ${hiddenLines.has(l.key) ? 'legend-hidden' : ''}`}
                onClick={() => toggleLine(l.key)}
              >
                <span className="chart-legend-dot" style={{ background: l.color }} />
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
