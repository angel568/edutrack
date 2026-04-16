// tests/unit/asistencia.test.js
process.env.NODE_ENV = 'test';

// ── Lógica extraída del controlador de asistencia ─────────────
const esFechaFutura = (fecha) => {
  const fechaDate = new Date(fecha);
  fechaDate.setHours(0, 0, 0, 0);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaDate > hoy;
};

const ESTADOS_VALIDOS = ['presente', 'ausente', 'tardanza'];

const esEstadoValido = (estado) => ESTADOS_VALIDOS.includes(estado);

const calcularPorcentajeAsistencia = (presente, total) => {
  if (total === 0) return 0;
  return Math.round((presente / total) * 100);
};

const calcularReporte = (registros) => {
  const reporte = { total: 0, presente: 0, ausente: 0, tardanza: 0 };
  registros.forEach(r => {
    reporte.total++;
    reporte[r.estado]++;
  });
  reporte.porcentaje = calcularPorcentajeAsistencia(reporte.presente, reporte.total);
  return reporte;
};

// ══════════════════════════════════════════════════════════════
describe('Asistencia — Validación de fechas', () => {
  test('fecha de hoy no es futura', () => {
    const hoy = new Date().toISOString().split('T')[0];
    expect(esFechaFutura(hoy)).toBe(false);
  });

  test('fecha de ayer no es futura', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    expect(esFechaFutura(ayer.toISOString().split('T')[0])).toBe(false);
  });

  test('fecha de mañana es futura', () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    expect(esFechaFutura(manana.toISOString().split('T')[0])).toBe(true);
  });

  test('fecha de hace 30 días no es futura', () => {
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    expect(esFechaFutura(hace30.toISOString().split('T')[0])).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
describe('Asistencia — Validación de estados', () => {
  test('acepta estado "presente"', () => {
    expect(esEstadoValido('presente')).toBe(true);
  });

  test('acepta estado "ausente"', () => {
    expect(esEstadoValido('ausente')).toBe(true);
  });

  test('acepta estado "tardanza"', () => {
    expect(esEstadoValido('tardanza')).toBe(true);
  });

  test('rechaza estado "falta"', () => {
    expect(esEstadoValido('falta')).toBe(false);
  });

  test('rechaza estado vacío', () => {
    expect(esEstadoValido('')).toBe(false);
  });

  test('rechaza estado en mayúsculas', () => {
    expect(esEstadoValido('PRESENTE')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
describe('Asistencia — Cálculo de porcentaje', () => {
  test('100% cuando todos presentes', () => {
    expect(calcularPorcentajeAsistencia(5, 5)).toBe(100);
  });

  test('0% cuando ninguno presente', () => {
    expect(calcularPorcentajeAsistencia(0, 5)).toBe(0);
  });

  test('0% cuando total es 0', () => {
    expect(calcularPorcentajeAsistencia(0, 0)).toBe(0);
  });

  test('75% con 3 de 4 presentes', () => {
    expect(calcularPorcentajeAsistencia(3, 4)).toBe(75);
  });

  test('redondea correctamente', () => {
    expect(calcularPorcentajeAsistencia(2, 3)).toBe(67);
  });
});

// ══════════════════════════════════════════════════════════════
describe('Asistencia — Generación de reporte', () => {
  const registros = [
    { estado: 'presente' },
    { estado: 'presente' },
    { estado: 'presente' },
    { estado: 'ausente' },
    { estado: 'tardanza' },
  ];

  test('cuenta correctamente el total de registros', () => {
    expect(calcularReporte(registros).total).toBe(5);
  });

  test('cuenta correctamente los presentes', () => {
    expect(calcularReporte(registros).presente).toBe(3);
  });

  test('cuenta correctamente los ausentes', () => {
    expect(calcularReporte(registros).ausente).toBe(1);
  });

  test('cuenta correctamente las tardanzas', () => {
    expect(calcularReporte(registros).tardanza).toBe(1);
  });

  test('calcula porcentaje correcto (60%)', () => {
    expect(calcularReporte(registros).porcentaje).toBe(60);
  });

  test('reporte vacío retorna 0 en todo', () => {
    const reporte = calcularReporte([]);
    expect(reporte.total).toBe(0);
    expect(reporte.porcentaje).toBe(0);
  });
});
