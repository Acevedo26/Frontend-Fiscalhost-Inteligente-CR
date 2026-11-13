export type Clasificacion = 'GRAVADO_13' | 'EXENTO' | 'RETENCION_15' | 'PENDIENTE';

export interface Transaccion {
  id: number | string;
  fecha: string;
  concepto: string;
  monto: number;
  tipo: 'INGRESO' | 'GASTO';
  fuente?: string;
  proveedor?: string;
  clasificacion?: Clasificacion;
  editado?: boolean;
  historial?: { fecha: string; campo: string; anterior: string; nuevo: string; razon: string }[];
}

export interface ObligacionDto {
  obligacionId: string;
  usuarioId?: string;
  calculoId?: string | null;
  periodoId?: string;
  tipoFormulario: number | string;
  descripcion: string;
  montoCapital: number;
  montoMulta: number;
  montoInteresesAcumulados: number;
  montoTotalActualizado: number;
  fechaVencimiento: string;
  fechaPago?: string | null;
  estado: number | string;
  tasaInteresAplicada?: number | null;
  historialIntereses?: string;
  diasVencido: number;
}

export interface ImportacionCsvResponse {
  success: boolean;
  importacionId: string;
  estado: string;
  totalRegistros: number;
  registrosExitosos: number;
  registrosConError: number;
  reporteErroresUrl?: string;
  errores?: string[];
}
