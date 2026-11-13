import { apiClient } from '../../../api/axiosClient';
import type { LoginRequest, LoginResponse, RegistroRequest, RegistroResponse } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const payload = {
      correo: credentials.correo || credentials.email || '',
      contrasena: credentials.contrasena || credentials.clave || credentials.password || '',
      clave: credentials.clave || credentials.contrasena || credentials.password || '',
    };
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  register: async (data: RegistroRequest): Promise<RegistroResponse> => {
    const payload = {
      nombreCompleto: data.nombreCompleto || data.nombre || '',
      nombre: data.nombre || data.nombreCompleto || '',
      correoElectronico: data.correoElectronico || data.correo || data.email || '',
      correo: data.correo || data.correoElectronico || data.email || '',
      contrasena: data.contrasena || data.clave || data.password || '',
      clave: data.clave || data.contrasena || data.password || '',
      numeroIdentificacion: data.numeroIdentificacion || data.identificacion || '',
      identificacion: data.identificacion || data.numeroIdentificacion || '',
      tipoIdentificacion: data.tipoIdentificacion || 'FISICA',
      razonSocial: data.razonSocial,
    };
    const response = await apiClient.post<RegistroResponse>('/auth/registro', payload);
    return response.data;
  }
};

