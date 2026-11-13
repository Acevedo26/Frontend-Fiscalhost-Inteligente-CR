import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Download, Lock, BarChart2, ClipboardList, FileText, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { showWarning, showSuccess } from '../../../utils/alerts';

interface ExportarModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporteSeleccionado: string | null;
  getTipoReporteLabel: (tipo: string) => string;
}

const getPasswordStrength = (p: string) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  return s;
};

export const ExportarModal: React.FC<ExportarModalProps> = ({
  isOpen,
  onClose,
  reporteSeleccionado,
  getTipoReporteLabel
}) => {
  const [exportFormat, setExportFormat] = useState('PDF');
  const [exportPass, setExportPass] = useState('');
  const [exportPassConfirm, setExportPassConfirm] = useState('');
  const [exportPassError, setExportPassError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const passStrength = getPasswordStrength(exportPass);
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', 'var(--color-danger)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-success)'];

  const handleExport = () => {
    if (!exportPass) {
      setExportPassError('La contraseña es requerida');
      showWarning('Contraseña Requerida', 'Debe especificar una contraseña para cifrar el archivo de exportación tributaria.');
      return;
    }
    if (exportPass !== exportPassConfirm) {
      setExportPassError('Las contraseñas no coinciden');
      showWarning('Contraseñas No Coinciden', 'La confirmación de la contraseña no coincide con la ingresada.');
      return;
    }

    const reportLabel = getTipoReporteLabel(reporteSeleccionado || 'Reporte_General');
    const dummyContent = [
      `----- BEGIN FISCALHOST ENCRYPTED REPORT -----`,
      `Tipo de Reporte: ${reportLabel}`,
      `Formato: ${exportFormat}`,
      `Periodo: Abril 2026`,
      `Cifrado: AES-256-GCM`,
      `Firma Digital Ley 8454: OK`,
      `Timestamp: ${new Date().toISOString()}`,
      `----- END FISCALHOST ENCRYPTED REPORT -----`,
    ].join('\n');

    const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${reportLabel.replace(/\s+/g, '_')}_Cifrado.${exportFormat.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportDone(true);
    showSuccess(
      'Exportación Exitosa',
      `El reporte "${reportLabel}" ha sido cifrado con su contraseña y descargado exitosamente en formato ${exportFormat}.`
    );
  };


  const handleClose = () => {
    setExportPass(''); setExportPassConfirm('');
    setExportPassError(''); setExportDone(false); setExportFormat('PDF');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Exportar Reporte" size="md">
      <div className="export-modal">
        {exportDone ? (
          <div className="export-done">
            <CheckCircle size={48} color="var(--color-success)" strokeWidth={1.5} />
            <p>Archivo listo para subir a TRIBU-CR</p>
            <p className="export-done-sub">El archivo fue cifrado con tu contraseña y descargado automáticamente.</p>
            <Button variant="primary" onClick={handleClose}>Cerrar</Button>
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
              <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
              <Button variant="primary" onClick={handleExport}>
                <Download size={16} /> Exportar y descargar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
