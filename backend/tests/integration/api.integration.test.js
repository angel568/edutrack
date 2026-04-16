// tests/integration/api.integration.test.js
const request = require('supertest');
const app     = require('../../src/app');

process.env.JWT_SECRET   = 'test_secret_integration_edutrack';
process.env.NODE_ENV     = 'test';
process.env.DB_HOST      = process.env.DB_HOST     || 'localhost';
process.env.DB_PORT      = process.env.DB_PORT     || '3306';
process.env.DB_NAME      = process.env.DB_NAME     || 'edutrack_test';
process.env.DB_USER      = process.env.DB_USER     || 'root';
process.env.DB_PASSWORD  = process.env.DB_PASSWORD || '';

const { sequelize }                                     = require('../../src/config/db');
const { User, Estudiante, Materia, Asistencia, Calificacion } = require('../../src/models');

let adminToken;
let profesorToken;
let estudianteCreado;
let materiaCreada;

// ── Setup global ──────────────────────────────────────────────
beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Crear usuarios de prueba
  await User.create({ nombre:'Admin',   apellido:'Test', email:'admin@test.com',    password:'Admin123!',    rol:'admin'      });
  await User.create({ nombre:'Profesor',apellido:'Test', email:'profesor@test.com', password:'Profesor123!', rol:'profesor'   });
  await User.create({ nombre:'Alumno',  apellido:'Test', email:'alumno@test.com',   password:'Alumno123!',   rol:'estudiante' });

  // Login admin
  const resAdmin = await request(app).post('/api/auth/login').send({ email:'admin@test.com', password:'Admin123!' });
  adminToken = resAdmin.body.token;

  // Login profesor
  const resProf = await request(app).post('/api/auth/login').send({ email:'profesor@test.com', password:'Profesor123!' });
  profesorToken = resProf.body.token;
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
});

// ══════════════════════════════════════════════════════════════
describe('GET /api/health', () => {
  test('responde con status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ══════════════════════════════════════════════════════════════
describe('POST /api/auth/login', () => {
  test('login exitoso devuelve token y datos del usuario', async () => {
    const res = await request(app).post('/api/auth/login').send({ email:'admin@test.com', password:'Admin123!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin@test.com');
    expect(res.body.user.rol).toBe('admin');
    expect(res.body.user.password).toBeUndefined();
  });

  test('credenciales incorrectas devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email:'admin@test.com', password:'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('usuario inexistente devuelve 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email:'noexiste@test.com', password:'Pass123!' });
    expect(res.status).toBe(401);
  });

  test('campos vacíos devuelve 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email:'', password:'' });
    expect(res.status).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════
describe('GET /api/auth/me', () => {
  test('devuelve usuario autenticado con token válido', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('admin@test.com');
  });

  test('sin token devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('token inválido devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer tokeninvalido');
    expect(res.status).toBe(401);
  });
});

// ══════════════════════════════════════════════════════════════
describe('POST /api/auth/register', () => {
  test('admin puede crear un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre:'Nuevo', apellido:'Usuario', email:'nuevo@test.com', password:'Pass123!', rol:'estudiante' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('nuevo@test.com');
  });

  test('profesor no puede crear usuarios (403)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${profesorToken}`)
      .send({ nombre:'X', apellido:'Y', email:'xy@test.com', password:'Pass123!', rol:'estudiante' });
    expect(res.status).toBe(403);
  });

  test('email duplicado devuelve error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre:'Dup', apellido:'User', email:'admin@test.com', password:'Pass123!', rol:'admin' });
    expect(res.status).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════
describe('CRUD /api/estudiantes', () => {
  test('admin puede crear un estudiante', async () => {
    const res = await request(app)
      .post('/api/estudiantes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre:'Juan', apellido:'Pérez', cedula:'001-0000001-0', email:'juan@test.com', grado:'1ro Bachillerato' });
    expect(res.status).toBe(201);
    expect(res.body.data.nombre).toBe('Juan');
    estudianteCreado = res.body.data;
  });

  test('obtiene lista de estudiantes', async () => {
    const res = await request(app)
      .get('/api/estudiantes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('obtiene estudiante por id', async () => {
    const res = await request(app)
      .get(`/api/estudiantes/${estudianteCreado.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.cedula).toBe('001-0000001-0');
  });

  test('busca estudiante por nombre', async () => {
    const res = await request(app)
      .get('/api/estudiantes?busqueda=Juan')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('admin puede editar un estudiante', async () => {
    const res = await request(app)
      .put(`/api/estudiantes/${estudianteCreado.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ telefono:'809-555-1234' });
    expect(res.status).toBe(200);
    expect(res.body.data.telefono).toBe('809-555-1234');
  });

  test('cédula duplicada devuelve error', async () => {
    const res = await request(app)
      .post('/api/estudiantes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre:'Ana', apellido:'Gómez', cedula:'001-0000001-0', email:'ana@test.com', grado:'1ro Bachillerato' });
    expect(res.status).toBe(400);
  });

  test('estudiante no encontrado devuelve 404', async () => {
    const res = await request(app)
      .get('/api/estudiantes/99999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test('admin puede desactivar un estudiante', async () => {
    const res = await request(app)
      .delete(`/api/estudiantes/${estudianteCreado.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════
describe('CRUD /api/materias', () => {
  test('admin puede crear una materia', async () => {
    const res = await request(app)
      .post('/api/materias')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre:'Matemáticas', codigo:'MAT101', creditos:4, grado:'1ro Bachillerato' });
    expect(res.status).toBe(201);
    expect(res.body.data.codigo).toBe('MAT101');
    materiaCreada = res.body.data;
  });

  test('obtiene lista de materias activas', async () => {
    const res = await request(app)
      .get('/api/materias')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test('profesor puede editar una materia', async () => {
    const res = await request(app)
      .put(`/api/materias/${materiaCreada.id}`)
      .set('Authorization', `Bearer ${profesorToken}`)
      .send({ creditos:3 });
    expect(res.status).toBe(200);
    expect(res.body.data.creditos).toBe(3);
  });

  test('código duplicado devuelve error', async () => {
    const res = await request(app)
      .post('/api/materias')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre:'Otra Materia', codigo:'MAT101', creditos:3, grado:'2do Bachillerato' });
    expect(res.status).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════
describe('GET /api/dashboard', () => {
  test('admin puede ver el dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.resumen).toBeDefined();
    expect(res.body.data.resumen.totalEstudiantes).toBeDefined();
    expect(res.body.data.resumen.totalProfesores).toBeDefined();
    expect(res.body.data.resumen.totalMaterias).toBeDefined();
  });

  test('profesor puede ver el dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${profesorToken}`);
    expect(res.status).toBe(200);
  });
});
