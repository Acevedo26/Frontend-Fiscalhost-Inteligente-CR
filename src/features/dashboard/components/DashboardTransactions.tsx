import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';

const defaultTransactions = [
  { id: 1, date: '15/04/2026', concept: 'Reserva Airbnb #2847', amount: 45000, type: 'income', classification: 'GRAVADO_13' },
  { id: 2, date: '14/04/2026', concept: 'Reserva Booking #B3921', amount: 32000, type: 'income', classification: 'GRAVADO_13' },
  { id: 3, date: '12/04/2026', concept: 'Limpieza Villa Sol', amount: -15000, type: 'expense', classification: 'GASTO' },
  { id: 4, date: '10/04/2026', concept: 'Reserva Directa', amount: 28000, type: 'income', classification: 'EXENTO' },
  { id: 5, date: '08/04/2026', concept: 'Mantenimiento AC', amount: -35000, type: 'expense', classification: 'GASTO' },
];

interface DashboardTransactionsProps {
  transactions?: Array<{
    id: string | number;
    date: string;
    concept: string;
    amount: number;
    type: string;
    classification?: string;
  }>;
}

export const DashboardTransactions: React.FC<DashboardTransactionsProps> = ({ transactions }) => {
  const navigate = useNavigate();
  const txList = transactions && transactions.length > 0 ? transactions : defaultTransactions;

  return (
    <Card variant="outlined" padding="md">
      <div className="card-header">
        <h3>Ingresos Recientes</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/ingresos')}>
          Ver todos
        </Button>
      </div>
      <div className="transactions-list">
        {txList.map(tx => (
          <div key={tx.id} className="transaction-item">
            <div className="transaction-info">
              <span className="transaction-date">{tx.date}</span>
              <span className="transaction-concept">{tx.concept}</span>
            </div>
            <div className="transaction-right">
              <span className={`transaction-amount ${tx.type === 'expense' ? 'expense' : 'income'}`}>
                {tx.type === 'expense' ? '-' : '+'}₡{Math.abs(tx.amount).toLocaleString()}
              </span>
              {tx.classification && tx.classification !== 'GASTO' && (
                <Badge variant={tx.classification === 'GRAVADO_13' ? 'info' : 'success'} size="sm">
                  {tx.classification === 'GRAVADO_13' ? '13%' : 'Exento'}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
