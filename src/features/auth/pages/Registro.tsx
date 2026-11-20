/* ============================================
   PÁGINA: Registro
   Descripción: Registro multiformato (HU-001)
   Flujo paso a paso con progressive disclosure y validaciones fiscales
   FiscalHost Inteligente CR
   ============================================ */

import { useState } from 'react';
import type { FC, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  User,
  Building2,
  Globe,
  Plane,
  Mail,
  Lock,
} from 'lucide-react';
import { showWarning, showSuccess as showAlertSuccess, showError } from '../../../utils/alerts';
import { AuthService } from '../services/AuthService';
import './Registro.css';

type TipoIdentificacion = 'FISICA' | 'JURIDICA' | 'DIMEX' | 'NITE';

export const Registro: FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tipoIdentificacion, setTipoIdentificacion] = useState<TipoIdentificacion>('FISICA');
  const [formData, setFormData] = useState({
    identificacion: '',
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getIdentificacionMask = (tipo: TipoIdentificacion) => {
    switch (tipo) {
      case 'FISICA':
        return { placeholder: '1-2345-6789', maxLength: 11, expectedDigits: 9, label: 'Persona Física Nacional' };
      case 'JURIDICA':
        return { placeholder: '3-101-123456', maxLength: 12, expectedDigits: 10, label: 'Persona Jurídica' };
      case 'DIMEX':
        return { placeholder: '12345678901', maxLength: 12, expectedDigits: 11, label: 'Extranjero Residente' };
      case 'NITE':
        return { placeholder: '1234567890', maxLength: 10, expectedDigits: 10, label: 'Extranjero No Residente' };
      default:
        return { placeholder: '', maxLength: 20, expectedDigits: 9, label: 'Identificación' };
    }
  };

  const mask = getIdentificacionMask(tipoIdentificacion);

  const formatIdentificacion = (value: string, tipo: TipoIdentificacion) => {
    const digits = value.replace(/\D/g, '');
    if (tipo === 'FISICA') {
      if (digits.length === 0) return '';
      let res = digits.slice(0, 1);
      if (digits.length > 1) res += '-' + digits.slice(1, 5);
      if (digits.length > 5) res += '-' + digits.slice(5, 9);
      return res;
    } else if (tipo === 'JURIDICA') {
      if (digits.length === 0) return '';
      let res = digits.slice(0, 1);
      if (digits.length > 1) res += '-' + digits.slice(1, 4);
      if (digits.length > 4) res += '-' + digits.slice(4, 10);
      return res;
    }
    return digits;
  };

  const handleTipoIdentificacionChange = (tipo: TipoIdentificacion) => {
    setTipoIdentificacion(tipo);
    const reformatted = formatIdentificacion(formData.identificacion, tipo);
    setFormData({ ...formData, identificacion: reformatted });
    if (errors.identificacion) {
      setErrors({ ...errors, identificacion: '' });
    }
  };

  const handleIdentificacionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIdentificacion(e.target.value, tipoIdentificacion);
    setFormData({ ...formData, identificacion: formatted });
    if (errors.identificacion) {
      setErrors({ ...errors, identificacion: '' });
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Debe tener al menos una mayúscula';
    if (!/[0-9]/.test(password)) return 'Debe tener al menos un número';
    return '';
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { strength: 0, label: '' };
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^a-zA-Z0-9]/.test(p)) strength++;

    const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    return { strength, label: labels[strength] || 'Fuerte' };
  };

  const handleNext = async () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const trimmedId = formData.identificacion.trim();
      const digits = trimmedId.replace(/\D/g, '');

      if (!trimmedId) {
        const msg = 'Por favor ingrese su número de identificación tributaria.';
        newErrors.identificacion = msg;
        setErrors(newErrors);
        await showWarning('Identificación Requerida', msg);
        return;
      }

      if (tipoIdentificacion === 'FISICA' && digits.length !== 9) {
        const msg = 'La cédula física nacional debe tener exactamente 9 dígitos. Ejemplo: 1-2345-6789';
        newErrors.identificacion = msg;
        setErrors(newErrors);
        await showWarning('Cédula Física Inválida', msg);
        return;
      }

      if (tipoIdentificacion === 'JURIDICA' && digits.length !== 10) {
        const msg = 'La cédula jurídica debe tener exactamente 10 dígitos. Ejemplo: 3-101-123456';
        newErrors.identificacion = msg;
        setErrors(newErrors);
        await showWarning('Cédula Jurídica Inválida', msg);
        return;
      }

      if (tipoIdentificacion === 'DIMEX' && (digits.length < 11 || digits.length > 12)) {
        const msg = 'El documento DIMEX debe tener 11 o 12 dígitos.';
        newErrors.identificacion = msg;
        setErrors(newErrors);
        await showWarning('DIMEX Inválido', msg);
        return;
      }

      if (tipoIdentificacion === 'NITE' && digits.length !== 10) {
        const msg = 'El documento NITE debe tener exactamente 10 dígitos.';
        newErrors.identificacion = msg;
        setErrors(newErrors);
        await showWarning('NITE Inválido', msg);
        return;
      }

      setErrors({});
      setStep(2);
      return;
    }

    if (step === 2) {
      const trimmedNombre = formData.nombre.trim();
      const trimmedEmail = formData.email.trim();

      // Validate Nombre Completo
      if (!trimmedNombre) {
        const msg = 'El nombre completo o razón social es obligatorio.';
        newErrors.nombre = msg;
        setErrors(newErrors);
        await showWarning('Nombre Requerido', msg);
        return;
      }

      if (trimmedNombre.length < 3) {
        const msg = 'El nombre completo debe tener al menos 3 caracteres.';
        newErrors.nombre = msg;
        setErrors(newErrors);
        await showWarning('Nombre Inválido', msg);
        return;
      }

      // Validate Email
      if (!trimmedEmail) {
        const msg = 'El correo electrónico es obligatorio.';
        newErrors.email = msg;
        setErrors(newErrors);
        await showWarning('Correo Requerido', msg);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        const msg = 'El formato de correo no es válido. Ejemplo: contribuyente@correo.com';
        newErrors.email = msg;
        setErrors(newErrors);
        await showWarning('Correo Inválido', msg);
        return;
      }

      // Validate Password
      if (!formData.password) {
        const msg = 'La contraseña es obligatoria.';
        newErrors.password = msg;
        setErrors(newErrors);
        await showWarning('Contraseña Requerida', msg);
        return;
      }

      const passError = validatePassword(formData.password);
      if (passError) {
        newErrors.password = passError;
        setErrors(newErrors);
        await showWarning('Contraseña Insegura', passError);
        return;
      }

      // Validate Password Confirmation
      if (formData.password !== formData.confirmarPassword) {
        const msg = 'Las contraseñas no coinciden. Por favor verifique.';
        newErrors.confirmarPassword = msg;
        setErrors(newErrors);
        await showWarning('Contraseñas No Coinciden', msg);
        return;
      }

      setErrors({});
      setStep(3);
      return;
    }

    if (step === 3) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const rawId = formData.identificacion.replace(/\D/g, '') || formData.identificacion;
      await AuthService.register({
        nombreCompleto: formData.nombre.trim(),
        nombre: formData.nombre.trim(),
        correoElectronico: formData.email.trim(),
        correo: formData.email.trim(),
        contrasena: formData.password,
        clave: formData.password,
        numeroIdentificacion: rawId,
        identificacion: rawId,
        tipoIdentificacion: tipoIdentificacion,
      });

      await showAlertSuccess(
        '¡Registro Exitoso!',
        'Su cuenta tributaria ha sido creada exitosamente. Inicie sesión para comenzar a gestionar sus obligaciones.'
      );
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      if (!err?.response) {
        await showError(
          'Error de Conexión',
          err?.message || 'No fue posible registrar la cuenta. Verifique el estado del servidor.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  if (showSuccess) {
    return (
      <div className="registro-page">
        <Card variant="elevated" padding="lg" className="success-card">
          <div className="success-icon">
            <CheckCircle size={64} color="var(--color-success)" strokeWidth={1.5} />
          </div>
          <h2>¡Registro exitoso!</h2>
          <p>Se ha registrado la cuenta para <strong>{formData.nombre}</strong></p>
          <p>Identificación: <strong>{formData.identificacion}</strong></p>
          <p>Correo electrónico: <strong>{formData.email}</strong></p>
          <p className="success-note">Su cuenta tributaria se encuentra lista para su uso en FiscalHost.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <Button variant="primary" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="registro-page">
      <div className="registro-container">
        <div className="registro-header">
          <Link to="/login" className="back-link">
            <ArrowLeft size={18} />
            Volver
          </Link>
          <h1>Crear tu cuenta</h1>
          <p>Completa los datos solicitados para tu perfil tributario</p>
        </div>

        <div className="stepper">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`step ${s <= step ? 'step-active' : ''} ${s < step ? 'step-complete' : ''}`}
            >
              <div className="step-circle">
                {s < step ? <Check size={16} strokeWidth={3} /> : s}
              </div>
              <span>{s === 1 ? 'Identidad' : s === 2 ? 'Cuenta' : 'Verificar'}</span>
            </div>
          ))}
        </div>

        <Card variant="outlined" padding="lg">
          {step === 1 && (
            <div className="step-content">
              <h3>Tipo de identificación</h3>
              <div className="identity-types">
                {[
                  { value: 'FISICA', label: 'Persona Física Nacional', icon: <User size={20} /> },
                  { value: 'JURIDICA', label: 'Persona Jurídica', icon: <Building2 size={20} /> },
                  { value: 'DIMEX', label: 'Extranjero Residente', icon: <Globe size={20} /> },
                  { value: 'NITE', label: 'Extranjero No Residente', icon: <Plane size={20} /> },
                ].map((type) => (
                  <button
                    key={type.value}
                    className={`identity-chip ${tipoIdentificacion === type.value ? 'active' : ''}`}
                    onClick={() => handleTipoIdentificacionChange(type.value as TipoIdentificacion)}
                    type="button"
                  >
                    <span className="chip-icon">{type.icon}</span>
                    <span className="chip-label">{type.label}</span>
                  </button>
                ))}
              </div>

              <Input
                label={`Número de ${tipoIdentificacion === 'FISICA' ? 'Cédula' : tipoIdentificacion === 'JURIDICA' ? 'Cédula Jurídica' : tipoIdentificacion === 'DIMEX' ? 'DIMEX' : 'NITE'}`}
                placeholder={mask.placeholder}
                value={formData.identificacion}
                onChange={handleIdentificacionChange}
                error={errors.identificacion}
                maxLength={mask.maxLength}
              />

              <p className="input-hint">Formato esperado: {mask.placeholder} ({mask.expectedDigits} dígitos)</p>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>Datos de cuenta</h3>

              <Input
                label="Nombre Completo o Razón Social"
                type="text"
                placeholder="Ej. Juan Pérez Soto / Soluciones CR S.A."
                value={formData.nombre}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value });
                  if (errors.nombre) setErrors({ ...errors, nombre: '' });
                }}
                error={errors.nombre}
                leftIcon={<User size={16} />}
              />
              
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
                leftIcon={<Mail size={16} />}
              />

              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                error={errors.password}
                leftIcon={<Lock size={16} />}
              />
              
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className={`strength-fill strength-${passwordStrength.strength}`}
                      style={{ width: `${passwordStrength.strength * 25}%` }}
                    />
                  </div>
                  <span className={`strength-label strength-${passwordStrength.strength}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}

              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="••••••••"
                value={formData.confirmarPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmarPassword: e.target.value });
                  if (errors.confirmarPassword) setErrors({ ...errors, confirmarPassword: '' });
                }}
                error={errors.confirmarPassword}
                leftIcon={<Lock size={16} />}
              />
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Confirmación de Datos</h3>
              <p className="verify-message">
                Verifique que la información tributaria ingresada sea correcta antes de registrarse.
              </p>
              <div className="verify-summary">
                <div className="summary-item">
                  <span className="summary-label">Tipo de Contribuyente</span>
                  <span className="summary-value">{mask.label}</span>
                </div>
                <div className="summary-item" style={{ marginTop: '0.5rem' }}>
                  <span className="summary-label">Número de Identificación</span>
                  <span className="summary-value">{formData.identificacion}</span>
                </div>
                <div className="summary-item" style={{ marginTop: '0.5rem' }}>
                  <span className="summary-label">Nombre / Razón Social</span>
                  <span className="summary-value">{formData.nombre}</span>
                </div>
                <div className="summary-item" style={{ marginTop: '0.5rem' }}>
                  <span className="summary-label">Correo Electrónico</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
              </div>
            </div>
          )}

          <div className="step-actions">
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={loading}>
                Atrás
              </Button>
            )}
            <Button variant="primary" onClick={handleNext} loading={loading}>
              {step === 3 ? 'Registrarse' : 'Continuar'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Registro;