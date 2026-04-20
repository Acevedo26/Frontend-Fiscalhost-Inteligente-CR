/* ============================================
   PÁGINA: Mis Ingresos — HU-004, HU-005, HU-006
   ============================================ */

import React, { useState, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Upload, Plus, Pencil, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import './Ingresos.css';

type Clasificacion = 'GRAVADO_13' | 'EXENTO' | 'RETENCION_15' | 'PENDIENTE';

interface Transaccion {
  id: number;
  fecha: string;
  concepto: string;
  monto: number;
  tipo: 'INGRESO' | 'GASTO';
  fuente?: string;
  proveedor?: string;
  clasificacion?: Clasificacion;
  editado?: boolean;
  historial?: { fecha: string; campo: string; anterior: string; nuevo: string; razon: string }[];
}

const initialTransactions: Transaccion[] = [
  { id: 1, fecha: '15/04/2026', concepto: 'Reserva Airbnb #2847', monto: 45000, tipo: 'INGRESO', fuente: 'Airbnb', clasificacion: 'GRAVADO_13' },
  { id: 2, fecha: '14/04/2026', concepto: 'Reserva Booking #B3921', monto: 32000, tipo: 'INGRESO', fuente: 'Booking', clasificacion: 'GRAVADO_13' },
  { id: 3, fecha: '12/04/2026', concepto: 'Reserva Directa', monto: 28000, tipo: 'INGRESO', fuente: 'Directo', clasificacion: 'EXENTO' },
  { id: 4, fecha: '10/04/2026', concepto: 'Reserva Airbnb #2845', monto: 55000, tipo: 'INGRESO', fuente: 'Airbnb', clasificacion: 'GRAVADO_13' },
  { id: 5, fecha: '08/04/2026', concepto: 'Retención PayPal', monto: 6750, tipo: 'INGRESO', fuente: 'PayPal', clasificacion: 'RETENCION_15' },
  { id: 6, fecha: '05/04/2026', concepto: 'Reserva Vrbo #V123', monto: 38000, tipo: 'INGRESO', fuente: 'Vrbo', clasificacion: 'GRAVADO_13' },
];

const initialGastos: Transaccion[] = [
  { id: 1, fecha: '12/04/2026', concepto: 'Limpieza Villa Sol', monto: 15000, tipo: 'GASTO', proveedor: 'Limpiezas Costa' },
  { id: 2, fecha: '08/04/2026', concepto: 'Mantenimiento AC', monto: 35000, tipo: 'GASTO', proveedor: 'CoolTech' },
  { id: 3, fecha: '01/04/2026', concepto: 'Internet', monto: 25000, tipo: 'GASTO', proveedor: 'ICE' },
];

const optionsClasificacion = [
  { label: 'Gravado 13%', value: 'GRAVADO_13' },
  { label: 'Exento', value: 'EXENTO' },
  { label: 'Retención 15%', value: 'RETENCION_15' },
  { label: 'Pendiente', value: 'PENDIENTE' },
];

const optionsFuente = [
  { label: 'Airbnb', value: 'AIRBNB' },
  { label: 'Booking', value: 'BOOKING' },
  { label: 'Vrbo', value: 'VRBO' },
  { label: 'Directo', value: 'DIRECTO' },
  { label: 'PayPal', value: 'PAYPAL' },
];

type ImportState = 'idle' | 'progress' | 'done' | 'error-columns' | 'error-empty';

export const Ingresos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ingresos' | 'gastos'>('ingresos');
  const [transactions, setTransactions] = useState<Transaccion[]>(initialTransactions);
  const [gastos, setGastos] = useState<Transaccion[]>(initialGastos);

  // HU-005: agregar
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [addForm, setAddForm] = useState({ fecha: '', concepto: '', monto: '', fuente: '', proveedor: '', clasificacion: 'GRAVADO_13' as Clasificacion });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // HU-005: editar con auditoría
  const [editTx, setEditTx] = useState<Transaccion | null>(null);
  const [editMonto, setEditMonto] = useState('');
  const [editRazon, setEditRazon] = useState('');
  const [editRazonError, setEditRazonError] = useState('');

  // HU-006: reclasificación
  const [reclasificarTx, setReclasificarTx] = useState<Transaccion | null>(null);
  const [nuevaClasif, setNuevaClasif] = useState<Clasificacion>('GRAVADO_13');
  const [reclasifJustif, setReclasifJustif] = useState('');
  const [reclasifError, setReclasifError] = useState('');

  // HU-004: importar CSV
  const [showModalImport, setShowModalImport] = useState(false);
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState({ ok: 0, omitidos: 0 });
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);

  const today = new Date().toISOString().split('T')[0];

  // ── HU-004: simular importación ──
  const handleImportFile = (file: File) => {
    if (!file || file.size === 0) { setImportState('error-empty'); return; }
    if (file.name.includes('bad-columns')) { setImportState('error-columns'); return; }
    setImportState('progress');
    setImportProgress(0);
    const total = 20;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setImportProgress(Math.round((current / total) * 100));
      if (current >= total) {
        clearInterval(interval);
        setImportResult({ ok: 18, omitidos: 2 });
        setImportState('done');
      }
    }, 80);
  };

  const handleCloseImport = () => { setShowModalImport(false); setImportState('idle'); setImportProgress(0); setSelectedPlatform(''); };

  // ── HU-005: validar agregar ──
  const validateAdd = () => {
    const errors: Record<string, string> = {};
    if (!addForm.fecha) errors.fecha = 'Fecha requerida';
    else if (addForm.fecha > today) errors.fecha = 'No se pueden registrar reservas con fecha futura. Si es una reserva anticipada, utilice la fecha de ingreso real';
    if (!addForm.concepto) errors.concepto = 'Concepto requerido';
    if (!addForm.monto || Number(addForm.monto) <= 0) errors.monto = 'El monto debe ser mayor a cero';
    return errors;
  };

  const handleSaveAdd = () => {
    const errors = validateAdd();
    if (Object.keys(errors).length > 0) { setAddErrors(errors); return; }
    const nueva: Transaccion = {
      id: Date.now(),
      fecha: addForm.fecha,
      concepto: addForm.concepto,
      monto: Number(addForm.monto),
      tipo: activeTab === 'ingresos' ? 'INGRESO' : 'GASTO',
      fuente: addForm.fuente || undefined,
      proveedor: addForm.proveedor || undefined,
      clasificacion: activeTab === 'ingresos' ? addForm.clasificacion : undefined,
    };
    if (activeTab === 'ingresos') setTransactions([nueva, ...transactions]);
    else setGastos([nueva, ...gastos]);
    setShowModalAdd(false);
    setAddForm({ fecha: '', concepto: '', monto: '', fuente: '', proveedor: '', clasificacion: 'GRAVADO_13' });
    setAddErrors({});
  };

  // ── HU-005: guardar edición con auditoría ──
  const handleSaveEdit = () => {
    if (!editRazon.trim()) { setEditRazonError('Debe ingresar una razón para modificar este campo'); return; }
    if (!editTx) return;
    const entrada = {
      fecha: new Date().toLocaleDateString('es-CR'),
      campo: 'monto',
      anterior: String(editTx.monto),
      nuevo: editMonto,
      razon: editRazon,
    };
    setTransactions(transactions.map(t => t.id === editTx.id
      ? { ...t, monto: Number(editMonto), editado: true, historial: [...(t.historial || []), entrada] }
      : t
    ));
    setEditTx(null); setEditMonto(''); setEditRazon(''); setEditRazonError('');
  };

  // ── HU-006: guardar reclasificación ──
  const handleSaveReclasif = () => {
    if (!reclasifJustif.trim()) { setReclasifError('Debe indicar una razón para la reclasificación'); return; }
    if (!reclasificarTx) return;
    setTransactions(transactions.map(t => t.id === reclasificarTx.id
      ? { ...t, clasificacion: nuevaClasif, editado: true }
      : t
    ));
    setReclasificarTx(null); setReclasifJustif(''); setReclasifError('');
  };

  const clasifBadge = (c: Clasificacion) => {
    const map: Record<Clasificacion, { variant: 'info' | 'success' | 'warning' | 'default'; label: string }> = {
      GRAVADO_13: { variant: 'info', label: 'Gravado 13% IVA' },
      EXENTO: { variant: 'success', label: 'Exento de IVA' },
      RETENCION_15: { variant: 'warning', label: 'Retención 15%' },
      PENDIENTE: { variant: 'default', label: 'Pendiente' },
    };
    return map[c];
  };

  const list = activeTab === 'ingresos' ? transactions : gastos;

  return (
    <div className="ingresos-page">
      <div className="page-header">
        <div>
          <h1>Mis Ingresos</h1>
          <p>Gestiona tus transacciones y clasificaciones</p>
        </div>
        <div className="page-actions">
          <Button variant="outline" onClick={() => setShowModalImport(true)}>
            <Upload size={18} /> Importar CSV
          </Button>
          <Button variant="primary" onClick={() => setShowModalAdd(true)}>
            <Plus size={18} /> Agregar
          </Button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'ingresos' ? 'tab-active' : ''}`} onClick={() => setActiveTab('ingresos')}>
          Ingresos ({transactions.length})
        </button>
        <button className={`tab ${activeTab === 'gastos' ? 'tab-active' : ''}`} onClick={() => setActiveTab('gastos')}>
          Gastos ({gastos.length})
        </button>
      </div>

      <Card variant="outlined" padding="none">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                {activeTab === 'ingresos' ? <th>Fuente</th> : <th>Proveedor</th>}
                <th>Monto</th>
                {activeTab === 'ingresos' && <th>Clasificación</th>}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((tx) => (
                <tr key={tx.id}>
                  <td className="cell-date">{tx.fecha}</td>
                  <td className="cell-concept">
                    {tx.concepto}
                    {tx.editado && (
                      <span className="edited-badge" title={`Modificado — ${tx.historial?.at(-1)?.razon ?? ''}`}>✎</span>
                    )}
                  </td>
                  {activeTab === 'ingresos' ? <td>{tx.fuente}</td> : <td>{tx.proveedor}</td>}
                  <td className={`cell-amount ${tx.tipo === 'GASTO' ? 'expense' : 'income'}`}>
                    {tx.tipo === 'GASTO' ? '-' : '+'}{formatCurrency(tx.monto)}
                  </td>
                  {activeTab === 'ingresos' && tx.clasificacion && (
                    <td>
                      <div className="clasif-cell">
                        <Badge variant={clasifBadge(tx.clasificacion).variant} size="sm">
                          {clasifBadge(tx.clasificacion).label}
                        </Badge>
                        <button className="action-btn" title="Reclasificar"
                          onClick={() => { setReclasificarTx(tx); setNuevaClasif(tx.clasificacion!); setReclasifJustif(''); setReclasifError(''); }}>
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="cell-actions">
                    <button className="action-btn" title="Editar"
                      onClick={() => { setEditTx(tx); setEditMonto(String(tx.monto)); setEditRazon(''); setEditRazonError(''); }}>
                      <Pencil size={16} />
                    </button>
                    <button className="action-btn action-btn-danger" title="Eliminar"
                      onClick={() => activeTab === 'ingresos'
                        ? setTransactions(transactions.filter(t => t.id !== tx.id))
                        : setGastos(gastos.filter(t => t.id !== tx.id))}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modal Agregar (HU-005) ── */}
      <Modal isOpen={showModalAdd} onClose={() => { setShowModalAdd(false); setAddErrors({}); }} title="Agregar Transacción" size="md">
        <div className="modal-form">
          <Input label="Fecha" type="date" max={today} value={addForm.fecha}
            onChange={e => { setAddForm({ ...addForm, fecha: e.target.value }); setAddErrors({ ...addErrors, fecha: '' }); }}
            error={addErrors.fecha} />
          <Input label="Concepto" placeholder="Ej: Reserva Airbnb #1234" value={addForm.concepto}
            onChange={e => { setAddForm({ ...addForm, concepto: e.target.value }); setAddErrors({ ...addErrors, concepto: '' }); }}
            error={addErrors.concepto} />
          <Input label="Monto (₡)" type="number" placeholder="0" value={addForm.monto}
            onChange={e => { setAddForm({ ...addForm, monto: e.target.value }); setAddErrors({ ...addErrors, monto: '' }); }}
            error={addErrors.monto} />
          {activeTab === 'ingresos'
            ? <Select label="Fuente" options={optionsFuente} value={addForm.fuente} onChange={v => setAddForm({ ...addForm, fuente: v })} placeholder="Selecciona la fuente" />
            : <Input label="Proveedor" placeholder="Nombre del proveedor" value={addForm.proveedor} onChange={e => setAddForm({ ...addForm, proveedor: e.target.value })} />
          }
          {activeTab === 'ingresos' && (
            <Select label="Clasificación" options={optionsClasificacion} value={addForm.clasificacion}
              onChange={v => setAddForm({ ...addForm, clasificacion: v as Clasificacion })} />
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => { setShowModalAdd(false); setAddErrors({}); }}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveAdd}>Guardar</Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Editar con auditoría (HU-005) ── */}
      <Modal isOpen={!!editTx} onClose={() => setEditTx(null)} title="Editar Registro" size="sm">
        <div className="modal-form">
          <p className="audit-notice">Modificar un campo sensible requiere justificación para auditoría fiscal.</p>
          <Input label="Nuevo monto (₡)" type="number" value={editMonto}
            onChange={e => setEditMonto(e.target.value)} />
          <Input label="Razón del cambio (requerido para auditoría fiscal)" placeholder="Describe el motivo..."
            value={editRazon}
            onChange={e => { setEditRazon(e.target.value); setEditRazonError(''); }}
            error={editRazonError} />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setEditTx(null)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveEdit} disabled={!editMonto}>Guardar</Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Reclasificar (HU-006) ── */}
      <Modal isOpen={!!reclasificarTx} onClose={() => setReclasificarTx(null)} title="Cambiar Clasificación" size="sm">
        <div className="modal-form">
          <Select label="Nueva clasificación" options={optionsClasificacion} value={nuevaClasif}
            onChange={v => setNuevaClasif(v as Clasificacion)} />
          <Input label="Justificación (obligatoria)" placeholder="Razón del cambio de clasificación..."
            value={reclasifJustif}
            onChange={e => { setReclasifJustif(e.target.value); setReclasifError(''); }}
            error={reclasifError} />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setReclasificarTx(null)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveReclasif}>Confirmar</Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Importar CSV (HU-004) ── */}
      <Modal isOpen={showModalImport} onClose={handleCloseImport} title="Importar CSV" size="md">
        <div className="import-csv">

          {importState === 'idle' && (
            <>
              <div className="import-step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Seleccionar Plataforma</h4>
                  <div className="platform-options">
                    {['Airbnb', 'Booking', 'Vrbo', 'Genérico'].map(p => (
                      <button key={p} className={`platform-btn ${selectedPlatform === p ? 'platform-btn-active' : ''}`}
                        onClick={() => setSelectedPlatform(p)}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="import-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Subir Archivo</h4>
                  <div className="drop-zone" onClick={() => fileRef.current?.click()}>
                    <Upload size={48} strokeWidth={1.5} color="var(--color-text-muted)" />
                    <p>Arrastra tu archivo CSV aquí</p>
                    <span>o</span>
                    <button className="browse-btn" type="button">Buscar archivo</button>
                    <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => { if (e.target.files?.[0]) handleImportFile(e.target.files[0]); }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {importState === 'progress' && (
            <div className="import-progress">
              <p>Procesando {Math.round(importProgress * 0.2)} de 20 filas…</p>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${importProgress}%` }} /></div>
              <span>{importProgress}%</span>
            </div>
          )}

          {importState === 'done' && (
            <div className="import-result">
              <div className="result-success">
                <span>✓ Se importaron <strong>{importResult.ok} reservas</strong> correctamente.</span>
                {importResult.omitidos > 0 && (
                  <div className="banner-warning-import">
                    <AlertTriangle size={14} />
                    Se omitieron {importResult.omitidos} filas por errores en el formato de fecha.
                    <button className="link-btn">Descargar archivo de errores</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {importState === 'error-columns' && (
            <div className="import-error-modal">
              <AlertTriangle size={24} color="var(--color-danger)" />
              <p>El archivo tiene columnas faltantes. Se requieren:</p>
              <ul className="columns-list">
                {['fecha', 'concepto', 'monto', 'fuente'].map(c => <li key={c}><code>{c}</code></li>)}
              </ul>
              <button className="link-btn">Descargar plantilla oficial</button>
            </div>
          )}

          {importState === 'error-empty' && (
            <div className="import-error-modal">
              <AlertTriangle size={24} color="var(--color-danger)" />
              <p>El archivo está vacío o dañado. Por favor verifique el contenido.</p>
            </div>
          )}

          <div className="modal-actions">
            <Button variant="secondary" onClick={handleCloseImport}>
              {importState === 'done' || importState.startsWith('error') ? 'Cerrar' : 'Cancelar'}
            </Button>
            {importState === 'idle' && (
              <Button variant="primary" disabled={!selectedPlatform} onClick={() => fileRef.current?.click()}>
                Importar
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Ingresos;
