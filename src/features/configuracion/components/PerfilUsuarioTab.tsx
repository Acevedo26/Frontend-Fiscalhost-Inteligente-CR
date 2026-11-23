import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Loader2 } from 'lucide-react';
import { showWarning, showSuccess } from '../../../utils/alerts';
import { useActualizarPerfil } from '../hooks/useConfiguracion';

type TipoIdentificacion = 'FISICA' | 'JURIDICA' | 'DIMEX' | 'NITE';

interface PerfilUsuarioData {
  nombreCompleto: string;
  correoElectronico: string;
  tipoIdentificacion: TipoIdentificacion;
  numeroIdentificacion: string;
  razonSocial?: string;
}

export const PerfilUsuarioTab: React.FC<{ initialData?: PerfilUsuarioData }> = ({ initialData }) => {
  const [nombreCompleto, setNombreCompleto] = useState(initialData?.nombreCompleto || '');
  const [email] = useState(initialData?.correoElectronico || '');
  const [tipoIdentificacion, setTipoIdentificacion] = useState<TipoIdentificacion>(initialData?.tipoIdentificacion || 'FISICA');
  const [identificacion, setIdentificacion] = useState(initialData?.numeroIdentificacion || '');
  const [razonSocial, setRazonSocial] = useState(initialData?.razonSocial || '');
  const [isSaving, setIsSaving] = useState(false);

  const actualizarPerfilMutation = useActualizarPerfil();

  // Update local state when initialData changes (e.g., after successful save)
  useEffect(() => {
    if (initialData) {
      setNombreCompleto(initialData.nombreCompleto);
      setTipoIdentificacion(initialData.tipoIdentificacion);
      setIdentificacion(initialData.numeroIdentificacion);
      setRazonSocial(initialData.razonSocial || '');
    }
  }, [initialData]);

  const handleGuardar = async () => {
    if (!nombreCompleto || !nombreCompleto.trim()) {
      showWarning('Nombre Requerido', 'El nombre completo no puede estar vacío.');
      return;
    }

    if (!identificacion || !identificacion.trim()) {
      showWarning('Identificación Requerida', 'El número de identificación es obligatorio.');
      return;
    }

    if (tipoIdentificacion === 'JURIDICA' && (!razonSocial || !razonSocial.trim())) {
      showWarning('Razón Social Requerida', 'Para cédula jurídica, la razón social es obligatoria.');
      return;
    }

    setIsSaving(true);
    try {
      await actualizarPerfilMutation.mutateAsync({
        nombreCompleto: nombreCompleto.trim(),
        razonSocial: razonSocial.trim() || undefined,
        tipoIdentificacion,
        numeroIdentificacion: identificacion.trim(),
      });
      showSuccess('Perfil Actualizado', 'Los datos de tu perfil fueron actualizados correctamente.');
    } catch {
      // Error handled by global interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const isJuridica = tipoIdentificacion === 'JURIDICA';

  return (
    <Card variant="outlined" padding="md">
      <h3>Perfil de Usuario</h3>
      <p className="config-desc">Información personal y de identificación tributaria</p>

      <div className="config-form">
        <div className="form-row">
          <Input
            label="Nombre Completo"
            value={nombreCompleto}
            onChange={(e: any) => setNombreCompleto(e.target.value)}
            placeholder="Tu nombre completo"
          />
          <Input label="Email" type="email" value={email} disabled />
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
            onChange={(val) => setTipoIdentificacion(val as TipoIdentificacion)}
          />
          <Input
            label="Número de Identificación"
            value={identificacion}
            onChange={(e: any) => setIdentificacion(e.target.value)}
            placeholder={isJuridica ? 'Ej: 3-101-123456' : 'Ej: 1-1234-0567'}
          />
        </div>

        {isJuridica && (
          <div className="form-row">
            <Input
              label="Razón Social"
              value={razonSocial}
              onChange={(e: any) => setRazonSocial(e.target.value)}
              placeholder="Nombre comercial de la empresa"
            />
          </div>
        )}

        <div className="form-actions">
          <Button variant="primary" onClick={handleGuardar} disabled={isSaving || actualizarPerfilMutation.isPending}>
            {isSaving || actualizarPerfilMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </Card>
  );
};