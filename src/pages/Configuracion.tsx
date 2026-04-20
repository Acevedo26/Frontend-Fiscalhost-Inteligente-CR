/* ============================================
   PÁGINA: Configuración — HU-002, HU-003, HU-013, HU-020
   ============================================ */

import React, { useState, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Upload, User, Bell, Shield, ClipboardList, CheckCircle, AlertTriangle, Eye, EyeOff, Info, X } from 'lucide-react';
import './Configuracion.css';

// ── Datos mock ──
const ACTIVIDADES = [
  { label: '551001 — Alojamiento turístico', value: '551001' },
  { label: '551002 — Alojamiento en apartamentos', value: '551002' },
  { label: '552001 — Restaurantes y afines', value: '552001' },
  { label: '552002 — Servicios de catering', value: '552002' },
  { label: '681001 — Alquiler de bienes inmuebles', value: '681001' },
];

const mockLogs = [
  { id: 1, accion: 'Inicio de sesión', fecha: '19/04/2026 08:30', ip: '192.168.1.100', usuario: 'lisbeth@email.com', campo: null, anterior: null, nuevo: null },
  { id: 2, accion: 'Modificación de ingreso', fecha: '18/04/2026 14:22', ip: '192.168.1.100', usuario: 'lisbeth@email.com', campo: 'monto', anterior: '45000', nuevo: '48000' },
  { id: 3, accion: 'Exportación de reporte', fecha: '17/04/2026 10:15', ip: '192.168.1.100', usuario: 'lisbeth@email.com', campo: null, anterior: null, nuevo: null },
  { id: 4, accion: 'Cambio de contraseña', fecha: '15/04/2026 09:00', ip: '192.168.1.100', usuario: 'lisbeth@email.com', campo: null, anterior: null, nuevo: null },
];

const getPasswordStrength = (p: string) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  return s;
};

// Simula rol: 'admin' | 'viewer'
const USER_ROLE: 'admin' | 'viewer' = 'admin';

export const Configuracion: React.FC = () => {
  const [activeSection, setActiveSection] = useState('perfil');

  // ── HU-002: Actividad económica ──
  const [actividadQuery, setActividadQuery] = useState('551001 — Alojamiento turístico');
  const [actividadSeleccionada, setActividadSeleccionada] = useState(ACTIVIDADES[0]);
  const [showActividadDropdown, setShowActividadDropdown] = useState(false);
  const [actividadError, setActividadError] = useState('');
  const [showCambioActividadModal, setShowCambioActividadModal] = useState(false);
  const [pendingActividad, setPendingActividad] = useState<typeof ACTIVIDADES[0] | null>(null);
  const [nise, setNise] = useState('');
  const [showNiseTooltip, setShowNiseTooltip] = useState(false);
  const [niseValidado, setNiseValidado] = useState(false);

  const actividadesFiltradas = ACTIVIDADES.filter(a =>
    a.label.toLowerCase().includes(actividadQuery.toLowerCase())
  );

  const handleSelectActividad = (act: typeof ACTIVIDADES[0]) => {
    if (act.value !== actividadSeleccionada.value) {
      setPendingActividad(act);
      setShowCambioActividadModal(true);
    }
    setShowActividadDropdown(false);
    setActividadError('');
  };

  const handleConfirmarCambioActividad = () => {
    if (pendingActividad) {
      setActividadSeleccionada(pendingActividad);
      setActividadQuery(pendingActividad.label);
    }
    setShowCambioActividadModal(false);
  };

  const handleValidarNise = () => {
    if (nise.length >= 6) setNiseValidado(true);
  };

  // ── HU-003: Llave .p12 ──
  const [p12State, setP12State] = useState<'idle' | 'progress' | 'done' | 'error-format' | 'error-pass'>('idle');
  const [p12Progress, setP12Progress] = useState(0);
  const [p12Pass, setP12Pass] = useState('');
  const [showP12Pass, setShowP12Pass] = useState(false);
  const [p12Archivo, setP12Archivo] = useState<string | null>(null);
  const [llaves, setLlaves] = useState<{ nombre: string; fecha: string; estado: string }[]>([]);
  const p12Ref = useRef<HTMLInputElement>(null);

  const handleP12File = (file: File) => {
    if (!file.name.endsWith('.p12')) { setP12State('error-format'); return; }
    setP12Archivo(file.name);
    setP12State('idle');
  };

  const handleSubirP12 = () => {
    if (!p12Archivo) return;
    if (!p12Pass) { setP12State('error-pass'); return; }
    setP12State('progress'); setP12Progress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 20;
      setP12Progress(p);
      if (p >= 100) {
        clearInterval(iv);
        if (p12Pass === 'wrong') { setP12State('error-pass'); return; }
        setP12State('done');
        setLlaves([{ nombre: p12Archivo, fecha: new Date().toLocaleDateString('es-CR'), estado: 'Activa' }]);
      }
    }, 200);
  };

  const p12PassStrength = getPasswordStrength(p12Pass);
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', 'var(--color-danger)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-success)'];

  // ── HU-013: Notificaciones ──
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifApp, setNotifApp] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [frecuencia, setFrecuencia] = useState('REAL');

  // ── HU-020: Log auditoría ──
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof mockLogs[0] | null>(null);

  const sections = [
    { id: 'perfil', label: 'Perfil Tributario', icon: <User size={18} /> },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell size={18} /> },
    { id: 'seguridad', label: 'Seguridad', icon: <Shield size={18} /> },
    { id: 'auditoria', label: 'Log de Auditoría', icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className="configuracion-page">
      <div className="page-header">
        <div><h1>Configuración</h1><p>Gestiona tu perfil y preferencias</p></div>
      </div>

      <div className="config-layout">
        <div className="config-sidebar">
          {sections.map(s => (
            <button key={s.id} className={`config-section-btn ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}>
              <span className="section-icon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="config-content">

          {/* ── HU-002: Perfil Tributario ── */}
          {activeSection === 'perfil' && (
            <Card variant="outlined" padding="md">
              <h3>Perfil Tributario</h3>
              <div className="config-form">
                <div className="form-row">
                  <Input label="Nombre Completo" defaultValue="Lisbeth Fallas" />
                  <Input label="Email" type="email" defaultValue="lisbeth@email.com" disabled />
                </div>
                <div className="form-row">
                  <Select label="Tipo de Identificación"
                    options={[{ label: 'Cédula Física', value: 'FISICA' }, { label: 'Cédula Jurídica', value: 'JURIDICA' }, { label: 'DIMEX', value: 'DIMEX' }, { label: 'NITE', value: 'NITE' }]}
                    value="FISICA" />
                  <Input label="Número de Identificación" defaultValue="01-0234-5678" />
                </div>

                {/* Typeahead actividad económica */}
                <div className="actividad-field">
                  <label className="input-label">Actividad Económica (RUT)</label>
                  <div className="typeahead-wrap">
                    <input className="typeahead-input"
                      value={actividadQuery}
                      onChange={e => { setActividadQuery(e.target.value); setShowActividadDropdown(true); setActividadError(''); }}
                      onFocus={() => setShowActividadDropdown(true)}
                      onBlur={() => setTimeout(() => setShowActividadDropdown(false), 150)}
                      placeholder="Buscar código o nombre..." />
                    {showActividadDropdown && actividadesFiltradas.length > 0 && (
                      <div className="typeahead-dropdown">
                        {actividadesFiltradas.map(a => (
                          <button key={a.value} className="typeahead-option" onMouseDown={() => handleSelectActividad(a)}>
                            <span className="typeahead-code">{a.value}</span>
                            <span>{a.label.split('—')[1]?.trim()}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {showActividadDropdown && actividadesFiltradas.length === 0 && (
                      <div className="typeahead-dropdown">
                        <span className="typeahead-empty">Código no válido. Seleccione una opción de la lista</span>
                      </div>
                    )}
                  </div>
                  {actividadError && <span className="input-helper input-helper-error">{actividadError}</span>}
                  {actividadSeleccionada && (
                    <div className="actividad-preview">
                      <span>{actividadSeleccionada.label}</span>
                      <Badge variant="success" size="sm">RUT vinculado</Badge>
                    </div>
                  )}
                </div>

                {/* NISE */}
                <div className="nise-field">
                  <div className="nise-label-row">
                    <label className="input-label">NISE (Número de Identificación del Servicio Eléctrico)</label>
                    <button className="nise-tooltip-btn" onMouseEnter={() => setShowNiseTooltip(true)} onMouseLeave={() => setShowNiseTooltip(false)}>
                      <Info size={14} />
                      {showNiseTooltip && (
                        <div className="nise-tooltip">El NISE es el número de medidor eléctrico de tu propiedad, usado para validar el domicilio fiscal.</div>
                      )}
                    </button>
                  </div>
                  <div className="nise-row">
                    <Input placeholder="Ej: 123456789" value={nise} onChange={e => { setNise(e.target.value); setNiseValidado(false); }} />
                    <Button variant="outline" size="sm" onClick={handleValidarNise}>Validar</Button>
                  </div>
                  {niseValidado && (
                    <div className="nise-success">
                      <CheckCircle size={14} /> Domicilio fiscal registrado correctamente
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <Select label="Régimen Tributario"
                    options={[{ label: 'Capital Inmobiliario (12.75%)', value: 'CAPITAL' }, { label: 'Régimen de Utilidades (25%)', value: 'UTILIDADES' }]}
                    value="CAPITAL" />
                </div>
                <div className="form-actions">
                  <Button variant="primary">Guardar Cambios</Button>
                </div>
              </div>
            </Card>
          )}

          {/* ── HU-013: Notificaciones ── */}
          {activeSection === 'notificaciones' && (
            <Card variant="outlined" padding="md">
              <h3>Preferencias de Notificaciones</h3>
              <div className="notifications-options">
                {[
                  { label: 'Notificaciones por Email', desc: 'Alertas y recordatorios por correo', value: notifEmail, set: setNotifEmail },
                  { label: 'Notificaciones in-app', desc: 'Notificaciones dentro de la aplicación', value: notifApp, set: setNotifApp },
                  { label: 'Notificaciones por SMS', desc: 'Mensajes de texto para alertas urgentes', value: notifSMS, set: setNotifSMS },
                ].map(opt => (
                  <div key={opt.label} className="notification-option">
                    <div className="option-info">
                      <span className="option-label">{opt.label}</span>
                      <span className="option-desc">{opt.desc}</span>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={opt.value} onChange={e => opt.set(e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
                <div className="notification-option">
                  <div className="option-info">
                    <span className="option-label">Frecuencia de Alertas</span>
                    <span className="option-desc">¿Con qué frecuencia quieres recibir alertas?</span>
                  </div>
                  <Select options={[{ label: 'Tiempo Real', value: 'REAL' }, { label: 'Diaria', value: 'DIARIA' }, { label: 'Semanal', value: 'SEMANAL' }]}
                    value={frecuencia} onChange={setFrecuencia} />
                </div>
              </div>
              <div className="notif-resumen">
                <Info size={14} />
                <span>Canales activos: {[notifEmail && 'Email', notifApp && 'In-app', notifSMS && 'SMS'].filter(Boolean).join(', ') || 'Ninguno'}</span>
              </div>
              <div className="form-actions">
                <Button variant="primary">Guardar Preferencias</Button>
              </div>
            </Card>
          )}

          {/* ── HU-003: Seguridad + .p12 ── */}
          {activeSection === 'seguridad' && (
            <Card variant="outlined" padding="md">
              <h3>Seguridad</h3>
              <div className="security-options">
                <div className="security-item">
                  <div className="security-info">
                    <span className="security-label">Cambiar Contraseña</span>
                    <span className="security-desc">Último cambio: 15 de abril 2026</span>
                  </div>
                  <Button variant="outline" size="sm">Cambiar</Button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <span className="security-label">Llave Criptográfica (.p12)</span>
                    <span className="security-desc">Certificado para firma de comprobantes electrónicos</span>
                  </div>
                  <Badge variant={llaves.length > 0 ? 'success' : 'default'} size="sm">
                    {llaves.length > 0 ? 'Configurada' : 'No configurada'}
                  </Badge>
                </div>

                {/* Lista de llaves */}
                {llaves.length > 0 && (
                  <div className="llaves-list">
                    {llaves.map((l, i) => (
                      <div key={i} className="llave-item">
                        <Shield size={16} color="var(--color-success)" />
                        <span className="llave-nombre">{l.nombre}</span>
                        <span className="llave-fecha">{l.fecha}</span>
                        <Badge variant="success" size="sm">{l.estado}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Zona de carga .p12 */}
                <div className="security-upload">
                  <div className={`upload-zone ${p12State === 'error-format' ? 'upload-zone-error' : ''}`}
                    onClick={() => p12Ref.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleP12File(f); }}>
                    <Upload size={40} strokeWidth={1.5} color="var(--color-text-muted)" />
                    <p>{p12Archivo ? p12Archivo : 'Arrastra tu archivo .p12 aquí o haz clic para seleccionar'}</p>
                    <span>Solo archivos .p12</span>
                    <input ref={p12Ref} type="file" accept=".p12" hidden
                      onChange={e => { if (e.target.files?.[0]) handleP12File(e.target.files[0]); }} />
                  </div>

                  {p12State === 'error-format' && (
                    <div className="p12-error"><X size={14} /> Formato no soportado. Debe subir un archivo .p12</div>
                  )}

                  {p12Archivo && p12State !== 'error-format' && (
                    <div className="p12-pass-section">
                      <div className="pass-field-wrap">
                        <Input label="Contraseña del certificado"
                          type={showP12Pass ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={p12Pass}
                          onChange={e => { setP12Pass(e.target.value); setP12State('idle'); }}
                          error={p12State === 'error-pass' ? 'Contraseña inválida. Verifique sus credenciales' : ''}
                          rightIcon={
                            <button type="button" onClick={() => setShowP12Pass(!showP12Pass)} className="pass-toggle">
                              {showP12Pass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          } />
                        {p12Pass && (
                          <div className="strength-bar-wrap">
                            <div className="strength-bar">
                              <div className="strength-fill" style={{ width: `${p12PassStrength * 25}%`, backgroundColor: strengthColors[p12PassStrength] }} />
                            </div>
                            <span style={{ color: strengthColors[p12PassStrength], fontSize: 'var(--text-xs)' }}>{strengthLabels[p12PassStrength]}</span>
                          </div>
                        )}
                      </div>

                      {p12State === 'progress' && (
                        <div className="p12-progress">
                          <div className="progress-bar"><div className="progress-fill" style={{ width: `${p12Progress}%` }} /></div>
                          <span>Validando certificado… {p12Progress}%</span>
                        </div>
                      )}

                      {p12State === 'done' && (
                        <div className="p12-success"><CheckCircle size={14} /> Llave criptográfica almacenada correctamente</div>
                      )}

                      {p12State !== 'done' && (
                        <Button variant="primary" size="sm" onClick={handleSubirP12} disabled={!p12Pass || p12State === 'progress'}>
                          Subir y validar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <Button variant="danger" size="sm">Cerrar Sesión</Button>
              </div>
            </Card>
          )}

          {/* ── HU-020: Log de Auditoría ── */}
          {activeSection === 'auditoria' && (
            <Card variant="outlined" padding="md">
              <h3>Log de Auditoría</h3>
              <p className="audit-desc">Registro inalterable de todas las acciones realizadas en tu cuenta</p>
              <div className="audit-list">
                {mockLogs.map(log => (
                  <div key={log.id} className="audit-item">
                    <div className="audit-info">
                      <div className="audit-accion-row">
                        <span className="audit-accion">{log.accion}</span>
                        {log.campo && <span className="audit-edited-icon" title={`Campo: ${log.campo} | Antes: ${log.anterior} → Después: ${log.nuevo}`}>✎</span>}
                      </div>
                      <span className="audit-fecha">{log.fecha} · {log.usuario}</span>
                    </div>
                    <div className="audit-actions">
                      <span className="audit-ip">{log.ip}</span>
                      {log.campo && (
                        <button className="audit-ver-btn" onClick={() => { setSelectedLog(log); setShowHistorialModal(true); }}>
                          Ver cambio
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                {USER_ROLE === 'admin'
                  ? <Button variant="outline">Exportar log completo</Button>
                  : <span className="audit-no-export">Solo el administrador puede exportar el log completo</span>
                }
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal cambio actividad económica */}
      <Modal isOpen={showCambioActividadModal} onClose={() => setShowCambioActividadModal(false)} title="Cambio de Actividad Económica" size="sm">
        <div className="cambio-actividad-modal">
          <div className="cambio-warning">
            <AlertTriangle size={24} color="var(--color-warning)" />
            <p>El cambio afectará los cálculos futuros. ¿Desea continuar?</p>
          </div>
          {pendingActividad && (
            <div className="cambio-preview">
              <span>Nueva actividad: <strong>{pendingActividad.label}</strong></span>
            </div>
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowCambioActividadModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirmarCambioActividad}>Confirmar cambio</Button>
          </div>
        </div>
      </Modal>

      {/* Modal historial de cambio */}
      <Modal isOpen={showHistorialModal} onClose={() => setShowHistorialModal(false)} title="Detalle del Cambio" size="sm">
        {selectedLog && (
          <div className="historial-modal">
            <div className="historial-row"><span>Acción</span><strong>{selectedLog.accion}</strong></div>
            <div className="historial-row"><span>Campo modificado</span><strong>{selectedLog.campo}</strong></div>
            <div className="historial-row"><span>Valor anterior</span><span className="historial-anterior">{selectedLog.anterior}</span></div>
            <div className="historial-row"><span>Valor nuevo</span><span className="historial-nuevo">{selectedLog.nuevo}</span></div>
            <div className="historial-row"><span>Fecha</span><span>{selectedLog.fecha}</span></div>
            <div className="historial-row"><span>Usuario</span><span>{selectedLog.usuario}</span></div>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowHistorialModal(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Configuracion;
