// tests/unit/asistencia.test.js
process.env.NODE_ENV = 'test';

const esFechaFutura = (fecha) => {
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
  return fecha > hoyStr;
};

const ESTADOS_VALIDOS = ['presente', 'ausente', 'tardanza'];
const esEstadoValido = (estado) => ESTADOS_VALIDOS.includes(estado);

const calcularPorcentajeAsistencia = (presente, total) => {
  if (total === 0) return 0;
  return Math.round((presente / total) * 100);
};

const calcularReporte = (registros) => {
  const reporte = { total: 0, presente: 0, ausente: 0, tardanza: 0 };
  registros.forEach(r => { reporte.total++; reporte[r.estado]++; });
  reporte.porcentaje = calcularPorcentajeAsistencia(reporte.presente, reporte.total);
  return reporte;
};

const getFechaLocal = (offsetDias = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

describe('Asistencia — Validación de fechas', () => {
  test('fecha de hoy no es futura', () => {
    expect(esFechaFutura(getFechaLocal(0))).toBe(false);
  });
  test('fecha de ayer no es futura', () => {
    expect(esFechaFutura(getFechaLocal(-1))).toBe(false);
  });
  test('fecha de mañana es futura', () => {
    expect(esFechaFutura(getFechaLocal(1))).toBe(true);
  });
  test('fecha de hace 30 días no es futura', () => {
    expect(esFechaFutura(getFechaLocal(-30))).toBe(false);
  });
  test('fecha de dentro de 7 días es futura', () => {
    expect(esFechaFutura(getFechaLocal(7))).toBe(true);
  });
});

describe('Asistencia — Validación de estados', () => {
  test('acepta estado "presente"', () => { expect(esEstadoValido('presente')).toBe(true); });
  test('acepta estado "ausente"', () => { expect(esEstadoValido('ausente')).toBe(true); });
  test('acepta estado "tardanza"', () => { expect(esEstadoValido('tardanza')).toBe(true); });
  test('rechaza estado "falta"', () => { expect(esEstadoValido('falta')).toBe(false); });
  test('rechaza estado vacío', () => { expect(esEstadoValido('')).toBe(false); });
  test('rechaza estado en mayúsculas', () => { expect(esEstadoValido('PRESENTE')).toBe(false); });
});

describe('Asistencia — Cálculo de porcentaje', () => {
  test('100% cuando todos presentes', () => { expect(calcularPorcentajeAsistencia(5, 5)).toBe(100); });
  test('0% cuando ninguno presente', () => { expect(calcularPorcentajeAsistencia(0, 5)).toBe(0); });
  test('0% cuando total es 0', () => { expect(calcularPorcentajeAsistencia(0, 0)).toBe(0); });
  test('75% con 3 de 4 presentes', () => { expect(calcularPorcentajeAsistencia(3, 4)).toBe(75); });
  test('redondea correctamente', () => { expect(calcularPorcentajeAsistencia(2, 3)).toBe(67); });
});

describe('Asistencia — Generación de reporte', () => {
  const registros = [
    { estado: 'presente' }, { estado: 'presente' }, { estado: 'presente' },
    { estado: 'ausente' }, { estado: 'tardanza' },
  ];
  test('cuenta correctamente el total', () => { expect(calcularReporte(registros).total).toBe(5); });
  test('cuenta correctamente los presentes', () => { expect(calcularReporte(registros).presente).toBe(3); });
  test('cuenta correctamente los ausentes', () => { expect(calcularReporte(registros).ausente).toBe(1); });
  test('cuenta correctamente las tardanzas', () => { expect(calcularReporte(registros).tardanza).toBe(1); });
  test('calcula porcentaje correcto (60%)', () => { expect(calcularReporte(registros).porcentaje).toBe(60); });
  test('reporte vacío retorna 0', () => {
    const r = calcularReporte([]);
    expect(r.total).toBe(0);
    expect(r.porcentaje).toBe(0);
  });
});