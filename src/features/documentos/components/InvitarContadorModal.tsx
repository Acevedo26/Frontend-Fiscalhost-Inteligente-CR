import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { CheckCircle } from 'lucide-react';
import { showWarning, showSuccess } from '../../../utils/alerts';
import { ReportesService } from '../services/ReportesService';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

interface Contador {
  id: number;
  nombre: string;
  email: string;
  permisos: string;
  expiracion: string;
  estado: 'ACTIVO' | 'EXPIRADO' | 'PENDIENTE';
}

interface InvitarContadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitar: (contador: Contador) => void;
}

export const InvitarContadorModal: React.FC<InvitarContadorModalProps> = ({
  isOpen,
  onClose,
  onInvitar
}) => {
  const [invEmail, setInvEmail] = useState('');
  const [invIdentificacion, setInvIdentificacion] = useState('');
  const [invEmailError, setInvEmailError] = useState('');
  const [invPermiso, setInvPermiso] = useState('Solo Lectura');
  const [invExpiracion, setInvExpiracion] = useState('');
  const [invSuccess, setInvSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvitar = async () => {
    if (!invEmail || !isValidEmail(invEmail)) {
      setInvEmailError('Formato de correo inválido. Por favor verifique');
      showWarning('Correo Inválido', 'Debe ingresar un correo electrónico válido para invitar al contador.');
      return;
    }

    if (!invIdentificacion || invIdentificacion.trim().length < 5) {
      showWarning('Identificación Requerida', 'Debe indicar el número de cédula o carné profesional del contador (mínimo 5 caracteres).');
      return;
    }

    setIsSubmitting(true);
    try {
      await ReportesService.invitarContador({
        correoContador: invEmail,
        puedeVerIngresos: true,
        puedeVerGastos: invPermiso !== 'Solo Lectura',
        puedeGenerarReportes: invPermiso === 'Acceso Total' || invPermiso === 'Lectura + Exportación',
        fechaExpiracion: invExpiracion ? new Date(invExpiracion).toISOString() : null,
      });
    } catch {
      // Global error handler
    } finally {
      setIsSubmitting(false);
    }

    const nuevo: Contador = {
      id: Date.now(),
      nombre: invEmail.split('@')[0],
      email: invEmail,
      permisos: invPermiso,
      expiracion: invExpiracion || '2026-12-31',
      estado: 'PENDIENTE',
    };
    onInvitar(nuevo);
    setInvSuccess(true);
    showSuccess('Invitación Enviada', `Se ha emitido la invitación formal para el contador ${invEmail}.`);

    setTimeout(() => {
      onClose();
      setInvEmail('');
      setInvIdentificacion('');
      setInvExpiracion('');
      setInvSuccess(false);
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setInvEmail('');
    setInvIdentificacion('');
    setInvEmailError('');
    setInvSuccess(false);
  };


  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invitar Contador" size="sm">
      <div className="invitar-form">
        {invSuccess ? (
          <div className="inv-success">
            <CheckCircle size={40} color="var(--color-success)" strokeWidth={1.5} />
            <p>Invitación enviada a <strong>{invEmail}</strong></p>
          </div>
        ) : (
          <>
            <Input label="Email del contador" type="email" placeholder="correo@contador.com"
              value={invEmail}
              onChange={e => { setInvEmail(e.target.value); setInvEmailError(''); }}
              error={invEmailError} />
            <Input label="Identificación / Carné Profesional" placeholder="Ej: 1-1234-0567"
              value={invIdentificacion}
              onChange={e => setInvIdentificacion(e.target.value)} />
            <div className="permisos-select">
              <label>Permisos</label>
              <div className="permisos-options">
                {['Solo Lectura', 'Lectura + Exportación', 'Acceso Total'].map(p => (
                  <button key={p} type="button" className={`permiso-btn ${invPermiso === p ? 'permiso-btn-active' : ''}`}
                    onClick={() => setInvPermiso(p)}>{p}</button>
                ))}
              </div>
            </div>
            <Input label="Fecha de expiración (opcional)" type="date" value={invExpiracion}
              onChange={e => setInvExpiracion(e.target.value)} />
            <div className="modal-actions">
              <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
              <Button variant="primary" disabled={!invEmail || isSubmitting} onClick={handleInvitar}>
                {isSubmitting ? 'Enviando...' : 'Enviar Invitación'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
