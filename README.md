<div align="center">

# FiscalHost Inteligente CR

### Plataforma de gestión fiscal inteligente para anfitriones de alquiler vacacional en Costa Rica

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![License](https://img.shields.io/badge/Licencia-MIT-green?style=flat-square)](LICENSE)
[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-orange?style=flat-square)]()

</div>

---

## ¿Qué es FiscalHost?

FiscalHost Inteligente CR es una aplicación web diseñada para que los anfitriones de plataformas como **Airbnb**, **Booking** y **Vrbo** en Costa Rica puedan gestionar sus obligaciones tributarias de forma simple, automatizada y sin necesidad de conocimientos contables avanzados.

El sistema cubre desde el registro de ingresos hasta la generación de borradores para declarar ante la **Dirección General de Tributación (DGT)**, incluyendo cálculo de IVA, renta, mora, sanciones y más.

---

## Módulos del sistema

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Identidad y Perfil** | Registro multiformato, actividad económica, llaves .p12 |
| 💰 **Ingresos** | Importación CSV, registro manual, clasificación automática |
| 🧾 **Comprobantes** | OCR de facturas, crédito fiscal, validación de evidencia |
| 🧮 **Centro de Cálculo** | IVA D-104, renta, reconstrucción retroactiva, borradores |
| ⚖️ **Sanciones** | Autoliquidación Art. 88, mora e intereses acumulados |
| 🔔 **Alertas** | Notificaciones proactivas, calendario fiscal |
| 📊 **Reportes** | Exportación Hacienda, accesos para contador |
| 📈 **Dashboard** | Métricas en tiempo real, semáforo de riesgo fiscal |
| 🔬 **Simulador** | Escenarios fiscales basados en datos históricos |
| 📚 **Guías** | Educación tributaria interactiva |

---

## Historias de usuario implementadas

<details>
<summary><strong>MÓDULO 1 — Identidad y Perfil Tributario</strong></summary>

- **HU-001** Registro multiformato: Física, Jurídica, DIMEX, NITE
- **HU-002** Configurar actividad económica y vinculación al RUT
- **HU-003** Gestionar llaves criptográficas (.p12)

</details>

<details>
<summary><strong>MÓDULO 2 — Operación y Automatización de Ingresos</strong></summary>

- **HU-004** Importar reportes masivos de plataformas (CSV)
- **HU-005** Registrar manualmente reservas directas y gastos
- **HU-006** Clasificar automáticamente ingresos (gravados vs exentos)
- **HU-007** Registrar comprobantes con validación OCR y crédito fiscal

</details>

<details>
<summary><strong>MÓDULO 3 — Inteligencia Fiscal y Cálculo</strong></summary>

- **HU-008** Calcular IVA devengado para el Formulario D-104
- **HU-009** Calcular Renta de Capital Inmobiliario o Régimen de Utilidades
- **HU-010** Reconstruir bases imponibles retroactivas (2024-2026)
- **HU-011** Autoliquidar sanciones con reducción del 80% (Art. 88)
- **HU-012** Calcular mora e intereses acumulados

</details>

<details>
<summary><strong>MÓDULO 4 — Prevención y Cumplimiento</strong></summary>

- **HU-013** Recibir alertas proactivas para evitar declaraciones extemporáneas
- **HU-014** Generar borradores listos para OVi (D-104, D-125, D-176)
- **HU-015** Exportar datos en formatos compatibles con Hacienda
- **HU-016** Autorizar contador de forma segura vía OVi

</details>

<details>
<summary><strong>MÓDULO 5 — Analítica e Inteligencia de Negocio</strong></summary>

- **HU-017** Dashboard en tiempo real con métricas fiscales clave
- **HU-018** Simular escenarios fiscales basados en datos históricos
- **HU-019** Acceder a guías educativas interactivas
- **HU-020** Registrar todos los cambios en un log inalterable

</details>

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | Framework de UI |
| TypeScript | 6.0 | Tipado estático |
| Vite | 8.0 | Bundler y servidor de desarrollo |
| React Router DOM | 7 | Navegación entre páginas |
| Lucide React | 1.8 | Librería de íconos |
| CSS Variables | — | Sistema de diseño |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── common/
│   └── layout/
├── pages/
│   ├── Login.tsx
│   ├── Registro.tsx
│   ├── Dashboard.tsx
│   ├── Ingresos.tsx
│   ├── Comprobantes.tsx
│   ├── Impuestos.tsx
│   ├── Autoliquidacion.tsx
│   ├── Mora.tsx
│   ├── Alertas.tsx
│   ├── Reportes.tsx
│   ├── Simulador.tsx
│   ├── Help.tsx
│   └── Configuracion.tsx
├── styles/
│   ├── variables.css
│   ├── reset.css
│   └── global.css
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Manual de uso

### Requisitos previos

- [Node.js](https://nodejs.org) versión **18 o superior**
- [npm](https://www.npmjs.com) versión **9 o superior**
- [Git](https://git-scm.com)

Verifica las versiones con:

```bash
node --version
npm --version
git --version
```

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/Acevedo26/Frontend-Fiscalhost-Inteligente-CR.git
cd Frontend-Fiscalhost-Inteligente-CR
```

---

### 2. Instalar dependencias

```bash
npm install
```

---

### 3. Correr en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

El servidor tiene **Hot Module Replacement (HMR)** activo, los cambios se reflejan en tiempo real sin recargar la página.

---

### 4. Compilar para producción

```bash
npm run build
```

Los archivos compilados se generan en la carpeta `dist/`.

---

### 5. Previsualizar el build de producción

```bash
npm run preview
```

```
http://localhost:4173
```

---

### 6. Ejecutar el linter

```bash
npm run lint
```

---

### Resumen de comandos

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala todas las dependencias |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila el proyecto para producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta el linter ESLint |

---

### Navegación del sistema

| Ruta | Página |
|------|--------|
| `/login` | Inicio de sesión |
| `/register` | Registro de cuenta |
| `/` | Dashboard principal |
| `/ingresos` | Gestión de ingresos y gastos |
| `/comprobantes` | Comprobantes con OCR |
| `/impuestos` | Centro de cálculo fiscal |
| `/autoliquidacion` | Autoliquidación de sanciones |
| `/mora` | Mora e intereses |
| `/alertas` | Alertas y calendario fiscal |
| `/reportes` | Reportes y exportación |
| `/simulador` | Simulador de escenarios |
| `/help` | Guías educativas |
| `/configuracion` | Configuración y seguridad |

---

### Credenciales de prueba

El sistema usa datos mock. Para ingresar usa cualquier correo y contraseña, o el botón **Continuar con Google**.

---

## Control de versiones

```
main            ← producción estable
develop         ← integración
feature/HU-XXX  ← desarrollo por historia de usuario
```

Cada commit sigue el estándar [Conventional Commits](https://www.conventionalcommits.org):

```
feat: HU-001 - descripción corta

Descripción detallada de los cambios.

Closes #1
```

---

## Contribuir

```bash
# 1. Crear rama desde develop
git checkout develop
git checkout -b feature/HU-XXX-nombre

# 2. Hacer cambios y commit
git add .
git commit -m "feat: HU-XXX - descripción"

# 3. Subir y abrir PR hacia develop
git push origin feature/HU-XXX-nombre
```

---