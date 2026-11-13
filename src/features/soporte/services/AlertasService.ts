import { apiClient } from '../../../api/axiosClient';
import type { AlertaDto } from '../types/alertas';
export const AlertasService = {
  getAlertas: async (soloNoLeidas: boolean = false): Promise<AlertaDto[]> => {
    const response = await apiClient.get<AlertaDto[]>('/alertas/mis-alertas', {
      params: { soloNoLeidas }
    });
    return response.data;
  },
  marcarLeida: async (alertaId: string): Promise<AlertaDto> => {
    const response = await apiClient.post<AlertaDto>(`/alertas/${alertaId}/marcar-leida`);
    return response.data;
  }
};
