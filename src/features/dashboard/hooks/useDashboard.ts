import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/DashboardService';

export const useDashboard = (fechaInicio?: string, fechaFin?: string) => {
  const currentYear = new Date().getFullYear();
  const inicio = fechaInicio || `${currentYear}-01-01T00:00:00`;
  const fin = fechaFin || `${currentYear}-12-31T23:59:59`;

  return useQuery({
    queryKey: ['dashboard', inicio, fin],
    queryFn: () => DashboardService.getDashboardData(inicio, fin),
  });
};
