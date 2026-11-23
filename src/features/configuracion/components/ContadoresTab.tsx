/* ============================================
   TAB: Contadores — HU-016
   Gestión de contadores autorizados (invitar/revocar)
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { X, AlertTriangle, CheckCircle, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { showWarning, showSuccess, showConfirm } from '../../../utils/alerts';
import { useContadores, useInvitarContador, useRevocarContador } from '../../documentos/hooks/useReportes';

export interface Contador {
  id: number;
  nombre: string;
  email: string;
  permisos: string;
  expiracion: string;
  estado: 'ACTIVO' | 'EXPIRADO' | 'PENDIENTE';
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const diasHastaExpiracion = (fecha: string) => {
  const diff = new Date(fecha).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/* ---------- Modal: Invitar ---------- */
interface InvitarContadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitar: (data: {
    correoContador: string;
    puedeVerIngresos: boolean;
    puedeVerGastos: boolean;
    puedeGenerarReportes: boolean;
    fechaExpiracion: string | null;
  }) => Promise<void>;
  isLoading: boolean;
}

const InvitarContadorModal: React.FC<InvitarContadorModalProps> = ({
  isOpen,
  onClose,
  onInvitar,
  isLoading,
}) => {
  const [invEmail, setInvEmail] = useState('');
  const [invIdentificacion, setInvIdentificacion] = useState('');
  const [invEmailError, setInvEmailError] = useState('');
  const [invPermiso, setInvPermiso] = useState<'Solo Lectura' | 'Lectura + Exportación' | 'Acceso Total'>('Solo Lectura');
  const [invExpiracion, setInvExpiracion] = useState('');
  const [invSuccess, setInvSuccess] = useState(false);

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

    try {
      await onInvitar({
        correoContador: invEmail,
        puedeVerIngresos: true,
        puedeVerGastos: invPermiso !== 'Solo Lectura',
        puedeGenerarReportes: invPermiso === 'Acceso Total' || invPermiso === 'Lectura + Exportación',
        fechaExpiracion: invExpiracion ? new Date(invExpiracion).toISOString() : null,
      });

      setInvSuccess(true);
      showSuccess('Invitación Enviada', `Se ha emitido la invitación formal para el contador ${invEmail}.`);

      setTimeout(() => {
        onClose();
        setInvEmail('');
        setInvIdentificacion('');
        setInvExpiracion('');
        setInvSuccess(false);
      }, 1500);
    } catch {
      // Error handled by global interceptor
    }
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
                    onClick={() => setInvPermiso(p as 'Solo Lectura' | 'Lectura + Exportación' | 'Acceso Total')}>{p}</button>
                ))}
              </div>
            </div>
            <Input label="Fecha de expiración (opcional)" type="date" value={invExpiracion}
              onChange={e => setInvExpiracion(e.target.value)} />
            <div className="modal-actions">
              <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
              <Button variant="primary" disabled={!invEmail || isLoading} onClick={handleInvitar}>
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Enviar Invitación'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

/* ---------- Modal: Revocar ---------- */
interface RevocarContadorModalProps {
  contador: Contador | null;
  onClose: () => void;
  onRevocar: (accesoId: string) => Promise<void>;
  isLoading: boolean;
}

const RevocarContadorModal: React.FC<RevocarContadorModalProps> = ({
  contador,
  onClose,
  onRevocar,
  isLoading,
}) => {
  if (!contador) return null;

  const handleConfirmRevocar = async () => {
    const confirm = await showConfirm(
      '¿Confirmar revocación de acceso?',
      `El contador ${contador.email} perderá inmediatamente el acceso a los registros contables y fiscales.`,
      'Sí, Revocar Acceso'
    );
    if (!confirm.isConfirmed) return;

    try {
      await onRevocar(contador.id.toString());
      onClose();
      showSuccess('Acceso Revocado', `Se ha revocado correctamente el acceso al contador ${contador.email}.`);
    } catch {
      // Handled by global interceptor
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
          <Button variant="danger" onClick={handleConfirmRevocar} loading={isLoading}>
            Revocar acceso
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ---------- Tab: Contadores ---------- */
export const ContadoresTab: React.FC = () => {
  const [showModalInvitar, setShowModalInvitar] = useState(false);
  const [revocarContador, setRevocarContador] = useState<Contador | null>(null);

  const { data: contadores = [], isLoading, error, refetch } = useContadores();
  const invitarMutation = useInvitarContador();
  const revocarMutation = useRevocarContador();

  const contadoresTyped = contadores as Contador[];
  const contadoresActivos = contadoresTyped.filter(c => c.estado === 'ACTIVO').length;
  const contadoresPendientes = contadoresTyped.filter(c => c.estado === 'PENDIENTE').length;

  const handleInvitar = async (data: {
    correoContador: string;
    puedeVerIngresos: boolean;
    puedeVerGastos: boolean;
    puedeGenerarReportes: boolean;
    fechaExpiracion: string | null;
  }) => {
    await invitarMutation.mutateAsync(data);
  };

  const handleRevocar = async (accesoId: string) => {
    await revocarMutation.mutateAsync(accesoId);
    setRevocarContador(null);
  };

  return (
    <div className="contadores-tab">
      <div className="contadores-header">
        <div>
          <h2>Contadores Autorizados</h2>
          <p>Gestiona el acceso de contadores a tu información fiscal</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModalInvitar(true)}>
          <UserPlus size={16} /> Invitar Contador
        </Button>
      </div>

      {error && (
        <div className="error-banner" style={{ padding: 'var(--space-md)', background: 'rgba(201, 112, 112, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', marginBottom: 'var(--space-md)' }}>
          No se pudo cargar la lista de contadores. <Button variant="ghost" size="sm" onClick={() => refetch()}>Reintentar</Button>
        </div>
      )}

      <div className="contadores-resumen">
        <div className="resumen-card">
          <div className="resumen-valor">{isLoading ? <Loader2 size={20} className="animate-spin" /> : contadoresTyped.length}</div>
          <div className="resumen-label">Total</div>
        </div>
        <div className="resumen-card">
          <div className="resumen-valor">{isLoading ? <Loader2 size={20} className="animate-spin" /> : contadoresActivos}</div>
          <div className="resumen-label">Activos</div>
        </div>
        <div className="resumen-card">
          <div className="resumen-valor">{isLoading ? <Loader2 size={20} className="animate-spin" /> : contadoresPendientes}</div>
          <div className="resumen-label">Pendientes</div>
        </div>
      </div>

      <Card variant="outlined" padding="md">
        <div className="card-header">
          <h3>Lista de Contadores</h3>
        </div>
        <div className="contadores-list">
          {isLoading ? (
            <div className="contador-vacio" style={{ padding: 'var(--space-xl)' }}>
              <Loader2 size={48} color="var(--color-primary)" className="animate-spin" />
              <p style={{ marginTop: 'var(--space-sm)' }}>Cargando contadores...</p>
            </div>
          ) : contadoresTyped.length === 0 ? (
            <div className="contador-vacio">
              <UserCheck size={48} color="var(--color-text-muted)" />
              <p>No hay contadores invitados aún.</p>
            </div>
          ) : (
            contadoresTyped.map(c => {
              const dias = diasHastaExpiracion(c.expiracion);
              const proxAVencer = c.estado === 'ACTIVO' && dias <= 7 && dias > 0;
              return (
                <div key={c.id} className="contador-item">
                  <div className="contador-avatar">{c.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div className="contador-info">
                    <span className="contador-nombre">{c.nombre}</span>
                    <span className="contador-email">{c.email}</span>
                  </div>
                  <Badge variant={c.estado === 'ACTIVO' ? 'success' : c.estado === 'PENDIENTE' ? 'warning' : 'default'} size="sm">
                    {c.estado}
                  </Badge>
                  <div className="contador-details">
                    <span>Permisos: {c.permisos}</span>
                    <span className={proxAVencer ? 'expiracion-prox' : ''}>
                      Expira: {new Date(c.expiracion).toLocaleDateString('es-CR')}
                      {proxAVencer && <Badge variant="warning" size="sm">{dias}d</Badge>}
                    </span>
                  </div>
                  <button className="action-icon action-icon-danger" title="Revocar"
                    onClick={() => setRevocarContador(c)}
                    disabled={revocarContador?.id === c.id || revocarMutation.isPending}>
                    <X size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <InvitarContadorModal
        isOpen={showModalInvitar}
        onClose={() => setShowModalInvitar(false)}
        onInvitar={handleInvitar}
        isLoading={invitarMutation.isPending}
      />

      <RevocarContadorModal
        contador={revocarContador}
        onClose={() => setRevocarContador(null)}
        onRevocar={handleRevocar}
        isLoading={revocarMutation.isPending}
      />
    </div>
  );
};