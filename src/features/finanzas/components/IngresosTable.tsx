import React from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { RefreshCw, Pencil, Trash2 } from 'lucide-react';
import type { Transaccion, Clasificacion } from '../types';

interface IngresosTableProps {
  activeTab: 'ingresos' | 'gastos';
  list: Transaccion[];
  onEdit: (tx: Transaccion) => void;
  onDelete: (id: number | string) => void;
  onReclassify: (tx: Transaccion) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);

const clasifBadge = (c: Clasificacion) => {
  const map: Record<Clasificacion, { variant: 'info' | 'success' | 'warning' | 'default'; label: string }> = {
    GRAVADO_13: { variant: 'info', label: 'Gravado 13% IVA' },
    EXENTO: { variant: 'success', label: 'Exento de IVA' },
    RETENCION_15: { variant: 'warning', label: 'Retención 15%' },
    PENDIENTE: { variant: 'default', label: 'Pendiente' },
  };
  return map[c] ?? map.PENDIENTE; 
};

export const IngresosTable: React.FC<IngresosTableProps> = ({ activeTab, list, onEdit, onDelete, onReclassify }) => {
  return (
    <Card variant="outlined" padding="none">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              {activeTab === 'ingresos' ? <th>Fuente</th> : <th>Proveedor</th>}
              <th>Monto</th>
              {activeTab === 'ingresos' && <th>Clasificación</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((tx) => (
              <tr key={tx.id}>
                <td className="cell-date">{tx.fecha}</td>
                <td className="cell-concept">
                  {tx.concepto}
                  {tx.editado && (
                    <span className="edited-badge" title={`Modificado — ${tx.historial?.at(-1)?.razon ?? ''}`}>✎</span>
                  )}
                </td>
                {activeTab === 'ingresos' ? <td>{tx.fuente}</td> : <td>{tx.proveedor}</td>}
                <td className={`cell-amount ${tx.tipo === 'GASTO' ? 'expense' : 'income'}`}>
                  {tx.tipo === 'GASTO' ? '-' : '+'}{formatCurrency(tx.monto)}
                </td>
                {activeTab === 'ingresos' && tx.clasificacion && (
                  <td>
                    <div className="clasif-cell">
                      <Badge variant={clasifBadge(tx.clasificacion).variant} size="sm">
                        {clasifBadge(tx.clasificacion).label}
                      </Badge>
                      <button className="action-btn" title="Reclasificar" onClick={() => onReclassify(tx)}>
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </td>
                )}
                <td className="cell-actions">
                  <button className="action-btn" title="Editar" onClick={() => onEdit(tx)}>
                    <Pencil size={16} />
                  </button>
                  <button className="action-btn action-btn-danger" title="Eliminar" onClick={() => onDelete(tx.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
