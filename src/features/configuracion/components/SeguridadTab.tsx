import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Badge } from '../../../components/common/Badge';
import { Shield, Upload, X, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { showConfirm, showSuccess, showWarning, showToast } from '../../../utils/alerts';
import { LlaveCriptograficaService } from '../services/ConfiguracionService';

const getPasswordStrength = (p: string) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  return s;
};

export const SeguridadTab: React.FC = () => {
  const navigate = useNavigate();
  const [p12State, setP12State] = useState<'idle' | 'progress' | 'done' | 'error-format' | 'error-pass'>('idle');
  const [p12Progress, setP12Progress] = useState(0);
  const [p12Pass, setP12Pass] = useState('');
  const [showP12Pass, setShowP12Pass] = useState(false);
  const [p12Archivo, setP12Archivo] = useState<string | null>(null);
  const [p12FileObj, setP12FileObj] = useState<File | null>(null);
  const [llaves, setLlaves] = useState<{ nombre: string; fecha: string; estado: string }[]>([]);
  const p12Ref = useRef<HTMLInputElement>(null);

  const handleP12File = (file: File) => {
    if (!file.name.endsWith('.p12')) {
      setP12State('error-format');
      showWarning('Formato Inválido', 'Solo se admiten certificados criptográficos con formato .p12.');
      return;
    }
    setP12Archivo(file.name);
    setP12FileObj(file);
    setP12State('idle');
  };

  const handleSubirP12 = async () => {
    if (!p12Archivo) {
      showWarning('Archivo Faltante', 'Debe seleccionar un archivo .p12 para continuar.');
      return;
    }
    if (!p12Pass) {
      setP12State('error-pass');
      showWarning('Contraseña Requerida', 'Debe indicar la contraseña del certificado criptográfico.');
      return;
    }

    setP12State('progress');
    setP12Progress(30);

    const formData = new FormData();
    if (p12FileObj) {
      formData.append('archivo', p12FileObj);
    }
    formData.append('contrasena', p12Pass);

    try {
      await LlaveCriptograficaService.subirP12(formData);
      setP12Progress(100);
      setP12State('done');
      setLlaves([{ nombre: p12Archivo, fecha: new Date().toLocaleDateString('es-CR'), estado: 'Activa' }]);
      showSuccess(
        'Llave Criptográfica Configurada',
        'El certificado criptográfico ha sido validado y almacenado correctamente para la emisión de comprobantes.'
      );
    } catch {
      // Global error handler already shows an error alert.
      setP12State('error-format');
    }
  };

  const handleLogout = async () => {
    const confirm = await showConfirm(
      '¿Cerrar sesión?',
      'Saldrás de tu cuenta activa en FiscalHost Inteligente CR.',
      'Cerrar Sesión',
      'Cancelar'
    );
    if (!confirm.isConfirmed) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Sesión cerrada exitosamente', 'info');
    navigate('/login');
  };


  const p12PassStrength = getPasswordStrength(p12Pass);
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const strengthColors = ['', 'var(--color-danger)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-success)'];

  return (
    <Card variant="outlined" padding="md">
      <h3>Seguridad</h3>
      <div className="security-options">
        <div className="security-item">
          <div className="security-info">
            <span className="security-label">Cambiar Contraseña</span>
            <span className="security-desc">Último cambio: 15 de abril 2026</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => showSuccess('Cambio de Contraseña', 'Se ha enviado un enlace seguro a tu correo electrónico para actualizar tu contraseña.')}>Cambiar</Button>
        </div>

        <div className="security-item">
          <div className="security-info">
            <span className="security-label">Llave Criptográfica (.p12)</span>
            <span className="security-desc">Certificado para firma de comprobantes electrónicos</span>
          </div>
          <Badge variant={llaves.length > 0 ? 'success' : 'default'} size="sm">
            {llaves.length > 0 ? 'Configurada' : 'No configurada'}
          </Badge>
        </div>

        {llaves.length > 0 && (
          <div className="llaves-list">
            {llaves.map((l, i) => (
              <div key={i} className="llave-item">
                <Shield size={16} color="var(--color-success)" />
                <span className="llave-nombre">{l.nombre}</span>
                <span className="llave-fecha">{l.fecha}</span>
                <Badge variant="success" size="sm">{l.estado}</Badge>
              </div>
            ))}
          </div>
        )}

        <div className="security-upload">
          <div className={`upload-zone ${p12State === 'error-format' ? 'upload-zone-error' : ''}`}
            onClick={() => p12Ref.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleP12File(f); }}>
            <Upload size={40} strokeWidth={1.5} color="var(--color-text-muted)" />
            <p>{p12Archivo ? p12Archivo : 'Arrastra tu archivo .p12 aquí o haz clic para seleccionar'}</p>
            <span>Solo archivos .p12</span>
            <input ref={p12Ref} type="file" accept=".p12" hidden
              onChange={(e: any) => { if (e.target.files?.[0]) handleP12File(e.target.files[0]); }} />
          </div>

          {p12State === 'error-format' && (
            <div className="p12-error"><X size={14} /> Formato no soportado. Debe subir un archivo .p12</div>
          )}

          {p12Archivo && p12State !== 'error-format' && (
            <div className="p12-pass-section">
              <div className="pass-field-wrap">
                <Input label="Contraseña del certificado"
                  type={showP12Pass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={p12Pass}
                  onChange={(e: any) => { setP12Pass(e.target.value); setP12State('idle'); }}
                  error={p12State === 'error-pass' ? 'Contraseña inválida. Verifique sus credenciales' : ''}
                  rightIcon={
                    <button type="button" onClick={() => setShowP12Pass(!showP12Pass)} className="pass-toggle">
                      {showP12Pass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  } />
                {p12Pass && (
                  <div className="strength-bar-wrap">
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${p12PassStrength * 25}%`, backgroundColor: strengthColors[p12PassStrength] }} />
                    </div>
                    <span style={{ color: strengthColors[p12PassStrength], fontSize: 'var(--text-xs)' }}>{strengthLabels[p12PassStrength]}</span>
                  </div>
                )}
              </div>

              {p12State === 'progress' && (
                <div className="p12-progress">
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${p12Progress}%` }} /></div>
                  <span>Validando certificado… {p12Progress}%</span>
                </div>
              )}

              {p12State === 'done' && (
                <div className="p12-success"><CheckCircle size={14} /> Llave criptográfica almacenada correctamente</div>
              )}

              {p12State !== 'done' && (
                <Button variant="primary" size="sm" onClick={handleSubirP12} disabled={!p12Pass || p12State === 'progress'}>
                  Subir y validar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="form-actions">
        <Button variant="danger" size="sm" onClick={handleLogout}>Cerrar Sesión</Button>
      </div>
    </Card>
  );
};
