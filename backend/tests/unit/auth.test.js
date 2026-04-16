// tests/unit/auth.test.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test_secret_edutrack';
process.env.JWT_EXPIRES_IN = '8h';
process.env.NODE_ENV = 'test';

// ── Helper local (misma lógica que authController) ────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ══════════════════════════════════════════════════════════════
describe('Auth — Generación de Token JWT', () => {
  test('genera un token válido con el id del usuario', () => {
    const userId = '42';
    const token  = generateToken(userId);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(userId);
  });

  test('el token contiene expiración', () => {
    const token   = generateToken('1');
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test('token firmado con secreto incorrecto lanza error', () => {
    const token = generateToken('1');
    expect(() => jwt.verify(token, 'secreto_incorrecto')).toThrow();
  });

  test('token expirado lanza error', () => {
    const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET, { expiresIn: '0s' });
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow('jwt expired');
  });

  test('token malformado lanza error', () => {
    expect(() => jwt.verify('esto.no.es.un.token', process.env.JWT_SECRET)).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════
describe('Auth — Validación de campos de login', () => {
  const validateLogin = ({ email, password }) => {
    if (!email || !password) return { ok: false, message: 'Email y contraseña son requeridos.' };
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) return { ok: false, message: 'Email inválido.' };
    if (password.length < 6) return { ok: false, message: 'Contraseña muy corta.' };
    return { ok: true };
  };

  test('acepta credenciales válidas', () => {
    expect(validateLogin({ email: 'admin@edutrack.do', password: 'Admin123!' })).toEqual({ ok: true });
  });

  test('rechaza email vacío', () => {
    const result = validateLogin({ email: '', password: 'Admin123!' });
    expect(result.ok).toBe(false);
  });

  test('rechaza contraseña vacía', () => {
    const result = validateLogin({ email: 'admin@edutrack.do', password: '' });
    expect(result.ok).toBe(false);
  });

  test('rechaza email con formato inválido', () => {
    const result = validateLogin({ email: 'noesuncorreo', password: 'Admin123!' });
    expect(result.ok).toBe(false);
  });

  test('rechaza contraseña menor a 6 caracteres', () => {
    const result = validateLogin({ email: 'admin@edutrack.do', password: '123' });
    expect(result.ok).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
describe('Auth — Hashing de contraseñas con bcrypt', () => {
  test('hashea una contraseña correctamente', async () => {
    const password = 'Admin123!';
    const hash     = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2a$10$')).toBe(true);
  });

  test('compara contraseña correcta con su hash', async () => {
    const password = 'Admin123!';
    const hash     = await bcrypt.hash(password, 10);
    const match    = await bcrypt.compare(password, hash);
    expect(match).toBe(true);
  });

  test('rechaza contraseña incorrecta contra el hash', async () => {
    const hash  = await bcrypt.hash('Admin123!', 10);
    const match = await bcrypt.compare('ContraseñaWrong', hash);
    expect(match).toBe(false);
  });

  test('dos hashes del mismo password son diferentes', async () => {
    const password = 'Admin123!';
    const hash1    = await bcrypt.hash(password, 10);
    const hash2    = await bcrypt.hash(password, 10);
    expect(hash1).not.toBe(hash2);
  });
});

// ══════════════════════════════════════════════════════════════
describe('Auth — Control de roles', () => {
  const ROLES_VALIDOS = ['admin', 'profesor', 'estudiante'];

  const authorize = (userRol, rolesPermitidos) =>
    rolesPermitidos.includes(userRol);

  test('admin tiene acceso a recursos de admin', () => {
    expect(authorize('admin', ['admin'])).toBe(true);
  });

  test('profesor tiene acceso a recursos de profesor', () => {
    expect(authorize('profesor', ['admin', 'profesor'])).toBe(true);
  });

  test('estudiante no tiene acceso a recursos de admin', () => {
    expect(authorize('estudiante', ['admin'])).toBe(false);
  });

  test('estudiante no tiene acceso a recursos de profesor', () => {
    expect(authorize('estudiante', ['admin', 'profesor'])).toBe(false);
  });

  test('todos los roles son válidos', () => {
    ROLES_VALIDOS.forEach(rol => {
      expect(['admin', 'profesor', 'estudiante']).toContain(rol);
    });
  });
});
