import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const serviceSource = readFileSync(
  new URL('../src/features/finanzas/services/FinanzasService.ts', import.meta.url),
  'utf8',
);

test('reclasificarIngreso preserves GUID reservation identifiers in the API path', () => {
  assert.doesNotMatch(
    serviceSource,
    /parseInt\(String\(id\),\s*10\)\s*\|\|\s*1/,
    'reservation identifiers must not be parsed as integers or defaulted to 1',
  );
  assert.match(
    serviceSource,
    /put\(`\/clasificacion-ingresos\/\$\{id\}\/reclasificar`/,
    'the original identifier must be interpolated into the endpoint path',
  );
});
