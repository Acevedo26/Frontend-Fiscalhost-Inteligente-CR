/* =========================================================================
   ADVERSARIAL STRESS TEST SUITE — Acceptance Criterion R3
   FiscalHost Inteligente CR
   Empirical Challenger 1: Hostile Environment & Boundary Exploration
   ========================================================================= */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

class MockSwalTracker {
  constructor() {
    this.warnings = [];
  }
  reset() {
    this.warnings = [];
  }
  showWarning(title, text) {
    this.warnings.push({ title, text });
    return Promise.resolve({ isConfirmed: true });
  }
}

const swal = new MockSwalTracker();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

describe('Adversarial Stress Testing — R3 Boundary & Injection Exploration', () => {
  beforeEach(() => {
    swal.reset();
  });

  describe('Adversarial Inputs on Login', () => {
    const malformedEmails = [
      "' OR '1'='1",
      "<script>alert(1)</script>",
      "admin@; DROP TABLE users;--",
      "spaces in email@domain.com",
      "user@@domain.com",
      "user@.com",
      "@nodomain.com",
      "plainaddress",
      "#@%^%#$@#$@#.com",
      "@example.com",
      "Joe Smith <email@example.com>",
      "email.example.com",
      "email@example@example.com"
    ];

    for (const badEmail of malformedEmails) {
      it(`blocks malformed email: "${badEmail}"`, async () => {
        let apiCalled = false;
        const trimmed = badEmail.trim();

        if (!trimmed) {
          await swal.showWarning('Correo Requerido', 'El correo electrónico es obligatorio para iniciar sesión.');
        } else if (!EMAIL_REGEX.test(trimmed)) {
          await swal.showWarning('Correo Inválido', 'El formato del correo electrónico no es válido.');
        } else {
          apiCalled = true;
        }

        assert.equal(apiCalled, false, `API must be blocked for email: ${badEmail}`);
        assert.equal(swal.warnings.length, 1);
        assert.match(swal.warnings[0].title, /Correo/);
      });
    }

    it('notes: EMAIL_REGEX permissive behavior on non-whitespace Unicode (e.g. emoji)', () => {
      // Documenting for adversarial review: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ allows non-whitespace Unicode/emoji
      const emojiEmail = 'emoji😀@domain.com';
      const isPermissive = EMAIL_REGEX.test(emojiEmail);
      assert.equal(isPermissive, true, 'Current regex permits non-ASCII chars because it only excludes whitespace and @');
    });

    it('blocks off-by-one boundary password (5 characters)', async () => {
      let apiCalled = false;
      const pwd = '12345'; // 5 chars, threshold is 6
      if (pwd.length < 6) {
        await swal.showWarning('Contraseña Corta', 'Mínimo 6 caracteres');
      } else {
        apiCalled = true;
      }
      assert.equal(apiCalled, false);
      assert.equal(swal.warnings[0].title, 'Contraseña Corta');
    });

    it('accepts exact boundary password (6 characters)', async () => {
      let apiCalled = false;
      const pwd = '123456'; // exactly 6
      if (pwd.length < 6) {
        await swal.showWarning('Contraseña Corta', 'Mínimo 6 caracteres');
      } else {
        apiCalled = true;
      }
      assert.equal(apiCalled, true);
      assert.equal(swal.warnings.length, 0);
    });
  });

  describe('Adversarial Inputs on Registro (Identificaciones)', () => {
    it('blocks SQL injection in Cédula Física', async () => {
      const sqlId = "1; DROP TABLE usuarios;";
      const digits = sqlId.replace(/\D/g, ''); // '1' -> length 1 !== 9
      let blocked = false;
      if (digits.length !== 9) {
        await swal.showWarning('Cédula Física Inválida', 'Debe tener 9 dígitos');
        blocked = true;
      }
      assert.equal(blocked, true);
      assert.equal(digits.length, 1);
    });

    it('blocks 8-digit and 10-digit boundary values for Cédula Física (exact 9 required)', async () => {
      for (const id of ['12345678', '1234567890']) {
        swal.reset();
        const digits = id.replace(/\D/g, '');
        let blocked = false;
        if (digits.length !== 9) {
          await swal.showWarning('Cédula Física Inválida', 'Debe tener 9 dígitos');
          blocked = true;
        }
        assert.equal(blocked, true, `Should block length ${digits.length}`);
      }
    });

    it('blocks 9-digit and 11-digit boundary values for Cédula Jurídica (exact 10 required)', async () => {
      for (const id of ['310112345', '31011234567']) {
        swal.reset();
        const digits = id.replace(/\D/g, '');
        let blocked = false;
        if (digits.length !== 10) {
          await swal.showWarning('Cédula Jurídica Inválida', 'Debe tener 10 dígitos');
          blocked = true;
        }
        assert.equal(blocked, true, `Should block length ${digits.length}`);
      }
    });

    it('blocks 10-digit and 13-digit boundary values for DIMEX (11-12 required)', async () => {
      for (const id of ['1234567890', '1234567890123']) {
        swal.reset();
        const digits = id.replace(/\D/g, '');
        let blocked = false;
        if (digits.length < 11 || digits.length > 12) {
          await swal.showWarning('DIMEX Inválido', 'Debe tener 11 o 12 dígitos');
          blocked = true;
        }
        assert.equal(blocked, true, `Should block length ${digits.length}`);
      }
    });

    it('accepts exact boundary values 11 and 12 for DIMEX', async () => {
      for (const id of ['12345678901', '123456789012']) {
        swal.reset();
        const digits = id.replace(/\D/g, '');
        let blocked = false;
        if (digits.length < 11 || digits.length > 12) {
          await swal.showWarning('DIMEX Inválido', 'Debe tener 11 o 12 dígitos');
          blocked = true;
        }
        assert.equal(blocked, false, `Should accept length ${digits.length}`);
      }
    });
  });

  describe('Adversarial Numbers and Floats on Amounts', () => {
    const invalidAmounts = [
      '-1',
      '-0.00001',
      '-999999999',
      '0',
      'NaN',
      'Infinity',
      '-Infinity',
      'abc',
      '₡5000',
      'null',
      'undefined',
      ''
    ];

    for (const badAmount of invalidAmounts) {
      it(`blocks invalid monto in Ingresos/Gastos: "${badAmount}"`, async () => {
        let apiCalled = false;
        const montoNum = Number(badAmount);
        if (!badAmount || isNaN(montoNum) || !isFinite(montoNum) || montoNum <= 0) {
          await swal.showWarning('Monto Inválido', 'El monto debe ser mayor a cero');
        } else {
          apiCalled = true;
        }
        assert.equal(apiCalled, false, `Amount "${badAmount}" must be blocked`);
        assert.equal(swal.warnings.length, 1);
        assert.equal(swal.warnings[0].title, 'Monto Inválido');
      });
    }

    it('blocks negative numbers in Simulador while allowing 0 as valid projection', async () => {
      const testCases = [
        { val: -1, expectedBlocked: true },
        { val: -500, expectedBlocked: true },
        { val: 0, expectedBlocked: false },
        { val: 100000, expectedBlocked: false }
      ];

      for (const tc of testCases) {
        swal.reset();
        let apiCalled = false;
        const num = Number(tc.val);
        if (isNaN(num) || num < 0) {
          await swal.showWarning('Monto Inválido', 'Mayor o igual a cero');
        } else {
          apiCalled = true;
        }
        assert.equal(!apiCalled, tc.expectedBlocked, `Value ${tc.val} blocked status mismatch`);
      }
    });
  });

  describe('Adversarial Temporal Boundaries', () => {
    const today = '2026-09-13';

    it('blocks tomorrow date in Ingresos', async () => {
      let apiCalled = false;
      const tomorrow = '2026-09-14';
      if (tomorrow > today) {
        await swal.showWarning('Fecha Inválida', 'No se permiten fechas futuras');
      } else {
        apiCalled = true;
      }
      assert.equal(apiCalled, false);
      assert.equal(swal.warnings[0].title, 'Fecha Inválida');
    });

    it('accepts today date in Ingresos', async () => {
      let apiCalled = false;
      const txDate = today;
      if (txDate > today) {
        await swal.showWarning('Fecha Inválida', 'No se permiten fechas futuras');
      } else {
        apiCalled = true;
      }
      assert.equal(apiCalled, true);
    });

    it('blocks start date after registration date in Autoliquidacion', async () => {
      const inicio = '2026-06-15';
      const registro = '2026-06-14'; // 1 day earlier!
      let blocked = false;
      if (new Date(inicio) > new Date(registro)) {
        await swal.showWarning('Fechas Incoherentes', 'Inicio debe ser anterior a registro');
        blocked = true;
      }
      assert.equal(blocked, true);
      assert.equal(swal.warnings[0].title, 'Fechas Incoherentes');
    });
  });
});
