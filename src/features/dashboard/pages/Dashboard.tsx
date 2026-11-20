import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useAuthContext } from '../../auth/context/AuthContext';
import { Button } from '../../../components/common/Button';
import { Upload } from 'lucide-react';
import { DashboardSemaphore } from '../components/DashboardSemaphore';
import { DashboardKpis } from '../components/DashboardKpis';
import { DashboardTransactions } from '../components/DashboardTransactions';
import { DashboardAlerts } from '../components/DashboardAlerts';
import { DashboardChart } from '../components/DashboardChart';
import './Dashboard.css';

interface DashboardProps {
  userName?: string;
  hasData?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ userName, hasData = true }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  const { user } = useAuthContext();

  // Retrieve user name from auth context
  let displayName = userName || user?.nombreCompleto || user?.nombre || user?.correoElectronico;

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <h1>Hola, {displayName} 👋</h1>
          <p>Este es tu centro de tranquilidad y cumplimiento fiscal</p>
        </div>
        <div className="dashboard-actions">
          <Button variant="primary" onClick={() => navigate('/ingresos?import=true')}>
            <Upload size={18} /> Importar Datos
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="dashboard-loading" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Cargando información fiscal actualizada...</p>
        </div>
      ) : (
        <>
          {/* ── Semáforo ── */}
          <DashboardSemaphore
            acumulado={data?.metricas?.ingresosBrutos}
            nivelRiesgo={data?.riesgoFiscal?.nivelRiesgo}
          />

          {/* ── KPIs ── */}
          <DashboardKpis metrics={data?.metricas} />

          {/* ── Grid: Transacciones + Alertas ── */}
          <div className="dashboard-grid">
            <DashboardTransactions />
            <DashboardAlerts />
          </div>

          {/* ── Gráfico de líneas ── */}
          <DashboardChart
            hasData={hasData && data?.tieneDatos === true}
            evolutionData={data?.evolucionMensual}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
