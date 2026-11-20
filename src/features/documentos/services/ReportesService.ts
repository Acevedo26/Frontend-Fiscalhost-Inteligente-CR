import { apiClient } from '../../../api/axiosClient';
export const ReportesService = {
  getContadores: async () => {
    const res = await apiClient.get('/accesos-contadores/mis-accesos');
    return res.data;
  },

  invitarContador: async (data: any) => {
    const res = await apiClient.post('/accesos-contadores/invitar', data);
    return res.data;
  },

  revocarContador: async (accesoId: string, justificacion: string) => {
    // DELETE lógico en el back: marca Estado = "REVOCADO" sin borrar físicamente.
    // El anfitrión se inyecta desde JWT en el controller; nunca se envía desde el cliente.
    const res = await apiClient.delete(`/accesos-contadores/${accesoId}`, {
      params: { justificacion }
    });
    return res.data;
  },

  exportarHacienda: async (data: any) => {
    const res = await apiClient.post('/exportaciones-hacienda', data);
    return res.data;
  }
};
