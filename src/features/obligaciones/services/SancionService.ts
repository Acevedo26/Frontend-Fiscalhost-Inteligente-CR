import { apiClient } from '../../../api/axiosClient';
export const SancionService = {
  calcularSancion: async (obligacionId: string) => {
    const res = await apiClient.post('/sancion-autoliquidacion/calcular', { obligacionId });
    return res.data;
  }
};
