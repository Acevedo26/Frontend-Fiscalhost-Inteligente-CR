import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { showWarning } from '../../../utils/alerts';
import type { Transaccion } from '../types';

interface EditTransactionModalProps {
  editTx: Transaccion | null;
  onClose: () => void;
  editMonto: string;
  setEditMonto: (monto: string) => void;
  editRazon: string;
  setEditRazon: (razon: string) => void;
  editRazonError: string;
  setEditRazonError: (error: string) => void;
  handleSaveEdit: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  editTx, onClose, editMonto, setEditMonto, editRazon, setEditRazon, editRazonError, setEditRazonError, handleSaveEdit
}) => {
  const handleSubmit = () => {
    const montoNum = Number(editMonto);
    if (!editMonto || isNaN(montoNum) || montoNum <= 0) {
      setEditRazonError('El monto debe ser mayor a cero');
      showWarning('Monto Inválido', 'El nuevo monto debe ser un valor numérico mayor a cero (₡).');
      return;
    }

    if (!editRazon || !editRazon.trim()) {
      setEditRazonError('Debe ingresar una razón para modificar este campo');
      showWarning(
        'Justificación Requerida',
        'La Ley 8968 exige detallar el motivo del cambio para el registro de auditoría fiscal inalterable.'
      );
      return;
    }

    handleSaveEdit();
  };

  return (
    <Modal isOpen={!!editTx} onClose={onClose} title="Editar Registro" size="sm">
      <div className="modal-form">
        <p className="audit-notice">
          Modificar un campo sensible requiere justificación para auditoría fiscal (Ley 8968).
        </p>
        <Input
          label="Nuevo monto (₡)"
          type="number"
          value={editMonto}
          onChange={e => {
            setEditMonto(e.target.value);
            setEditRazonError('');
          }}
        />
        <Input
          label="Razón del cambio (requerido para auditoría fiscal)"
          placeholder="Describe el motivo del ajuste..."
          value={editRazon}
          onChange={e => {
            setEditRazon(e.target.value);
            setEditRazonError('');
          }}
          error={editRazonError}
        />
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Guardar</Button>
        </div>
      </div>
    </Modal>
  );
};
