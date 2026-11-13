import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Select } from '../../../components/common/Select';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { showWarning } from '../../../utils/alerts';
import type { Transaccion, Clasificacion } from '../types';

interface ReclassifyModalProps {
  reclasificarTx: Transaccion | null;
  onClose: () => void;
  optionsClasificacion: { label: string; value: string }[];
  nuevaClasif: Clasificacion;
  setNuevaClasif: (clasif: Clasificacion) => void;
  reclasifJustif: string;
  setReclasifJustif: (justif: string) => void;
  reclasifError: string;
  setReclasifError: (error: string) => void;
  handleSaveReclasif: () => void;
}

export const ReclassifyModal: React.FC<ReclassifyModalProps> = ({
  reclasificarTx, onClose, optionsClasificacion, nuevaClasif, setNuevaClasif, reclasifJustif, setReclasifJustif, reclasifError, setReclasifError, handleSaveReclasif
}) => {
  const handleSubmit = () => {
    if (!nuevaClasif) {
      setReclasifError('Debe seleccionar una clasificación');
      showWarning('Clasificación Requerida', 'Por favor seleccione la nueva clasificación fiscal.');
      return;
    }

    if (!reclasifJustif || !reclasifJustif.trim()) {
      setReclasifError('Debe indicar una razón para la reclasificación');
      showWarning('Justificación Requerida', 'Debe indicar el motivo tributario para la reclasificación del ingreso.');
      return;
    }

    handleSaveReclasif();
  };

  return (
    <Modal isOpen={!!reclasificarTx} onClose={onClose} title="Cambiar Clasificación Fiscal" size="sm">
      <div className="modal-form">
        <Select
          label="Nueva clasificación"
          options={optionsClasificacion}
          value={nuevaClasif}
          onChange={v => {
            setNuevaClasif(v as Clasificacion);
            setReclasifError('');
          }}
        />
        <Input
          label="Justificación tributaria (obligatoria)"
          placeholder="Razón del cambio según comprobante o exención..."
          value={reclasifJustif}
          onChange={e => {
            setReclasifJustif(e.target.value);
            setReclasifError('');
          }}
          error={reclasifError}
        />
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Confirmar</Button>
        </div>
      </div>
    </Modal>
  );
};
