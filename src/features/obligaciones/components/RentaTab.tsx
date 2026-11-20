import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';

interface RentaTabProps {
  ingresosRenta: number;
  deduccionCapital: number;
  gastosRenta: number;
  baseCapital: number;
  baseUtilidades: number;
  impuestoCapital: number;
  impuestoUtilidades: number;
  regimenRecomendado: 'CAPITAL' | 'UTILIDADES';
  regimenActivo: 'CAPITAL' | 'UTILIDADES';
  setRegimenActivo: (r: 'CAPITAL' | 'UTILIDADES') => void;
  onAplicarRegimen?: (r: 'CAPITAL' | 'UTILIDADES') => void;
  setShowComparativa: (s: boolean) => void;
  formatCurrency: (n: number) => string;
  isAplicando?: boolean;
}

export const RentaTab: React.FC<RentaTabProps> = ({
  ingresosRenta, deduccionCapital, gastosRenta, baseCapital, baseUtilidades,
  impuestoCapital, impuestoUtilidades, regimenRecomendado, regimenActivo,
  setRegimenActivo, onAplicarRegimen, setShowComparativa, formatCurrency, isAplicando = false
}) => (
  <>
    <div className="regimen-comparativa">
      {[
        { id: 'CAPITAL', label: 'Capital Inmobiliario', tasa: '12.75%', impuesto: impuestoCapital,
          detalle: [`Ingresos: ${formatCurrency(ingresosRenta)}`, `Deducción 15%: -${formatCurrency(deduccionCapital)}`, `Base: ${formatCurrency(baseCapital)}`] },
        { id: 'UTILIDADES', label: 'Régimen de Utilidades', tasa: '25%', impuesto: impuestoUtilidades,
          detalle: [`Ingresos: ${formatCurrency(ingresosRenta)}`, `Gastos reales: -${formatCurrency(gastosRenta)}`, `Base: ${formatCurrency(baseUtilidades)}`] },
      ].map(r => (
        <Card key={r.id} variant={regimenActivo === r.id ? 'elevated' : 'outlined'} padding="md">
          <div className="regimen-card">
            <div className="regimen-card-header">
              <span className="regimen-name">{r.label}</span>
              {regimenRecomendado === r.id && <Badge variant="success" size="sm">Recomendado</Badge>}
            </div>
            <span className="regimen-rate">{r.tasa}</span>
            <div className="regimen-detalle">
              {r.detalle.map((d, i) => <span key={i} className="regimen-detalle-item">{d}</span>)}
            </div>
            <span className={`regimen-impuesto ${regimenRecomendado === r.id ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(r.impuesto)}
            </span>
            <Button variant={regimenActivo === r.id ? 'primary' : 'outline'} size="sm"
              onClick={() => {
                if (onAplicarRegimen) {
                  onAplicarRegimen(r.id as 'CAPITAL' | 'UTILIDADES');
                } else {
                  setRegimenActivo(r.id as 'CAPITAL' | 'UTILIDADES');
                }
              }}
              disabled={isAplicando || regimenActivo === r.id}
              loading={isAplicando}>
              {regimenActivo === r.id ? 'Régimen activo' : 'Aplicar régimen'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
    <div className="comparativa-action">
      <Button variant="outline" onClick={() => setShowComparativa(true)}>Ver comparativa detallada</Button>
    </div>
  </>
);
