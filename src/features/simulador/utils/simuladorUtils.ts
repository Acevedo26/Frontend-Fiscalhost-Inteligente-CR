import type { Escenario } from '../types/simulador';

export const calcularIVA = (ingresos: number, gastos: number) => {
  const base = Math.max(0, ingresos - gastos);
  return Math.round(base * 0.13);
};

export const calcularRenta = (ingresos: number, gastos: number, activo: number) => {
  const base = Math.max(0, ingresos - gastos - activo);
  return Math.round(base * 0.1275);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CR', { 
    style: 'currency', 
    currency: 'CRC',
    minimumFractionDigits: 0 
  }).format(amount);
};

export const getDiferencia = (escenario: Escenario, escenarioBase: Escenario) => {
  const baseIVA = calcularIVA(escenarioBase.ingresos, escenarioBase.gastos);
  const baseRenta = calcularRenta(escenarioBase.ingresos, escenarioBase.gastos, escenarioBase.activo);
  const escIVA = calcularIVA(escenario.ingresos, escenario.gastos);
  const escRenta = calcularRenta(escenario.ingresos, escenario.gastos, escenario.activo);
  return {
    iva: escIVA - baseIVA,
    renta: escRenta - baseRenta,
  };
};
