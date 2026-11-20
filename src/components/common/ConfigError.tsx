import React from 'react';

interface ConfigErrorProps {
  error: Error | unknown;
  onRetry?: () => void;
}

/**
 * Componente mostrado cuando la aplicación no puede inicializarse por
 * falta de configuración (por ejemplo, VITE_API_URL no definida).
 * Evita la pantalla en blanco y brinda un mensaje claro al usuario final.
 */
export const ConfigError: React.FC<ConfigErrorProps> = ({ error, onRetry }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f8fafc',
      }}
    >
      <div style={{
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '480px',
        width: '100%',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#fee2e2',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: '1.25rem',
            color: '#1e293b',
            marginBottom: '0.5rem',
          }}
        >
          Sistema no disponible
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            color: '#64748b',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
          }}
        >
          La aplicación no está configurada correctamente para funcionar.
          Contacte al administrador del sistema.
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Reintentar
          </button>
        )}
      </div>

      {import.meta.env.DEV && (
        <details
          style={{
            marginTop: '1rem',
            fontSize: '0.8rem',
            color: '#94a3b8',
          }}
        >
          <summary style={{ cursor: 'pointer' }}>Detalle técnico</summary>
          <pre
            style={{
              marginTop: '0.5rem',
              textAlign: 'left',
              backgroundColor: '#f1f5f9',
              padding: '0.75rem',
              borderRadius: '6px',
              overflow: 'auto',
              maxHeight: '200px',
            }}
          >
            {String(error)}
          </pre>
        </details>
      )}
    </div>
  );
};
