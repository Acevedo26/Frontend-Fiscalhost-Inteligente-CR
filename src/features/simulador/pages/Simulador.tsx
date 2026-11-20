/* ============================================
   PÁGINA: Simulador de Escenarios
   Descripción: Simulador "¿Qué pasa si...?" (HU-018)
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import './Simulador.css';

import type { Escenario } from '../types/simulador';
import { ComparisonTable } from '../components/ComparisonTable';
import { EscenarioCard } from '../components/EscenarioCard';
import { showWarning, showSuccess, showConfirm } from '../../../utils/alerts';
import { SimuladorService } from '../services/SimuladorService';

export const Simulador: React.FC = () => {
  const [modo, setModo] = useState<'historico' | 'personalizado'>('historico');
  const [periodoBase, setPeriodoBase] = useState('2025');
  const [escenarios, setEscenarios] = useState<Escenario[]>([]);
  const [nuevoEscenario, setNuevoEscenario] = useState({ nombre: '', ingresos: 350000, gastos: 80000, activo: 0 });
  const [showComparison, setShowComparison] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const agregarEscenario = async () => {
    if (!nuevoEscenario.nombre || !nuevoEscenario.nombre.trim()) {
      showWarning('Nombre Requerido', 'Debe ingresar un nombre descriptivo para el nuevo escenario fiscal.');
      return;
    }

    const ingresosNum = Number(nuevoEscenario.ingresos);
    const gastosNum = Number(nuevoEscenario.gastos);

    if (isNaN(ingresosNum) || ingresosNum < 0) {
      showWarning('Monto Inválido', 'El monto de ingresos estimados debe ser un número mayor o igual a cero.');
      return;
    }

    if (isNaN(gastosNum) || gastosNum < 0) {
      showWarning('Monto Inválido', 'El monto de gastos estimados debe ser un número mayor o igual a cero.');
      return;
    }

    const newId = Date.now().toString();
    setIsSaving(true);
    try {
      await SimuladorService.crearSimulacion({
        nombre: nuevoEscenario.nombre.trim(),
        periodoBaseAnio: Number(periodoBase) || 2026,
        parametros: {
          ingresosMensualesEstimados: ingresosNum,
          gastosMensualesEstimados: gastosNum,
        }
      });
    } catch {
      // Handled by global Axios interceptor
    } finally {
      setIsSaving(false);
    }

    setEscenarios([
      ...escenarios,
      {
        id: newId,
        nombre: nuevoEscenario.nombre.trim(),
        ingresos: ingresosNum,
        gastos: gastosNum,
        activo: nuevoEscenario.activo || 0,
      }
    ]);
    setNuevoEscenario({ nombre: '', ingresos: 350000, gastos: 80000, activo: 0 });
    showSuccess('Escenario Creado', `El escenario "${nuevoEscenario.nombre.trim()}" ha sido registrado y proyectado exitosamente.`);
  };

  const eliminarEscenario = async (id: string) => {
    if (id === 'base') {
      showWarning('Acción No Permitida', 'No se puede eliminar el escenario base.');
      return;
    }

    const esc = escenarios.find(e => e.id === id);
    const confirm = await showConfirm(
      '¿Eliminar escenario?',
      `¿Desea eliminar el escenario "${esc?.nombre || id}"? Esta acción no se puede deshacer.`,
      'Sí, Eliminar'
    );
    if (!confirm.isConfirmed) return;

    setIsSaving(true);
    try {
      await SimuladorService.eliminarSimulacion(id);
    } catch {
      // Handled by global Axios interceptor
    } finally {
      setIsSaving(false);
    }

    setEscenarios(escenarios.filter(e => e.id !== id));
    showSuccess('Escenario Eliminado', 'El escenario ha sido eliminado exitosamente.');
  };

  const actualizarEscenario = (id: string, updates: Partial<Escenario>) => {
    setEscenarios(escenarios.map(esc => 
      esc.id === id ? { ...esc, ...updates } : esc
    ));
  };


  const escenarioBase = escenarios.find(e => e.id === 'base') || escenarios[0];

  return (
    <div className="simulador-page">
      <div className="page-header">
        <div>
          <h1>Simulador de Escenarios</h1>
          <p>Visualiza el impacto de cambios en tus proyecciones fiscales</p>
        </div>
        <Button variant="outline" onClick={() => setShowComparison(!showComparison)}>
          {showComparison ? 'Ver detalles' : 'Comparar escenarios'}
        </Button>
      </div>

      <div className="modo-selector">
        <button 
          className={`modo-btn ${modo === 'historico' ? 'active' : ''}`}
          onClick={() => setModo('historico')}
        >
          Basado en datos históricos
        </button>
        <button 
          className={`modo-btn ${modo === 'personalizado' ? 'active' : ''}`}
          onClick={() => setModo('personalizado')}
        >
          Crear desde cero
        </button>
      </div>

      {modo === 'historico' && periodoBase && (
        <Card variant="outlined" padding="md">
          <div className="periodo-selector">
            <h3>Período base</h3>
            <Select
              value={periodoBase}
              onChange={setPeriodoBase}
              options={[
                { label: '2025', value: '2025' },
                { label: '2024', value: '2024' },
                { label: '2023', value: '2023' },
              ]}
            />
            <p className="periodo-info">
              Los escenarios se compararán contra los datos del año {periodoBase}
            </p>
          </div>
        </Card>
      )}

      <div className="escenarios-grid">
        {escenarios.map((escenario) => {
          const isBase = escenario.id === 'base' || escenario.id === escenarios[0]?.id;
          return (
            <EscenarioCard
              key={escenario.id}
              escenario={escenario}
              escenarioBase={escenarioBase}
              isBase={isBase}
              onUpdate={actualizarEscenario}
              onDelete={eliminarEscenario}
              isDeleting={isSaving}
            />
          );
        })}

        <Card variant="outlined" padding="md" className="nuevo-escenario">
          <h3>Agregar nuevo escenario</h3>
          <Input
            label="Nombre del escenario"
            placeholder="Ej: Nueva propiedad en Tamarindo"
            value={nuevoEscenario.nombre}
            onChange={(e) => setNuevoEscenario({ ...nuevoEscenario, nombre: e.target.value })}
          />
          <Input
            label="Ingresos mensuales proyectados (₡)"
            type="number"
            placeholder="350000"
            value={nuevoEscenario.ingresos.toString()}
            onChange={(e) => setNuevoEscenario({ ...nuevoEscenario, ingresos: Number(e.target.value) })}
          />
          <Input
            label="Gastos mensuales estimados (₡)"
            type="number"
            placeholder="80000"
            value={nuevoEscenario.gastos.toString()}
            onChange={(e) => setNuevoEscenario({ ...nuevoEscenario, gastos: Number(e.target.value) })}
          />
          <Button variant="primary" onClick={agregarEscenario} loading={isSaving}>
            Agregar escenario
          </Button>
        </Card>
      </div>

      {showComparison && <ComparisonTable escenarios={escenarios} />}
    </div>
  );
};

export default Simulador;