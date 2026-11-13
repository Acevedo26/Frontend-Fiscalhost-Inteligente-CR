import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Info } from 'lucide-react';

interface IvaTabProps {
  ingresos: number;
  debitoFiscal: number;
  creditoFiscal: number;
  ivaNeto: number;
  saldoAFavor: boolean;
  formatCurrency: (n: number) => string;
  onVerDetalleDebito?: () => void;
  onVerDetalleCredito?: () => void;
}

export const IvaTab: React.FC<IvaTabProps> = ({
  ingresos,
  debitoFiscal,
  creditoFiscal,
  ivaNeto,
  saldoAFavor,
  formatCurrency,
  onVerDetalleDebito,
  onVerDetalleCredito
}) => (
  <div className="iva-cards">
    <Card variant="outlined" padding="md">
      <div className="iva-card-content">
        <span className="iva-card-label">Ingresos gravados</span>
        <span className="iva-card-value">{formatCurrency(ingresos)}</span>
        <span className="iva-card-sub">Período: Abril 2026</span>
      </div>
    </Card>
    <Card variant="outlined" padding="md">
      <div className="iva-card-content">
        <span className="iva-card-label">Débito fiscal (13%)</span>
        <span className="iva-card-value">{formatCurrency(debitoFiscal)}</span>
        <Button variant="ghost" size="sm" onClick={onVerDetalleDebito}>Ver detalle</Button>
      </div>
    </Card>
    <Card variant="outlined" padding="md">
      <div className="iva-card-content">
        <span className="iva-card-label">Crédito fiscal</span>
        <span className="iva-card-value">{formatCurrency(creditoFiscal)}</span>
        <Button variant="ghost" size="sm" onClick={onVerDetalleCredito}>Ver detalle</Button>
      </div>
    </Card>
    <Card variant={saldoAFavor ? 'elevated' : 'outlined'} padding="md">
      <div className="iva-card-content">
        <span className="iva-card-label">IVA neto {saldoAFavor ? '— Saldo a favor' : 'a pagar'}</span>
        <span className={`iva-card-value ${saldoAFavor ? 'text-success' : 'text-danger'}`}>
          {saldoAFavor ? '-' : ''}{formatCurrency(Math.abs(ivaNeto))}
        </span>
        {saldoAFavor && (
          <div className="saldo-favor-banner">
            <Info size={14} /> Este saldo se aplicará automáticamente al próximo período
          </div>
        )}
        {!saldoAFavor && <Badge variant="success" size="sm">Período calculado correctamente</Badge>}
      </div>
    </Card>
  </div>
);
