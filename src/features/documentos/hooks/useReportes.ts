import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReportesService } from '../services/ReportesService';
import { useAuth } from '../../auth/hooks/useAuth';
export const useContadores = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['contadores', user?.id],
    queryFn: () => ReportesService.getContadores(),
    enabled: !!user?.id,
  });
};
export const useInvitarContador = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (data: any) => ReportesService.invitarContador(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contadores', user?.id] });
    },
  });
};
export const useRevocarContador = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => ReportesService.revocarContador(id, 'Revocación de acceso de contador solicitada por el propietario.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contadores', user?.id] });
    },
  });
};
export const useExportarHacienda = () => {
  return useMutation({
    mutationFn: (data: any) => ReportesService.exportarHacienda(data),
  });
};
