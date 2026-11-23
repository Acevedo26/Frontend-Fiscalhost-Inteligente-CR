import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReportesService } from '../services/ReportesService';
import { useAuth } from '../../auth/hooks/useAuth';

interface BackendContador {
  accesoId: string;
  anfitrionId: string;
  contadorId?: string;
  correoContador: string;
  nombreContador?: string;
  estado: string;
  fechaInvitacion: string;
  fechaExpiracion?: string;
  fechaRevocacion?: string;
  puedeVerIngresos: boolean;
  puedeVerGastos: boolean;
  puedeGenerarReportes: boolean;
  permisos: string;
}

const mapBackendToContador = (backend: BackendContador) => ({
  id: backend.accesoId,
  nombre: backend.nombreContador || backend.correoContador.split('@')[0],
  email: backend.correoContador,
  permisos: backend.permisos || 'Sin permisos',
  expiracion: backend.fechaExpiracion ? new Date(backend.fechaExpiracion).toISOString() : new Date().toISOString(),
  estado: backend.estado as 'ACTIVO' | 'EXPIRADO' | 'PENDIENTE',
});

export const useContadores = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['contadores', user?.id],
    queryFn: async () => {
      const data = await ReportesService.getContadores();
      return (data as BackendContador[]).map(mapBackendToContador);
    },
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
