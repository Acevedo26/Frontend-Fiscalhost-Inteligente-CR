import { useQuery } from '@tanstack/react-query';
import { ImpuestosService } from '../services/ImpuestosService';
export const useCalculoIva = (anio: number, mes: number) => {
  return useQuery({
    queryKey: ['calculoIva', anio, mes],
    queryFn: () => ImpuestosService.generarCalculoIva(anio, mes),
  });
};
export const useCalculoRenta = (anio: number, mes: number) => {
  return useQuery({
    queryKey: ['calculoRenta', anio, mes],
    queryFn: () => ImpuestosService.calcularRentaCapital(anio, mes),
  });
};
export const useSimularRenta = (anio: number, mes: number) => {
  return useQuery({
    queryKey: ['simularRenta', anio, mes],
    queryFn: () => ImpuestosService.simularRenta(anio, mes),
  });
};
