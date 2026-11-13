// Empirical Stress Test Harness: Axios Interceptors, Alerts & Error Parser
import assert from 'node:assert/strict';

// 1. Mock Browser Environment (window & localStorage)
let currentPath = '/dashboard';
let redirectedTo = null;

globalThis.window = {
  location: {
    get pathname() {
      return currentPath;
    },
    set href(val) {
      redirectedTo = val;
    },
  },
};

const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

// 2. Import modules
import { extractErrorMessage } from '../src/utils/alerts.ts';
import { apiClient } from '../src/api/axiosClient.ts';
import Swal, { recordedCalls } from 'sweetalert2';

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests.push({ name, error: err });
    console.error(`  ✗ FAIL: ${name}\n    ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests.push({ name, error: err });
    console.error(`  ✗ FAIL: ${name}\n    ${err.message}`);
  }
}

console.log('====================================================');
console.log('CHALLENGER 2: EMPIRICAL STRESS TEST SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// SECTION 1: Error Message Parser (extractErrorMessage)
// ----------------------------------------------------
console.log('--- SECTION 1: extractErrorMessage Parser Tests ---');

runTest('1.1 Should extract RFC 7807 ProblemDetails detail field', () => {
  const payload = {
    type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
    title: 'Bad Request',
    status: 400,
    detail: 'El monto ingresado excede el límite permitido para el régimen simplificado.',
  };
  const result = extractErrorMessage(payload);
  assert.equal(result, 'El monto ingresado excede el límite permitido para el régimen simplificado.');
});

runTest('1.2 Should fallback to ProblemDetails title if detail is missing', () => {
  const payload = {
    title: 'Recurso No Encontrado',
    status: 404,
  };
  const result = extractErrorMessage(payload);
  assert.equal(result, 'Recurso No Encontrado');
});

runTest('1.3 Should parse ASP.NET Core ModelState error dictionary with multiple fields', () => {
  const payload = {
    errors: {
      Cedula: ['La cédula es requerida.', 'Formato de cédula jurídica inválido.'],
      Monto: ['El monto debe ser mayor a cero.'],
    },
  };
  const result = extractErrorMessage(payload);
  assert.ok(result.includes('La cédula es requerida.'));
  assert.ok(result.includes('Formato de cédula jurídica inválido.'));
  assert.ok(result.includes('El monto debe ser mayor a cero.'));
  assert.equal(result.split('\n').length, 3);
});

runTest('1.4 Should parse backend custom payload with "mensaje" field', () => {
  const payload = { mensaje: 'Error: La Ley 8968 exige proporcionar una Razón de cambio.' };
  const result = extractErrorMessage(payload);
  assert.equal(result, 'Error: La Ley 8968 exige proporcionar una Razón de cambio.');
});

runTest('1.5 Should parse backend custom payload with "message" field', () => {
  const payload = { message: 'Credenciales inválidas.' };
  const result = extractErrorMessage(payload);
  assert.equal(result, 'Credenciales inválidas.');
});

runTest('1.6 Should parse backend custom payload with "error" field', () => {
  const payload = { error: 'Token de sesión corrupto o vencido.' };
  const result = extractErrorMessage(payload);
  assert.equal(result, 'Token de sesión corrupto o vencido.');
});

runTest('1.7 Should return raw string if backend returns a plain text error', () => {
  const payload = 'Internal server exception at line 42';
  const result = extractErrorMessage(payload);
  assert.equal(result, 'Internal server exception at line 42');
});

runTest('1.8 Should return default fallback if payload is null or undefined', () => {
  const resNull = extractErrorMessage(null);
  const resUndef = extractErrorMessage(undefined);
  assert.equal(resNull, 'Ocurrió un error al procesar la solicitud.');
  assert.equal(resUndef, 'Ocurrió un error al procesar la solicitud.');
});

runTest('1.9 Should return custom default message if provided when payload has no error text', () => {
  const result = extractErrorMessage({}, 'Mensaje personalizado');
  assert.equal(result, 'Mensaje personalizado');
});

// ----------------------------------------------------
// SECTION 2: Axios Request Interceptor (Auth Token)
// ----------------------------------------------------
console.log('\n--- SECTION 2: Axios Request Interceptor Tests ---');

const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;

runTest('2.1 Request interceptor attaches Bearer token when token exists in localStorage', () => {
  localStorage.setItem('token', 'fake-jwt-token-12345');
  const config = { headers: {} };
  const modified = requestInterceptor(config);
  assert.equal(modified.headers.Authorization, 'Bearer fake-jwt-token-12345');
});

runTest('2.2 Request interceptor does not attach Bearer token when no token in localStorage', () => {
  localStorage.removeItem('token');
  const config = { headers: {} };
  const modified = requestInterceptor(config);
  assert.equal(modified.headers.Authorization, undefined);
});

// ----------------------------------------------------
// SECTION 3: Axios Response Error Interceptor (Status Codes & SweetAlert2)
// ----------------------------------------------------
console.log('\n--- SECTION 3: Axios Response Error Interceptor Tests ---');

const responseErrorInterceptor = apiClient.interceptors.response.handlers[0].rejected;

await runAsyncTest('3.1 Status 400 Bad Request triggers showError with parsed message', async () => {
  recordedCalls.length = 0;
  const mockError = {
    response: {
      status: 400,
      data: { detail: 'Validación fiscal: Régimen no coincide con el periodo.' },
    },
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  assert.equal(recordedCalls.length, 1);
  const call = recordedCalls[0];
  assert.equal(call.icon, 'error');
  assert.equal(call.title, 'Solicitud Inválida');
  assert.equal(call.text, 'Validación fiscal: Régimen no coincide con el periodo.');
});

await runAsyncTest('3.2 Status 401 triggers session cleanup, showWarning, and redirect to /login', async () => {
  recordedCalls.length = 0;
  redirectedTo = null;
  currentPath = '/finanzas/ingresos';
  localStorage.setItem('token', 'active-session-token');
  localStorage.setItem('usuario', JSON.stringify({ nombre: 'Tester' }));

  const mockError = {
    response: {
      status: 401,
      data: { message: 'Token expirado' },
    },
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  // Verify token and usuario removed
  assert.equal(localStorage.getItem('token'), null);
  assert.equal(localStorage.getItem('usuario'), null);

  // Verify SweetAlert2 warning
  assert.equal(recordedCalls.length, 1);
  const call = recordedCalls[0];
  assert.equal(call.icon, 'warning');
  assert.equal(call.title, 'Sesión Expirada');

  // Allow the promise resolution (.then()) to trigger redirect
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(redirectedTo, '/login');
});

await runAsyncTest('3.3 Status 401 does not loop redirect if already on /login', async () => {
  recordedCalls.length = 0;
  redirectedTo = null;
  currentPath = '/login';

  const mockError = {
    response: {
      status: 401,
      data: {},
    },
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  await new Promise((r) => setTimeout(r, 10));
  assert.equal(redirectedTo, null);
});

await runAsyncTest('3.4 Status 403 Forbidden triggers showWarning with Acceso Denegado', async () => {
  recordedCalls.length = 0;
  const mockError = {
    response: {
      status: 403,
      data: { mensaje: 'Solo los contadores autorizados pueden firmar este borrador.' },
    },
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  assert.equal(recordedCalls.length, 1);
  const call = recordedCalls[0];
  assert.equal(call.icon, 'warning');
  assert.equal(call.title, 'Acceso Denegado');
  assert.equal(call.text, 'Solo los contadores autorizados pueden firmar este borrador.');
});

await runAsyncTest('3.5 Status 404 Not Found triggers showWarning with Recurso No Encontrado', async () => {
  recordedCalls.length = 0;
  const mockError = {
    response: {
      status: 404,
      data: { error: 'Comprobante XML no existe.' },
    },
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  assert.equal(recordedCalls.length, 1);
  const call = recordedCalls[0];
  assert.equal(call.icon, 'warning');
  assert.equal(call.title, 'Recurso No Encontrado');
  assert.equal(call.text, 'Comprobante XML no existe.');
});

await runAsyncTest('3.6 Status 422 Unprocessable Entity triggers showWarning with Regla Fiscal', async () => {
  recordedCalls.length = 0;
  const mockError = {
    response: {
      status: 422,
      data: { mensaje: 'Error: La Ley 8968 exige proporcionar una Razón de cambio válida.' },
    },
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  assert.equal(recordedCalls.length, 1);
  const call = recordedCalls[0];
  assert.equal(call.icon, 'warning');
  assert.equal(call.title, 'Regla Fiscal');
  assert.equal(call.text, 'Error: La Ley 8968 exige proporcionar una Razón de cambio válida.');
});

await runAsyncTest('3.7 Status 500 Internal Server Error triggers showError with Error del Servidor', async () => {
  recordedCalls.length = 0;
  const mockError = {
    response: {
      status: 500,
      data: { detail: 'PostgreSQL connection timeout in DbContext.' },
    },
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  assert.equal(recordedCalls.length, 1);
  const call = recordedCalls[0];
  assert.equal(call.icon, 'error');
  assert.equal(call.title, 'Error del Servidor');
  assert.equal(call.text, 'PostgreSQL connection timeout in DbContext.');
});

await runAsyncTest('3.8 Unhandled Status Code (e.g. 502 Bad Gateway) triggers showError default format', async () => {
  recordedCalls.length = 0;
  const mockError = {
    response: {
      status: 502,
      data: { message: 'Bad Gateway proxy error' },
    },
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  assert.equal(recordedCalls.length, 1);
  const call = recordedCalls[0];
  assert.equal(call.icon, 'error');
  assert.equal(call.title, 'Error (502)');
  assert.equal(call.text, 'Bad Gateway proxy error');
});

await runAsyncTest('3.9 Network Error (no response object) triggers showError Error de Conexión', async () => {
  recordedCalls.length = 0;
  const mockError = {
    message: 'Network Error',
    config: {},
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  assert.equal(recordedCalls.length, 1);
  const call = recordedCalls[0];
  assert.equal(call.icon, 'error');
  assert.equal(call.title, 'Error de Conexión');
  assert.ok(call.text.includes('No se pudo establecer comunicación'));
});

await runAsyncTest('3.10 skipGlobalAlert = true suppresses SweetAlert2 popup completely', async () => {
  recordedCalls.length = 0;
  const mockError = {
    response: {
      status: 500,
      data: { detail: 'Fatal crash' },
    },
    config: {
      skipGlobalAlert: true,
    },
  };

  await assert.rejects(async () => {
    await responseErrorInterceptor(mockError);
  });

  // Zero calls to SweetAlert2!
  assert.equal(recordedCalls.length, 0);
});

// ----------------------------------------------------
// SECTION 4: Summary & Exit
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`STRESS TEST SUMMARY: ${passedTests}/${totalTests} tests passed.`);
if (failedTests.length > 0) {
  console.error(`FAILED: ${failedTests.length} tests failed!`);
  for (const f of failedTests) {
    console.error(` - ${f.name}: ${f.error.message}`);
  }
  process.exit(1);
} else {
  console.log('ALL EMPIRICAL TESTS PASSED SUCCESSFULLY! (100%)');
  process.exit(0);
}
