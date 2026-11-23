import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfiguracionService, AuditoriaService } from '../services/ConfiguracionService';

export const useConfiguracion = (enabled = true) => {
  return useQuery({
    queryKey: ['configuracion'],
    queryFn: () => ConfiguracionService.getMiConfiguracion(),
    enabled,
    retry: false,
  });
};

export const usePerfilUsuario = (enabled = true) => {
  return useQuery({
    queryKey: ['perfil-usuario'],
    queryFn: () => ConfiguracionService.getMiPerfil(),
    enabled,
    retry: false,
  });
};

export const useActualizarPerfil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => ConfiguracionService.actualizarPerfil(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-usuario'] });
    },
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