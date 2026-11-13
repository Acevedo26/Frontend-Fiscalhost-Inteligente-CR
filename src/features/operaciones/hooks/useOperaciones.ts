import { useQuery } from '@tanstack/react-query';
import { OperacionesService } from '../services/OperacionesService';
export const useGastos = () => useQuery({ queryKey: ['gastos'], queryFn: () => OperacionesService.getGastos() });

