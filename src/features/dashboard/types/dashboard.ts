export interface DashboardMetrics {
  ingresosBrutos: number;
  impuestosEstimados: number;
  ivaDebito: number;
  ivaCreditoFiscal: number;
  ivaRetenido: number;
  rentaEstimada: number;
  gastosTotales: number;
  ingresosNetos: number;
}

export interface DashboardRisk {
  nivelRiesgo: string;
  factores: string[];
}

export interface DashboardEvolution {
  anio: number;
  mes: number;
  ingresosBrutos: number;
  impuestosEstimados: number;
  ivaRetenido: number;
  rentaEstimada: number;
  ingresosNetos: number;
}

export interface DashboardResponse {
  metricas: DashboardMetrics;
  riesgoFiscal: DashboardRisk;
  evolucionMensual: DashboardEvolution[];
  tieneDatos: boolean;
}
