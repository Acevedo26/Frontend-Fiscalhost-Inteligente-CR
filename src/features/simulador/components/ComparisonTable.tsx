import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Download } from 'lucide-react';
import type { Escenario } from '../types/simulador';
import { calcularIVA, calcularRenta, formatCurrency } from '../utils/simuladorUtils';

interface ComparisonTableProps {
  escenarios: Escenario[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ escenarios }) => {
  return (
    <Card variant="elevated" padding="lg">
      <h3>Comparación de escenarios</h3>
      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Escenario</th>
              <th>Ingresos</th>
              <th>Gastos</th>
              <th>IVA</th>
              <th>Renta</th>
              <th>Flujo neto</th>
            </tr>
          </thead>
          <tbody>
            {escenarios.map((escenario) => (
              <tr key={escenario.id}>
                <td>{escenario.nombre}</td>
                <td>{formatCurrency(escenario.ingresos)}</td>
                <td>{formatCurrency(escenario.gastos)}</td>
                <td>{formatCurrency(calcularIVA(escenario.ingresos, escenario.gastos))}</td>
                <td>{formatCurrency(calcularRenta(escenario.ingresos, escenario.gastos, escenario.activo))}</td>
                <td className="neto">{formatCurrency(escenario.ingresos - escenario.gastos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="comparison-actions">
        <Button variant="outline">
          <Download size={18} />
          Exportar a PDF
        </Button>
      </div>
    </Card>
  );
};
