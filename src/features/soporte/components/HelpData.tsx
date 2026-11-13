import React from 'react';
import { DollarSign, TrendingDown, BarChart2, CheckCircle, TriangleAlert, FileText } from 'lucide-react';

export interface Guia {
  id: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  contenido: string;
  icono: React.ReactNode;
}

export const guias: Guia[] = [
  {
    id: 'iva',
    titulo: '¿Qué es el IVA?',
    categoria: 'IVA',
    descripcion: 'Aprende qué es el Impuesto al Valor Agregado y cómo afecta a tu negocio de alquiler vacacional.',
    icono: <DollarSign size={28} />,
    contenido: `# ¿Qué es el IVA?

El Impuesto al Valor Agregado (IVA) es un impuesto que grava el consumo de bienes y servicios en Costa Rica.

## Para alquileres vacacionales

- Si tus ingresos por alquiler superan los ₡4,200,000 al año (₡350,000/mes), debes cobrar IVA
- La tasa general es del 13%
- El IVA se calcula sobre el monto del alquiler sin incluyen servicios adicionales

## Ejemplo práctico

Si cobras ₡50,000 por noche por una villa:

| Concepto | Monto |
|---------|-------|
| Alquiler noche | ₡50,000 |
| IVA 13% | ₡6,500 |
| **Total** | **₡56,500** |

## Deducciones

Puedes descontar el IVA de tus gastos operativos (limpieza, mantenimiento, servicios) de lo que debes pagar a Hacienda.

> Ejemplo: Si pagaste ₡15,000 en limpieza y cobras ₡6,500 de IVA, solo debes pagar ₡6,500 - ₡1,950 = ₡4,550`
  },
  {
    id: 'credito-fiscal',
    titulo: 'Crédito Fiscal',
    categoria: 'IVA',
    descripcion: 'Aprende a reduce tu IVA a pagar usando el crédito fiscal de tus gastos.',
    icono: <TrendingDown size={28} />,
    contenido: `# Crédito Fiscal

El crédito fiscal es el IVA que pagaste en tus gastos operativos y que puedes descontar del IVA que cobras a tus huéspedes.

## Requisitos para crédito fiscal

1. El gasto debe estar relacionado con tu actividad empresarial
2. Debes tener el comprobante de electrónica (factura)
3. El proveedor debe estar inscrito en Hacienda

## Ejemplo

| Concepto | Monto |
|---------|-------|
| IVA cobrado a huéspedes | ₡26,000 |
| (-) IVA de limpieza | ₡1,950 |
| (-) IVA de mantenimiento | ₡1,300 |
| (-) IVA de servicios | ₡1,950 |
| **IVA a pagar** | **₡20,800** |

## Importante

- No puedes tener crédito negativo (si tus gastos superan lo que cobras, el excedente no te lo devuelven)
- Guarda todas tus facturas electrónicas`
  },
  {
    id: 'renta',
    titulo: 'Declaración de Renta',
    categoria: 'Renta',
    descripcion: 'Entiende cómo se calcula y declara el impuesto sobre la renta.',
    icono: <BarChart2 size={28} />,
    contenido: `# Declaración de Renta

La declaración de renta es el impuesto que se paga sobre las utilidades (ganancias) de tu negocio.

## Dos regímenes fiscales

### 1. Capital Inmobiliario (12.75%)
- Para rentalde de propiedades amuebladas en zonas turísticas
- Deducción automática del 15%
- No requiere justificar gastos

**Cálculo:**
\`\`\`
Ingresos anuales - Deducción 15% = Base
Base × 12.75% = Impuesto
\`\`\`

### 2. Régimen de Utilidades (25%)
- Para quienes llevan contabilidad organizada
- Se restan los gastos reales

**Cálculo:**
\`\`\`
Ingresos anuales - Gastos reales = Utilidad
Utilidad × 25% = Impuesto
\`\`\`

## Ejemplo

Si tus ingresos anuales son ₡3,000,000:

| Régimen | Cálculo | Impuesto |
|---------|---------|----------|
| Capital | 3,000,000 × 0.1275 × 0.85 | ₡325,125 |
| Utilidades | (3,000,000 - 600,000) × 0.25 | ₡600,000 |

> El régimen de Capital sueleConveniente para Airbnb/Booking`
  },
  {
    id: 'exencion',
    titulo: 'Exención de Alquileres',
    categoria: 'Renta',
    descripcion: 'Descubre si tus alquileres están exentos del impuesto de renta.',
    icono: <CheckCircle size={28} />,
    contenido: `# Exención de Alquileres

En Costa Rica, algunos alquileres estão exentos del pago de renta.

## Requisitos de exención

1. **Monto**: Ingresos anuales menores a ₡4,200,000
2. **Tipo**: Alquiler de vivienda amueblada para fines vacacionales
3. **Duración**: Alquileres menores a 90 días連続

## Límites 2026

| Ingresos anuales | Situación |
|-----------------|-----------|
| Menos de ₡4,200,000 | Exento |
| ₡4,200,000 - ₡8,400,000 | 10% retención |
| Más de ₡8,400,000 | Declaración normal |

## Ejemplo

Si ganas ₡3,500,000 al año:
- No declaras renta
- Solo pagas el IVA si corresponde

> ¡Ceñúrate de mantener registros para demostrar tus ingresos si Hacienda te lo pide!`
  },
  {
    id: 'sanciones',
    titulo: 'Sanciones y Multas',
    categoria: 'Sanciones',
    descripcion: 'Conoce las sanciones por incumplimiento y cómo evitarlas.',
    icono: <TriangleAlert size={28} />,
    contenido: `# Sanciones y Multas

Hacienda aplica multas por incumplimiento. Conócelas para evitarlas.

## Multas comunes

| Infracción | Multa |
|------------|-------|
| No declarar a tiempo | ₡100,000 + intereses |
| Declarar incorrecto | ₡50,000 |
| No llevar libros | ₡200,000 |
| No emitir facturas | ₡25,000 por documento |

## Cómo evitar sanksi

1. **Declare a tiempo**: Usa el calendario fiscal
2. **Guarda comprobantes**: Todas las facturas
3. **Clasifica bien**:辨别 ingresos y gastos
4. **Usa FiscalHost**: Te avisa antes de vencer

## Reducción de Multas

Si regularizas antes del vencimiento:
- Multa base de ₡100,000
- 80% de descuento = solo ₡20,000

> Mejor prevenir que pagar`
  },
  {
    id: 'facturas',
    titulo: 'Factura Electrónica',
    categoria: 'General',
    descripcion: 'Aprende cuándo y cómo emitir facturas electrónicas.',
    icono: <FileText size={28} />,
    contenido: `# Factura electrónica

Todo alquiler vacacional en Costa Rica debe emitirse con factura electrónica.

##Cuándo facturar

- Al recibir el pago del alquiler
- Al prestar servicios adicionales (limpieza, traslado, etc.)

##Datos requeridos

1. Tu nombre/razón social y NITE
2.Nombre del cliente
3. Detalle del servicio
4. Monto y IVA
5. Fecha de emisión

## Ejemplo de factura

\`\`\`
FISCALHOST S.A.
NITE: 3101234567

Cliente: Juan Pérez
Cédula: 1-2345-6789

Servicio: Alquiler Villa Sol (5 noches)
Monto: ₡250,000
IVA 13%: ₡32,500
-------------------
TOTAL: ₡282,500
\`\`\`

## Herramientas

Puedes usar el sitio de Hacienda o plataformas como FiscalHost para generar facturas`
  },
];
