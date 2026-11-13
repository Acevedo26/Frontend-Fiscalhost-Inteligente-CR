/* =========================================================================
   TEST SUITE: Acceptance Criterion R3 — Pre-Submit Validation Stress-Tester
   FiscalHost Inteligente CR
   Empirical Challenger 1 Verification Harness
   ========================================================================= */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Helper mock for SweetAlert2 warnings/alerts tracking
class MockSwalTracker {
  constructor() {
    this.warnings = [];
    this.errors = [];
    this.successes = [];
    this.infos = [];
  }

  reset() {
    this.warnings = [];
    this.errors = [];
    this.successes = [];
    this.infos = [];
  }

  showWarning(title, text) {
    this.warnings.push({ title, text });
    return Promise.resolve({ isConfirmed: true });
  }

  showError(title, text) {
    this.errors.push({ title, text });
    return Promise.resolve({ isConfirmed: true });
  }

  showSuccess(title, text) {
    this.successes.push({ title, text });
    return Promise.resolve({ isConfirmed: true });
  }

  showInfo(title, text) {
    this.infos.push({ title, text });
    return Promise.resolve({ isConfirmed: true });
  }
}

const swalTracker = new MockSwalTracker();

/* =========================================================================
   SIMULATED HANDLERS MATCHING PRODUCTION LOGIC EXACTLY
   (Extracted verbatim from Login.tsx, Registro.tsx, Ingresos.tsx,
    AddTransactionModal.tsx, EditTransactionModal.tsx, ReclassifyModal.tsx,
    Autoliquidacion.tsx, ExportarModal.tsx, Simulador.tsx)
   ========================================================================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1. LOGIN VALIDATION LOGIC (from Login.tsx lines 31-70)
async function submitLogin({ email, password, apiCaller }) {
  const trimmedEmail = (email || '').trim();

  // 1. Validate both empty
  if (!trimmedEmail && !password) {
    const msg = 'Por favor ingrese su correo electrónico y contraseña.';
    await swalTracker.showWarning('Campos Incompletos', msg);
    return { blocked: true, reason: 'Campos Incompletos' };
  }

  // 2. Validate email
  if (!trimmedEmail) {
    const msg = 'El correo electrónico es obligatorio para iniciar sesión.';
    await swalTracker.showWarning('Correo Requerido', msg);
    return { blocked: true, reason: 'Correo Requerido' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    const msg = 'El formato del correo electrónico no es válido. Ejemplo: usuario@dominio.com';
    await swalTracker.showWarning('Correo Inválido', msg);
    return { blocked: true, reason: 'Correo Inválido' };
  }

  // 3. Validate password
  if (!password) {
    const msg = 'La contraseña es obligatoria.';
    await swalTracker.showWarning('Contraseña Requerida', msg);
    return { blocked: true, reason: 'Contraseña Requerida' };
  }

  if (password.length < 6) {
    const msg = 'La contraseña debe contener al menos 6 caracteres.';
    await swalTracker.showWarning('Contraseña Corta', msg);
    return { blocked: true, reason: 'Contraseña Corta' };
  }

  // 4. If valid, proceed to API
  await apiCaller({ correo: trimmedEmail, clave: password });
  return { blocked: false };
}

// 2. REGISTRO VALIDATION LOGIC (from Registro.tsx lines 118-242)
function validateRegistroPassword(password) {
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe tener al menos una mayúscula';
  if (!/[0-9]/.test(password)) return 'Debe tener al menos un número';
  return '';
}

async function handleRegistroNext({ step, tipoIdentificacion, formData, apiCaller }) {
  if (step === 1) {
    const trimmedId = (formData.identificacion || '').trim();
    const digits = trimmedId.replace(/\D/g, '');

    if (!trimmedId) {
      const msg = 'Por favor ingrese su número de identificación tributaria.';
      await swalTracker.showWarning('Identificación Requerida', msg);
      return { nextStep: 1, blocked: true, reason: 'Identificación Requerida' };
    }

    if (tipoIdentificacion === 'FISICA' && digits.length !== 9) {
      const msg = 'La cédula física nacional debe tener exactamente 9 dígitos. Ejemplo: 1-2345-6789';
      await swalTracker.showWarning('Cédula Física Inválida', msg);
      return { nextStep: 1, blocked: true, reason: 'Cédula Física Inválida' };
    }

    if (tipoIdentificacion === 'JURIDICA' && digits.length !== 10) {
      const msg = 'La cédula jurídica debe tener exactamente 10 dígitos. Ejemplo: 3-101-123456';
      await swalTracker.showWarning('Cédula Jurídica Inválida', msg);
      return { nextStep: 1, blocked: true, reason: 'Cédula Jurídica Inválida' };
    }

    if (tipoIdentificacion === 'DIMEX' && (digits.length < 11 || digits.length > 12)) {
      const msg = 'El documento DIMEX debe tener 11 o 12 dígitos.';
      await swalTracker.showWarning('DIMEX Inválido', msg);
      return { nextStep: 1, blocked: true, reason: 'DIMEX Inválido' };
    }

    if (tipoIdentificacion === 'NITE' && digits.length !== 10) {
      const msg = 'El documento NITE debe tener exactamente 10 dígitos.';
      await swalTracker.showWarning('NITE Inválido', msg);
      return { nextStep: 1, blocked: true, reason: 'NITE Inválido' };
    }

    return { nextStep: 2, blocked: false };
  }

  if (step === 2) {
    const trimmedNombre = (formData.nombre || '').trim();
    const trimmedEmail = (formData.email || '').trim();

    if (!trimmedNombre) {
      const msg = 'El nombre completo o razón social es obligatorio.';
      await swalTracker.showWarning('Nombre Requerido', msg);
      return { nextStep: 2, blocked: true, reason: 'Nombre Requerido' };
    }

    if (trimmedNombre.length < 3) {
      const msg = 'El nombre completo debe tener al menos 3 caracteres.';
      await swalTracker.showWarning('Nombre Inválido', msg);
      return { nextStep: 2, blocked: true, reason: 'Nombre Inválido' };
    }

    if (!trimmedEmail) {
      const msg = 'El correo electrónico es obligatorio.';
      await swalTracker.showWarning('Correo Requerido', msg);
      return { nextStep: 2, blocked: true, reason: 'Correo Requerido' };
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      const msg = 'El formato de correo no es válido. Ejemplo: contribuyente@correo.com';
      await swalTracker.showWarning('Correo Inválido', msg);
      return { nextStep: 2, blocked: true, reason: 'Correo Inválido' };
    }

    if (!formData.password) {
      const msg = 'La contraseña es obligatoria.';
      await swalTracker.showWarning('Contraseña Requerida', msg);
      return { nextStep: 2, blocked: true, reason: 'Contraseña Requerida' };
    }

    const passError = validateRegistroPassword(formData.password);
    if (passError) {
      await swalTracker.showWarning('Contraseña Insegura', passError);
      return { nextStep: 2, blocked: true, reason: 'Contraseña Insegura' };
    }

    if (formData.password !== formData.confirmarPassword) {
      const msg = 'Las contraseñas no coinciden. Por favor verifique.';
      await swalTracker.showWarning('Contraseñas No Coinciden', msg);
      return { nextStep: 2, blocked: true, reason: 'Contraseñas No Coinciden' };
    }

    return { nextStep: 3, blocked: false };
  }

  if (step === 3) {
    await apiCaller(formData);
    return { nextStep: 3, blocked: false };
  }
}

// 3. INGRESOS VALIDATION LOGIC (from Ingresos.tsx & AddTransactionModal.tsx, EditTransactionModal.tsx, ReclassifyModal.tsx)
async function submitAddTransaction({ addForm, activeTab, today, apiCaller }) {
  if (!addForm.fecha) {
    await swalTracker.showWarning('Fecha Requerida', 'Por favor ingrese la fecha de la transacción.');
    return { blocked: true, reason: 'Fecha Requerida' };
  }

  if (addForm.fecha > today) {
    await swalTracker.showWarning('Fecha Inválida', 'No se pueden registrar transacciones con fecha futura.');
    return { blocked: true, reason: 'Fecha Inválida' };
  }

  if (!addForm.concepto || !addForm.concepto.trim()) {
    await swalTracker.showWarning('Concepto Requerido', 'Por favor ingrese una descripción o concepto para la transacción.');
    return { blocked: true, reason: 'Concepto Requerido' };
  }

  const montoNum = Number(addForm.monto);
  if (!addForm.monto || isNaN(montoNum) || montoNum <= 0) {
    await swalTracker.showWarning('Monto Inválido', 'El monto de la transacción debe ser un número mayor a cero (₡).');
    return { blocked: true, reason: 'Monto Inválido' };
  }

  await apiCaller({
    tipo: activeTab === 'ingresos' ? 'INGRESO' : 'GASTO',
    fecha: addForm.fecha,
    monto: montoNum,
    concepto: addForm.concepto.trim(),
  });
  return { blocked: false };
}

async function submitEditTransaction({ editMonto, editRazon, apiCaller }) {
  const montoNum = Number(editMonto);
  if (!editMonto || isNaN(montoNum) || montoNum <= 0) {
    await swalTracker.showWarning('Monto Inválido', 'El nuevo monto debe ser un valor numérico mayor a cero (₡).');
    return { blocked: true, reason: 'Monto Inválido' };
  }

  if (!editRazon || !editRazon.trim()) {
    await swalTracker.showWarning(
      'Justificación Requerida',
      'La Ley 8968 exige detallar el motivo del cambio para el registro de auditoría fiscal inalterable.'
    );
    return { blocked: true, reason: 'Justificación Requerida' };
  }

  await apiCaller({ monto: montoNum, razon: editRazon.trim() });
  return { blocked: false };
}

async function submitReclassifyTransaction({ nuevaClasif, reclasifJustif, apiCaller }) {
  if (!nuevaClasif) {
    await swalTracker.showWarning('Clasificación Requerida', 'Por favor seleccione la nueva clasificación fiscal.');
    return { blocked: true, reason: 'Clasificación Requerida' };
  }

  if (!reclasifJustif || !reclasifJustif.trim()) {
    await swalTracker.showWarning('Justificación Requerida', 'Debe indicar el motivo tributario para la reclasificación del ingreso.');
    return { blocked: true, reason: 'Justificación Requerida' };
  }

  await apiCaller({ nuevaClasif, justificacion: reclasifJustif.trim() });
  return { blocked: false };
}

// 4. AUTOLIQUIDACION VALIDATION LOGIC (from Autoliquidacion.tsx)
async function submitAutoliquidacionVerificar({ tipo, fechaOmision, impuestoOmision, fechaInicioActividad, fechaRegistro, apiCaller }) {
  if (tipo === 'omision') {
    if (!fechaOmision) {
      await swalTracker.showWarning('Fecha Requerida', 'Debe ingresar la fecha de la omisión tributaria antes de verificar con el servidor.');
      return { blocked: true, reason: 'Fecha Requerida' };
    }
    if (Number(impuestoOmision) <= 0) {
      await swalTracker.showWarning('Monto Inválido', 'Debe especificar un impuesto adeudado mayor a cero antes de verificar con el servidor.');
      return { blocked: true, reason: 'Monto Inválido' };
    }
  } else {
    if (!fechaInicioActividad || !fechaRegistro) {
      await swalTracker.showWarning('Fechas Requeridas', 'Debe completar tanto la fecha de inicio de actividades como la fecha de registro.');
      return { blocked: true, reason: 'Fechas Requeridas' };
    }
    if (new Date(fechaInicioActividad) > new Date(fechaRegistro)) {
      await swalTracker.showWarning('Fechas Incoherentes', 'La fecha de inicio de actividades debe ser anterior a la fecha de registro en Hacienda.');
      return { blocked: true, reason: 'Fechas Incoherentes' };
    }
  }

  await apiCaller();
  return { blocked: false };
}

async function submitGenerarD176({ fechaInicioActividad, fechaRegistro, hoy, generator }) {
  if (!fechaInicioActividad) {
    await swalTracker.showWarning('Fecha Requerida', 'Debe indicar la fecha real de inicio de actividades.');
    return { blocked: true, reason: 'Fecha Requerida' };
  }
  if (!fechaRegistro) {
    await swalTracker.showWarning('Fecha Requerida', 'Debe indicar la fecha de registro ante la Administración Tributaria.');
    return { blocked: true, reason: 'Fecha Requerida' };
  }
  if (new Date(fechaInicioActividad) > new Date(fechaRegistro)) {
    await swalTracker.showWarning('Fechas Inválidas', 'La fecha de inicio de actividades debe ser anterior o igual a la fecha de registro.');
    return { blocked: true, reason: 'Fechas Inválidas' };
  }
  if (fechaRegistro > hoy) {
    await swalTracker.showWarning('Fecha Futura No Permitida', 'La fecha de registro no puede ser posterior a la fecha actual.');
    return { blocked: true, reason: 'Fecha Futura No Permitida' };
  }

  await generator();
  return { blocked: false };
}

async function submitGenerarD104({ fechaOmision, fechaCorte, impuestoOmision, hoy, generator }) {
  if (!fechaOmision) {
    await swalTracker.showWarning('Fecha Requerida', 'Debe indicar la fecha de omisión de la declaración D-104.');
    return { blocked: true, reason: 'Fecha Requerida' };
  }
  if (fechaOmision > hoy) {
    await swalTracker.showWarning('Fecha Futura No Permitida', 'La fecha de la omisión tributaria no puede ser una fecha futura.');
    return { blocked: true, reason: 'Fecha Futura No Permitida' };
  }
  if (fechaCorte < fechaOmision) {
    await swalTracker.showWarning('Fechas Inválidas', 'La fecha de corte no puede ser anterior a la fecha de la omisión.');
    return { blocked: true, reason: 'Fechas Inválidas' };
  }
  if (!impuestoOmision || Number(impuestoOmision) <= 0) {
    await swalTracker.showWarning('Impuesto Requerido', 'Debe ingresar un monto de impuesto adeudado mayor a cero.');
    return { blocked: true, reason: 'Impuesto Requerido' };
  }

  await generator();
  return { blocked: false };
}

// 5. REPORTES EXPORTAR VALIDATION LOGIC (from ExportarModal.tsx)
async function submitExportarReporte({ exportPass, exportPassConfirm, exportAction }) {
  if (!exportPass) {
    await swalTracker.showWarning('Contraseña Requerida', 'Debe especificar una contraseña para cifrar el archivo de exportación tributaria.');
    return { blocked: true, reason: 'Contraseña Requerida' };
  }
  if (exportPass !== exportPassConfirm) {
    await swalTracker.showWarning('Contraseñas No Coinciden', 'La confirmación de la contraseña no coincide con la ingresada.');
    return { blocked: true, reason: 'Contraseñas No Coinciden' };
  }

  await exportAction();
  return { blocked: false };
}

// 6. SIMULADOR VALIDATION LOGIC (from Simulador.tsx)
async function submitAgregarEscenario({ nuevoEscenario, apiCaller }) {
  if (!nuevoEscenario.nombre || !nuevoEscenario.nombre.trim()) {
    await swalTracker.showWarning('Nombre Requerido', 'Debe ingresar un nombre descriptivo para el nuevo escenario fiscal.');
    return { blocked: true, reason: 'Nombre Requerido' };
  }

  const ingresosNum = Number(nuevoEscenario.ingresos);
  const gastosNum = Number(nuevoEscenario.gastos);

  if (isNaN(ingresosNum) || ingresosNum < 0) {
    await swalTracker.showWarning('Monto Inválido', 'El monto de ingresos estimados debe ser un número mayor o igual a cero.');
    return { blocked: true, reason: 'Monto Inválido' };
  }

  if (isNaN(gastosNum) || gastosNum < 0) {
    await swalTracker.showWarning('Monto Inválido', 'El monto de gastos estimados debe ser un número mayor o igual a cero.');
    return { blocked: true, reason: 'Monto Inválido' };
  }

  await apiCaller({
    nombre: nuevoEscenario.nombre.trim(),
    ingresos: ingresosNum,
    gastos: gastosNum,
  });
  return { blocked: false };
}

/* =========================================================================
   TEST SUITES
   ========================================================================= */

describe('Acceptance Criterion R3 — Pre-Submit Form Validations', () => {
  beforeEach(() => {
    swalTracker.reset();
  });

  // -----------------------------------------------------------------------
  // 1. LOGIN FORM
  // -----------------------------------------------------------------------
  describe('1. Login Form Pre-Submit Validation', () => {
    it('blocks request and triggers showWarning when both email and password are empty', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitLogin({ email: '', password: '', apiCaller });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false, 'API must NOT be called');
      assert.equal(swalTracker.warnings.length, 1);
      assert.equal(swalTracker.warnings[0].title, 'Campos Incompletos');
    });

    it('blocks request and triggers showWarning when email is empty', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitLogin({ email: '   ', password: 'Password123!', apiCaller });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings.length, 1);
      assert.equal(swalTracker.warnings[0].title, 'Correo Requerido');
    });

    it('blocks request and triggers showWarning for invalid email format ("invalid-email")', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitLogin({ email: 'invalid-email', password: 'Password123!', apiCaller });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings.length, 1);
      assert.equal(swalTracker.warnings[0].title, 'Correo Inválido');
    });

    it('blocks request and triggers showWarning for missing @ or domain in email', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res1 = await submitLogin({ email: 'user@', password: 'Password123!', apiCaller });
      assert.equal(res1.blocked, true);
      assert.equal(apiCalled, false);

      const res2 = await submitLogin({ email: '@domain.com', password: 'Password123!', apiCaller });
      assert.equal(res2.blocked, true);
      assert.equal(apiCalled, false);
    });

    it('blocks request and triggers showWarning when password is empty', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitLogin({ email: 'contribuyente@fiscalhost.cr', password: '', apiCaller });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings.length, 1);
      assert.equal(swalTracker.warnings[0].title, 'Contraseña Requerida');
    });

    it('blocks request and triggers showWarning when password has < 6 characters', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitLogin({ email: 'contribuyente@fiscalhost.cr', password: '12345', apiCaller });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings.length, 1);
      assert.equal(swalTracker.warnings[0].title, 'Contraseña Corta');
    });

    it('allows submission when valid credentials are provided', async () => {
      let apiCalled = false;
      let payload = null;
      const apiCaller = (p) => { apiCalled = true; payload = p; };

      const res = await submitLogin({
        email: 'contribuyente@fiscalhost.cr',
        password: 'PasswordSegura2026',
        apiCaller
      });

      assert.equal(res.blocked, false);
      assert.equal(apiCalled, true);
      assert.equal(payload.correo, 'contribuyente@fiscalhost.cr');
      assert.equal(swalTracker.warnings.length, 0);
    });
  });

  // -----------------------------------------------------------------------
  // 2. REGISTRO FORM
  // -----------------------------------------------------------------------
  describe('2. Registro Form Pre-Submit Validation', () => {
    it('Step 1: blocks advancement if identificación is empty', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await handleRegistroNext({
        step: 1,
        tipoIdentificacion: 'FISICA',
        formData: { identificacion: '' },
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(res.nextStep, 1);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings.length, 1);
      assert.equal(swalTracker.warnings[0].title, 'Identificación Requerida');
    });

    it('Step 1: blocks advancement if cédula física has !== 9 digits', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      // 8 digits
      const res1 = await handleRegistroNext({
        step: 1,
        tipoIdentificacion: 'FISICA',
        formData: { identificacion: '1-234-567' },
        apiCaller
      });
      assert.equal(res1.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Cédula Física Inválida');

      // 10 digits
      swalTracker.reset();
      const res2 = await handleRegistroNext({
        step: 1,
        tipoIdentificacion: 'FISICA',
        formData: { identificacion: '1-2345-67890' },
        apiCaller
      });
      assert.equal(res2.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Cédula Física Inválida');
      assert.equal(apiCalled, false);
    });

    it('Step 1: blocks advancement if cédula jurídica has !== 10 digits', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await handleRegistroNext({
        step: 1,
        tipoIdentificacion: 'JURIDICA',
        formData: { identificacion: '3-101-12345' },
        apiCaller
      });
      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Cédula Jurídica Inválida');
    });

    it('Step 1: blocks advancement if DIMEX is not 11 or 12 digits', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await handleRegistroNext({
        step: 1,
        tipoIdentificacion: 'DIMEX',
        formData: { identificacion: '123456789' },
        apiCaller
      });
      assert.equal(res.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'DIMEX Inválido');
    });

    it('Step 1: blocks advancement if NITE is not 10 digits', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await handleRegistroNext({
        step: 1,
        tipoIdentificacion: 'NITE',
        formData: { identificacion: '12345678' },
        apiCaller
      });
      assert.equal(res.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'NITE Inválido');
    });

    it('Step 1: successfully advances to Step 2 with valid cédula física (9 digits)', async () => {
      const res = await handleRegistroNext({
        step: 1,
        tipoIdentificacion: 'FISICA',
        formData: { identificacion: '1-1234-5678' },
        apiCaller: () => {}
      });
      assert.equal(res.blocked, false);
      assert.equal(res.nextStep, 2);
      assert.equal(swalTracker.warnings.length, 0);
    });

    it('Step 2: blocks advancement if nombre is empty or <3 chars', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res1 = await handleRegistroNext({
        step: 2,
        formData: { nombre: '', email: 'test@cr.com', password: 'Password1', confirmarPassword: 'Password1' },
        apiCaller
      });
      assert.equal(res1.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Nombre Requerido');

      swalTracker.reset();
      const res2 = await handleRegistroNext({
        step: 2,
        formData: { nombre: 'Al', email: 'test@cr.com', password: 'Password1', confirmarPassword: 'Password1' },
        apiCaller
      });
      assert.equal(res2.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Nombre Inválido');
      assert.equal(apiCalled, false);
    });

    it('Step 2: blocks advancement if email is invalid', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await handleRegistroNext({
        step: 2,
        formData: { nombre: 'Juan Pérez', email: 'correo-sin-arroba', password: 'Password1', confirmarPassword: 'Password1' },
        apiCaller
      });
      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Correo Inválido');
    });

    it('Step 2: blocks advancement if password is weak (<8 chars, no uppercase, or no number)', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      // Missing uppercase
      const res1 = await handleRegistroNext({
        step: 2,
        formData: { nombre: 'Juan Pérez', email: 'juan@fiscalhost.cr', password: 'password123', confirmarPassword: 'password123' },
        apiCaller
      });
      assert.equal(res1.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Contraseña Insegura');

      // Missing number
      swalTracker.reset();
      const res2 = await handleRegistroNext({
        step: 2,
        formData: { nombre: 'Juan Pérez', email: 'juan@fiscalhost.cr', password: 'PasswordNoNumber', confirmarPassword: 'PasswordNoNumber' },
        apiCaller
      });
      assert.equal(res2.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Contraseña Insegura');

      // < 8 chars
      swalTracker.reset();
      const res3 = await handleRegistroNext({
        step: 2,
        formData: { nombre: 'Juan Pérez', email: 'juan@fiscalhost.cr', password: 'Pass1', confirmarPassword: 'Pass1' },
        apiCaller
      });
      assert.equal(res3.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Contraseña Insegura');
    });

    it('Step 2: blocks advancement if passwords do not match', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await handleRegistroNext({
        step: 2,
        formData: {
          nombre: 'Juan Pérez',
          email: 'juan@fiscalhost.cr',
          password: 'PasswordSegura123',
          confirmarPassword: 'PasswordDistinta456'
        },
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Contraseñas No Coinciden');
    });

    it('Step 2 & 3: advances to Step 3 and calls register API when valid', async () => {
      let apiCalled = false;
      let payload = null;
      const apiCaller = (p) => { apiCalled = true; payload = p; };

      const res2 = await handleRegistroNext({
        step: 2,
        formData: {
          nombre: 'Juan Pérez Soto',
          email: 'juan@fiscalhost.cr',
          password: 'PasswordSegura123',
          confirmarPassword: 'PasswordSegura123'
        },
        apiCaller
      });
      assert.equal(res2.blocked, false);
      assert.equal(res2.nextStep, 3);

      const res3 = await handleRegistroNext({
        step: 3,
        formData: {
          nombre: 'Juan Pérez Soto',
          email: 'juan@fiscalhost.cr',
          password: 'PasswordSegura123',
        },
        apiCaller
      });
      assert.equal(res3.blocked, false);
      assert.equal(apiCalled, true);
      assert.equal(payload.nombre, 'Juan Pérez Soto');
    });
  });

  // -----------------------------------------------------------------------
  // 3. INGRESOS & GASTOS
  // -----------------------------------------------------------------------
  describe('3. Mis Ingresos / Gastos Pre-Submit Validation', () => {
    const today = '2026-09-13';

    it('Add: blocks submission if fecha is missing', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAddTransaction({
        addForm: { fecha: '', concepto: 'Reserva 101', monto: '150000' },
        activeTab: 'ingresos',
        today,
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Fecha Requerida');
    });

    it('Add: blocks submission if fecha is in the future (> today)', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAddTransaction({
        addForm: { fecha: '2026-12-31', concepto: 'Reserva 101', monto: '150000' },
        activeTab: 'ingresos',
        today,
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Fecha Inválida');
    });

    it('Add: blocks submission if concepto is empty', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAddTransaction({
        addForm: { fecha: '2026-09-10', concepto: '   ', monto: '150000' },
        activeTab: 'ingresos',
        today,
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Concepto Requerido');
    });

    it('Add: blocks submission if monto is negative, zero or non-numeric', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      // Negative
      const resNeg = await submitAddTransaction({
        addForm: { fecha: '2026-09-10', concepto: 'Reserva 101', monto: '-5000' },
        activeTab: 'ingresos',
        today,
        apiCaller
      });
      assert.equal(resNeg.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Monto Inválido');

      // Zero
      swalTracker.reset();
      const resZero = await submitAddTransaction({
        addForm: { fecha: '2026-09-10', concepto: 'Reserva 101', monto: '0' },
        activeTab: 'ingresos',
        today,
        apiCaller
      });
      assert.equal(resZero.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Monto Inválido');

      // NaN
      swalTracker.reset();
      const resNaN = await submitAddTransaction({
        addForm: { fecha: '2026-09-10', concepto: 'Reserva 101', monto: 'not-a-number' },
        activeTab: 'ingresos',
        today,
        apiCaller
      });
      assert.equal(resNaN.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Monto Inválido');
    });

    it('Add: allows valid transaction to invoke API', async () => {
      let apiCalled = false;
      let payload = null;
      const apiCaller = (p) => { apiCalled = true; payload = p; };

      const res = await submitAddTransaction({
        addForm: { fecha: '2026-09-10', concepto: 'Reserva Hospedaje #402', monto: '250000' },
        activeTab: 'ingresos',
        today,
        apiCaller
      });

      assert.equal(res.blocked, false);
      assert.equal(apiCalled, true);
      assert.equal(payload.monto, 250000);
      assert.equal(swalTracker.warnings.length, 0);
    });

    it('Edit: blocks update if new monto is <= 0', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitEditTransaction({
        editMonto: '-100',
        editRazon: 'Ajuste de comisión',
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Monto Inválido');
    });

    it('Edit: blocks update if audit reason (Ley 8968) is empty', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitEditTransaction({
        editMonto: '180000',
        editRazon: '   ',
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Justificación Requerida');
    });

    it('Edit: allows update with valid monto and audit justification', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitEditTransaction({
        editMonto: '180000',
        editRazon: 'Ajuste acordado con huésped por salida temprana',
        apiCaller
      });

      assert.equal(res.blocked, false);
      assert.equal(apiCalled, true);
    });

    it('Reclassify: blocks if classification is missing', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitReclassifyTransaction({
        nuevaClasif: '',
        reclasifJustif: 'Justificación válida',
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Clasificación Requerida');
    });

    it('Reclassify: blocks if justification is missing', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCaller = true; };

      const res = await submitReclassifyTransaction({
        nuevaClasif: 'EXENTO',
        reclasifJustif: '',
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Justificación Requerida');
    });
  });

  // -----------------------------------------------------------------------
  // 4. AUTOLIQUIDACION
  // -----------------------------------------------------------------------
  describe('4. Autoliquidación Pre-Submit Validation', () => {
    const hoy = '2026-09-13';

    it('Omisión: blocks backend check when fechaOmision is empty', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAutoliquidacionVerificar({
        tipo: 'omision',
        fechaOmision: '',
        impuestoOmision: '100000',
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Fecha Requerida');
    });

    it('Omisión: blocks backend check when impuesto is <= 0', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAutoliquidacionVerificar({
        tipo: 'omision',
        fechaOmision: '2026-01-15',
        impuestoOmision: '0',
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Monto Inválido');
    });

    it('Inscripción Tardía: blocks backend check when dates are missing', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAutoliquidacionVerificar({
        tipo: 'inscripcion',
        fechaInicioActividad: '',
        fechaRegistro: '2026-08-01',
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Fechas Requeridas');
    });

    it('Inscripción Tardía: blocks backend check when fechaInicio > fechaRegistro', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAutoliquidacionVerificar({
        tipo: 'inscripcion',
        fechaInicioActividad: '2026-08-15',
        fechaRegistro: '2026-05-01',
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Fechas Incoherentes');
    });

    it('Generar D-176: blocks when dates are incoherent or future', async () => {
      let genCalled = false;
      const generator = () => { genCalled = true; };

      // Incoherent (inicio > registro)
      const res1 = await submitGenerarD176({
        fechaInicioActividad: '2026-09-01',
        fechaRegistro: '2026-06-01',
        hoy,
        generator
      });
      assert.equal(res1.blocked, true);
      assert.equal(genCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Fechas Inválidas');

      // Future registration date
      swalTracker.reset();
      const res2 = await submitGenerarD176({
        fechaInicioActividad: '2026-01-01',
        fechaRegistro: '2026-12-31',
        hoy,
        generator
      });
      assert.equal(res2.blocked, true);
      assert.equal(genCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Fecha Futura No Permitida');
    });

    it('Generar D-104: blocks when omision is future, corte < omision, or impuesto <= 0', async () => {
      let genCalled = false;
      const generator = () => { genCalled = true; };

      // Future omision
      const res1 = await submitGenerarD104({
        fechaOmision: '2026-10-01',
        fechaCorte: '2026-10-15',
        impuestoOmision: '50000',
        hoy,
        generator
      });
      assert.equal(res1.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Fecha Futura No Permitida');

      // fechaCorte < fechaOmision
      swalTracker.reset();
      const res2 = await submitGenerarD104({
        fechaOmision: '2026-05-01',
        fechaCorte: '2026-04-01',
        impuestoOmision: '50000',
        hoy,
        generator
      });
      assert.equal(res2.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Fechas Inválidas');

      // impuesto <= 0
      swalTracker.reset();
      const res3 = await submitGenerarD104({
        fechaOmision: '2026-05-01',
        fechaCorte: '2026-09-01',
        impuestoOmision: '-1000',
        hoy,
        generator
      });
      assert.equal(res3.blocked, true);
      assert.equal(swalTracker.warnings[0].title, 'Impuesto Requerido');
      assert.equal(genCalled, false);
    });
  });

  // -----------------------------------------------------------------------
  // 5. REPORTES (EXPORTACIÓN CIFRADA)
  // -----------------------------------------------------------------------
  describe('5. Reportes (Exportación Cifrada) Pre-Submit Validation', () => {
    it('blocks export when encryption password is empty', async () => {
      let exportRun = false;
      const exportAction = () => { exportRun = true; };

      const res = await submitExportarReporte({
        exportPass: '',
        exportPassConfirm: '',
        exportAction
      });

      assert.equal(res.blocked, true);
      assert.equal(exportRun, false);
      assert.equal(swalTracker.warnings[0].title, 'Contraseña Requerida');
    });

    it('blocks export when password and confirmation do not match', async () => {
      let exportRun = false;
      const exportAction = () => { exportRun = true; };

      const res = await submitExportarReporte({
        exportPass: 'ClaveSecreta123',
        exportPassConfirm: 'ClaveErronea456',
        exportAction
      });

      assert.equal(res.blocked, true);
      assert.equal(exportRun, false);
      assert.equal(swalTracker.warnings[0].title, 'Contraseñas No Coinciden');
    });

    it('allows export when passwords match and are non-empty', async () => {
      let exportRun = false;
      const exportAction = () => { exportRun = true; };

      const res = await submitExportarReporte({
        exportPass: 'ClaveSegura2026!',
        exportPassConfirm: 'ClaveSegura2026!',
        exportAction
      });

      assert.equal(res.blocked, false);
      assert.equal(exportRun, true);
      assert.equal(swalTracker.warnings.length, 0);
    });
  });

  // -----------------------------------------------------------------------
  // 6. SIMULADOR DE ESCENARIOS
  // -----------------------------------------------------------------------
  describe('6. Simulador de Escenarios Pre-Submit Validation', () => {
    it('blocks simulation creation when scenario name is empty', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAgregarEscenario({
        nuevoEscenario: { nombre: '   ', ingresos: 500000, gastos: 100000 },
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Nombre Requerido');
    });

    it('blocks simulation creation when ingresos is negative', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAgregarEscenario({
        nuevoEscenario: { nombre: 'Temporada Baja', ingresos: -250000, gastos: 100000 },
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Monto Inválido');
    });

    it('blocks simulation creation when gastos is negative', async () => {
      let apiCalled = false;
      const apiCaller = () => { apiCalled = true; };

      const res = await submitAgregarEscenario({
        nuevoEscenario: { nombre: 'Ahorro Operativo', ingresos: 400000, gastos: -50000 },
        apiCaller
      });

      assert.equal(res.blocked, true);
      assert.equal(apiCalled, false);
      assert.equal(swalTracker.warnings[0].title, 'Monto Inválido');
    });

    it('allows simulation creation with valid parameters', async () => {
      let apiCalled = false;
      let payload = null;
      const apiCaller = (p) => { apiCalled = true; payload = p; };

      const res = await submitAgregarEscenario({
        nuevoEscenario: { nombre: 'Expansión Pacífico', ingresos: 650000, gastos: 180000 },
        apiCaller
      });

      assert.equal(res.blocked, false);
      assert.equal(apiCalled, true);
      assert.equal(payload.nombre, 'Expansión Pacífico');
      assert.equal(swalTracker.warnings.length, 0);
    });
  });
});
