import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { TriangleAlert, TrendingUp, AlertCircle, Info } from 'lucide-react';

const LIMITE_EXENCION_DEFAULT = 4200000;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(n);

interface DashboardSemaphoreProps {
  acumulado?: number;
  limite?: number;
  nivelRiesgo?: string;
}

export const DashboardSemaphore: React.FC<DashboardSemaphoreProps> = ({
  acumulado = 1850000,
  limite = LIMITE_EXENCION_DEFAULT,
  nivelRiesgo,
}) => {
  const navigate = useNavigate();
  const [showTooltipSemaforo, setShowTooltipSemaforo] = useState(false);

  const semaforoRatio = limite > 0 ? acumulado / limite : 0;

  // Determine color and status
  let semaforoColor: 'danger' | 'warning' | 'success' = 'success';
  let semaforoLabel = 'Seguro';

  if (nivelRiesgo) {
    const rLower = nivelRiesgo.toLowerCase();
    if (rLower.includes('alto') || rLower.includes('danger')) {
      semaforoColor = 'danger';
      semaforoLabel = 'Riesgo Alto';
    } else if (rLower.includes('medio') || rLower.includes('moderado') || rLower.includes('warning')) {
      semaforoColor = 'warning';
      semaforoLabel = 'Cerca del límite';
    } else {
      semaforoColor = 'success';
      semaforoLabel = 'Seguro';
    }
  } else {
    if (semaforoRatio >= 1) {
      semaforoColor = 'danger';
      semaforoLabel = 'Límite alcanzado';
    } else if (semaforoRatio >= 0.75) {
      semaforoColor = 'warning';
      semaforoLabel = 'Cerca del límite';
    } else {
      semaforoColor = 'success';
      semaforoLabel = 'Seguro';
    }
  }

  return (
    <div className={`dashboard-semaphore semaphore-${semaforoColor}`}>
      <div className={`semaphore-icon-wrap semaphore-icon-${semaforoColor}`}>
        {semaforoColor === 'danger' ? (
          <AlertCircle size={26} />
        ) : semaforoColor === 'warning' ? (
          <TriangleAlert size={26} />
        ) : (
          <TrendingUp size={26} />
        )}
      </div>
      <div className="semaphore-content">
        <h3>{semaforoLabel}: Riesgo fiscal</h3>
        <p>
          {semaforoColor === 'danger'
            ? 'Has superado el límite de exención anual. Debes preparar y presentar tu declaración tributaria.'
            : semaforoColor === 'warning'
            ? 'Estás cerca del límite de exención anual. Monitorea tus ingresos de hospedaje turístico.'
            : 'Tus ingresos se encuentran dentro del margen de tranquilidad y exención fiscal.'}
        </p>
        <div className="semaphore-bar-row">
          <div className="semaphore-bar">
            <div
              className={`semaphore-fill semaphore-fill-${semaforoColor}`}
              style={{ width: `${Math.min(semaforoRatio * 100, 100)}%` }}
            />
          </div>
          <span className="semaphore-pct">{Math.round(semaforoRatio * 100)}%</span>
          <div
            className="semaphore-info-btn"
            onMouseEnter={() => setShowTooltipSemaforo(true)}
            onMouseLeave={() => setShowTooltipSemaforo(false)}
          >
            <Info size={14} />
            {showTooltipSemaforo && (
              <div className="semaphore-tooltip">
                Acumulado anual: {formatCurrency(acumulado)}
                <br />
                Límite de exención: {formatCurrency(limite)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Button variant="outline" onClick={() => navigate('/impuestos')}>
        Generar Borrador
      </Button>
    </div>
  );
};
