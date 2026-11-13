import axios from 'axios';
import type { AxiosError } from 'axios';
import { showError, showWarning, extractErrorMessage } from '../utils/alerts';

// Extend AxiosRequestConfig to support skipGlobalAlert option
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalAlert?: boolean;
  }
}

// Get base URL from env or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5062/api';

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

      case 500:
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
