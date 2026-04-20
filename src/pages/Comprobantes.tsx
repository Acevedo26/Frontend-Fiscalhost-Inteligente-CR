/* ============================================
   PÁGINA: Comprobantes de Gastos
   Descripción: Gestión de comprobantes con OCR y crédito fiscal (HU-007)
   ============================================ */

import React, { useState, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Eye } from 'lucide-react';
import './Comprobantes.css';

interface Comprobante {
  id: number;
  numero: string;
  proveedor: string;
  fecha: string;
  monto: number;
  estado: 'VALIDADO' | 'PENDIENTE' | 'SIN_OCR';
  aptoCreditoFiscal: boolean;
}

const mockComprobantes: Comprobante[] = [
  { id: 1, numero: 'FE-001-2026', proveedor: 'Limpiezas Costa', fecha: '12/04/2026', monto: 15000, estado: 'VALIDADO', aptoCreditoFiscal: true },
  { id: 2, numero: 'FE-002-2026', proveedor: 'CoolTech', fecha: '08/04/2026', monto: 35000, estado: 'VALIDADO', aptoCreditoFiscal: true },
  { id: 3, numero: 'FE-003-2026', proveedor: 'ICE', fecha: '01/04/2026', monto: 25000, estado: 'SIN_OCR', aptoCreditoFiscal: false },
  { id: 4, numero: 'FE-004-2026', proveedor: 'Ferretería Nacional', fecha: '28/03/2026', monto: 18500, estado: 'PENDIENTE', aptoCreditoFiscal: false },
];

type OcrState = 'idle' | 'processing' | 'done' | 'error';
type DropState = 'idle' | 'error-format' | 'error-duplicate';

export const Comprobantes: React.FC = () => {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>(mockComprobantes);
  const [showModal, setShowModal] = useState(false);
  const [dropState, setDropState] = useState<DropState>('idle');
  const [ocrState, setOcrState] = useState<OcrState>('idle');
  const [sinOcr, setSinOcr] = useState(false);
  const [formData, setFormData] = useState({ numero: '', proveedor: '', fecha: '', monto: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.pdf') && !file.type.startsWith('image/')) {
      setDropState('error-format');
      return;
    }
    const isDuplicate = comprobantes.some(c => c.numero === 'FE-001-2026');
    if (isDuplicate && file.name.includes('FE-001')) {
      setDropState('error-duplicate');
      return;
    }
    setDropState('idle');
    setOcrState('processing');
    setTimeout(() => {
      setOcrState('done');
      setFormData({ numero: 'FE-00' + (comprobantes.length + 1) + '-2026', proveedor: 'Proveedor Extraído', fecha: '2026-04-20', monto: '12000' });
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.numero) errors.numero = 'Número de factura requerido';
    if (!formData.proveedor) errors.proveedor = 'Proveedor requerido';
    if (!formData.fecha) errors.fecha = 'Fecha requerida';
    if (!formData.monto || Number(formData.monto) <= 0) errors.monto = 'Monto debe ser mayor a cero';
    return errors;
  };

  const handleGuardar = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    const nuevo: Comprobante = {
      id: Date.now(),
      numero: formData.numero,
      proveedor: formData.proveedor,
      fecha: formData.fecha,
      monto: Number(formData.monto),
      estado: sinOcr ? 'SIN_OCR' : 'VALIDADO',
      aptoCreditoFiscal: !sinOcr,
    };
    setComprobantes([nuevo, ...comprobantes]);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setOcrState('idle');
    setDropState('idle');
    setSinOcr(false);
    setFormData({ numero: '', proveedor: '', fecha: '', monto: '' });
    setFormErrors({});
  };

  const totalCreditoFiscal = comprobantes
    .filter(c => c.aptoCreditoFiscal)
    .reduce((sum, c) => sum + c.monto * 0.13, 0);

  return (
    <div className="comprobantes-page">
      <div className="page-header">
        <div>
          <h1>Comprobantes de Gastos</h1>
          <p>Gestiona tus facturas y crédito fiscal</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Upload size={18} />
          Subir Comprobante
        </Button>
      </div>

      <div className="comprobantes-resumen">
        <Card variant="elevated" padding="md">
          <div className="resumen-item">
            <span className="resumen-label">Comprobantes validados</span>
            <span className="resumen-value">{comprobantes.filter(c => c.estado === 'VALIDADO').length}</span>
          </div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="resumen-item">
            <span className="resumen-label">Crédito fiscal disponible</span>
            <span className="resumen-value resumen-success">{formatCurrency(totalCreditoFiscal)}</span>
          </div>
        </Card>
        <Card variant="elevated" padding="md">
          <div className="resumen-item">
            <span className="resumen-label">Sin OCR (pendientes)</span>
            <span className="resumen-value resumen-warning">{comprobantes.filter(c => c.estado === 'SIN_OCR').length}</span>
          </div>
        </Card>
      </div>

      <Card variant="outlined" padding="none">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Factura</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Crédito Fiscal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprobantes.map(c => (
                <tr key={c.id}>
                  <td className="cell-concept">{c.numero}</td>
                  <td>{c.proveedor}</td>
                  <td className="cell-date">{c.fecha}</td>
                  <td className="cell-amount expense">{formatCurrency(c.monto)}</td>
                  <td>
                    <Badge
                      variant={c.estado === 'VALIDADO' ? 'success' : c.estado === 'SIN_OCR' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {c.estado === 'VALIDADO' ? 'Evidencia validada' : c.estado === 'SIN_OCR' ? 'Sin OCR' : 'Pendiente'}
                    </Badge>
                  </td>
                  <td>
                    {c.aptoCreditoFiscal
                      ? <Badge variant="success" size="sm">Apto</Badge>
                      : <Badge variant="default" size="sm">No apto</Badge>
                    }
                  </td>
                  <td className="cell-actions">
                    <button className="action-btn" title="Ver"><Eye size={16} /></button>
                    <button className="action-btn action-btn-danger" title="Eliminar"
                      onClick={() => setComprobantes(comprobantes.filter(x => x.id !== c.id))}>
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal subir comprobante */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title="Subir Comprobante" size="md">
        <div className="comprobante-modal">

          {/* Zona de carga */}
          {ocrState === 'idle' && (
            <>
              <div
                className={`drop-zone-comp ${dragOver ? 'drag-over' : ''} ${dropState === 'error-format' ? 'drop-error' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={40} strokeWidth={1.5} />
                <p>Arrastra tu PDF o imagen aquí o haz clic para seleccionar</p>
                <span>Formatos: PDF, JPG, PNG</span>
                <input ref={fileRef} type="file" accept=".pdf,image/*" hidden onChange={handleFileInput} />
              </div>

              {dropState === 'error-format' && (
                <div className="inline-error">
                  <X size={14} /> Formato no soportado. Debe subir un PDF o imagen.
                </div>
              )}

              {dropState === 'error-duplicate' && (
                <div className="inline-error">
                  <AlertTriangle size={14} /> Ya existe un comprobante con este número. Verifique el número de factura.
                </div>
              )}

              <div className="sinOcr-toggle">
                <label>
                  <input type="checkbox" checked={sinOcr} onChange={e => setSinOcr(e.target.checked)} />
                  Guardar sin extracción automática
                </label>
              </div>

              {sinOcr && (
                <div className="banner-warning">
                  <AlertTriangle size={16} />
                  Este gasto no será considerado automáticamente para crédito fiscal hasta que se ingresen los datos manualmente.
                </div>
              )}
            </>
          )}

          {/* OCR procesando */}
          {ocrState === 'processing' && (
            <div className="ocr-processing">
              <div className="ocr-spinner" />
              <p>Extrayendo datos del comprobante…</p>
            </div>
          )}

          {/* Formulario (post-OCR o manual) */}
          {(ocrState === 'done' || sinOcr) && (
            <div className="comp-form">
              {ocrState === 'done' && (
                <div className="banner-success">
                  <CheckCircle size={16} />
                  Datos extraídos correctamente. Revisa y confirma.
                </div>
              )}
              <Input label="N° de Factura" value={formData.numero}
                onChange={e => { setFormData({ ...formData, numero: e.target.value }); setFormErrors({ ...formErrors, numero: '' }); }}
                error={formErrors.numero} />
              <Input label="Proveedor" value={formData.proveedor}
                onChange={e => { setFormData({ ...formData, proveedor: e.target.value }); setFormErrors({ ...formErrors, proveedor: '' }); }}
                error={formErrors.proveedor} />
              <Input label="Fecha" type="date" value={formData.fecha}
                onChange={e => { setFormData({ ...formData, fecha: e.target.value }); setFormErrors({ ...formErrors, fecha: '' }); }}
                error={formErrors.fecha} />
              <Input label="Monto" type="number" value={formData.monto}
                onChange={e => { setFormData({ ...formData, monto: e.target.value }); setFormErrors({ ...formErrors, monto: '' }); }}
                error={formErrors.monto} />
            </div>
          )}

          {/* OCR error */}
          {ocrState === 'error' && (
            <div className="banner-warning">
              <AlertTriangle size={16} />
              No se pudo extraer la información automáticamente. Ingresa los datos manualmente.
            </div>
          )}

          <div className="modal-actions">
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            {(ocrState === 'done' || sinOcr) && (
              <Button variant="primary" onClick={handleGuardar}>
                <FileText size={16} />
                Confirmar y Guardar
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Comprobantes;
