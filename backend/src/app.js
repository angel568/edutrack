const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const {
  authRouter, estudianteRouter, materiaRouter,
  asistenciaRouter, calificacionRouter, dashboardRouter, reporteRouter,
} = require('./routes/index');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/auth',           authRouter);
app.use('/api/estudiantes',    estudianteRouter);
app.use('/api/materias',       materiaRouter);
app.use('/api/asistencia',     asistenciaRouter);
app.use('/api/calificaciones', calificacionRouter);
app.use('/api/dashboard',      dashboardRouter);
app.use('/api/reportes',       reporteRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', db: 'mysql', version: '2.0.0' }));
app.use((req, res) => res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` }));
app.use(errorHandler);

module.exports = app;
