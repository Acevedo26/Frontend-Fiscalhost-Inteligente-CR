/* ============================================
   PÁGINA: Recuperación de Contraseña
   Descripción: Solicitud de restablecimiento por correo (HU-001)
   FiscalHost Inteligente CR — Serene Tax System
   ============================================ */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { Mail, ArrowLeft } from 'lucide-react';
import { showWarning, showSuccess, showError, extractErrorMessage } from '../../../utils/alerts';
import { AuthService } from '../services/AuthService';
import './ForgotPassword.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = correo.trim();

    if (!trimmed) {
      await showWarning('Correo Requerido', 'Debe ingresar su correo electrónico.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      await showWarning('Correo Inválido', 'El formato del correo electrónico no es válido. Ejemplo: usuario@dominio.com');
      return;
    }

    setLoading(true);
    try {
      await AuthService.forgotPassword({ correo: trimmed });
      await showSuccess(
        'Correo Enviado',
        `Se ha enviado un enlace de restablecimiento de contraseña a ${trimmed}. Revise su bandeja de entrada.`
      );
      navigate('/login');
    } catch (err: any) {
      const parsedError = extractErrorMessage(
        err?.response?.data,
        'No se pudo procesar la solicitud de restablecimiento. Intente nuevamente.'
      );
      await showError('Error de Recuperación', parsedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-container">
        <div className="forgot-header">
          <button type="button" className="back-link" onClick={() => navigate('/login')}>
            <ArrowLeft size={18} /> Volver al inicio de sesión
          </button>
          <h1>Restablecer Contraseña</h1>
          <p>Ingresa el correo electrónico asociado a tu cuenta fiscal.</p>
        </div>

        <Card variant="outlined" padding="lg">
          <form onSubmit={handleSubmit} className="forgot-form">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              leftIcon={<Mail size={16} />}
            />

            <div className="forgot-actions">
              <Button type="button" variant="secondary" onClick={() => navigate('/login')}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Enviar enlace de restablecimiento
              </Button>
            </div>
          </form>
        </Card>

        <div className="forgot-footer">
          <p>¿Recuerdas tu contraseña?</p>
          <Link to="/login" className="login-link">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
