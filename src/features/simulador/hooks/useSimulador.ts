import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SimuladorService } from '../services/SimuladorService';
import type { CreateSimulacionRequest } from '../services/SimuladorService';
export const useSimulaciones = () => {
  return useQuery({
    queryKey: ['simulaciones'],
    queryFn: () => SimuladorService.listarSimulaciones(),
  });
};
export const useCrearSimulacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSimulacionRequest) => SimuladorService.crearSimulacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulaciones'] });
    },
  });
};
export const useEliminarSimulacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SimuladorService.eliminarSimulacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulaciones'] });
    },
  });
};
