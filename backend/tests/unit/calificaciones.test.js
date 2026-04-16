// tests/unit/calificaciones.test.js
process.env.NODE_ENV = 'test';

// ── Lógica extraída del modelo Calificacion ───────────────────
const calcularPromedio = (parcial1, parcial2, parcial3, final) => {
  const notas = [parcial1, parcial2, parcial3, final]
    .filter(n => n !== null && n !== undefined);
  if (notas.length === 0) return null;
  return Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100;
};

const estaAprobado = (promedio) => promedio !== null && promedio >= 60;

const esNotaValida = (nota) =>
  nota === null || nota === undefined || (typeof nota === 'number' && nota >= 0 && nota <= 100);

const esPeriodoValido = (periodo) => /^\d{4}-\d{1,2}$/.test(periodo);

// ══════════════════════════════════════════════════════════════
describe('Calificaciones — Cálculo de promedio', () => {
  test('calcula promedio correcto con 4 notas', () => {
    expect(calcularPromedio(80, 90, 85, 90)).toBe(86.25);
  });

  test('calcula promedio con exactamente 60 (borde de aprobación)', () => {
    expect(calcularPromedio(60, 60, 60, 60)).toBe(60);
  });

  test('calcula promedio con notas máximas', () => {
    expect(calcularPromedio(100, 100, 100, 100)).toBe(100);
  });

  test('calcula promedio con notas mínimas', () => {
    expect(calcularPromedio(0, 0, 0, 0)).toBe(0);
  });

  test('calcula promedio con solo 2 notas (parciales opcionales)', () => {
    expect(calcularPromedio(80, 90, null, null)).toBe(85);
  });

  test('calcula promedio con 3 notas', () => {
    expect(calcularPromedio(70, 80, 90, null)).toBe(80);
  });

  test('retorna null cuando no hay ninguna nota', () => {
    expect(calcularPromedio(null, null, null, null)).toBeNull();
  });

  test('redondea a 2 decimales correctamente', () => {
    expect(calcularPromedio(70, 71, 72, null)).toBe(71);
  });
});

// ══════════════════════════════════════════════════════════════
describe('Calificaciones — Estado aprobado/reprobado', () => {
  test('aprobado con promedio exactamente 60', () => {
    expect(estaAprobado(60)).toBe(true);
  });

  test('aprobado con promedio 100', () => {
    expect(estaAprobado(100)).toBe(true);
  });

  test('aprobado con promedio 75', () => {
    expect(estaAprobado(75)).toBe(true);
  });

  test('reprobado con promedio 59.99', () => {
    expect(estaAprobado(59.99)).toBe(false);
  });

  test('reprobado con promedio 0', () => {
    expect(estaAprobado(0)).toBe(false);
  });

  test('reprobado cuando promedio es null', () => {
    expect(estaAprobado(null)).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
describe('Calificaciones — Validación de notas', () => {
  test('acepta nota 0 (mínimo)', () => {
    expect(esNotaValida(0)).toBe(true);
  });

  test('acepta nota 100 (máximo)', () => {
    expect(esNotaValida(100)).toBe(true);
  });

  test('acepta nota 75.5 (decimal)', () => {
    expect(esNotaValida(75.5)).toBe(true);
  });

  test('acepta null (nota no ingresada)', () => {
    expect(esNotaValida(null)).toBe(true);
  });

  test('rechaza nota -1 (menor al mínimo)', () => {
    expect(esNotaValida(-1)).toBe(false);
  });

  test('rechaza nota 101 (mayor al máximo)', () => {
    expect(esNotaValida(101)).toBe(false);
  });

  test('rechaza nota como string', () => {
    expect(esNotaValida('80')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
describe('Calificaciones — Validación de formato de periodo', () => {
  test('acepta formato 2025-1', () => {
    expect(esPeriodoValido('2025-1')).toBe(true);
  });

  test('acepta formato 2025-2', () => {
    expect(esPeriodoValido('2025-2')).toBe(true);
  });

  test('acepta formato 2024-10 (mes de 2 dígitos)', () => {
    expect(esPeriodoValido('2024-10')).toBe(true);
  });

  test('rechaza formato inválido "primer-semestre"', () => {
    expect(esPeriodoValido('primer-semestre')).toBe(false);
  });

  test('rechaza formato vacío', () => {
    expect(esPeriodoValido('')).toBe(false);
  });

  test('rechaza solo el año', () => {
    expect(esPeriodoValido('2025')).toBe(false);
  });
});
