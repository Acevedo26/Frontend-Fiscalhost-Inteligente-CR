import { apiClient } from '../../../api/axiosClient';
export const ConfiguracionService = {
  // Perfil de Usuario
  getMiPerfil: async () => {
    const res = await apiClient.get('/usuarios/me', { skipGlobalAlert: true });
    return res.data;
  },
  actualizarPerfil: async (data: any) => {
    const res = await apiClient.put('/usuarios/me/perfil', data);
    return res.data;
  },

  // Configuración Tributaria
  getActividades: async () => {
    const res = await apiClient.get('/configuracion-tributaria/actividades');
    return res.data;
  },
  
  getMiConfiguracion: async () => {
    const res = await apiClient.get('/configuracion-tributaria/mi-configuracion', { skipGlobalAlert: true });
    return res.data;
  },
  guardarConfiguracion: async (data: any) => {
    const res = await apiClient.post('/configuracion-tributaria', data);
    return res.data;
  },

  guardarPreferenciasNotificacion: async (canalAlertas: "CORREO" | "PLATAFORMA" | "AMBOS") => {
    const res = await apiClient.put('/usuarios/me/preferencias-notificacion', { canalAlertas });
    return res.data;
  }
};
export const LlaveCriptograficaService = {
  subirP12: async (formData: FormData) => {
    const res = await apiClient.post('/llave-criptografica/subir-p12', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};
export const AuditoriaService = {
  getLogs: async () => {
    const res = await apiClient.get('/auditoria-inalterable');
    return res.data;
  }
};
