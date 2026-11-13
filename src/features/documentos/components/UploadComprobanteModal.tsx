import React, { useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';

export type OcrState = 'idle' | 'processing' | 'done' | 'error';
export type DropState = 'idle' | 'error-format' | 'error-duplicate';

interface UploadComprobanteModalProps {
  showModal: boolean;
  ocrState: OcrState;
  dropState: DropState;
  dragOver: boolean;
  sinOcr: boolean;
  selectedFile: File | null;
  isPending: boolean;
  setDragOver: (val: boolean) => void;
  setSinOcr: (val: boolean) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCloseModal: () => void;
  handleGuardar: () => void;
}

export const UploadComprobanteModal: React.FC<UploadComprobanteModalProps> = ({
  showModal,
  ocrState,
  dropState,
  dragOver,
  sinOcr,
  selectedFile,
  isPending,
  setDragOver,
  setSinOcr,
  handleDrop,
  handleFileInput,
  handleCloseModal,
  handleGuardar,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Modal isOpen={showModal} onClose={handleCloseModal} title="Subir Comprobante" size="md">
      <div className="comprobante-modal">
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

        {(ocrState === 'done' || sinOcr) && (
          <div className="comp-form">
            {ocrState === 'done' && (
              <div className="banner-success">
                <CheckCircle size={16} />
                Archivo seleccionado: {selectedFile?.name}.
                Haz clic en Guardar para procesar con OCR en el servidor.
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <Button variant="secondary" onClick={handleCloseModal} disabled={isPending}>Cancelar</Button>
          {(ocrState === 'done' || sinOcr) && (
            <Button variant="primary" onClick={handleGuardar} disabled={isPending}>
              <FileText size={16} />
              {isPending ? 'Subiendo...' : 'Confirmar y Guardar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
