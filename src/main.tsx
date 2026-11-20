import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigError } from './components/common/ConfigError';
import './styles/alerts.css';

async function init() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('No se encontró el elemento #root en el DOM.');
    return;
  }

  try {
    // Importación dinámica para capturar errores de configuración a nivel
    // de módulo (por ejemplo, VITE_API_URL no definida en axiosClient.ts)
    // antes de montar la aplicación y evitar pantalla en blanco.
    const { default: App } = await import('./App.tsx');

    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error: unknown) {
    console.error('Error al inicializar la aplicación:', error);

    createRoot(rootElement).render(
      <StrictMode>
        <ConfigError error={error} onRetry={() => window.location.reload()} />
      </StrictMode>,
    );
  }
}

init();
