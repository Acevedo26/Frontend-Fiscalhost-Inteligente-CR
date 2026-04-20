/* ============================================
   PÁGINA: Simulador de Escenarios
   Descripción: Simulador "¿Qué pasa si...?" (HU-018)
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { X, Download } from 'lucide-react';
import './Simulador.css';

interface Escenario {
  id: string;
  nombre: string;
  ingresos: number;
  gastos: number;
  activo: number;
}

const mockEscenarios: Escenario[] = [
  { id: 'base', nombre: 'Escenario Base', ingresos: 350000, gastos: 80000, activo: 0 },
  { id: '1', nombre: 'Aumento reservas 20%', ingresos: 420000, gastos: 85000, activo: 0 },
  { id: '2', nombre: 'Nueva propiedad', ingresos: 550000, gastos: 150000, activo: 25000000 },
];

export const Simulador: React.FC = () => {
  const [modo, setModo] = useState<'historico' | 'personalizado'>('historico');
  const [periodoBase, setPeriodoBase] = useState('2025');
  const [escenarios, setEscenarios] = useState<Escenario[]>(mockEscenarios);
  const [nuevoEscenario, setNuevoEscenario] = useState({ nombre: '', ingresos: 350000, gastos: 80000, activo: 0 });
  const [showComparison, setShowComparison] = useState(false);

  const calcularIVA = (ingresos: number, gastos: number) => {
    const base = Math.max(0, ingresos - gastos);
    return Math.round(base * 0.13);
  };

  const calcularRenta = (ingresos: number, gastos: number, activo: number) => {
    const base = Math.max(0, ingresos - gastos - activo);
    return Math.round(base * 0.1275);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { 
      style: 'currency', 
      currency: 'CRC',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const agregarEscenario = () => {
    if (!nuevoEscenario.nombre) return;
    setEscenarios([...escenarios, { 
      ...nuevoEscenario, 
      id: Date.now().toString() 
    }]);
    setNuevoEscenario({ nombre: '', ingresos: 350000, gastos: 80000, activo: 0 });
  };

  const eliminarEscenario = (id: string) => {
    if (id === 'base') return;
    setEscenarios(escenarios.filter(e => e.id !== id));
  };

  const escenarioBase = escenarios.find(e => e.id === 'base') || escenarios[0];

  const getDiferencia = (escenario: Escenario) => {
    const baseIVA = calcularIVA(escenarioBase.ingresos, escenarioBase.gastos);
    const baseRenta = calcularRenta(escenarioBase.ingresos, escenarioBase.gastos, escenarioBase.activo);
    const escIVA = calcularIVA(escenario.ingresos, escenario.gastos);
    const escRenta = calcularRenta(escenario.ingresos, escenario.gastos, escenario.activo);
    return {
      iva: escIVA - baseIVA,
      renta: escRenta - baseRenta,
    };
  };

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
          const diff = getDiferencia(escenario);
          const isBase = escenario.id === 'base' || escenario.id === escenarios[0]?.id;
          
          return (
            <Card key={escenario.id} variant={isBase ? 'elevated' : 'outlined'} padding="md">
              <div className="escenario-header">
                <h3>{escenario.nombre}</h3>
                {!isBase && (
                  <button 
                    className="eliminar-btn"
                    onClick={() => eliminarEscenario(escenario.id)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="escenario-inputs">
                <div className="input-group">
                  <label>Ingresos mensuales</label>
                  <Input
                    type="number"
                    value={escenario.ingresos}
                    onChange={(e) => {
                      const newIngresos = Number(e.target.value);
                      setEscenarios(escenarios.map(esc => 
                        esc.id === escenario.id ? { ...esc, ingresos: newIngresos } : esc
                      ));
                    }}
                    disabled={isBase}
                  />
                </div>
                <div className="input-group">
                  <label>Gastos deducibles</label>
                  <Input
                    type="number"
                    value={escenario.gastos}
                    onChange={(e) => {
                      const newGastos = Number(e.target.value);
                      setEscenarios(escenarios.map(esc => 
                        esc.id === escenario.id ? { ...esc, gastos: newGastos } : esc
                      ));
                    }}
                    disabled={isBase}
                  />
                </div>
                <div className="input-group">
                  <label>Compra de activo (opcional)</label>
                  <Input
                    type="number"
                    value={escenario.activo}
                    onChange={(e) => {
                      const newActivo = Number(e.target.value);
                      setEscenarios(escenarios.map(esc => 
                        esc.id === escenario.id ? { ...esc, activo: newActivo } : esc
                      ));
                    }}
                    disabled={isBase}
                  />
                </div>
              </div>

              <div className="escenario-resultados">
                <div className="resultado-item">
                  <span className="resultado-label">IVA proyectado</span>
                  <span className="resultado-value">
                    {formatCurrency(calcularIVA(escenario.ingresos, escenario.gastos))}
                  </span>
                </div>
                <div className="resultado-item">
                  <span className="resultado-label">Renta proyectada</span>
                  <span className="resultado-value">
                    {formatCurrency(calcularRenta(escenario.ingresos, escenario.gastos, escenario.activo))}
                  </span>
                </div>
                <div className="resultado-item resultado-neto">
                  <span className="resultado-label">Flujo neto</span>
                  <span className="resultado-value">
                    {formatCurrency(escenario.ingresos - escenario.gastos)}
                  </span>
                </div>
              </div>

              {!isBase && (
                <div className="escenario-diferencia">
                  <span>vs escenario base:</span>
                  <span className={diff.iva > 0 ? 'text-danger' : diff.iva < 0 ? 'text-success' : ''}>
                    {diff.iva > 0 ? '+' : ''}{formatCurrency(diff.iva)} IVA
                  </span>
                  <span className={diff.renta > 0 ? 'text-danger' : diff.renta < 0 ? 'text-success' : ''}>
                    {diff.renta > 0 ? '+' : ''}{formatCurrency(diff.renta)} Renta
                  </span>
                </div>
              )}
            </Card>
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
          <Button variant="primary" onClick={agregarEscenario} disabled={!nuevoEscenario.nombre}>
            Agregar escenario
          </Button>
        </Card>
      </div>

      {showComparison && (
        <Card variant="elevated" padding="lg">
          <h3>Comparación de escenarios</h3>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Escenario</th>
                  <th>Ingresos</th>
                  <th>Gastos</th>
                  <th>IVA</th>
                  <th>Renta</th>
                  <th> flujo neto</th>
                </tr>
              </thead>
              <tbody>
                {escenarios.map((escenario) => (
                  <tr key={escenario.id}>
                    <td>{escenario.nombre}</td>
                    <td>{formatCurrency(escenario.ingresos)}</td>
                    <td>{formatCurrency(escenario.gastos)}</td>
                    <td>{formatCurrency(calcularIVA(escenario.ingresos, escenario.gastos))}</td>
                    <td>{formatCurrency(calcularRenta(escenario.ingresos, escenario.gastos, escenario.activo))}</td>
                    <td className="neto">{formatCurrency(escenario.ingresos - escenario.gastos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="comparison-actions">
            <Button variant="outline">
              <Download size={18} />
              Exportar a PDF
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Simulador;