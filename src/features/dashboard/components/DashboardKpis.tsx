import React from 'react';
import { Card } from '../../../components/common/Card';
import { DollarSign, Receipt, FileText, Wallet } from 'lucide-react';
import type { DashboardMetrics } from '../types/dashboard';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(n);

interface DashboardKpisProps {
  metrics?: DashboardMetrics;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ metrics }) => {
  const kpiData = [
    {
      id: 'brutos',
      label: 'Ingresos Brutos',
      value: formatCurrency(metrics?.ingresosBrutos ?? 0),
      status: 'neutral',
      subtitle: 'Acumulado 2026',
      icon: <DollarSign size={18} />,
    },
    {
      id: 'iva',
      label: 'IVA Retenido',
      value: formatCurrency(metrics?.ivaRetenido ?? 0),
      status: 'danger',
      subtitle: 'Vence en 3 días',
      icon: <Receipt size={18} />,
    },
    {
      id: 'renta',
      label: 'Renta Estimada',
      value: formatCurrency(metrics?.rentaEstimada ?? 0),
      status: 'warning',
      subtitle: 'Proyección anual',
      icon: <FileText size={18} />,
    },
    {
      id: 'neto',
      label: 'Neto Disponible',
      value: formatCurrency(metrics?.ingresosNetos ?? 0),
      status: 'success',
      subtitle: 'Después de impuestos',
      icon: <Wallet size={18} />,
    },
  ];

  return (
    <div className="dashboard-kpis">
      {kpiData.map(kpi => (
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
  );
};
