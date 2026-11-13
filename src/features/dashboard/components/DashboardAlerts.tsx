import React from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { AlertCircle, Info } from 'lucide-react';

const alerts = [
  { id: 1, title: 'D-104 vence pronto',       message: 'Genera tu borrador antes del 15 de mayo', priority: 'high' },
  { id: 2, title: 'Clasificación pendiente',  message: '2 ingresos requieren revisión manual',     priority: 'medium' },
];

export const DashboardAlerts: React.FC = () => {
  return (
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
  );
};
