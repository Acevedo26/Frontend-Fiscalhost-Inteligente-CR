import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { showWarning } from '../../../utils/alerts';
import type { Clasificacion } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'ingresos' | 'gastos';
  addForm: {
    fecha: string;
    concepto: string;
    monto: string;
    fuente?: string;
    proveedor?: string;
    clasificacion?: Clasificacion;
  };
  setAddForm: React.Dispatch<React.SetStateAction<any>>;
  addErrors: Record<string, string>;
  setAddErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSaveAdd: () => void;
  isSaving?: boolean;
  optionsClasificacion: { label: string; value: string }[];
  optionsFuente: { label: string; value: string }[];
  today: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen, onClose, activeTab, addForm, setAddForm, addErrors, setAddErrors, handleSaveAdd, isSaving = false, optionsClasificacion, optionsFuente, today
}) => {
  const handleSubmit = () => {
    const errors: Record<string, string> = {};

    if (!addForm.fecha) {
      errors.fecha = 'Fecha requerida';
      setAddErrors(errors);
      showWarning('Fecha Requerida', 'Por favor ingrese la fecha de la transacción.');
      return;
    }

    if (addForm.fecha > today) {
      errors.fecha = 'No se permiten fechas futuras';
      setAddErrors(errors);
      showWarning('Fecha Inválida', 'No se pueden registrar transacciones con fecha futura.');
      return;
    }

    if (!addForm.concepto || !addForm.concepto.trim()) {
      errors.concepto = 'Concepto requerido';
      setAddErrors(errors);
      showWarning('Concepto Requerido', 'Por favor ingrese una descripción o concepto para la transacción.');
      return;
    }

    const montoNum = Number(addForm.monto);
    if (!addForm.monto || isNaN(montoNum) || montoNum <= 0) {
      errors.monto = 'El monto debe ser mayor a cero';
      setAddErrors(errors);
      showWarning('Monto Inválido', 'El monto de la transacción debe ser un número mayor a cero (₡).');
      return;
    }

    if (activeTab === 'gastos' && !addForm.proveedor?.trim() && !addForm.concepto.trim()) {
      errors.proveedor = 'Proveedor requerido';
      setAddErrors(errors);
      showWarning('Proveedor Requerido', 'Por favor indique el nombre del proveedor.');
      return;
    }

    handleSaveAdd();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activeTab === 'ingresos' ? 'Agregar Ingreso' : 'Agregar Gasto'} size="md">
      <div className="modal-form">
        <Input
          label="Fecha"
          type="date"
          max={today}
          value={addForm.fecha}
          onChange={e => {
            setAddForm({ ...addForm, fecha: e.target.value });
            setAddErrors(prev => ({ ...prev, fecha: '' }));
          }}
          error={addErrors.fecha}
        />
        <Input
          label="Concepto"
          placeholder={activeTab === 'ingresos' ? 'Ej: Reserva Airbnb #1234' : 'Ej: Mantenimiento de aire acondicionado'}
          value={addForm.concepto}
          onChange={e => {
            setAddForm({ ...addForm, concepto: e.target.value });
            setAddErrors(prev => ({ ...prev, concepto: '' }));
          }}
          error={addErrors.concepto}
        />
        <Input
          label="Monto (₡)"
          type="number"
          placeholder="0"
          value={addForm.monto}
          onChange={e => {
            setAddForm({ ...addForm, monto: e.target.value });
            setAddErrors(prev => ({ ...prev, monto: '' }));
          }}
          error={addErrors.monto}
        />
        {activeTab === 'ingresos' ? (
          <Select
            label="Fuente"
            options={optionsFuente}
            value={addForm.fuente || 'AIRBNB'}
            onChange={v => setAddForm({ ...addForm, fuente: v })}
            placeholder="Selecciona la fuente"
          />
        ) : (
          <Input
            label="Proveedor"
            placeholder="Nombre del proveedor o comercio"
            value={addForm.proveedor || ''}
            onChange={e => {
              setAddForm({ ...addForm, proveedor: e.target.value });
              setAddErrors(prev => ({ ...prev, proveedor: '' }));
            }}
            error={addErrors.proveedor}
          />
        )}
        {activeTab === 'ingresos' && (
          <Select
            label="Clasificación"
            options={optionsClasificacion}
            value={addForm.clasificacion || 'GRAVADO_13'}
            onChange={v => setAddForm({ ...addForm, clasificacion: v as Clasificacion })}
          />
        )}
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={isSaving}>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
