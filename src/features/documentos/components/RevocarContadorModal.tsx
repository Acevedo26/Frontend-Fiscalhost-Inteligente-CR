import React from 'react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { AlertTriangle } from 'lucide-react';
import { showConfirm, showSuccess } from '../../../utils/alerts';
import { ReportesService } from '../services/ReportesService';

interface Contador {
  id: number;
  nombre: string;
  email: string;
  permisos: string;
  expiracion: string;
  estado: 'ACTIVO' | 'EXPIRADO' | 'PENDIENTE';
}

interface RevocarContadorModalProps {
  contador: Contador | null;
  onClose: () => void;
  onRevocar: (contador: Contador) => void;
}

export const RevocarContadorModal: React.FC<RevocarContadorModalProps> = ({
  contador,
  onClose,
  onRevocar
}) => {
  if (!contador) return null;

  const handleConfirmRevocar = async () => {
    const confirm = await showConfirm(
      '¿Confirmar revocación de acceso?',
      `El contador ${contador.email} perderá inmediatamente el acceso a los registros contables y fiscales.`,
      'Sí, Revocar Acceso'
    );
    if (!confirm.isConfirmed) return;

    let revokeOk = false;
    try {
      await ReportesService.revocarContador(contador.id.toString(), 'Revocación de acceso de contador solicitada por el propietario.');
      revokeOk = true;
    } catch {
      // Handled by global interceptor
    }

    if (revokeOk) {
      onRevocar(contador);
      showSuccess('Acceso Revocado', `Se ha revocado correctamente el acceso al contador ${contador.email}.`);
    }
  };

  return (
    <Modal isOpen={!!contador} onClose={onClose} title="Revocar Acceso" size="sm">
      <div className="revocar-modal">
        <div className="revocar-warning">
          <AlertTriangle size={24} color="var(--color-danger)" />
          <p>¿Está seguro de revocar el acceso a <strong>{contador.email}</strong>? Esta acción es inmediata.</p>
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmRevocar}>Revocar acceso</Button>
        </div>
      </div>
    </Modal>
  );
};

