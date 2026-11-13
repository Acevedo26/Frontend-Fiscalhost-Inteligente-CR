import React from 'react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(n);

interface ComparativaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingresosRenta: number;
  deduccionCapital: number;
  gastosRenta: number;
  baseCapital: number;
  baseUtilidades: number;
  impuestoCapital: number;
  impuestoUtilidades: number;
  regimenRecomendado: 'CAPITAL' | 'UTILIDADES';
  setRegimenActivo: (regimen: 'CAPITAL' | 'UTILIDADES') => void;
  onAplicarRegimen?: (regimen: 'CAPITAL' | 'UTILIDADES') => void;
}

export const ComparativaModal: React.FC<ComparativaModalProps> = ({
  isOpen,
  onClose,
  ingresosRenta,
  deduccionCapital,
  gastosRenta,
  baseCapital,
  baseUtilidades,
  impuestoCapital,
  impuestoUtilidades,
  regimenRecomendado,
  setRegimenActivo,
  onAplicarRegimen
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comparativa de Regímenes" size="md">
      <div className="comparativa-modal">
        <table className="comparativa-table">
          <thead>
            <tr><th>Concepto</th><th>Capital Inmobiliario</th><th>Utilidades</th></tr>
          </thead>
          <tbody>
            <tr><td>Ingresos</td><td>{formatCurrency(ingresosRenta)}</td><td>{formatCurrency(ingresosRenta)}</td></tr>
            <tr><td>Deducción</td><td>15% fija ({formatCurrency(deduccionCapital)})</td><td>Gastos reales ({formatCurrency(gastosRenta)})</td></tr>
            <tr><td>Base imponible</td><td>{formatCurrency(baseCapital)}</td><td>{formatCurrency(baseUtilidades)}</td></tr>
            <tr><td>Tasa</td><td>12.75%</td><td>25%</td></tr>
            <tr className="comparativa-total">
              <td>Impuesto</td>
              <td className={regimenRecomendado === 'CAPITAL' ? 'text-success' : ''}>{formatCurrency(impuestoCapital)}</td>
              <td className={regimenRecomendado === 'UTILIDADES' ? 'text-success' : ''}>{formatCurrency(impuestoUtilidades)}</td>
            </tr>
          </tbody>
        </table>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" onClick={() => {
            if (onAplicarRegimen) {
              onAplicarRegimen(regimenRecomendado);
            } else {
              setRegimenActivo(regimenRecomendado);
            }
            onClose();
          }}>
            Aplicar régimen recomendado
          </Button>
        </div>
      </div>
    </Modal>
  );
};

