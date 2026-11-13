import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertasService } from '../services/AlertasService';
export const useAlertas = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['alertas'],
    queryFn: () => AlertasService.getAlertas(),
  });
  const marcarLeidaMutation = useMutation({
    mutationFn: (alertaId: string) => AlertasService.marcarLeida(alertaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
  return {
    alertas: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    marcarLeida: marcarLeidaMutation.mutate,
    isMarkingLeida: marcarLeidaMutation.isPending,
  };
};

