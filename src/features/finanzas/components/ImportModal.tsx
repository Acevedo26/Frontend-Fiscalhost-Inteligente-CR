import React, { useRef, useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Upload, AlertTriangle } from 'lucide-react';
import { showWarning } from '../../../utils/alerts';
import { API_BASE_URL } from '../../../api/axiosClient';

export type ImportState = 'idle' | 'progress' | 'done' | 'error-columns' | 'error-empty';

interface ImportModalProps {
  showModalImport: boolean;
  handleCloseImport: () => void;
  importState: ImportState;
  importProgress: number;
  importResult: { ok: number; omitidos: number; errorReportUrl?: string };
  selectedPlatform: string;
  setSelectedPlatform: (p: string) => void;
  handleImportFile: (file: File) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  showModalImport,
  handleCloseImport,
  importState,
  importProgress,
  importResult,
  selectedPlatform,
  setSelectedPlatform,
  handleImportFile,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndUpload = (file: File) => {
    if (!file) {
      showWarning('Archivo Requerido', 'Por favor seleccione un archivo CSV para importar.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showWarning('Formato Inválido', 'Debe seleccionar un archivo con formato .CSV válido.');
      return;
    }

    if (file.size === 0) {
      showWarning('Archivo Vacío', 'El archivo CSV seleccionado no contiene datos.');
      return;
    }

    if (!selectedPlatform) {
      showWarning('Plataforma Requerida', 'Por favor seleccione la plataforma de origen antes de importar.');
      return;
    }

    handleImportFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    window.open(`${API_BASE_URL}/importaciones/plantilla`, '_blank');
  };

  const handleDownloadErrors = () => {
    if (importResult.errorReportUrl) {
      window.open(`${API_BASE_URL.replace('/api', '')}${importResult.errorReportUrl}`, '_blank');
    }
  };

  return (
    <Modal isOpen={showModalImport} onClose={handleCloseImport} title="Importar Reservas CSV" size="md">
      <div className="import-csv">
        {importState === 'idle' && (
          <>
            <div className="import-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Seleccionar Plataforma de Hospedaje</h4>
                <div className="platform-options">
                  {['Airbnb', 'Booking', 'Vrbo', 'Genérico'].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`platform-btn ${selectedPlatform === p ? 'platform-btn-active' : ''}`}
                      onClick={() => setSelectedPlatform(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="import-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Subir Archivo (.CSV)</h4>
                <div
                  className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
                  onClick={() => {
                    if (!selectedPlatform) {
                      showWarning('Plataforma Requerida', 'Primero seleccione la plataforma de origen en el paso 1.');
                      return;
                    }
                    fileRef.current?.click();
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload size={48} strokeWidth={1.5} color="var(--color-text-muted)" />
                  <p>Arrastra tu archivo CSV aquí</p>
                  <span>o</span>
                  <button className="browse-btn" type="button">
                    Buscar archivo
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        validateAndUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {importState === 'progress' && (
          <div className="import-progress">
            <p>Procesando y validando registros con Hacienda...</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${importProgress}%` }} />
            </div>
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
                  Se omitieron {importResult.omitidos} filas por inconsistencias o errores de formato.
                  {importResult.errorReportUrl && (
                    <button type="button" className="link-btn" onClick={handleDownloadErrors}>
                      Descargar reporte de errores
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {importState === 'error-columns' && (
          <div className="import-error-modal">
            <AlertTriangle size={24} color="var(--color-danger)" />
            <p>El archivo tiene columnas faltantes o un formato no reconocido. Se requieren:</p>
            <ul className="columns-list">
              {['fecha_inicio', 'fecha_fin', 'monto_bruto', 'huesped'].map(c => (
                <li key={c}><code>{c}</code></li>
              ))}
            </ul>
            <button type="button" className="link-btn" onClick={handleDownloadTemplate}>
              Descargar plantilla oficial CSV
            </button>
          </div>
        )}

        {importState === 'error-empty' && (
          <div className="import-error-modal">
            <AlertTriangle size={24} color="var(--color-danger)" />
            <p>El archivo está vacío o no contiene filas de datos legibles. Por favor verifique el archivo.</p>
          </div>
        )}

        <div className="modal-actions">
          <Button variant="secondary" onClick={handleCloseImport}>
            {importState === 'done' || importState.startsWith('error') ? 'Cerrar' : 'Cancelar'}
          </Button>
          {importState === 'idle' && (
            <Button
              variant="primary"
              onClick={() => {
                if (!selectedPlatform) {
                  showWarning('Plataforma Requerida', 'Seleccione una plataforma antes de continuar.');
                  return;
                }
                fileRef.current?.click();
              }}
            >
              Importar
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
