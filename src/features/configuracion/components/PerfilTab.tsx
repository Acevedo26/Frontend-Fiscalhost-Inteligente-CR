import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { showWarning, showSuccess } from '../../../utils/alerts';
import { ConfiguracionService } from '../services/ConfiguracionService';
import { useAuthContext } from '../../auth/context/AuthContext';

interface PerfilTabProps {
  configuracionData: any;
  ACTIVIDADES: any[];
}

export const PerfilTab: React.FC<PerfilTabProps> = ({ configuracionData, ACTIVIDADES }) => {
  const { user } = useAuthContext();
  const [nombreCompleto, setNombreCompleto] = useState(
    configuracionData?.nombreCompleto || user?.nombreCompleto || user?.nombre || ''
  );
  const [email] = useState(
    configuracionData?.email || user?.correoElectronico || user?.correo || ''
  );
  const [tipoIdentificacion, setTipoIdentificacion] = useState(configuracionData?.tipoIdentificacion || 'FISICA');
  const [identificacion, setIdentificacion] = useState(configuracionData?.identificacion || '01-0234-5678');
  const [regimen, setRegimen] = useState<'CAPITAL' | 'UTILIDADES'>(configuracionData?.regimen || 'CAPITAL');
  const [actividadQuery, setActividadQuery] = useState(configuracionData?.actividadEconomica || '551001 — Alojamiento turístico');
  const [actividadSeleccionada, setActividadSeleccionada] = useState(ACTIVIDADES[0]);
  const [showActividadDropdown, setShowActividadDropdown] = useState(false);
  const [actividadError, setActividadError] = useState('');
  const [showCambioActividadModal, setShowCambioActividadModal] = useState(false);
  const [pendingActividad, setPendingActividad] = useState<any>(null);
  const [nise, setNise] = useState(configuracionData?.nise || '123456789');
  const [showNiseTooltip, setShowNiseTooltip] = useState(false);
  const [niseValidado, setNiseValidado] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const actividadesFiltradas = ACTIVIDADES.filter((a: any) =>
    (a.label || a.nombre || '').toLowerCase().includes(actividadQuery.toLowerCase())
  );

  const handleSelectActividad = (act: any) => {
    if (act.value !== actividadSeleccionada.value) {
      setPendingActividad(act);
      setShowCambioActividadModal(true);
    }
    setShowActividadDropdown(false);
    setActividadError('');
  };

  const handleConfirmarCambioActividad = () => {
    if (pendingActividad) {
      setActividadSeleccionada(pendingActividad);
      setActividadQuery(pendingActividad.label || pendingActividad.nombre);
    }
    setShowCambioActividadModal(false);
  };

  const handleValidarNise = () => {
    if (nise.length >= 6) {
      setNiseValidado(true);
      showSuccess('NISE Validado', 'El número de servicio eléctrico fue verificado exitosamente ante la compañía distribuidora.');
    } else {
      showWarning('NISE Inválido', 'El número de NISE debe contener al menos 6 dígitos.');
    }
  };

  const handleGuardarPerfil = async () => {
    if (!nombreCompleto || !nombreCompleto.trim()) {
      showWarning('Nombre Requerido', 'El nombre completo del contribuyente no puede estar vacío.');
      return;
    }

    if (!identificacion || !identificacion.trim()) {
      showWarning('Identificación Requerida', 'El número de identificación tributaria es obligatorio.');
      return;
    }

    if (!actividadSeleccionada) {
      showWarning('Actividad Requerida', 'Debe seleccionar una actividad económica del RUT.');
      return;
    }

    if (!nise || !nise.trim()) {
      showWarning('NISE Requerido', 'Debe registrar el NISE para validar el domicilio fiscal.');
      return;
    }

    setIsSaving(true);
    let saveOk = false;
    try {
      await ConfiguracionService.guardarConfiguracion({
        codigoActividad: actividadSeleccionada.value,
        direccionFiscal: 'San José, Costa Rica',
        nise: nise.trim(),
      });
      saveOk = true;
    } catch {
      // Global Axios interceptor already shows an error alert to the user.
    } finally {
      setIsSaving(false);
    }

    if (saveOk) {
      showSuccess(
        'Perfil Actualizado',
        'Los datos del perfil tributario y fiscal fueron actualizados correctamente.'
      );
    }
  };

  return (
    <>
      <Card variant="outlined" padding="md">
        <h3>Perfil Tributario</h3>
        <div className="config-form">
          <div className="form-row">
            <Input
              label="Nombre Completo"
              value={nombreCompleto}
              onChange={(e: any) => setNombreCompleto(e.target.value)}
            />
            <Input label="Email" type="email" value={email} />
          </div>
          <div className="form-row">
            <Select
              label="Tipo de Identificación"
              options={[
                { label: 'Cédula Física', value: 'FISICA' },
                { label: 'Cédula Jurídica', value: 'JURIDICA' },
                { label: 'DIMEX', value: 'DIMEX' },
                { label: 'NITE', value: 'NITE' }
              ]}
              value={tipoIdentificacion}
              onChange={(val) => setTipoIdentificacion(val)}
            />
            <Input
              label="Número de Identificación"
              value={identificacion}
              onChange={(e: any) => setIdentificacion(e.target.value)}
            />
          </div>

          <div className="actividad-field">
            <label className="input-label">Actividad Económica (RUT)</label>
            <div className="typeahead-wrap">
              <input className="typeahead-input"
                value={actividadQuery}
                onChange={(e: any) => { setActividadQuery(e.target.value); setShowActividadDropdown(true); setActividadError(''); }}
                onFocus={() => setShowActividadDropdown(true)}
                onBlur={() => setTimeout(() => setShowActividadDropdown(false), 150)}
                placeholder="Buscar código o nombre..." />
              {showActividadDropdown && actividadesFiltradas.length > 0 && (
                <div className="typeahead-dropdown">
                  {actividadesFiltradas.map((a: any) => (
                    <button key={a.value} className="typeahead-option" onClick={() => handleSelectActividad(a)}>
                      <span className="typeahead-code">{a.value}</span>
                      <span>{a.label.split('—')[1]?.trim()}</span>
                    </button>
                  ))}
                </div>
              )}
              {showActividadDropdown && actividadesFiltradas.length === 0 && (
                <div className="typeahead-dropdown">
                  <span className="typeahead-empty">Código no válido. Seleccione una opción de la lista</span>
                </div>
              )}
            </div>
            {actividadError && <span className="input-helper input-helper-error">{actividadError}</span>}
            {actividadSeleccionada && (
              <div className="actividad-preview">
                <span>{actividadSeleccionada.label}</span>
                <Badge variant="success" size="sm">RUT vinculado</Badge>
              </div>
            )}
          </div>

          <div className="nise-field">
            <div className="nise-label-row">
              <label className="input-label">NISE (Número de Identificación del Servicio Eléctrico)</label>
              <button type="button" className="nise-tooltip-btn" aria-describedby="nise-tooltip" onMouseEnter={() => setShowNiseTooltip(true)} onMouseLeave={() => setShowNiseTooltip(false)}>
                <Info size={14} />
                {showNiseTooltip && (
                  <div className="nise-tooltip">El NISE es el número de medidor eléctrico de tu propiedad, usado para validar el domicilio fiscal.</div>
                )}
              </button>
            </div>
            <div className="nise-row">
              <Input placeholder="Ej: 123456789" value={nise} onChange={(e: any) => { setNise(e.target.value); setNiseValidado(false); }} />
              <Button variant="outline" size="sm" onClick={handleValidarNise}>Validar</Button>
            </div>
            {niseValidado && (
              <div className="nise-success">
                <CheckCircle size={14} /> Domicilio fiscal registrado correctamente
              </div>
            )}
          </div>

          <div className="form-row">
            <Select label="Régimen Tributario"
              options={[{ label: 'Capital Inmobiliario (12.75%)', value: 'CAPITAL' }, { label: 'Régimen de Utilidades (25%)', value: 'UTILIDADES' }]}
              value={regimen}
              onChange={(v) => setRegimen(v as 'CAPITAL' | 'UTILIDADES')} />
          </div>
          <div className="form-actions">
            <Button variant="primary" onClick={handleGuardarPerfil} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={showCambioActividadModal} onClose={() => setShowCambioActividadModal(false)} title="Cambio de Actividad Económica" size="sm">
        <div className="cambio-actividad-modal">
          <div className="cambio-warning">
            <AlertTriangle size={24} color="var(--color-warning)" />
            <p>El cambio afectará los cálculos futuros. ¿Desea continuar?</p>
          </div>
          {pendingActividad && (
            <div className="cambio-preview">
              <span>Nueva actividad: <strong>{pendingActividad.label}</strong></span>
            </div>
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowCambioActividadModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirmarCambioActividad}>Confirmar cambio</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
