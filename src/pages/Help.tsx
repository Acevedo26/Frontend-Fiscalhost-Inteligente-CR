/* ============================================
   PÁGINA: Guía Educativa
   Descripción: Guías educativas y ayuda (HU-019)
   ============================================ */

import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Search, DollarSign, TrendingDown, BarChart2, CheckCircle, TriangleAlert, FileText } from 'lucide-react';
import './Help.css';

interface Guia {
  id: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  contenido: string;
  icono: React.ReactNode;
}

const guias: Guia[] = [
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

const categorias = ['Todas', ...new Set(guias.map(g => g.categoria))];

export const Help: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [selectedGuia, setSelectedGuia] = useState<Guia | null>(null);

  const filteredGuias = guias.filter(guia => {
    const matchesSearch = guia.titulo.toLowerCase().includes(search.toLowerCase()) || 
                       guia.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchesCategoria = categoriaFilter === 'Todas' || guia.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="help-page">
      <div className="page-header">
        <div>
          <h1>Guías Educativas</h1>
          <p>Aprende sobre tus obligaciones fiscales de forma sencilla</p>
        </div>
      </div>

      <Card variant="outlined" padding="md">
        <div className="search-section">
          <div className="search-input">
            <Input
              placeholder="Buscar términos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div className="category-filters">
            {categorias.map(cat => (
              <button
                key={cat}
                className={`category-btn ${categoriaFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoriaFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="guias-grid">
        {filteredGuias.map(guia => (
          <Card 
            key={guia.id} 
            variant="interactive" 
            padding="md"
            onClick={() => setSelectedGuia(guia)}
          >
            <div className="guia-card">
              <span className="guia-icono">{guia.icono}</span>
              <Badge variant={guia.categoria === 'IVA' ? 'info' : guia.categoria === 'Renta' ? 'success' : guia.categoria === 'Sanciones' ? 'danger' : 'default'}>
                {guia.categoria}
              </Badge>
              <h3>{guia.titulo}</h3>
              <p>{guia.descripcion}</p>
            </div>
          </Card>
        ))}
      </div>

      {filteredGuias.length === 0 && (
        <Card variant="outlined" padding="lg">
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>No se encontraron guías</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        </Card>
      )}

      <Modal 
        isOpen={!!selectedGuia} 
        onClose={() => setSelectedGuia(null)} 
        title={selectedGuia?.titulo || ''}
        size="lg"
      >
        {selectedGuia && (
          <div className="guia-modal">
            <div className="guia-header">
              <span className="guia-icono-large">{selectedGuia.icono}</span>
              <Badge variant={selectedGuia.categoria === 'IVA' ? 'info' : 'success'}>
                {selectedGuia.categoria}
              </Badge>
            </div>
            <div className="guia-contenido">
              <p className="guia-intro">{selectedGuia.descripcion}</p>
              <div className="guia-body">
                {selectedGuia.contenido.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>;
                  if (line.startsWith('## ')) return <h3 key={i}>{line.slice(3)}</h3>;
                  if (line.startsWith('> ')) return <blockquote key={i}>{line.slice(2)}</blockquote>;
                  if (line.startsWith('|')) return <p key={i} className="table-line">{line}</p>;
                  if (line.startsWith('```')) return null;
                  if (line.trim()) return <p key={i}>{line}</p>;
                  return <br key={i} />;
                })}
              </div>
            </div>
            <div className="guia-footer">
              <Button variant="outline" onClick={() => setSelectedGuia(null)}>
                Cerrar
              </Button>
              <a 
                href="https://www.hacienda.go.cr" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="primary">
                  Ver normativa en Hacienda
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Help;