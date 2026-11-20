import React from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { X } from 'lucide-react';
import type { Escenario } from '../types/simulador';
import { calcularIVA, calcularRenta, formatCurrency, getDiferencia } from '../utils/simuladorUtils';

interface EscenarioCardProps {
  escenario: Escenario;
  escenarioBase: Escenario;
  isBase: boolean;
  onUpdate: (id: string, updates: Partial<Escenario>) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const EscenarioCard: React.FC<EscenarioCardProps> = ({
  escenario,
  escenarioBase,
  isBase,
  onUpdate,
  onDelete,
  isDeleting = false,
}) => {
  const diff = getDiferencia(escenario, escenarioBase);

  return (
    <Card variant={isBase ? 'elevated' : 'outlined'} padding="md">
      <div className="escenario-header">
        <h3>{escenario.nombre}</h3>
        {!isBase && (
          <button 
            className="eliminar-btn"
            onClick={() => onDelete(escenario.id)}
            disabled={isDeleting}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="escenario-inputs">
        <div className="input-group">
          <label>Ingresos mensuales</label>
          <Input
            type="number"
            value={escenario.ingresos}
            onChange={(e) => onUpdate(escenario.id, { ingresos: Number(e.target.value) })}
            disabled={isBase}
          />
        </div>
        <div className="input-group">
          <label>Gastos deducibles</label>
          <Input
            type="number"
            value={escenario.gastos}
            onChange={(e) => onUpdate(escenario.id, { gastos: Number(e.target.value) })}
            disabled={isBase}
          />
        </div>
        <div className="input-group">
          <label>Compra de activo (opcional)</label>
          <Input
            type="number"
            value={escenario.activo}
            onChange={(e) => onUpdate(escenario.id, { activo: Number(e.target.value) })}
            disabled={isBase}
          />
        </div>
      </div>

      <div className="escenario-resultados">
        <div className="resultado-item">
          <span className="resultado-label">IVA proyectado</span>
          <span className="resultado-value">
            {formatCurrency(calcularIVA(escenario.ingresos, escenario.gastos))}
          </span>
        </div>
        <div className="resultado-item">
          <span className="resultado-label">Renta proyectada</span>
          <span className="resultado-value">
            {formatCurrency(calcularRenta(escenario.ingresos, escenario.gastos, escenario.activo))}
          </span>
        </div>
        <div className="resultado-item resultado-neto">
          <span className="resultado-label">Flujo neto</span>
          <span className="resultado-value">
            {formatCurrency(escenario.ingresos - escenario.gastos)}
          </span>
        </div>
      </div>

      {!isBase && (
        <div className="escenario-diferencia">
          <span>vs escenario base:</span>
          <span className={diff.iva > 0 ? 'text-danger' : diff.iva < 0 ? 'text-success' : ''}>
            {diff.iva > 0 ? '+' : ''}{formatCurrency(diff.iva)} IVA
          </span>
          <span className={diff.renta > 0 ? 'text-danger' : diff.renta < 0 ? 'text-success' : ''}>
            {diff.renta > 0 ? '+' : ''}{formatCurrency(diff.renta)} Renta
          </span>
        </div>
      )}
    </Card>
  );
};
