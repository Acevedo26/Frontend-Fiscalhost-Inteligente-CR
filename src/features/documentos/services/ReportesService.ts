import { apiClient } from '../../../api/axiosClient';
export const ReportesService = {
  getContadores: async (anfitrionId?: string) => {
    try {
      const res = await apiClient.get('/accesos-contadores/mis-accesos');
      return res.data;
    } catch {
      const res = await apiClient.get(`/accesos-contadores/anfitrion/${anfitrionId || '00000000-0000-0000-0000-000000000000'}`);
      return res.data;
    }
  },
  
  invitarContador: async (data: any) => {
    const res = await apiClient.post('/accesos-contadores/invitar', data);
    return res.data;
  },
  revocarContador: async (accesoId: string, anfitrionId?: string, justificacion?: string) => {
    try {
      const res = await apiClient.put(`/accesos-contadores/${accesoId}/revocar`, {
        anfitrionId,
        justificacion: justificacion || 'Revocación solicitada por el usuario anfitrión.'
      });
      return res.data;
    } catch {
      const res = await apiClient.delete(`/accesos-contadores/${accesoId}`);
      return res.data;
    }
  },
  exportarHacienda: async (data: any) => {
    const res = await apiClient.post('/exportaciones-hacienda', data);
    return res.data;
  }
};

