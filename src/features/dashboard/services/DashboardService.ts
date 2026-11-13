import { apiClient } from '../../../api/axiosClient';
import type { DashboardResponse } from '../types/dashboard';
export const DashboardService = {
  getDashboardData: async (fechaInicio: string, fechaFin: string): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>('/dashboard', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  }
};
