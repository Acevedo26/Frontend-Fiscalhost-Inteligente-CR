import { apiClient } from '../../../api/axiosClient';
export interface CreateSimulacionRequest { id?: string; }
export const SimuladorService = {
  listarSimulaciones: async () => { const r = await apiClient.get('/simulador'); return r.data; },
  crearSimulacion: async (data: any) => { const r = await apiClient.post('/simulador', data); return r.data; },
  eliminarSimulacion: async (id: string) => { const r = await apiClient.delete('/simulador/' + id); return r.data; }
};
