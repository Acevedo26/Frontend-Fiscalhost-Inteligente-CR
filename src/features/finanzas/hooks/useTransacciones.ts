import { useQuery } from '@tanstack/react-query';
import { FinanzasService } from '../services/FinanzasService';

export const useTransacciones = () => {
  return useQuery({
    queryKey: ['transacciones'],
    queryFn: FinanzasService.getOperaciones,
  });
};
