import axios from 'axios';
import type { AxiosError } from 'axios';
import { showError, showWarning, extractErrorMessage } from '../utils/alerts';

// Extend AxiosRequestConfig to support skipGlobalAlert option
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalAlert?: boolean;
  }
}

// Get base URL from env. No localhost fallback in production: fail fast with a clear error
// if VITE_API_URL is not defined, instead of silently pointing to localhost.
const VITE_API_URL = import.meta.env.VITE_API_URL;
if (!VITE_API_URL) {
  throw new Error(
    'VITE_API_URL no está definida. Configure .env con la URL base del backend FiscalHost para producción.',
  );
}
export const API_BASE_URL = VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle global response errors with SweetAlert2
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Check if caller opted out of global alert notification
    if (error.config?.skipGlobalAlert) {
      return Promise.reject(error);
    }

    // 1. Network Error or Server Unreachable
    if (!error.response) {
      showError(
        'Error de Conexión',
        'No se pudo establecer comunicación con el servidor backend. Verifique su conexión a la red o el estado del servicio.'
      );
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = extractErrorMessage(data);

    // 2. HTTP Status-specific handling
    switch (status) {
      case 400:
        showError('Solicitud Inválida', message || 'Los datos proporcionados no cumplen con el formato requerido.');
        break;

      case 401:
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        showWarning(
          'Sesión Expirada',
          'Su sesión ha caducado o no se encuentra autenticado. Por favor, vuelva a iniciar sesión.'
        ).then(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        });
        break;

      case 403:
        showWarning(
          'Acceso Denegado',
          message || 'No dispone de los permisos necesarios para realizar la operación solicitada.'
        );
        break;

      case 404:
        showWarning(
          'Recurso No Encontrado',
          message || 'El recurso o registro solicitado no existe en el sistema.'
        );
        break;

      case 422:
        showWarning(
          'Regla Fiscal',
          message || 'La operación no cumple con las reglas de validación de negocio o fiscales vigentes.'
        );
        break;

      case 405:
      case 406:
      case 408:
      case 409:
      case 410:
      case 413:
      case 414:
      case 415:
      case 429:
        showError(
          'Error de Solicitud',
          message || 'La solicitud no se pudo completar. Verifique los datos e intente nuevamente.'
        );
        break;

      case 500:
      case 501:
      case 502:
      case 503:
      case 504:
      case 505:
        showError(
          'Error del Servidor',
          message || 'Ocurrió una falla inesperada en el servidor. Intente nuevamente en unos momentos.'
        );
        break;

      default:
        showError(
          `Error (${status})`,
          message || 'Se produjo un error al procesar su solicitud.'
        );
        break;
    }

    return Promise.reject(error);
  }
);
