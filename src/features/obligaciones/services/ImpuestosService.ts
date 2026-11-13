import { apiClient } from '../../../api/axiosClient';
export const ImpuestosService = {
  generarCalculoIva: async (anio: number, mes: number) => {
    const res = await apiClient.post('/CalculoFiscal/iva/generar', { anio, mes });
    return res.data;
  },
  calcularRentaCapital: async (anio: number, mes: number) => {
    const res = await apiClient.post('/renta-capital/calcular', { anio, mes });
    return res.data;
  },
  simularRenta: async (anio: number, mes: number) => {
    const res = await apiClient.post('/renta-capital/simular', { anio, mes });
    return res.data;
  },
  cambiarRegimen: async (nuevoRegimen: string, anio: number = 2026, mes: number = 4) => {
    const regimen = nuevoRegimen === 'CAPITAL' ? 'CAPITAL_INMOBILIARIO' : nuevoRegimen;
    const res = await apiClient.post('/renta-capital/cambiar-regimen', {
      nuevoRegimen: regimen,
      anio,
      mes,
    });
    return res.data;
  },
  generarBorradorD104: async (anio: number = 2026, mes: number = 4) => {
    const res = await apiClient.post('/borradores/d104', { anio, mes });
    return res.data;
  },
  generarBorradorD125: async (anio: number = 2026, regimenUtilidades: boolean = false) => {
    const res = await apiClient.post('/borradores/d125', { anio, regimenUtilidades });
    return res.data;
  },
  generarBorradorD176: async (impuestoPrincipal: number, fechaVencimientoOriginal: string) => {
    const res = await apiClient.post('/borradores/d176', { impuestoPrincipal, fechaVencimientoOriginal });
    return res.data;
  }
};

