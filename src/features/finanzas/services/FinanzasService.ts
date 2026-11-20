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
  /** @default "CRC" — pendiente de exponer en la UI */
  moneda?: "CRC" | "USD";
  /** @default true — pendiente de exponer en la UI */
  esDeducibleRenta?: boolean;
  /** @default true — pendiente de exponer en la UI */
  esCreditoFiscalValido?: boolean;
  /** @default 'General' — pendiente de exponer en la UI */
  tipoGasto?: string;
}

export interface ActualizarGastoDto {
  justificacion: string;
  proveedor: string;
  montoTotal: number;
  fechaEmision: string;
  tipoGasto?: string;
  /** @default "CRC" — pendiente de exponer en la UI */
  moneda?: "CRC" | "USD";
  numeroFactura?: string | null;
}

export interface ActualizarReservaDto {
  monto: number;
  razonCambio: string;
  justificacion?: string;
  fechaReserva?: string;
  huesped?: string;
}

// Valores por defecto del contrato de backend (Costa Rica). Pendiente de exponer
// como campos de elección en la UI para no hardcodear datos del usuario.
const MONEDA_CRC: "CRC" | "USD" = "CRC";
const TIPO_CAMBIO_CRC = 1.0;
const TIPO_GASTO_DEFAULT = 'General';

const clasificacionFiscalDe = (clasificacion?: string): "GRAVADO" | "EXENTO" | "GRAVADO_CON_RETENCION" => {
  switch (clasificacion) {
    case 'EXENTO': return "EXENTO";
    case 'RETENCION_15': return "GRAVADO_CON_RETENCION";
    case 'GRAVADO_13':
    default: return "GRAVADO";
  }
};

const plataformaOrigenDe = (fuente?: string): "AIRBNB" | "BOOKING" | "VRBO" | "DIRECTA" | "OTRA" => {
  switch (fuente?.toUpperCase()) {
    case 'AIRBNB': return "AIRBNB";
    case 'BOOKING': return "BOOKING";
    case 'VRBO': return "VRBO";
    case 'PAYPAL': return "OTRA";
    case 'DIRECTO':
    default: return "DIRECTA";
  }
};

export const FinanzasService = {
  getOperaciones: async () => {
    try {
      // `/operaciones` (adapter del prototipo) se elimina en el back.
      // Se consulta por separado reservas y gastos, los únicos que quedan.
      const [reservasRes, gastosRes] = await Promise.all([
        apiClient.get('/operaciones-manuales/reservas'),
        apiClient.get('/operaciones-manuales/gastos'),
      ]);
      return {
        ingresos: reservasRes.data ?? [],
        gastos: gastosRes.data ?? [],
      };
    } catch {
      // Si el endpoint falla (sin datos aún, 401, etc.) devolver estructura vacía
      // para que la pantalla muestre los datos iniciales en lugar de quedar en blanco.
      return { ingresos: [], gastos: [] };
    }
  },

  crearOperacion: async (data: CrearOperacionDto) => {
    const fechaISO = data.fecha.includes('T') ? data.fecha : `${data.fecha}T00:00:00Z`;
    const fechaSolo = data.fecha.includes('T') ? data.fecha.split('T')[0] : data.fecha;
    const [anio, mes] = fechaSolo.split('-').map(Number);
    const hoy = new Date();

    if (data.tipo === 'INGRESO') {
      const res = await apiClient.post('/operaciones-manuales/reserva', {
        fechaInicio: fechaISO,
        fechaFin: fechaISO,
        nombreHuesped: data.huesped || data.concepto || null,
        montoBruto: Number(data.monto),
        moneda: data.moneda ?? MONEDA_CRC,
        tipoCambio: TIPO_CAMBIO_CRC,
        clasificacionFiscal: clasificacionFiscalDe(data.clasificacion),
        plataformaOrigen: plataformaOrigenDe(data.fuente),
        periodoFiscalAnio: anio ?? hoy.getFullYear(),
        periodoFiscalMes: mes ?? hoy.getMonth() + 1,
      });
      return res.data;
    } else {
      const res = await apiClient.post('/operaciones-manuales/gasto', {
        justificacion: data.concepto,
        proveedor: data.proveedor || data.concepto || '',
        numeroFactura: data.numeroFactura ?? null,
        fechaEmision: fechaSolo,
        montoTotal: Number(data.monto),
        moneda: data.moneda ?? MONEDA_CRC,
        tipoGasto: data.tipoGasto ?? TIPO_GASTO_DEFAULT,
        esDeducibleRenta: data.esDeducibleRenta ?? true,
        esCreditoFiscalValido: data.esCreditoFiscalValido ?? true,
      });
      return res.data;
    }
  },

  actualizarGasto: async (id: string | number, data: ActualizarGastoDto) => {
    const res = await apiClient.put(`/operaciones-manuales/gasto/${id}`, {
      justificacion: data.justificacion,
      proveedor: data.proveedor,
      numeroFactura: data.numeroFactura ?? null,
      fechaEmision: data.fechaEmision,
      montoTotal: Number(data.montoTotal),
      moneda: data.moneda ?? MONEDA_CRC,
      tipoGasto: data.tipoGasto ?? TIPO_GASTO_DEFAULT,
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
    const intId =
      typeof id === 'number' ? id : parseInt(String(id), 10);
    if (!intId) {
      throw new Error('ID de ingreso inválido para reclasificación.');
    }
    let clasificacionIva: "Gravado13" | "Exento" = "Gravado13";
    if (clasificacion === 'EXENTO' || clasificacion.toLowerCase().includes('exento')) {
      clasificacionIva = "Exento";
    }
    const res = await apiClient.put(`/clasificacion-ingresos/${intId}/reclasificar`, {
      clasificacionIva,
      justificacion,
    });
    return res.data;
  },

  importarCsv: async (file: File): Promise<ImportacionCsvResponse> => {
    const formData = new FormData();
    formData.append('archivo', file);
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
  }
};
