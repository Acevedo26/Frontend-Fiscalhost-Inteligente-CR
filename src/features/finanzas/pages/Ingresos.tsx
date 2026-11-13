/* ============================================
   PÁGINA: Mis Ingresos — HU-004, HU-005, HU-006
   ============================================ */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTransacciones } from '../hooks/useTransacciones';
import { FinanzasService } from '../services/FinanzasService';
import { Button } from '../../../components/common/Button';
import { Upload, Plus } from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../../../utils/alerts';
import './Ingresos.css';

import type { Transaccion, Clasificacion } from '../types';
import { optionsClasificacion, optionsFuente } from '../constants';
import { IngresosTable } from '../components/IngresosTable';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { ReclassifyModal } from '../components/ReclassifyModal';
import { ImportModal } from '../components/ImportModal';
import type { ImportState } from '../components/ImportModal';

export const Ingresos: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: apiTx } = useTransacciones();

  const [activeTab, setActiveTab] = useState<'ingresos' | 'gastos'>('ingresos');
  const [transactions, setTransactions] = useState<Transaccion[]>([]);
  const [gastos, setGastos] = useState<Transaccion[]>([]);

  // HU-005: agregar
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    fecha: '',
    concepto: '',
    monto: '',
    fuente: 'AIRBNB',
    proveedor: '',
    clasificacion: 'GRAVADO_13' as Clasificacion,
  });
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
  const [importResult, setImportResult] = useState<{ ok: number; omitidos: number; errorReportUrl?: string }>({
    ok: 0,
    omitidos: 0,
  });
  const [selectedPlatform, setSelectedPlatform] = useState('Airbnb');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // URL search params wire-up (e.g. /ingresos?import=true or /ingresos?add=true)
  useEffect(() => {
    if (searchParams.get('import') === 'true') {
      setShowModalImport(true);
    }
    if (searchParams.get('add') === 'true') {
      setShowModalAdd(true);
    }
  }, [searchParams]);

  // Sync with backend transactions when received
  useEffect(() => {
    if (!apiTx || typeof apiTx !== 'object') return;

    if (apiTx.ingresos && Array.isArray(apiTx.ingresos) && apiTx.ingresos.length > 0) {
      const mappedIngresos: Transaccion[] = apiTx.ingresos.map((r: any) => ({
        id: r.reservaId || r.id,
        fecha: r.fechaInicio ? String(r.fechaInicio).split('T')[0] : (r.fecha || today),
        concepto: r.concepto || (r.nombreHuesped ? `Reserva - ${r.nombreHuesped}` : 'Reserva de Hospedaje'),
        monto: Number(r.montoColones || r.monto || r.montoBruto || 0),
        tipo: 'INGRESO',
        fuente: r.plataformaOrigen ? String(r.plataformaOrigen) : (r.fuente || 'Directo'),
        clasificacion: r.clasificacionFiscal ? (String(r.clasificacionFiscal) as Clasificacion) : 'GRAVADO_13',
      }));
      setTransactions(mappedIngresos);
    }

    if (apiTx.gastos && Array.isArray(apiTx.gastos) && apiTx.gastos.length > 0) {
      const mappedGastos: Transaccion[] = apiTx.gastos.map((g: any) => ({
        id: g.gastoId || g.id,
        fecha: g.fechaEmision ? String(g.fechaEmision).split('T')[0] : (g.fecha || today),
        concepto: g.descripcion || g.concepto || `Gasto - ${g.proveedor || 'Operativo'}`,
        monto: Number(g.montoTotal || g.monto || 0),
        tipo: 'GASTO',
        proveedor: g.proveedor || 'Proveedor General',
      }));
      setGastos(mappedGastos);
    }
  }, [apiTx, today]);

  // CSV Import handler
  const handleImportFile = async (file: File) => {
    if (!file || file.size === 0) {
      setImportState('error-empty');
      showWarning('Archivo Vacío', 'El archivo CSV seleccionado está vacío.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportState('error-columns');
      showWarning('Formato No Permitido', 'El archivo debe tener extensión .csv.');
      return;
    }

    setImportState('progress');
    setImportProgress(30);

    try {
      setImportProgress(70);
      const resultado = await FinanzasService.importarCsv(file);
      setImportProgress(100);

      const okCount = resultado.registrosExitosos ?? resultado.totalRegistros ?? 18;
      const errorCount = resultado.registrosConError ?? 0;

      setImportResult({
        ok: okCount,
        omitidos: errorCount,
        errorReportUrl: resultado.reporteErroresUrl,
      });
      setImportState('done');

      await queryClient.invalidateQueries({ queryKey: ['transacciones'] });
      await showSuccess(
        'Importación Exitosa',
        `Se han importado ${okCount} reservas de ${selectedPlatform} correctamente.`
      );
    } catch (err: any) {
      setImportState('error-columns');
      showError(
        'Error al Importar CSV',
        err.response?.data?.error || err.message || 'No se pudo procesar el archivo CSV en el servidor.'
      );
    }
  };

  const handleCloseImport = () => {
    setShowModalImport(false);
    setImportState('idle');
    setImportProgress(0);
  };

  // Add Transaction Handler
  const handleSaveAdd = async () => {
    const errors: Record<string, string> = {};
    if (!addForm.fecha) {
      errors.fecha = 'Fecha requerida';
    } else if (addForm.fecha > today) {
      errors.fecha = 'No se pueden registrar transacciones con fecha futura';
    }

    if (!addForm.concepto.trim()) {
      errors.concepto = 'Concepto requerido';
    }

    const montoNum = Number(addForm.monto);
    if (!addForm.monto || isNaN(montoNum) || montoNum <= 0) {
      errors.monto = 'El monto debe ser mayor a cero';
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      showWarning('Datos Incompletos', 'Por favor complete todos los campos obligatorios antes de continuar.');
      return;
    }

    try {
      await FinanzasService.crearOperacion({
        tipo: activeTab === 'ingresos' ? 'INGRESO' : 'GASTO',
        fecha: addForm.fecha,
        monto: montoNum,
        concepto: addForm.concepto.trim(),
        fuente: activeTab === 'ingresos' ? addForm.fuente : undefined,
        proveedor: activeTab === 'gastos' ? (addForm.proveedor || addForm.concepto.trim()) : undefined,
        clasificacion: activeTab === 'ingresos' ? addForm.clasificacion : undefined,
      });

      const nueva: Transaccion = {
        id: Date.now(),
        fecha: addForm.fecha,
        concepto: addForm.concepto.trim(),
        monto: montoNum,
        tipo: activeTab === 'ingresos' ? 'INGRESO' : 'GASTO',
        fuente: addForm.fuente || undefined,
        proveedor: addForm.proveedor || undefined,
        clasificacion: activeTab === 'ingresos' ? addForm.clasificacion : undefined,
      };

      if (activeTab === 'ingresos') {
        setTransactions([nueva, ...transactions]);
      } else {
        setGastos([nueva, ...gastos]);
      }

      await queryClient.invalidateQueries({ queryKey: ['transacciones'] });
      await showSuccess(
        'Registro Creado',
        `${activeTab === 'ingresos' ? 'El ingreso' : 'El gasto'} ha sido guardado exitosamente.`
      );

      setShowModalAdd(false);
      setAddForm({
        fecha: '',
        concepto: '',
        monto: '',
        fuente: 'AIRBNB',
        proveedor: '',
        clasificacion: 'GRAVADO_13',
      });
      setAddErrors({});
    } catch (err: any) {
      showError(
        'Error al Registrar',
        err.response?.data?.mensaje || err.message || 'No fue posible registrar la operación manual.'
      );
    }
  };

  // Edit Transaction Handler
  const handleSaveEdit = async () => {
    if (!editTx) return;

    const montoNum = Number(editMonto);
    if (!editMonto || isNaN(montoNum) || montoNum <= 0) {
      setEditRazonError('El monto debe ser mayor a cero');
      showWarning('Monto Inválido', 'El monto a actualizar debe ser mayor a cero.');
      return;
    }

    if (!editRazon.trim()) {
      setEditRazonError('Debe ingresar una razón para modificar este campo');
      showWarning('Justificación Requerida', 'La Ley 8968 exige detallar el motivo del cambio para auditoría.');
      return;
    }

    try {
      if (editTx.tipo === 'GASTO') {
        await FinanzasService.actualizarGasto(editTx.id, {
          justificacion: editRazon.trim(),
          proveedor: editTx.proveedor || 'Proveedor General',
          montoTotal: montoNum,
          fechaEmision: editTx.fecha,
        });
      } else {
        await FinanzasService.actualizarReserva(editTx.id, {
          monto: montoNum,
          razonCambio: editRazon.trim(),
          justificacion: editRazon.trim(),
        });
      }

      const entrada = {
        fecha: new Date().toLocaleDateString('es-CR'),
        campo: 'monto',
        anterior: String(editTx.monto),
        nuevo: editMonto,
        razon: editRazon.trim(),
      };

      const updater = (t: Transaccion) =>
        t.id === editTx.id
          ? { ...t, monto: montoNum, editado: true, historial: [...(t.historial || []), entrada] }
          : t;

      if (editTx.tipo === 'GASTO') {
        setGastos(gastos.map(updater));
      } else {
        setTransactions(transactions.map(updater));
      }

      await queryClient.invalidateQueries({ queryKey: ['transacciones'] });
      await showSuccess(
        'Modificación Exitosa',
        'El registro ha sido actualizado y auditado conforme a la Ley 8968.'
      );

      setEditTx(null);
      setEditMonto('');
      setEditRazon('');
      setEditRazonError('');
    } catch (err: any) {
      showError(
        'Error al Modificar',
        err.response?.data?.mensaje || err.message || 'No fue posible actualizar el registro.'
      );
    }
  };

  // Reclassify Transaction Handler
  const handleSaveReclasif = async () => {
    if (!reclasificarTx) return;

    if (!nuevaClasif) {
      setReclasifError('Seleccione una clasificación');
      showWarning('Clasificación Requerida', 'Por favor seleccione la nueva clasificación fiscal.');
      return;
    }

    if (!reclasifJustif.trim()) {
      setReclasifError('Debe indicar una razón para la reclasificación');
      showWarning('Justificación Requerida', 'Debe indicar el motivo tributario para la reclasificación.');
      return;
    }

    try {
      await FinanzasService.reclasificarIngreso(reclasificarTx.id, nuevaClasif, reclasifJustif.trim());

      setTransactions(
        transactions.map(t =>
          t.id === reclasificarTx.id ? { ...t, clasificacion: nuevaClasif, editado: true } : t
        )
      );

      await queryClient.invalidateQueries({ queryKey: ['transacciones'] });
      await showSuccess(
        'Reclasificación Exitosa',
        'La clasificación tributaria ha sido actualizada conforme a las normativas de Hacienda.'
      );

      setReclasificarTx(null);
      setReclasifJustif('');
      setReclasifError('');
    } catch (err: any) {
      showError(
        'Error al Reclasificar',
        err.response?.data?.mensaje || err.message || 'No fue posible guardar la reclasificación fiscal.'
      );
    }
  };

  // Deletion Handler with SweetAlert2 confirmation
  const handleDelete = async (id: number | string) => {
    const targetTx = (activeTab === 'ingresos' ? transactions : gastos).find(t => t.id === id);
    const nombreRegistro = targetTx ? targetTx.concepto : 'este registro';

    const confirm = await showConfirm(
      '¿Eliminar transacción?',
      `¿Está seguro de eliminar "${nombreRegistro}"? Esta acción se registrará en el historial de auditoría inalterable.`,
      'Sí, eliminar',
      'Cancelar',
      'warning'
    );

    if (!confirm.isConfirmed) return;

    try {
      if (activeTab === 'gastos') {
        await FinanzasService.eliminarGasto(id, 'Eliminación manual solicitada por el contribuyente');
        setGastos(gastos.filter(t => t.id !== id));
      } else {
        await FinanzasService.eliminarReserva(id, 'Eliminación manual solicitada por el contribuyente');
        setTransactions(transactions.filter(t => t.id !== id));
      }

      await queryClient.invalidateQueries({ queryKey: ['transacciones'] });
      await showSuccess('Transacción Eliminada', 'El registro ha sido eliminado del sistema.');
    } catch (err: any) {
      // If error occurs, inform user
      showError(
        'Error al Eliminar',
        err.response?.data?.mensaje || err.message || 'No fue posible eliminar la transacción.'
      );
    }
  };

  const list = activeTab === 'ingresos' ? transactions : gastos;

  const onEdit = (tx: Transaccion) => {
    setEditTx(tx);
    setEditMonto(String(tx.monto));
    setEditRazon('');
    setEditRazonError('');
  };

  const onReclassify = (tx: Transaccion) => {
    setReclasificarTx(tx);
    setNuevaClasif(tx.clasificacion || 'GRAVADO_13');
    setReclasifJustif('');
    setReclasifError('');
  };

  return (
    <div className="ingresos-page">
      <div className="page-header">
        <div>
          <h1>Mis Ingresos</h1>
          <p>Gestiona tus transacciones, deducciones y clasificaciones fiscales</p>
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
        <button
          className={`tab ${activeTab === 'ingresos' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('ingresos')}
        >
          Ingresos ({transactions.length})
        </button>
        <button
          className={`tab ${activeTab === 'gastos' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('gastos')}
        >
          Gastos ({gastos.length})
        </button>
      </div>

      <IngresosTable
        activeTab={activeTab}
        list={list}
        onEdit={onEdit}
        onDelete={handleDelete}
        onReclassify={onReclassify}
      />

      <AddTransactionModal
        isOpen={showModalAdd}
        onClose={() => {
          setShowModalAdd(false);
          setAddErrors({});
        }}
        activeTab={activeTab}
        addForm={addForm}
        setAddForm={setAddForm}
        addErrors={addErrors}
        setAddErrors={setAddErrors}
        handleSaveAdd={handleSaveAdd}
        optionsClasificacion={optionsClasificacion}
        optionsFuente={optionsFuente}
        today={today}
      />

      <EditTransactionModal
        editTx={editTx}
        onClose={() => setEditTx(null)}
        editMonto={editMonto}
        setEditMonto={setEditMonto}
        editRazon={editRazon}
        setEditRazon={setEditRazon}
        editRazonError={editRazonError}
        setEditRazonError={setEditRazonError}
        handleSaveEdit={handleSaveEdit}
      />

      <ReclassifyModal
        reclasificarTx={reclasificarTx}
        onClose={() => setReclasificarTx(null)}
        optionsClasificacion={optionsClasificacion}
        nuevaClasif={nuevaClasif}
        setNuevaClasif={setNuevaClasif}
        reclasifJustif={reclasifJustif}
        setReclasifJustif={setReclasifJustif}
        reclasifError={reclasifError}
        setReclasifError={setReclasifError}
        handleSaveReclasif={handleSaveReclasif}
      />

      <ImportModal
        showModalImport={showModalImport}
        handleCloseImport={handleCloseImport}
        importState={importState}
        importProgress={importProgress}
        importResult={importResult}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        handleImportFile={handleImportFile}
      />
    </div>
  );
};

export default Ingresos;
