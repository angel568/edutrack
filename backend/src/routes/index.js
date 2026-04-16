const express = require('express');
const { protect, authorize } = require('../middleware/auth');

// ── AUTH ──────────────────────────────────────────────────────────────────────
const { login, getMe, register, getUsers } = require('../controllers/authController');
const authRouter = express.Router();
authRouter.post('/login', login);
authRouter.get('/me', protect, getMe);
authRouter.post('/register', protect, authorize('admin'), register);
authRouter.get('/users', protect, authorize('admin'), getUsers);

// ── ESTUDIANTES ───────────────────────────────────────────────────────────────
const { getEstudiantes, getEstudiante, createEstudiante, updateEstudiante, deleteEstudiante } =
  require('../controllers/estudianteController');
const estudianteRouter = express.Router();
estudianteRouter.use(protect);
estudianteRouter.route('/').get(getEstudiantes).post(authorize('admin'), createEstudiante);
estudianteRouter.route('/:id')
  .get(getEstudiante)
  .put(authorize('admin'), updateEstudiante)
  .delete(authorize('admin'), deleteEstudiante);

// ── MATERIAS ──────────────────────────────────────────────────────────────────
const { getMaterias, getMateria, createMateria, updateMateria, deleteMateria } =
  require('../controllers/materiaController');
const materiaRouter = express.Router();
materiaRouter.use(protect);
materiaRouter.route('/').get(getMaterias).post(authorize('admin'), createMateria);
materiaRouter.route('/:id')
  .get(getMateria)
  .put(authorize('admin', 'profesor'), updateMateria)
  .delete(authorize('admin'), deleteMateria);

// ── ASISTENCIA ────────────────────────────────────────────────────────────────
const { registrarAsistencia, getAsistencia, getReporteAsistencia } =
  require('../controllers/asistenciaController');
const asistenciaRouter = express.Router();
asistenciaRouter.use(protect);
asistenciaRouter.route('/').get(getAsistencia).post(authorize('admin', 'profesor'), registrarAsistencia);
asistenciaRouter.get('/reporte/:estudianteId', getReporteAsistencia);

// ── CALIFICACIONES ────────────────────────────────────────────────────────────
const { getCalificaciones, createCalificacion, updateCalificacion, cerrarPeriodo } =
  require('../controllers/calificacionController');
const calificacionRouter = express.Router();
calificacionRouter.use(protect);
calificacionRouter.route('/').get(getCalificaciones).post(authorize('admin', 'profesor'), createCalificacion);
calificacionRouter.put('/cerrar-periodo', authorize('admin'), cerrarPeriodo);
calificacionRouter.put('/:id', authorize('admin', 'profesor'), updateCalificacion);

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const { getDashboard } = require('../controllers/dashboardController');
const dashboardRouter = express.Router();
dashboardRouter.get('/', protect, authorize('admin', 'profesor'), getDashboard);

// ── REPORTES ──────────────────────────────────────────────────────────────────
const { exportCalificacionesExcel, exportAsistenciaExcel, exportCalificacionesPDF } =
  require('../controllers/reporteController');
const reporteRouter = express.Router();
reporteRouter.use(protect, authorize('admin', 'profesor'));
reporteRouter.get('/calificaciones/excel', exportCalificacionesExcel);
reporteRouter.get('/calificaciones/pdf',   exportCalificacionesPDF);
reporteRouter.get('/asistencia/excel',     exportAsistenciaExcel);

module.exports = { authRouter, estudianteRouter, materiaRouter, asistenciaRouter, calificacionRouter, dashboardRouter, reporteRouter };
