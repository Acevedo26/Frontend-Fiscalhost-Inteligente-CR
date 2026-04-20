/* ============================================
   PÁGINA: Registro
   Descripción: Registro multiformato (HU-001)
   Flujo paso a paso con progressive disclosure
   ============================================ */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { ArrowLeft, Check, CheckCircle, User, Building2, Globe, Plane, Mail, Lock } from 'lucide-react';
import './Registro.css';

type TipoIdentificacion = 'FISICA' | 'JURIDICA' | 'DIMEX' | 'NITE';

export const Registro: React.FC = () => {
  const [step, setStep] = useState(1);
  const [tipoIdentificacion, setTipoIdentificacion] = useState<TipoIdentificacion>('FISICA');
  const [formData, setFormData] = useState({
    identificacion: '',
    email: '',
    password: '',
    confirmarPassword: '',
    nombre: '',
    apellido: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getIdentificacionMask = (tipo: TipoIdentificacion) => {
    switch (tipo) {
      case 'FISICA': return { placeholder: '1-2345-6789', maxLength: 12, regex: /^\d-\d{4}-\d{4}$/ };
      case 'JURIDICA': return { placeholder: '3-101-123456', maxLength: 14, regex: /^\d-\d{3}-\d{6}$/ };
      case 'DIMEX': return { placeholder: '12345678901', maxLength: 11, regex: /^\d{11}$/ };
      case 'NITE': return { placeholder: 'P123456789', maxLength: 9, regex: /^P\d{8}$/ };
      default: return { placeholder: '', maxLength: 20, regex: /./ };
    }
  };

  const mask = getIdentificacionMask(tipoIdentificacion);

  const formatIdentificacion = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (tipoIdentificacion === 'FISICA') {
      if (digits.length > 0) return digits.slice(0, 1) + (digits.length > 1 ? '-' + digits.slice(1, 5) : '') + (digits.length > 5 ? '-' + digits.slice(5, 9) : '');
    } else if (tipoIdentificacion === 'JURIDICA') {
      if (digits.length > 0) return digits.slice(0, 1) + (digits.length > 1 ? '-' + digits.slice(1, 4) : '') + (digits.length > 4 ? '-' + digits.slice(4, 10) : '');
    }
    return digits;
  };

  const handleIdentificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIdentificacion(e.target.value);
    setFormData({ ...formData, identificacion: formatted });
    if (errors.identificacion) setErrors({ ...errors, identificacion: '' });
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
    return { strength, label: labels[strength] };
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.identificacion || !mask.regex.test(formData.identificacion)) {
        newErrors.identificacion = `Formato inválido. Ejemplo: ${mask.placeholder}`;
      }
    } else if (step === 2) {
      if (!formData.email) newErrors.email = 'Correo requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Correo inválido';
      
      const passError = validatePassword(formData.password);
      if (passError) newErrors.password = passError;
      
      if (formData.password !== formData.confirmarPassword) {
        newErrors.confirmarPassword = 'Las contraseñas no coinciden';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 1500);
  };

  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength();

  if (showSuccess) {
    return (
      <div className="registro-page">
        <Card variant="elevated" padding="lg" className="success-card">
          <div className="success-icon">
            <CheckCircle size={64} color="var(--color-success)" strokeWidth={1.5} />
          </div>
          <h2>¡Registro exitoso!</h2>
          <p>Hemos enviado un enlace de activación a <strong>{formData.email}</strong></p>
          <p className="success-note">Revisa tu correo y haz clic en el enlace para activar tu cuenta.</p>
          <Button variant="primary" onClick={() => navigate('/')}>Ir al Dashboard</Button>
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
          <p>Completa los datos solicitados</p>
        </div>

        <div className="stepper">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step ${s <= step ? 'step-active' : ''} ${s < step ? 'step-complete' : ''}`}>
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
                    onClick={() => setTipoIdentificacion(type.value as TipoIdentificacion)}
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

              <p className="input-hint">Formato: {mask.placeholder}</p>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>Datos de cuenta</h3>
              
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                error={errors.email}
                leftIcon={<Mail size={16} />}
              />

              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                error={errors.password}
                leftIcon={<Lock size={16} />}
              />
              
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className={`strength-fill strength-${passwordStrength.strength}`} style={{ width: `${passwordStrength.strength * 25}%` }} />
                  </div>
                  <span className={`strength-label strength-${passwordStrength.strength}`}>{passwordStrength.label}</span>
                </div>
              )}

              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="••••••••"
                value={formData.confirmarPassword}
                onChange={(e) => { setFormData({ ...formData, confirmarPassword: e.target.value }); setErrors({ ...errors, confirmarPassword: '' }); }}
                error={errors.confirmarPassword}
              />
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Verificar correo</h3>
              <p className="verify-message">
                Te enviaremos un enlace de activación a <strong>{formData.email}</strong>
              </p>
              <div className="verify-summary">
                <div className="summary-item">
                  <span className="summary-label">Identificación</span>
                  <span className="summary-value">{formData.identificacion}</span>
                </div>
              </div>
            </div>
          )}

          <div className="step-actions">
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
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