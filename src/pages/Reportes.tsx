/* ============================================
   PÁGINA: Reportes — HU-015, HU-016
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Download, X, ChevronRight, Lock, BarChart2, ClipboardList, DollarSign, FileText, Upload, CheckCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import './Reportes.css';

const mockReportes = [
  { id: 1, tipo: 'RESUMEN_MENSUAL', nombre: 'Resumen Abril 2026', fecha: '18/04/2026', estado: 'LISTO' },
  { id: 2, tipo: 'DECLARACION_IVA', nombre: 'Declaración IVA - Marzo 2026', fecha: '15/04/2026', estado: 'ENVIADO' },
  { id: 3, tipo: 'DECLARACION_RENTA', nombre: 'Declaración Renta 2025', fecha: '01/03/2026', estado: 'ENVIADO' },
  { id: 4, tipo: 'DETALLE_GASTOS', nombre: 'Detalle Gastos 2026', fecha: '20/02/2026', estado: 'LISTO' },
];

interface Contador {
  id: number;
  nombre: string;
  email: string;
  permisos: string;
  expiracion: string;
  estado: 'ACTIVO' | 'EXPIRADO' | 'PENDIENTE';
}

const initialContadores: Contador[] = [
  { id: 1, nombre: 'Maria Vargas', email: 'maria@contadorescr.com', permisos: 'Solo Lectura', expiracion: '2026-06-15', estado: 'ACTIVO' },
  { id: 2, nombre: 'Carlos Lopez', email: 'carlos@contabilidad.com', permisos: 'Exportación', expiracion: '2026-05-01', estado: 'EXPIRADO' },
];

const diasHastaExpiracion = (fecha: string) => {
  const diff = new Date(fecha).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getTipoReporteLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    RESUMEN_MENSUAL: 'Resumen Mensual', DECLARACION_IVA: 'Declaración IVA',
    DECLARACION_RENTA: 'Declaración Renta', DETALLE_GASTOS: 'Detalle de Gastos', EXPORTACION_ATV: 'Exportación ATV',
  };
  return labels[tipo] || tipo;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getPasswordStrength = (p: string) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  return s;
};

export const Reportes: React.FC = () => {
  const [contadores, setContadores] = useState<Contador[]>(initialContadores);

  // HU-015: exportar
  const [showExportModal, setShowExportModal] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [exportPass, setExportPass] = useState('');
  const [exportPassConfirm, setExportPassConfirm] = useState('');
  const [exportPassError, setExportPassError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  // HU-016: invitar
  const [showModalInvitar, setShowModalInvitar] = useState(false);
  const [invEmail, setInvEmail] = useState('');
  const [invEmailError, setInvEmailError] = useState('');
  const [invPermiso, setInvPermiso] = useState('Solo Lectura');
  const [invExpiracion, setInvExpiracion] = useState('');
  const [invSuccess, setInvSuccess] = useState(false);

  // HU-016: revocar
  const [revocarContador, setRevocarContador] = useState<Contador | null>(null);

  const handleExport = () => {
    if (!exportPass) { setExportPassError('La contraseña es requerida'); return; }
    if (exportPass !== exportPassConfirm) { setExportPassError('Las contraseñas no coinciden'); return; }
    setExportDone(true);
  };

  const handleCloseExport = () => {
    setShowExportModal(false); setExportPass(''); setExportPassConfirm('');
    setExportPassError(''); setExportDone(false); setExportFormat('PDF');
  };

  const handleInvitar = () => {
    if (!isValidEmail(invEmail)) { setInvEmailError('Formato de correo inválido. Por favor verifique'); return; }
    const nuevo: Contador = {
      id: Date.now(), nombre: invEmail.split('@')[0], email: invEmail,
      permisos: invPermiso, expiracion: invExpiracion || '2026-12-31', estado: 'PENDIENTE',
    };
    setContadores([...contadores, nuevo]);
    setInvSuccess(true);
    setTimeout(() => { setShowModalInvitar(false); setInvEmail(''); setInvExpiracion(''); setInvSuccess(false); }, 1500);
  };

  const handleRevocar = () => {
    if (!revocarContador) return;
    setContadores(contadores.filter(c => c.id !== revocarContador.id));
    setRevocarContador(null);
  };

  const passStrength = getPasswordStrength(exportPass);
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', 'var(--color-danger)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-success)'];

  return (
    <div className="reportes-page">
      <div className="page-header">
        <div>
          <h1>Reportes</h1>
          <p>Genera y exporta tus reportes fiscales</p>
        </div>
      </div>

      <div className="reportes-grid">
        <Card variant="outlined" padding="md">
          <div className="card-header"><h3>Generar Reportes</h3></div>
          <div className="report-types">
            {[
              { tipo: 'RESUMEN_MENSUAL', icono: <BarChart2 size={22} />, desc: 'Resumen de ingresos y gastos del mes' },
              { tipo: 'DECLARACION_IVA', icono: <ClipboardList size={22} />, desc: 'Formulario de declaración de IVA' },
              { tipo: 'DECLARACION_RENTA', icono: <DollarSign size={22} />, desc: 'Declaración anual de renta' },
              { tipo: 'DETALLE_GASTOS', icono: <FileText size={22} />, desc: 'Listado detallado de gastos' },
              { tipo: 'EXPORTACION_ATV', icono: <Upload size={22} />, desc: 'Exportación en formato ATV' },
            ].map(r => (
              <div key={r.tipo} className="report-type-card"
                onClick={() => { setReporteSeleccionado(r.tipo); setShowExportModal(true); }}>
                <span className="report-type-icon">{r.icono}</span>
                <div className="report-type-info">
                  <span className="report-type-name">{getTipoReporteLabel(r.tipo)}</span>
                  <span className="report-type-desc">{r.desc}</span>
                </div>
                <ChevronRight size={20} color="var(--color-text-muted)" />
              </div>
            ))}
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <div className="card-header"><h3>Reportes Recientes</h3></div>
          <div className="reportes-list">
            {mockReportes.map(r => (
              <div key={r.id} className="reporte-item">
                <div className="reporte-info">
                  <span className="reporte-nombre">{r.nombre}</span>
                  <span className="reporte-fecha">{r.fecha}</span>
                </div>
                <div className="reporte-actions">
                  <Badge variant={r.estado === 'ENVIADO' ? 'success' : 'info'} size="sm">{r.estado}</Badge>
                  <button className="action-icon" title="Descargar"><Download size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* HU-016: Autorizar Contador */}
      <Card variant="outlined" padding="md">
        <div className="card-header">
          <h3>Autorizar Contador</h3>
          <Button variant="primary" size="sm" onClick={() => setShowModalInvitar(true)}>Invitar Contador</Button>
        </div>
        <div className="contadores-list">
          {contadores.map(c => {
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
                  onClick={() => setRevocarContador(c)}>
                  <X size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Modal Exportar (HU-015) ── */}
      <Modal isOpen={showExportModal} onClose={handleCloseExport} title="Exportar Reporte" size="md">
        <div className="export-modal">
          {exportDone ? (
            <div className="export-done">
              <CheckCircle size={48} color="var(--color-success)" strokeWidth={1.5} />
              <p>Archivo listo para subir a TRIBU-CR</p>
              <p className="export-done-sub">El archivo fue cifrado con tu contraseña y descargado automáticamente.</p>
              <Button variant="primary" onClick={handleCloseExport}>Cerrar</Button>
            </div>
          ) : (
            <>
              <div className="export-preview">
                <h4>Vista Previa</h4>
                <div className="preview-content">
                  <p>Reporte: {reporteSeleccionado && getTipoReporteLabel(reporteSeleccionado)}</p>
                  <p>Período: Abril 2026 · Ingresos: ₡245,000 · Impuesto: ₡26,000</p>
                </div>
              </div>
              <div className="export-options">
                <h4>Formato</h4>
                <div className="format-options">
                  {[{ id: 'PDF', icon: <FileText size={20} /> }, { id: 'CSV', icon: <BarChart2 size={20} /> }, { id: 'XML', icon: <ClipboardList size={20} /> }].map(f => (
                    <button key={f.id} className={`format-btn ${exportFormat === f.id ? 'format-btn-active' : ''}`}
                      onClick={() => setExportFormat(f.id)}>
                      {f.icon}<span>{f.id}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="export-password-section">
                <h4><Lock size={14} /> Cifrar archivo con contraseña</h4>
                <div className="pass-field">
                  <Input label="Contraseña" type={showPass ? 'text' : 'password'} value={exportPass}
                    onChange={e => { setExportPass(e.target.value); setExportPassError(''); }}
                    rightIcon={<button type="button" onClick={() => setShowPass(!showPass)} className="pass-toggle">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>} />
                  {exportPass && (
                    <div className="strength-bar-wrap">
                      <div className="strength-bar">
                        <div className="strength-fill" style={{ width: `${passStrength * 25}%`, backgroundColor: strengthColors[passStrength] }} />
                      </div>
                      <span style={{ color: strengthColors[passStrength], fontSize: 'var(--text-xs)' }}>{strengthLabels[passStrength]}</span>
                    </div>
                  )}
                </div>
                <Input label="Confirmar contraseña" type="password" value={exportPassConfirm}
                  onChange={e => { setExportPassConfirm(e.target.value); setExportPassError(''); }}
                  error={exportPassError} />
              </div>
              <div className="modal-actions">
                <Button variant="secondary" onClick={handleCloseExport}>Cancelar</Button>
                <Button variant="primary" onClick={handleExport}>
                  <Download size={16} /> Exportar y descargar
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ── Modal Invitar Contador (HU-016) ── */}
      <Modal isOpen={showModalInvitar} onClose={() => { setShowModalInvitar(false); setInvEmail(''); setInvEmailError(''); setInvSuccess(false); }} title="Invitar Contador" size="sm">
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
              <div className="permisos-select">
                <label>Permisos</label>
                <div className="permisos-options">
                  {['Solo Lectura', 'Lectura + Exportación', 'Acceso Total'].map(p => (
                    <button key={p} className={`permiso-btn ${invPermiso === p ? 'permiso-btn-active' : ''}`}
                      onClick={() => setInvPermiso(p)}>{p}</button>
                  ))}
                </div>
              </div>
              <Input label="Fecha de expiración (opcional)" type="date" value={invExpiracion}
                onChange={e => setInvExpiracion(e.target.value)} />
              <div className="modal-actions">
                <Button variant="secondary" onClick={() => setShowModalInvitar(false)}>Cancelar</Button>
                <Button variant="primary" disabled={!invEmail} onClick={handleInvitar}>Enviar Invitación</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ── Modal Revocar (HU-016) ── */}
      <Modal isOpen={!!revocarContador} onClose={() => setRevocarContador(null)} title="Revocar Acceso" size="sm">
        <div className="revocar-modal">
          <div className="revocar-warning">
            <AlertTriangle size={24} color="var(--color-danger)" />
            <p>¿Está seguro de revocar el acceso a <strong>{revocarContador?.email}</strong>? Esta acción es inmediata.</p>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setRevocarContador(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleRevocar}>Revocar acceso</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reportes;
