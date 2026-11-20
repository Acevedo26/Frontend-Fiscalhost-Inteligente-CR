/* ============================================
   PÁGINA: Comprobantes de Gastos
   Descripción: Gestión de comprobantes con OCR y crédito fiscal (HU-007)
   ============================================ */

import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';

import { Upload } from 'lucide-react';
import './Comprobantes.css';

import { useGastos } from '../../operaciones/hooks/useOperaciones';
import { useUploadComprobante } from '../hooks/useUploadComprobante';
import { ComprobantesTable } from '../components/ComprobantesTable';
import { UploadComprobanteModal } from '../components/UploadComprobanteModal';
import type { OcrState, DropState } from '../components/UploadComprobanteModal';
import { SereneSwal, showSuccess, showWarning } from '../../../utils/alerts';
import { OperacionesService } from '../../operaciones/services/OperacionesService';
import { useQueryClient } from '@tanstack/react-query';

export const Comprobantes: React.FC = () => {
  const { data: comprobantesData, isLoading } = useGastos();
  const uploadComprobante = useUploadComprobante();
  const queryClient = useQueryClient();
  
  const [showModal, setShowModal] = useState(false);
  const [dropState, setDropState] = useState<DropState>('idle');
  const [ocrState, setOcrState] = useState<OcrState>('idle');
  const [sinOcr, setSinOcr] = useState(false);
  const [, setFormErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const comprobantes = useMemo(() => comprobantesData || [], [comprobantesData]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.startsWith('image/')) {
      setDropState('error-format');
      showWarning('Formato No Soportado', 'El comprobante debe ser un archivo PDF o una imagen (JPG, PNG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showWarning('Archivo Demasiado Grande', 'El tamaño del comprobante no puede superar 10 MB.');
      return;
    }

    setDropState('idle');
    setSelectedFile(file);
    setOcrState('done');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleGuardar = () => {
    if (!selectedFile) {
      setFormErrors({ file: 'Archivo requerido' });
      showWarning('Archivo Faltante', 'Debe seleccionar o arrastrar un archivo de comprobante válido.');
      return;
    }
    uploadComprobante.mutate(selectedFile, {
      onSuccess: () => {
        handleCloseModal();
        showSuccess('Comprobante Guardado', 'El comprobante fue subido y validado exitosamente.');
      }
    });
  };

  const handleDeleteComprobante = async (gasto: any) => {
    const gastoId = gasto.gastoId || gasto.id;
    const result = await SereneSwal.fire({
      title: '¿Eliminar comprobante de gasto?',
      text: 'Conforme a la Ley 8968 y la normativa de trazabilidad tributaria, debe suministrar una justificación (mínimo 10 caracteres) para eliminar este comprobante:',
      input: 'textarea',
      inputPlaceholder: 'Indique el motivo de eliminación (ej: Comprobante registrado por error / Factura duplicada)...',
      inputAttributes: {
        'aria-label': 'Justificación de eliminación según Ley 8968'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar Eliminación',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value || value.trim().length < 10) {
          return 'La justificación debe tener al menos 10 caracteres según la Ley 8968.';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      let deleteOk = false;
      try {
        await OperacionesService.eliminarGasto(gastoId, result.value.trim());
        queryClient.invalidateQueries({ queryKey: ['gastos'] });
        deleteOk = true;
      } catch {
        // Handled by global Axios interceptor
      } finally {
        setIsDeleting(false);
      }

      if (deleteOk) {
        showSuccess('Comprobante Eliminado', 'El comprobante ha sido eliminado y auditado conforme a la Ley 8968.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setOcrState('idle');
    setDropState('idle');
    setSinOcr(false);
    setSelectedFile(null);
    setFormErrors({});
  };


  const totalCreditoFiscal = comprobantes
    .filter((c: any) => c.esCreditoFiscalValido)
    .reduce((sum: number, c: any) => sum + c.montoIvaSoportado, 0);

  const countValidados = comprobantes.filter((c: any) => c.esCreditoFiscalValido).length;
  const countSinOcr = 0; // Not tracked directly on frontend right now

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
            <span className="resumen-value">{countValidados}</span>
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
            <span className="resumen-value resumen-warning">{countSinOcr}</span>
          </div>
        </Card>
      </div>

      <ComprobantesTable
        comprobantes={comprobantes}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
        onDelete={handleDeleteComprobante}
        isDeleting={isDeleting}
      />

      <UploadComprobanteModal
        showModal={showModal}
        ocrState={ocrState}
        dropState={dropState}
        dragOver={dragOver}
        sinOcr={sinOcr}
        selectedFile={selectedFile}
        isPending={uploadComprobante.isPending}
        setDragOver={setDragOver}
        setSinOcr={setSinOcr}
        handleDrop={handleDrop}
        handleFileInput={handleFileInput}
        handleCloseModal={handleCloseModal}
        handleGuardar={handleGuardar}
      />
    </div>
  );
};

export default Comprobantes;
