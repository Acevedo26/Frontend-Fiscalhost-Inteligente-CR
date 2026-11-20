import { apiClient } from '../../../api/axiosClient';
export const OperacionesService = {
  getTransacciones: async () => { const r = await apiClient.get('/operaciones'); return r.data; },
  getGastos: async () => { const r = await apiClient.get('/operaciones-manuales/gastos'); return r.data; },
  getReservas: async () => { const r = await apiClient.get('/operaciones-manuales/reservas'); return r.data; },
  crearGasto: async (data: any) => { const r = await apiClient.post('/operaciones-manuales/gasto', data); return r.data; },
  eliminarGasto: async (id: string, justificacion: string) => {
    const r = await apiClient.delete(`/operaciones-manuales/gasto/${id}`, {
      data: { justificacion }
    });
    return r.data;
  }
};

