import React from 'react';
import { Badge } from '../../../components/common/Badge';
import { Card } from '../../../components/common/Card';
import { X } from 'lucide-react';

interface ComprobantesTableProps {
  comprobantes: any[];
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  onDelete?: (gasto: any) => void;
}

export const ComprobantesTable: React.FC<ComprobantesTableProps> = ({ comprobantes, isLoading, formatCurrency, onDelete }) => {
  return (
    <Card variant="outlined" padding="none">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Crédito Fiscal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center p-4">Cargando...</td></tr>
            ) : comprobantes.map((c: any) => (
              <tr key={c.gastoId || c.id}>
                <td className="cell-concept">{c.numeroFactura || 'N/A'}</td>
                <td>{c.proveedor}</td>
                <td className="cell-date">{c.fechaEmision || c.fecha}</td>
                <td className="cell-amount expense">{formatCurrency(c.montoTotal || c.monto)}</td>
                <td>
                  {(((c as any).fuenteRegistro ?? 1) === 1 || ((c as any).fuenteRegistro ?? 1) === 2) && (
                    <div className="flex gap-2">
                      <Badge variant={c.esCreditoFiscalValido ? 'success' : 'warning'} size="sm">
                        {c.esCreditoFiscalValido ? 'Hacienda' : 'Pendiente'}
                      </Badge>
                      <Badge variant={c.esCreditoFiscalValido ? 'success' : 'default'} size="sm">
                        {c.esCreditoFiscalValido ? 'OCR' : 'Pendiente'}
                      </Badge>
                    </div>
                  )}
                </td>
                <td>
                  {c.esCreditoFiscalValido
                    ? <Badge variant="success" size="sm">Apto</Badge>
                    : <Badge variant="default" size="sm">No apto</Badge>
                  }
                </td>
                <td className="cell-actions">
                  <button
                    className="action-btn action-btn-danger"
                    title="Eliminar"
                    onClick={() => onDelete?.(c)}
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {comprobantes.length === 0 && !isLoading && (
              <tr><td colSpan={7} className="text-center p-4">No hay comprobantes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
