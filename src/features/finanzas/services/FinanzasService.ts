import { apiClient } from '../../../api/axiosClient';
import type { ObligacionDto, ImportacionCsvResponse } from '../types';

export interface CrearOperacionDto {
  tipo: 'INGRESO' | 'GASTO';
  fecha: string;
  monto: number;
  concepto: string;
  fuente?: string;
  proveedor?: string;
  huesped?: string;
  numeroFactura?: string;
  clasificacion?: string;
}

export interface ActualizarGastoDto {
  justificacion: string;
  proveedor: string;
  montoTotal: number;
  fechaEmision: string;
  tipoGasto?: string;
}

export interface ActualizarReservaDto {
  monto: number;
  razonCambio: string;
  justificacion?: string;
  fechaReserva?: string;
  huesped?: string;
}

export const FinanzasService = {
  getOperaciones: async () => {
    try {
      const res = await apiClient.get('/operaciones', { skipGlobalAlert: true });
      return res.data;
    } catch {
      // Si el endpoint falla (sin datos aún, 401, etc.) devolver estructura vacía
      // para que la pantalla muestre los datos iniciales en lugar de quedar en blanco.
      return { ingresos: [], gastos: [] };
    }
  },

  crearOperacion: async (data: CrearOperacionDto) => {
    if (data.tipo === 'INGRESO') {
      // Use the manuales/reserva endpoint for reservations (BUG-001 fix)
      const res = await apiClient.post('/operaciones-manuales/reserva', {
        fechaReserva: data.fecha.includes('T') ? data.fecha : `${data.fecha}T00:00:00Z`,
        monto: Number(data.monto),
        huesped: data.huesped || data.concepto,
      });
      return res.data;
    } else {
      // Use the manuales/gasto endpoint for expenses
      // Backend will calculate IVA (13%) and net amount automatically
      const res = await apiClient.post('/operaciones-manuales/gasto', {
        justificacion: data.concepto,
        proveedor: data.proveedor || 'Proveedor General',
        numeroFactura: data.numeroFactura || `FAC-${Date.now()}`,
        fechaEmision: data.fecha.includes('T') ? data.fecha : `${data.fecha}T00:00:00Z`,
        montoTotal: Number(data.monto),
        moneda: 1, // TipoMoneda.CRC
        tipoGasto: 'General',
        esDeducibleRenta: true,
        esCreditoFiscalValido: true,
      });
      return res.data;
    }
  },

  actualizarGasto: async (id: string | number, data: ActualizarGastoDto) => {
    const res = await apiClient.put(`/operaciones-manuales/gasto/${id}`, {
      justificacion: data.justificacion,
      proveedor: data.proveedor || 'Proveedor General',
      numeroFactura: `FAC-${id}`,
      fechaEmision: data.fechaEmision,
      montoTotal: Number(data.montoTotal),
      moneda: 1, // TipoMoneda.CRC
      tipoGasto: data.tipoGasto || 'General',
      esDeducibleRenta: true,
    });
    return res.data;
  },

  eliminarGasto: async (id: string | number, justificacion: string) => {
    const res = await apiClient.delete(`/operaciones-manuales/gasto/${id}`, {
      data: { justificacion },
    });
    return res.data;
  },

  actualizarReserva: async (id: string | number, data: ActualizarReservaDto) => {
    const res = await apiClient.put(`/operaciones-manuales/reserva/${id}`, {
      monto: Number(data.monto),
      razonCambio: data.razonCambio,
      justificacion: data.justificacion || data.razonCambio,
      fechaReserva: data.fechaReserva,
      huesped: data.huesped,
    });
    return res.data;
  },

  eliminarReserva: async (id: string | number, razonCambio: string) => {
    const res = await apiClient.delete(`/operaciones-manuales/reserva/${id}`, {
      data: {
        razonCambio,
        justificacion: razonCambio,
      },
    });
    return res.data;
  },

  reclasificarIngreso: async (id: string | number, clasificacion: string, justificacion: string) => {
    // Map classification string to enum integer or string expected by backend:
    // 1: Gravado13, 2: Exento
    let clasificacionIva = 1;
    if (clasificacion === 'EXENTO' || clasificacion.toLowerCase().includes('exento')) {
      clasificacionIva = 2;
    }
    const res = await apiClient.put(`/clasificacion-ingresos/${id}/reclasificar`, {
      clasificacionIva,
      justificacion,
    });
    return res.data;
  },

  importarCsv: async (file: File): Promise<ImportacionCsvResponse> => {
    const formData = new FormData();
    formData.append('archivo', file);
    // NO establecer Content-Type manualmente: axios lo hace automáticamente con el boundary correcto
    const res = await apiClient.post<ImportacionCsvResponse>('/importaciones/csv', formData);
    return res.data;
  },

  getObligaciones: async (fechaCorte?: string): Promise<ObligacionDto[]> => {
    const res = await apiClient.get<ObligacionDto[]>('/obligaciones', {
      params: fechaCorte ? { fechaCorte } : undefined,
    });
    return res.data;
  },

  getDeudaObligacion: async (id: string): Promise<ObligacionDto> => {
    const res = await apiClient.get<ObligacionDto>(`/obligaciones/${id}/deuda`);
    return res.data;
  },
};
