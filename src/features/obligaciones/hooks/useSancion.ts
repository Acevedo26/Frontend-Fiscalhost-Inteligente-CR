import { useMutation } from '@tanstack/react-query';
import { SancionService } from '../services/SancionService';
export const useCalcularSancion = () => {
  return useMutation({
    mutationFn: (obligacionId: string) => SancionService.calcularSancion(obligacionId),
  });
};
