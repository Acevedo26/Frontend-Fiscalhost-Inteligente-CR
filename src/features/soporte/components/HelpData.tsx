import React from 'react';
import {
  DollarSign,
  TrendingDown,
  BarChart2,
  CheckCircle,
  TriangleAlert,
  FileText,
  LogIn,
  User,
  Plus,
  Calculator,
  Bell,
  BookOpen,
  Shield,
} from 'lucide-react';

export type FasePedagogica = 'contexto' | 'demostracion' | 'practica' | 'comprobacion';

export interface PasoGuia {
  id: string;
  titulo: string;
  fase: FasePedagogica;
  indicacion: string;
  explicacion?: string;
  accion: string;
  resultadoEsperado: string;
  ejemplo?: string;
}

export interface PreguntaComprobacion {
  id: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion: string;
}

export interface Guia {
  id: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  /** Contenido Markdown estático (solo para guías sin recorrido de pasos). */
  contenido?: string;
  icono: React.ReactNode;
  /** Recorrido interactivo paso a paso (Opción 3). */
  pasos?: PasoGuia[];
  /** Pregunta(s) de comprobación al finalizar la guía. */
  preguntasComprobacion?: PreguntaComprobacion[];
  /** Cuando la función aún no está habilitada y la guía es solo demostrativa. */
  esDemo?: boolean;
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

- Si tus ingresos por alquiler superan los ₡4.200.000 al año (₡350.000/mes), debes cobrar IVA.
- La tasa general es del 13%.
- El IVA se calcula sobre el monto del alquiler sin incluir servicios adicionales.

## Ejemplo práctico

| Concepto | Monto |
| --- | --- |
| Alquiler noche | ₡50.000 |
| IVA 13% | ₡6.500 |
| **Total** | **₡56.500** |

## Deducciones

Puedes descontar el IVA de tus gastos operativos (limpieza, mantenimiento, servicios) de lo que debes pagar a Hacienda.

> Ejemplo: Si pagaste ₡15.000 en limpieza y cobras ₡6.500 de IVA, solo debes pagar ₡6.500 - ₡1.950 = ₡4.550`,
  },
  {
    id: 'credito-fiscal',
    titulo: 'Crédito Fiscal',
    categoria: 'IVA',
    descripcion: 'Aprende a reducir tu IVA a pagar usando el crédito fiscal de tus gastos.',
    icono: <TrendingDown size={28} />,
    contenido: `# Crédito Fiscal

El crédito fiscal es el IVA que pagaste en tus gastos operativos y que puedes descontar del IVA que cobras a tus huéspedes.

## Requisitos para crédito fiscal

1. El gasto debe estar relacionado con tu actividad empresarial.
2. Debes tener el comprobante electrónico (factura).
3. El proveedor debe estar inscrito en Hacienda.

## Ejemplo

| Concepto | Monto |
| --- | --- |
| IVA cobrado a huéspedes | ₡26.000 |
| (-) IVA de limpieza | ₡1.950 |
| (-) IVA de mantenimiento | ₡1.300 |
| (-) IVA de servicios | ₡1.950 |
| **IVA a pagar** | **₡20.800** |

## Importante

- No puedes tener crédito negativo (si tus gastos superan lo que cobras, el excedente no te lo devuelven).
- Guarda todas tus facturas electrónicas`,
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

### 1. Capital Inmobiliario (12,75 %)

- Para rental de propiedades amuebladas en zonas turísticas.
- Deducción automática del 15 %.
- No requiere justificar gastos.

**Cálculo:**
\`\`\`
Ingresos anuales - Deducción 15 % = Base
Base × 12,75 % = Impuesto
\`\`\`

### 2. Régimen de Utilidades (25 %)

- Para quienes llevan contabilidad organizada.
- Se restan los gastos reales.

**Cálculo:**
\`\`\`
Ingresos anuales - Gastos reales = Utilidad
Utilidad × 25 % = Impuesto
\`\`\`

## Ejemplo

Si tus ingresos anuales son ₡3.000.000:

| Régimen | Cálculo | Impuesto |
| --- | --- | --- |
| Capital | 3.000.000 × 0,1275 × 0,85 | ₡325.125 |
| Utilidades | (3.000.000 - 600.000) × 0,25 | ₡600.000 |

> El régimen de Capital suele ser conveniente para Airbnb/Booking.`,
  },
  {
    id: 'exencion',
    titulo: 'Exención de Alquileres',
    categoria: 'Renta',
    descripcion: 'Descubre si tus alquileres están exentos del pago de renta.',
    icono: <CheckCircle size={28} />,
    contenido: `# Exención de Alquileres

En Costa Rica, algunos alquileres están exentos del pago de renta.

## Requisitos de exención

1. **Monto**: Ingresos anuales menores a ₡4.200.000.
2. **Tipo**: Alquiler de vivienda amueblada para fines vacacionales.
3. **Duración**: Alquileres menores a 90 días consecutivos.

## Límites 2026

| Ingresos anuales | Situación |
| --- | --- |
| Menos de ₡4.200.000 | Exento |
| ₡4.200.000 - ₡8.400.000 | 10 % retención |
| Más de ₡8.400.000 | Declaración normal |

## Ejemplo

Si ganas ₡3.500.000 al año:

- No declaras renta.
- Solo pagas el IVA si corresponde.

> Asegúrate de mantener registros para demostrar tus ingresos si Hacienda te lo pide.`,
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
| --- | --- |
| No declarar a tiempo | ₡100.000 + intereses |
| Declarar incorrecto | ₡50.000 |
| No llevar libros | ₡200.000 |
| No emitir facturas | ₡25.000 por documento |

## Cómo evitar sanciones

1. Declara a tiempo: Usa el calendario fiscal.
2. Guarda comprobantes: Todas las facturas.
3. Clasifica bien: ingresos y gastos por separado.
4. Usa FiscalHost: te avisa antes de vencer.

## Reducción de multas

Si regularizas antes del vencimiento:

- Multa base de ₡100.000.
- 80 % de descuento = solo ₡20.000.

> Mejor prevenir que pagar.`,
  },
  {
    id: 'facturas',
    titulo: 'Factura Electrónica',
    categoria: 'General',
    descripcion: 'Aprende cuándo y cómo emitir facturas electrónicas.',
    icono: <FileText size={28} />,
    contenido: `# Factura electrónica

Todo alquiler vacacional en Costa Rica debe emitirse con factura electrónica.

## Cuándo facturar

- Al recibir el pago del alquiler.
- Al prestar servicios adicionales (limpieza, traslado, etc.).

## Datos requeridos

1. Tu nombre/razón social y NITE.
2. Nombre del cliente.
3. Detalle del servicio.
4. Monto y IVA.
5. Fecha de emisión.

## Ejemplo de factura

\`\`\`
FISCALHOST S.A.
NITE: 3101234567

Cliente: Juan Pérez
Cédula: 1-2345-6789

Servicio: Alquiler Villa Sol (5 noches)
Monto: ₡250.000
IVA 13%: ₡32.500
---------------------------
TOTAL: ₡282.500
\`\`\`

## Herramientas

Puedes usar el sitio de Hacienda o plataformas como FiscalHost para generar facturas.`,
  },
  {
    id: 'acceso-plataforma',
    titulo: 'Acceso a la plataforma',
    categoria: 'Acceso',
    descripcion: 'Aprende a iniciar sesión, reconocer el panel principal, identificar tu rol y cerrar sesión de forma segura.',
    icono: <LogIn size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Abrir la plataforma',
        fase: 'contexto',
        indicacion: 'Ingresa a FiscalHost desde la dirección web proporcionada por el equipo del proyecto.',
        explicacion: 'Utiliza la dirección oficial. Comprueba que estás en el sitio correcto antes de introducir tus credenciales.',
        accion: 'Abrir la página de acceso.',
        resultadoEsperado: 'Se muestra la pantalla de inicio de sesión.',
      },
      {
        id: 'P2',
        titulo: 'Introducir las credenciales',
        fase: 'demostracion',
        indicacion: 'Escribe el correo electrónico y la contraseña asociados a tu cuenta.',
        explicacion: 'Las credenciales identifican al usuario y aplican los permisos de su perfil.',
        accion: 'Completar los campos y seleccionar iniciar sesión.',
        resultadoEsperado: 'El sistema valida las credenciales y permite el acceso si son correctas.',
      },
      {
        id: 'P3',
        titulo: 'Reconocer el panel principal',
        fase: 'practica',
        indicacion: 'Observa el panel principal e identifica los accesos e indicadores de tu perfil.',
        explicacion: 'El panel presenta información resumida según el rol, los datos registrados y el período seleccionado.',
        accion: 'Localizar cada sección en el menú de navegación.',
        resultadoEsperado: 'El usuario reconoce dónde encontrar las funciones principales.',
      },
      {
        id: 'P4',
        titulo: 'Identificar el rol',
        fase: 'practica',
        indicacion: 'Revisa el perfil de tu cuenta para identificar el rol asignado.',
        explicacion: 'FiscalHost tiene perfiles diferenciados: anfitrión, contador y administrador. El rol define qué puedes consultar y qué operaciones realizar.',
        accion: 'Identificar su rol y reconocer las opciones disponibles.',
        resultadoEsperado: 'El usuario comprende que no todas las cuentas tienen las mismas funciones.',
      },
      {
        id: 'P5',
        titulo: 'Cerrar sesión',
        fase: 'comprobacion',
        indicacion: 'Localiza la opción para cerrar sesión y utilízala cuando termine de trabajar.',
        explicacion: 'Cerrar sesión evita que otra persona use una cuenta abierta en un equipo compartido.',
        accion: 'Seleccionar la opción de cerrar sesión.',
        resultadoEsperado: 'La plataforma finaliza la sesión y vuelve a la pantalla de acceso.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué debes hacer antes de introducir tus credenciales?',
        opciones: [
          'Verificar que estás en la dirección oficial',
          'Compartir la contraseña con un compañero',
          'Utilizar cualquier enlace recibido',
        ],
        respuestaCorrecta: 0,
        explicacion: 'Siempre confirma que estás en la dirección oficial de FiscalHost antes de escribir tu contraseña.',
      },
    ],
  },
  {
    id: 'perfil-tributario',
    titulo: 'Configuración del perfil tributario',
    categoria: 'Perfil',
    descripcion: 'Revisa y completa los datos de tu perfil tributario para contextualizar las funciones fiscales.',
    icono: <User size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Abrir Configuración',
        fase: 'contexto',
        indicacion: 'Selecciona la sección de configuración y localiza el perfil tributario.',
        explicacion: 'Esta sección reúne los datos de configuración asociados a la cuenta o al contribuyente.',
        accion: 'Abrir la sección de configuración y localizar el perfil tributario.',
        resultadoEsperado: 'Se muestra el formulario del perfil tributario.',
      },
      {
        id: 'P2',
        titulo: 'Revisar la información existente',
        fase: 'demostracion',
        indicacion: 'Comprueba los datos que muestra el formulario.',
        explicacion: 'Revisa cada dato contra la documentación correspondiente. No des por correcto un valor solo porque ya aparezca registrado.',
        accion: 'Revisar cada campo del formulario.',
        resultadoEsperado: 'El usuario conoce qué datos están registrados.',
      },
      {
        id: 'P3',
        titulo: 'Completar o actualizar los campos permitidos',
        fase: 'practica',
        indicacion: 'Introduce o corrige la información solicitada por el sistema.',
        explicacion: 'Completa únicamente los campos que correspondan a tu situación y para los que tengas información verificada.',
        accion: 'Editar los campos permitidos del perfil tributario.',
        resultadoEsperado: 'Los campos están completos con información verificada.',
      },
      {
        id: 'P4',
        titulo: 'Guardar y verificar',
        fase: 'comprobacion',
        indicacion: 'Guarda los cambios y comprueba que la plataforma muestre la confirmación.',
        explicacion: 'La información queda guardada si supera las validaciones del sistema.',
        accion: 'Seleccionar la opción de guardar.',
        resultadoEsperado: 'La plataforma muestra una confirmación de guardado.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué debes hacer si no estás seguro de un dato tributario?',
        opciones: [
          'Inventar un valor aproximado',
          'Dejarlo como está sin revisarlo',
          'Consultar a la persona responsable antes de registrarlo',
        ],
        respuestaCorrecta: 2,
        explicacion: 'Nunca inventes valores tributarios. Consulta al responsable de contabilidad antes de registrar.',
      },
    ],
  },
  {
    id: 'consultar-ingresos-reservas',
    titulo: 'Consultar ingresos y reservas',
    categoria: 'Ingresos',
    descripcion: 'Localiza los ingresos y las reservas registrados en FiscalHost y revisa su información.',
    icono: <DollarSign size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Abrir Ingresos y reservas',
        fase: 'contexto',
        indicacion: 'Selecciona la sección correspondiente en el menú.',
        explicacion: 'Esta sección permite consultar los movimientos y reservas registrados en el sistema.',
        accion: 'Abrir la sección de ingresos y reservas.',
        resultadoEsperado: 'Se muestra la lista de movimientos y reservas.',
      },
      {
        id: 'P2',
        titulo: 'Reconocer la información de un registro',
        fase: 'demostracion',
        indicacion: 'Abre un registro de ejemplo o revisa las columnas de la lista.',
        explicacion: 'Identifica identificador, alojamiento, canal de origen, fecha, monto, estado y clasificación.',
        accion: 'Abrir el detalle de un registro.',
        resultadoEsperado: 'El usuario identifica los datos principales de un registro.',
      },
      {
        id: 'P3',
        titulo: 'Aplicar filtros',
        fase: 'practica',
        indicacion: 'Utiliza los filtros disponibles para localizar un registro por período, alojamiento, estado o criterio equivalente.',
        explicacion: 'Los filtros permiten concentrarse en un conjunto de registros sin modificar la información almacenada.',
        accion: 'Seleccionar filtros y aplicar.',
        resultadoEsperado: 'Se muestra la lista que corresponde a los criterios seleccionados.',
      },
      {
        id: 'P4',
        titulo: 'Revisar un registro',
        fase: 'comprobacion',
        indicacion: 'Abre el detalle de un registro y comprueba sus datos.',
        explicacion: 'Compara la información con el respaldo disponible.',
        accion: 'Ver el detalle de un registro seleccionado.',
        resultadoEsperado: 'El usuario verifica los datos del registro contra su respaldo.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué debes hacer antes de importar un archivo CSV?',
        opciones: [
          'Revisar encabezados, formatos y registros',
          'Cambiar el nombre de todas las columnas al azar',
          'Importarlo varias veces',
        ],
        respuestaCorrecta: 0,
        explicacion: 'Siempre revisa la estructura del archivo antes de importar para evitar errores.',
      },
    ],
  },
  {
    id: 'registro-manual-movimiento',
    titulo: 'Registrar un movimiento manualmente',
    categoria: 'Ingresos',
    descripcion: 'Registra un ingreso o gasto de forma manual cuando la función esté habilitada.',
    icono: <Plus size={28} />,
    esDemo: true,
    pasos: [
      {
        id: 'P1',
        titulo: 'Localizar la opción de registro',
        fase: 'contexto',
        indicacion: 'Abre Ingresos y reservas y selecciona la opción de crear o agregar un registro.',
        explicacion: 'Esta guía aplica si el registro manual está habilitado en la versión desplegada.',
        accion: 'Seleccionar crear/agregar registro.',
        resultadoEsperado: 'Se abre el formulario de registro.',
      },
      {
        id: 'P2',
        titulo: 'Completar los datos',
        fase: 'demostracion',
        indicacion: 'Introduce la información solicitada por el formulario.',
        explicacion: 'Selecciona el alojamiento correcto, registra la fecha, introduce el monto con el formato solicitado y completa los campos obligatorios.',
        accion: 'Rellenar el formulario de registro.',
        resultadoEsperado: 'Todos los campos obligatorios están completos.',
      },
      {
        id: 'P3',
        titulo: 'Revisar antes de guardar',
        fase: 'practica',
        indicacion: 'Comprueba todos los campos.',
        explicacion: 'Un monto, una fecha o un alojamiento incorrectos pueden afectar los reportes y las estimaciones posteriores.',
        accion: 'Revisar el formulario antes de enviar.',
        resultadoEsperado: 'El usuario confirma que los datos son correctos.',
      },
      {
        id: 'P4',
        titulo: 'Guardar y confirmar',
        fase: 'comprobacion',
        indicacion: 'Guarda el registro.',
        explicacion: 'El sistema muestra una confirmación y el movimiento aparece en la lista, si la operación fue exitosa.',
        accion: 'Seleccionar guardar.',
        resultadoEsperado: 'El movimiento aparece en la lista con una confirmación.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué debes hacer si un registro parece estar duplicado?',
        opciones: [
          'Importarlo de nuevo',
          'Ignorar la situación',
          'Comprobar los registros existentes antes de repetir la operación',
        ],
        respuestaCorrecta: 2,
        explicacion: 'Siempre verifica que el registro no exista antes de crear uno nuevo.',
      },
    ],
  },
  {
    id: 'importar-csv',
    titulo: 'Importar un archivo CSV',
    categoria: 'Ingresos',
    descripcion: 'Carga registros desde un archivo CSV siguiendo la plantilla y validaciones de la plataforma.',
    icono: <FileText size={28} />,
    esDemo: true,
    pasos: [
      {
        id: 'P1',
        titulo: 'Preparar el archivo',
        fase: 'contexto',
        indicacion: 'Localiza la plantilla o especificación de importación proporcionada por el equipo.',
        explicacion: 'Un archivo CSV organiza datos en filas y columnas. Los encabezados, formatos y valores deben coincidir con la estructura admitida.',
        accion: 'Descargar o revisar la plantilla CSV.',
        resultadoEsperado: 'El usuario conoce la estructura esperada del archivo.',
      },
      {
        id: 'P2',
        titulo: 'Revisar el contenido',
        fase: 'demostracion',
        indicacion: 'Antes de cargar el archivo, comprueba encabezados, campos requeridos, fechas, montos y posibles duplicados.',
        explicacion: 'Elimina filas vacías o registros de prueba que no correspondan.',
        accion: 'Revisar y limpiar el archivo CSV.',
        resultadoEsperado: 'El archivo está listo para importar.',
      },
      {
        id: 'P3',
        titulo: 'Seleccionar el archivo',
        fase: 'practica',
        indicacion: 'Abre la opción de importación y selecciona el archivo CSV.',
        accion: 'Seleccionar el archivo en el cuadro de diálogo.',
        resultadoEsperado: 'El archivo se carga para validación previa.',
      },
      {
        id: 'P4',
        titulo: 'Revisar la validación previa',
        fase: 'comprobacion',
        indicacion: 'Lee el resumen o los mensajes que presente la plataforma.',
        explicacion: 'La validación permite identificar problemas antes de completar la importación.',
        accion: 'Revisar mensajes de validación.',
        resultadoEsperado: 'El usuario conoce los problemas detectados, si los hay.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué debe hacerse si un registro parece estar duplicado?',
        opciones: [
          'Importarlo de nuevo',
          'Ignorar la situación',
          'Comprobar los registros existentes antes de repetir la operación',
        ],
        respuestaCorrecta: 2,
        explicacion: 'Verifica primero si el registro ya existe antes de importar nuevamente.',
      },
    ],
  },
  {
    id: 'gastos-deducibles',
    titulo: 'Consultar y revisar gastos deducibles',
    categoria: 'Gastos',
    descripcion: 'Consulta los gastos asociados a la actividad y revisa su información antes de usarlos en cálculos o reportes.',
    icono: <TrendingDown size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Abrir Gastos deducibles',
        fase: 'contexto',
        indicacion: 'Selecciona la sección de gastos.',
        accion: 'Abrir la sección de gastos.',
        resultadoEsperado: 'Se muestra el listado de gastos.',
      },
      {
        id: 'P2',
        titulo: 'Revisar el listado',
        fase: 'demostracion',
        indicacion: 'Identifica los registros disponibles y los datos que presenta cada uno.',
        explicacion: 'Fecha, descripción, monto, categoría, proveedor, estado de clasificación y documento de respaldo.',
        accion: 'Revisar la lista de gastos.',
        resultadoEsperado: 'El usuario reconoce los datos de cada gasto.',
      },
      {
        id: 'P3',
        titulo: 'Registrar o consultar un gasto',
        fase: 'practica',
        indicacion: 'Realiza la operación que permita el rol del usuario: consultar un registro o crear uno nuevo.',
        explicacion: 'Describe el gasto de forma clara, registra el monto correcto, selecciona una categoría y conserva la factura o comprobante.',
        accion: 'Consultar o crear un gasto según el rol.',
        resultadoEsperado: 'El gasto se consulta o se registra según corresponda.',
      },
      {
        id: 'P4',
        titulo: 'Revisar la clasificación',
        fase: 'comprobacion',
        indicacion: 'Verifica que la categoría del gasto sea la correcta.',
        explicacion: 'La categoría ayuda a organizar, pero no confirma por sí sola que el gasto sea fiscalmente deducible.',
        accion: 'Revisar la categoría asignada.',
        resultadoEsperado: 'El usuario confirma o corrige la clasificación.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿La categoría de un gasto confirma automáticamente que sea deducible?',
        opciones: ['Sí', 'No; debe verificarse conforme a las reglas aplicables'],
        respuestaCorrecta: 1,
        explicacion: 'La categoría organiza el gasto, pero la deducibilidad depende de las reglas tributarias aplicables.',
      },
    ],
  },
  {
    id: 'calculo-fiscal',
    titulo: 'Consultar el cálculo fiscal',
    categoria: 'Fiscal',
    descripcion: 'Consulta las estimaciones fiscales de IVA y renta y reconoce qué información revisar antes de usar los resultados.',
    icono: <Calculator size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Abrir Cálculo fiscal',
        fase: 'contexto',
        indicacion: 'Selecciona la sección correspondiente.',
        accion: 'Abrir la sección de cálculo fiscal.',
        resultadoEsperado: 'Se muestra la sección de cálculo fiscal.',
      },
      {
        id: 'P2',
        titulo: 'Seleccionar o identificar el período',
        fase: 'demostracion',
        indicacion: 'Revisa el período que se muestra o selecciona el período disponible.',
        explicacion: 'Los resultados deben interpretarse en relación con el período al que pertenecen.',
        accion: 'Seleccionar el período fiscal.',
        resultadoEsperado: 'El período está identificado correctamente.',
      },
      {
        id: 'P3',
        titulo: 'Identificar los resultados',
        fase: 'practica',
        indicacion: 'Localiza los indicadores de IVA y renta que presente la plataforma.',
        explicacion: 'Los indicadores resumen resultados calculados por el sistema.',
        accion: 'Revisar los indicadores mostrados.',
        resultadoEsperado: 'El usuario identifica los resultados de IVA y renta.',
      },
      {
        id: 'P4',
        titulo: 'Revisar los datos de origen',
        fase: 'comprobacion',
        indicacion: 'Comprueba que los ingresos, reservas y gastos del período estén registrados y clasificados.',
        explicacion: 'Antes de interpretar un resultado, verifica la integridad de los movimientos.',
        accion: 'Revisar los registros del período.',
        resultadoEsperado: 'El usuario confirma que los datos de origen están completos.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué representa una estimación fiscal?',
        opciones: [
          'Una declaración oficial presentada automáticamente',
          'Un resultado orientativo basado en los datos y reglas disponibles',
          'Una garantía de que no existen obligaciones pendientes',
        ],
        respuestaCorrecta: 1,
        explicacion: 'La estimación es una herramienta de apoyo, no una declaración oficial.',
      },
    ],
  },
  {
    id: 'comprender-alertas',
    titulo: 'Comprender las alertas',
    categoria: 'Fiscal',
    descripcion: 'Consulta las alertas y determina qué acción corresponde a cada una.',
    icono: <Bell size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Abrir Alertas y calendario',
        fase: 'contexto',
        indicacion: 'Selecciona la sección de alertas.',
        accion: 'Abrir la sección de alertas.',
        resultadoEsperado: 'Se muestra el listado de alertas.',
      },
      {
        id: 'P2',
        titulo: 'Leer cada alerta',
        fase: 'demostracion',
        indicacion: 'Abre o revisa el detalle de las notificaciones.',
        explicacion: 'Ejemplos: movimientos pendientes de clasificación, borrador de período, perfil incompleto, próximos vencimientos.',
        accion: 'Leer las alertas mostradas.',
        resultadoEsperado: 'El usuario identifica cada alerta.',
      },
      {
        id: 'P3',
        titulo: 'Determinar la acción necesaria',
        fase: 'practica',
        indicacion: 'Según el tipo de alerta, define la acción recomendada.',
        explicacion: 'Movimiento pendiente → revisar y clasificar. Perfil incompleto → actualizar datos. Borrador disponible → consultar contenido. Próximo vencimiento → verificar en fuente oficial.',
        accion: 'Determinar la acción para cada alerta.',
        resultadoEsperado: 'El usuario sabe qué acción tomar por alerta.',
      },
      {
        id: 'P4',
        titulo: 'Revisar el calendario y dar seguimiento',
        fase: 'comprobacion',
        indicacion: 'Consulta las fechas presentadas y vuelve a revisar las alertas después de atender la situación.',
        explicacion: 'El calendario facilita el seguimiento, pero el usuario debe verificar los vencimientos oficiales.',
        accion: 'Revisar el calendario y reconsultar las alertas.',
        resultadoEsperado: 'El usuario confirma que la situación fue atendida.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué debes hacer ante una duda sobre un vencimiento tributario?',
        opciones: [
          'Confiar únicamente en la alerta',
          'Ignorarla',
          'Verificar la fecha en la fuente oficial y consultar al responsable correspondiente',
        ],
        respuestaCorrecta: 2,
        explicacion: 'Siempre verifica vencimientos en fuentes oficiales antes de actuar.',
      },
    ],
  },
  {
    id: 'consultar-reportes',
    titulo: 'Consultar reportes',
    categoria: 'Reportes',
    descripcion: 'Localiza los reportes disponibles, selecciona criterios y verifica su contenido.',
    icono: <BarChart2 size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Abrir Reportes',
        fase: 'contexto',
        indicacion: 'Selecciona la sección de reportes desde el menú principal.',
        accion: 'Abrir la sección de reportes.',
        resultadoEsperado: 'Se muestra la sección de reportes.',
      },
      {
        id: 'P2',
        titulo: 'Identificar los reportes disponibles',
        fase: 'demostracion',
        indicacion: 'Revisa los tipos de reporte que muestra la plataforma.',
        explicacion: 'Pueden incluir resumen de ingresos, información de reservas, resumen de gastos y reportes por período.',
        accion: 'Revisar los reportes listados.',
        resultadoEsperado: 'El usuario conoce los reportes disponibles.',
      },
      {
        id: 'P3',
        titulo: 'Seleccionar los criterios',
        fase: 'practica',
        indicacion: 'Selecciona el período, categoría o filtro disponible.',
        explicacion: 'Los criterios determinan qué registros se incluyen en el reporte.',
        accion: 'Seleccionar criterios de consulta.',
        resultadoEsperado: 'Los criterios están seleccionados.',
      },
      {
        id: 'P4',
        titulo: 'Generar, visualizar y revisar el reporte',
        fase: 'comprobacion',
        indicacion: 'Utiliza la opción para consultar o generar el reporte y comprueba que el período y los montos sean correctos.',
        explicacion: 'La plataforma presenta la información que corresponde a los criterios seleccionados.',
        accion: 'Generar el reporte y revisar su contenido.',
        resultadoEsperado: 'El usuario verifica la corrección del reporte.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué debe verificarse antes de exportar un reporte?',
        opciones: [
          'El período y los datos incluidos',
          'Únicamente el nombre del archivo',
          'Nada, porque todos los reportes son correctos automáticamente',
        ],
        respuestaCorrecta: 0,
        explicacion: 'Siempre verifica el período y los datos antes de exportar o compartir.',
      },
    ],
  },
  {
    id: 'centro-de-guias',
    titulo: 'Utilizar el centro de guías',
    categoria: 'Ayuda',
    descripcion: 'Abre la sección Guías o Ayuda y vuelve a consultar los recorridos cuando lo necesites.',
    icono: <BookOpen size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Abrir la sección Guías',
        fase: 'contexto',
        indicacion: 'Abre la sección Guías o Ayuda.',
        explicacion: 'Este espacio reúne las instrucciones para realizar las tareas principales de FiscalHost.',
        accion: 'Abrir el centro de guías.',
        resultadoEsperado: 'Se muestra el centro de guías.',
      },
      {
        id: 'P2',
        titulo: 'Buscar la guía relacionada',
        fase: 'demostracion',
        indicacion: 'Busca la guía relacionada con la tarea que desees realizar.',
        explicacion: 'Sigue los pasos en el orden indicado y lee los mensajes y advertencias antes de confirmar operaciones.',
        accion: 'Seleccionar una guía del catálogo.',
        resultadoEsperado: 'El usuario encuentra la guía pertinente.',
      },
      {
        id: 'P3',
        titulo: 'Repetir la guía si es necesario',
        fase: 'practica',
        indicacion: 'Repite la guía si no recuerdas el procedimiento.',
        accion: 'Volver a iniciar la guía.',
        resultadoEsperado: 'El usuario refuerza su aprendizaje.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Qué debes hacer si una guía no coincide con la interfaz?',
        opciones: [
          'Continuar suponiendo que los pasos son correctos',
          'Comunicar la diferencia al equipo responsable',
          'Modificar datos para encontrar la opción',
        ],
        respuestaCorrecta: 1,
        explicacion: 'Si hay una diferencia entre la guía y la interfaz, avisa al equipo del proyecto.',
      },
    ],
  },
  {
    id: 'seguridad-buenas-practicas',
    titulo: 'Seguridad y buenas prácticas',
    categoria: 'Seguridad',
    descripcion: 'Aplica medidas de protección de credenciales, manejo de información, uso de permisos e información fiscal.',
    icono: <Shield size={28} />,
    esDemo: false,
    pasos: [
      {
        id: 'P1',
        titulo: 'Protección de credenciales',
        fase: 'contexto',
        indicacion: 'No compartas la contraseña ni dejes la sesión abierta en equipos compartidos.',
        explicacion: 'Cierra sesión al terminar y reporta cualquier uso no autorizado.',
        accion: 'Revisar las medidas de protección.',
        resultadoEsperado: 'El usuario conoce las medidas de protección de credenciales.',
      },
      {
        id: 'P2',
        titulo: 'Manejo de información',
        fase: 'demostracion',
        indicacion: 'Registra datos completos y correctos, revisa antes de guardar y conserva los respaldos.',
        explicacion: 'No dupliques registros deliberadamente y comparte reportes solo con personas autorizadas.',
        accion: 'Aplicar buenas prácticas de manejo de datos.',
        resultadoEsperado: 'El usuario aplica buenas prácticas de información.',
      },
      {
        id: 'P3',
        titulo: 'Uso de permisos',
        fase: 'practica',
        indicacion: 'Utiliza únicamente las funciones permitidas por el rol asignado.',
        explicacion: 'No intentes acceder a información que no corresponda a tu perfil.',
        accion: 'Revisar los permisos de su rol.',
        resultadoEsperado: 'El usuario respeta los límites de su rol.',
      },
      {
        id: 'P4',
        titulo: 'Uso de la información fiscal',
        fase: 'comprobacion',
        indicacion: 'No interpretes una estimación como una declaración oficial y verifica obligaciones en fuentes oficiales.',
        accion: 'Revisar el uso adecuado de la información fiscal.',
        resultadoEsperado: 'El usuario distingue estimación de declaración oficial.',
      },
    ],
    preguntasComprobacion: [
      {
        id: 'C1',
        pregunta: '¿Quién debe recibir un reporte con información financiera?',
        opciones: [
          'Cualquier persona que lo solicite',
          'Únicamente personas autorizadas',
          'Cualquier contacto externo',
        ],
        respuestaCorrecta: 1,
        explicacion: 'Los reportes financieros solo deben compartirse con personas autorizadas.',
      },
    ],
  },
];
