import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { X } from 'lucide-react';
import type { Contador } from '../pages/Reportes';

interface AutorizarContadorCardProps {
  contadores: Contador[];
  onInvitar: () => void;
  onRevocar: (contador: Contador) => void;
  isRevoking?: boolean;
}

const diasHastaExpiracion = (fecha: string) => {
  const diff = new Date(fecha).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const AutorizarContadorCard: React.FC<AutorizarContadorCardProps> = ({ contadores, onInvitar, onRevocar, isRevoking = false }) => {
  return (
    <Card variant="outlined" padding="md">
      <div className="card-header">
        <h3>Autorizar Contador</h3>
        <Button variant="primary" size="sm" onClick={onInvitar}>Invitar Contador</Button>
      </div>
      <div className="contadores-list">
        {contadores.map(c => {
          const dias = diasHastaExpiracion(c.expiracion);
          const proxAVencer = c.estado === 'ACTIVO' && dias <= 7 && dias > 0;
          return (
            <div key={c.id} className="contador-item">
              <div className="contador-avatar">{c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div className="contador-info">
                <span className="contador-nombre">{c.nombre}</span>
                <span className="contador-email">{c.email}</span>
              </div>
              <Badge variant={c.estado === 'ACTIVO' ? 'success' : c.estado === 'PENDIENTE' ? 'warning' : 'default'} size="sm">
                {c.estado}
              </Badge>
              <div className="contador-details">
                <span>Permisos: {c.permisos}</span>
                <span className={proxAVencer ? 'expiracion-prox' : ''}>
                  Expira: {new Date(c.expiracion).toLocaleDateString('es-CR')}
                  {proxAVencer && <Badge variant="warning" size="sm">{dias}d</Badge>}
                </span>
              </div>
              <button className="action-icon action-icon-danger" title="Revocar"
                onClick={() => onRevocar(c)}
                disabled={isRevoking}>
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
