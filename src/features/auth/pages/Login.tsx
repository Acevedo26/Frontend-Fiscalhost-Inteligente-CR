/* ============================================
   PÁGINA: Login
   Descripción: Autenticación de usuarios (HU-001)
   FiscalHost Inteligente CR — Serene Tax System
   ============================================ */

import { useState } from 'react';
import type { FC, FormEvent, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Card } from '../../../components/common/Card';
import { AlertCircle, Mail, Lock } from 'lucide-react';
import { showWarning, showInfo, showToast, extractErrorMessage } from '../../../utils/alerts';
import { AuthService } from '../services/AuthService';
import './Login.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Login: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();

    // 1. Validate both empty
    if (!trimmedEmail && !password) {
      const msg = 'Por favor ingrese su correo electrónico y contraseña.';
      setError(msg);
      await showWarning('Campos Incompletos', msg);
      return;
    }

    // 2. Validate email
    if (!trimmedEmail) {
      const msg = 'El correo electrónico es obligatorio para iniciar sesión.';
      setError(msg);
      await showWarning('Correo Requerido', msg);
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      const msg = 'El formato del correo electrónico no es válido. Ejemplo: usuario@dominio.com';
      setError(msg);
      await showWarning('Correo Inválido', msg);
      return;
    }

    // 3. Validate password
    if (!password) {
      const msg = 'La contraseña es obligatoria.';
      setError(msg);
      await showWarning('Contraseña Requerida', msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'La contraseña debe contener al menos 6 caracteres.';
      setError(msg);
      await showWarning('Contraseña Corta', msg);
      return;
    }

    // 4. Authenticate against Backend API
    setLoading(true);
    try {
      const data = await AuthService.login({
        correo: trimmedEmail,
        contrasena: password,
      });

      if (data && data.token) {
        localStorage.setItem('token', data.token);
        if (data.usuario) {
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }

        showToast('¡Inicio de sesión exitoso!', 'success');
        navigate('/');
      } else {
        throw new Error('No se recibió el token de autenticación del servidor.');
      }
    } catch (err: any) {
      const parsedError = extractErrorMessage(
        err?.response?.data,
        'Credenciales inválidas o error de conexión con el servidor.'
      );
      setError(parsedError);
      if (!err?.response) {
        await showWarning('Error de Autenticación', parsedError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await showInfo(
      'Autenticación Federada',
      'El inicio de sesión con Google Workspace está en proceso de certificación fiscal ante el Ministerio de Hacienda. Por favor, utilice su correo y contraseña.'
    );
  };

  const handleForgotPassword = async (e: MouseEvent) => {
    e.preventDefault();
    await showInfo(
      'Recuperación de Contraseña',
      'Para restablecer el acceso a su cuenta tributaria, comuníquese por los canales oficiales de la Administración Tributaria o con su contador asignado.'
    );
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
              <path d="M8 22V10l8 6-8 6z" fill="var(--color-background)" />
              <path d="M16 22V10l8 6-8 6z" fill="var(--color-accent)" />
            </svg>
          </div>
          <h1>Bienvenido a FiscalHost</h1>
          <p>Ingresa a tu cuenta para gestionar tus obligaciones fiscales</p>
        </div>

        <Card variant="outlined" padding="lg">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="social-login">
              <Button 
                type="button" 
                variant="secondary" 
                fullWidth 
                onClick={handleGoogleLogin}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
            </div>

            <div className="divider">
              <span>o</span>
            </div>

            {error && (
              <div className="login-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              leftIcon={<Lock size={16} />}
            />

            <div className="forgot-password">
              <a href="#olvidar" onClick={handleForgotPassword} className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Ingresar
            </Button>
          </form>

          <div className="login-footer">
            <p>¿No tienes cuenta?</p>
            <Link to="/register" className="register-link">Regístrate aquí</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;