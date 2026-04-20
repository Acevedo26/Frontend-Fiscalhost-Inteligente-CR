/* ============================================
   PÁGINA: Login
   Descripción: Autenticación de usuarios (HU-001)
   ============================================ */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { AlertCircle, Mail, Lock } from 'lucide-react';
import './Login.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleGoogleLogin = () => {
    navigate('/');
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
                {error}
              </div>
            )}

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
            />

            <div className="forgot-password">
              <Link to="/olvidar-contrasena">¿Olvidaste tu contraseña?</Link>
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