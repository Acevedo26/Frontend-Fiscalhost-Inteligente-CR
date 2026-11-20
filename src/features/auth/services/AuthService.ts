import { apiClient } from '../../../api/axiosClient';
import type { LoginRequest, LoginResponse, RegistroRequest, RegistroResponse } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      correo: credentials.correo,
      contrasena: credentials.contrasena,
    });
    return response.data;
  },

  register: async (data: RegistroRequest): Promise<RegistroResponse> => {
    const response = await apiClient.post<RegistroResponse>('/auth/register', {
      nombreCompleto: data.nombreCompleto,
      nombre: data.nombre ?? null,
      correoElectronico: data.correoElectronico,
      correo: data.correo ?? null,
      contrasena: data.contrasena,
      clave: data.clave ?? null,
      numeroIdentificacion: data.numeroIdentificacion,
      identificacion: data.identificacion ?? null,
      tipoIdentificacion: data.tipoIdentificacion,
      razonSocial: data.razonSocial ?? null,
    });
    return response.data;
  }
};
