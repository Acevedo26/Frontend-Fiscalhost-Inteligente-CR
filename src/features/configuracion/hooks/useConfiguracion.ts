import { useQuery } from '@tanstack/react-query';
import { ConfiguracionService, AuditoriaService } from '../services/ConfiguracionService';

export const useConfiguracion = (enabled = true) => {
  return useQuery({
    queryKey: ['configuracion'],
    queryFn: () => ConfiguracionService.getMiConfiguracion(),
    enabled,
    retry: false,
  });
};

export const useAuditoriaLogs = (enabled = true) => {
  return useQuery({
    queryKey: ['auditoria-logs'],
    queryFn: () => AuditoriaService.getLogs(),
    enabled,
    retry: false,
  });
};

export const useActividades = (enabled = true) => {
  return useQuery({
    queryKey: ['actividades'],
    queryFn: () => ConfiguracionService.getActividades(),
    enabled,
    retry: false,
  });
};