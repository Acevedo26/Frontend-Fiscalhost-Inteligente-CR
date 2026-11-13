/* ============================================
   PÁGINA: Autoliquidación de Sanciones
   Descripción: Cálculo de multas con reducción 80% Art. 88 (HU-011)
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Input } from '../../../components/common/Input';
import { AlertTriangle, Info, FileText, TrendingDown } from 'lucide-react';
import './Autoliquidacion.css';
import { useCalcularSancion } from '../hooks/useSancion';
import { showSuccess, showError, showWarning } from '../../../utils/alerts';


type TipoSancion = 'omision' | 'inscripcion';

const REDUCCION = 0.80;
const MULTA_BASE_OMISION = 100000;
const MULTA_BASE_INSCRIPCION = 50000;
const TASA_MORA_MENSUAL = 0.018; // 1.8% mensual

export const  Autoliquidacion: React.FC = () => {
  const [tipo, setTipo] = useState<TipoSancion>('omision');

  // Omisión
  const [fechaOmision, setFechaOmision] = useState('');
  const [impuestoOmision, setImpuestoOmision] = useState('');

  // Inscripción tardía
  const [fechaInicioActividad, setFechaInicioActividad] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState('');

  // Mora
  const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split('T')[0]);
  // Backend Sancion computation (optional, for validation later)
  const calcularSancionMutation = useCalcularSancion();

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

  const handleVerificarEnBackend = () => {
    if (tipo === 'omision') {
      if (!fechaOmision) {
        showWarning('Fecha Requerida', 'Debe ingresar la fecha de la omisión tributaria antes de verificar con el servidor.');
        return;
      }
      if (Number(impuestoOmision) <= 0) {
        showWarning('Monto Inválido', 'Debe especificar un impuesto adeudado mayor a cero antes de verificar con el servidor.');
        return;
      }
    } else {
      if (!fechaInicioActividad || !fechaRegistro) {
        showWarning('Fechas Requeridas', 'Debe completar tanto la fecha de inicio de actividades como la fecha de registro.');
        return;
      }
      if (new Date(fechaInicioActividad) > new Date(fechaRegistro)) {
        showWarning('Fechas Incoherentes', 'La fecha de inicio de actividades debe ser anterior a la fecha de registro en Hacienda.');
        return;
      }
    }

    const dummyGuid = '00000000-0000-0000-0000-000000000000';
    calcularSancionMutation.mutate(dummyGuid, {
      onSuccess: (data) =>
        showSuccess('Cálculo Oficial', `Cálculo de backend generado exitosamente: ${JSON.stringify(data)}`),
      onError: () =>
        showError('Error en Backend', 'No se encontró la obligación pendiente simulada.')
    });
  };

  const handleGenerarD176 = () => {
    if (!fechaInicioActividad) {
      showWarning('Fecha Requerida', 'Debe indicar la fecha real de inicio de actividades.');
      return;
    }
    if (!fechaRegistro) {
      showWarning('Fecha Requerida', 'Debe indicar la fecha de registro ante la Administración Tributaria.');
      return;
    }
    if (new Date(fechaInicioActividad) > new Date(fechaRegistro)) {
      showWarning('Fechas Inválidas', 'La fecha de inicio de actividades debe ser anterior o igual a la fecha de registro.');
      return;
    }
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaRegistro > hoy) {
      showWarning('Fecha Futura No Permitida', 'La fecha de registro no puede ser posterior a la fecha actual.');
      return;
    }

    const contenido = [
      `============================================================`,
      `MINISTERIO DE HACIENDA - DIRECCION GENERAL DE TRIBUTACION`,
      `FORMULARIO D-176: AUTOLIQUIDACION DE SANCIONES POR INSCRIPCION TARDIA`,
      `Fecha de emision: ${new Date().toLocaleDateString('es-CR')}`,
      `Fundamento legal: Articulo 78 y Articulo 88 del C.N.P.T.`,
      `============================================================`,
      `Fecha inicio real de actividades: ${fechaInicioActividad}`,
      `Fecha de registro efectivo: ${fechaRegistro}`,
      `Meses de retraso determinados: ${mesesInscripcion} mes(es)`,
      `Sancion base legal (Art. 78): CRC 50,000`,
      `Reduccion voluntaria aplicada (-80% Art. 88): -CRC 40,000`,
      `Monto final de sancion a pagar: CRC ${multaFinal.toLocaleString()}`,
      `============================================================`,
    ].join('\n');

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Formulario_D176_Autoliquidacion_${fechaRegistro}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess(
      'Formulario D-176 Generado',
      `El formulario D-176 por sanción de inscripción tardía se ha generado con el 80% de reducción voluntaria (Art. 88 CNPT). Multa a liquidar: ₡${multaFinal.toLocaleString()}.`
    );
  };

  const handleGenerarD104Autoliquidacion = () => {
    if (!fechaOmision) {
      showWarning('Fecha Requerida', 'Debe indicar la fecha de omisión de la declaración D-104.');
      return;
    }
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaOmision > hoy) {
      showWarning('Fecha Futura No Permitida', 'La fecha de la omisión tributaria no puede ser una fecha futura.');
      return;
    }
    if (fechaCorte < fechaOmision) {
      showWarning('Fechas Inválidas', 'La fecha de corte no puede ser anterior a la fecha de la omisión.');
      return;
    }
    if (!impuestoOmision || Number(impuestoOmision) <= 0) {
      showWarning('Impuesto Requerido', 'Debe ingresar un monto de impuesto adeudado mayor a cero.');
      return;
    }

    const contenido = [
      `============================================================`,
      `MINISTERIO DE HACIENDA - DIRECCION GENERAL DE TRIBUTACION`,
      `FORMULARIO D-104 CON AUTOLIQUIDACION DE SANCIONES E INTERESES`,
      `Fecha de emision: ${new Date().toLocaleDateString('es-CR')}`,
      `Periodo omitido: ${fechaOmision}`,
      `Fecha de corte de intereses: ${fechaCorte}`,
      `============================================================`,
      `Impuesto principal omitido: CRC ${capitalOmision.toLocaleString()}`,
      `Tiempo transcurrido: ${mesesOmision} mes(es)`,
      `Intereses de mora acumulados (1.8% mensual): CRC ${Math.round(interesesMora).toLocaleString()}`,
      `Multa por omision base (Art. 79): CRC ${MULTA_BASE_OMISION.toLocaleString()}`,
      `Reduccion voluntaria (-80% Art. 88): -CRC ${reduccion.toLocaleString()}`,
      `Multa reducida aplicable: CRC ${multaFinal.toLocaleString()}`,
      `------------------------------------------------------------`,
      `TOTAL A PAGAR (Principal + Intereses + Sancion): CRC ${Math.round(totalAPagar).toLocaleString()}`,
      `============================================================`,
    ].join('\n');

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Formulario_D104_Autoliquidacion_${fechaOmision}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess(
      'Formulario D-104 Generado',
      `Formulario D-104 con autoliquidación generado con éxito. Total a pagar (incluyendo reducción Art. 88): ₡${Math.round(totalAPagar).toLocaleString()}.`
    );
  };


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
          <h3>Desglose del cálculo (Simulación)</h3>
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

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <Button variant="outline" fullWidth onClick={handleVerificarEnBackend} disabled={calcularSancionMutation.isPending}>
              {calcularSancionMutation.isPending ? 'Verificando...' : 'Verificar cálculo oficial en Backend'}
            </Button>

            {tipo === 'inscripcion' && (
              <Button variant="primary" fullWidth onClick={handleGenerarD176}>
                <FileText size={16} />
                Generar formulario D-176
              </Button>
            )}

            {tipo === 'omision' && (
              <Button variant="primary" fullWidth onClick={handleGenerarD104Autoliquidacion}>
                <FileText size={16} />
                Generar formulario D-104 con autoliquidación
              </Button>
            )}
          </div>
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
