/* ============================================
   PÁGINA: Autoliquidación de Sanciones
   Descripción: Cálculo de multas con reducción 80% Art. 88 (HU-011)
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { AlertTriangle, Info, FileText, TrendingDown } from 'lucide-react';
import './Autoliquidacion.css';

type TipoSancion = 'omision' | 'inscripcion';

const REDUCCION = 0.80;
const MULTA_BASE_OMISION = 100000;
const MULTA_BASE_INSCRIPCION = 50000;
const TASA_MORA_MENSUAL = 0.018; // 1.8% mensual

export const Autoliquidacion: React.FC = () => {
  const [tipo, setTipo] = useState<TipoSancion>('omision');

  // Omisión
  const [fechaOmision, setFechaOmision] = useState('');
  const [impuestoOmision, setImpuestoOmision] = useState('');

  // Inscripción tardía
  const [fechaInicioActividad, setFechaInicioActividad] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState('');

  // Mora
  const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split('T')[0]);

  const calcularMesesEntre = (desde: string, hasta: string): number => {
    if (!desde || !hasta) return 0;
    const d = new Date(desde);
    const h = new Date(hasta);
    return Math.max(0, (h.getFullYear() - d.getFullYear()) * 12 + (h.getMonth() - d.getMonth()));
  };

  const mesesOmision = calcularMesesEntre(fechaOmision, fechaCorte);
  const mesesInscripcion = calcularMesesEntre(fechaInicioActividad, fechaRegistro);

  const multaBase = tipo === 'omision' ? MULTA_BASE_OMISION : MULTA_BASE_INSCRIPCION;
  const reduccion = multaBase * REDUCCION;
  const multaFinal = multaBase - reduccion;

  const capitalOmision = Number(impuestoOmision) || 0;
  const interesesMora = capitalOmision * TASA_MORA_MENSUAL * mesesOmision;
  const totalAPagar = multaFinal + (tipo === 'omision' ? capitalOmision + interesesMora : 0);

  const sinDeuda = tipo === 'omision' && !impuestoOmision && !fechaOmision;

  return (
    <div className="autoliquidacion-page">
      <div className="page-header">
        <div>
          <h1>Autoliquidación de Sanciones</h1>
          <p>Calcula tu multa con reducción voluntaria del 80% — Art. 88 Código Tributario</p>
        </div>
      </div>

      {/* Selector tipo */}
      <div className="tipo-selector">
        <button
          className={`tipo-btn ${tipo === 'omision' ? 'active' : ''}`}
          onClick={() => setTipo('omision')}
        >
          <AlertTriangle size={18} />
          Omisión de declaración
        </button>
        <button
          className={`tipo-btn ${tipo === 'inscripcion' ? 'active' : ''}`}
          onClick={() => setTipo('inscripcion')}
        >
          <FileText size={18} />
          Inscripción tardía
        </button>
      </div>

      {sinDeuda && (
        <div className="banner-info">
          <Info size={16} />
          No hay deuda registrada para este período. Verifique los datos históricos.
          <a href="/impuestos" className="banner-link">Ir a datos históricos</a>
        </div>
      )}

      <div className="autoliq-grid">
        {/* Formulario */}
        <Card variant="outlined" padding="md">
          <h3>{tipo === 'omision' ? 'Datos de la omisión' : 'Datos de inscripción tardía'}</h3>

          {tipo === 'omision' && (
            <div className="form-fields">
              <Input
                label="Fecha de la omisión"
                type="date"
                value={fechaOmision}
                onChange={e => setFechaOmision(e.target.value)}
              />
              <Input
                label="Impuesto adeudado (₡)"
                type="number"
                placeholder="0"
                value={impuestoOmision}
                onChange={e => setImpuestoOmision(e.target.value)}
              />
              <Input
                label="Fecha de corte para intereses"
                type="date"
                value={fechaCorte}
                onChange={e => setFechaCorte(e.target.value)}
              />
            </div>
          )}

          {tipo === 'inscripcion' && (
            <div className="form-fields">
              <Input
                label="Fecha de inicio real de actividades"
                type="date"
                value={fechaInicioActividad}
                onChange={e => setFechaInicioActividad(e.target.value)}
              />
              <Input
                label="Fecha de registro en Hacienda"
                type="date"
                value={fechaRegistro}
                onChange={e => setFechaRegistro(e.target.value)}
              />
              {mesesInscripcion > 0 && (
                <div className="comparativa-fechas">
                  <span>Retraso en inscripción:</span>
                  <Badge variant="warning">{mesesInscripcion} meses</Badge>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Desglose del cálculo */}
        <Card variant="outlined" padding="md">
          <h3>Desglose del cálculo</h3>
          <div className="calculo-desglose">
            <div className="desglose-item">
              <span>Multa base (Art. {tipo === 'omision' ? '79' : '78'})</span>
              <span>₡{multaBase.toLocaleString()}</span>
            </div>
            <div className="desglose-item desglose-reduccion">
              <span className="reduccion-label">
                <TrendingDown size={16} />
                Reducción voluntaria 80%
              </span>
              <span className="reduccion-valor">-₡{reduccion.toLocaleString()}</span>
            </div>
            <div className="desglose-divider" />
            <div className="desglose-item desglose-subtotal">
              <span>Multa reducida</span>
              <span>₡{multaFinal.toLocaleString()}</span>
            </div>

            {tipo === 'omision' && capitalOmision > 0 && (
              <>
                <div className="desglose-item">
                  <span>Capital original adeudado</span>
                  <span>₡{capitalOmision.toLocaleString()}</span>
                </div>
                <div className="desglose-item">
                  <span>Intereses de mora ({mesesOmision} meses × 1.8%)</span>
                  <span>₡{Math.round(interesesMora).toLocaleString()}</span>
                </div>
                <div className="desglose-divider" />
              </>
            )}

            <div className="desglose-item desglose-total">
              <span>Total a pagar</span>
              <span>₡{Math.round(totalAPagar).toLocaleString()}</span>
            </div>
          </div>

          <div className="ahorro-badge">
            <Badge variant="success">Reducción voluntaria aplicada: -80%</Badge>
            <span className="ahorro-texto">Ahorro: ₡{reduccion.toLocaleString()} vs multa completa</span>
          </div>

          {tipo === 'inscripcion' && (
            <Button variant="primary" fullWidth>
              <FileText size={16} />
              Generar formulario D-176
            </Button>
          )}

          {tipo === 'omision' && capitalOmision > 0 && (
            <Button variant="primary" fullWidth>
              <FileText size={16} />
              Generar formulario D-104 con autoliquidación
            </Button>
          )}
        </Card>
      </div>

      {/* Nota legal */}
      <Card variant="outlined" padding="md">
        <div className="nota-legal">
          <Info size={16} />
          <p>
            La reducción del 80% aplica cuando el contribuyente se presenta voluntariamente antes de que
            la Administración Tributaria inicie actuaciones de control. Artículo 88 del Código de Normas
            y Procedimientos Tributarios de Costa Rica.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Autoliquidacion;
