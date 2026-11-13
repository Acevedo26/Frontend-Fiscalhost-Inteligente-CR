import type { Transaccion } from './types';

export const initialTransactions: Transaccion[] = [
  { id: 1, fecha: '15/04/2026', concepto: 'Reserva Airbnb #2847', monto: 45000, tipo: 'INGRESO', fuente: 'Airbnb', clasificacion: 'GRAVADO_13' },
  { id: 2, fecha: '14/04/2026', concepto: 'Reserva Booking #B3921', monto: 32000, tipo: 'INGRESO', fuente: 'Booking', clasificacion: 'GRAVADO_13' },
  { id: 3, fecha: '12/04/2026', concepto: 'Reserva Directa', monto: 28000, tipo: 'INGRESO', fuente: 'Directo', clasificacion: 'EXENTO' },
  { id: 4, fecha: '10/04/2026', concepto: 'Reserva Airbnb #2845', monto: 55000, tipo: 'INGRESO', fuente: 'Airbnb', clasificacion: 'GRAVADO_13' },
  { id: 5, fecha: '08/04/2026', concepto: 'Retención PayPal', monto: 6750, tipo: 'INGRESO', fuente: 'PayPal', clasificacion: 'RETENCION_15' },
  { id: 6, fecha: '05/04/2026', concepto: 'Reserva Vrbo #V123', monto: 38000, tipo: 'INGRESO', fuente: 'Vrbo', clasificacion: 'GRAVADO_13' },
];

export const initialGastos: Transaccion[] = [
  { id: 1, fecha: '12/04/2026', concepto: 'Limpieza Villa Sol', monto: 15000, tipo: 'GASTO', proveedor: 'Limpiezas Costa' },
  { id: 2, fecha: '08/04/2026', concepto: 'Mantenimiento AC', monto: 35000, tipo: 'GASTO', proveedor: 'CoolTech' },
  { id: 3, fecha: '01/04/2026', concepto: 'Internet', monto: 25000, tipo: 'GASTO', proveedor: 'ICE' },
];

export const optionsClasificacion = [
  { label: 'Gravado 13%', value: 'GRAVADO_13' },
  { label: 'Exento', value: 'EXENTO' },
  { label: 'Retención 15%', value: 'RETENCION_15' },
  { label: 'Pendiente', value: 'PENDIENTE' },
];

export const optionsFuente = [
  { label: 'Airbnb', value: 'AIRBNB' },
  { label: 'Booking', value: 'BOOKING' },
  { label: 'Vrbo', value: 'VRBO' },
  { label: 'Directo', value: 'DIRECTO' },
  { label: 'PayPal', value: 'PAYPAL' },
];
