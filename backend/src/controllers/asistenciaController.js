const { Op } = require('sequelize');
const { Asistencia, Estudiante, Materia, User } = require('../models');

const registrarAsistencia = async (req, res, next) => {
  try {
    const { estudianteId, materiaId, fecha, estado } = req.body;

    const fechaDate = new Date(fecha);
    const hoy = new Date(); hoy.setHours(23, 59, 59, 999);
    if (fechaDate > hoy)
      return res.status(400).json({ success: false, message: 'No se puede registrar asistencia para fechas futuras.' });

    const [asistencia, created] = await Asistencia.findOrCreate({
      where: { estudianteId, materiaId, fecha },
      defaults: { estudianteId, materiaId, fecha, estado, registradoPorId: req.user.id },
    });

    if (!created) await asistencia.update({ estado, registradoPorId: req.user.id });

    res.status(created ? 201 : 200).json({ success: true, data: asistencia });
  } catch (err) { next(err); }
};

const getAsistencia = async (req, res, next) => {
  try {
    const { materiaId, estudianteId, fechaInicio, fechaFin } = req.query;
    const where = {};
    if (materiaId)   where.materiaId   = materiaId;
    if (estudianteId) where.estudianteId = estudianteId;
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha[Op.gte] = fechaInicio;
      if (fechaFin)    where.fecha[Op.lte] = fechaFin;
    }

    const asistencias = await Asistencia.findAll({
      where,
      include: [
        { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombre', 'apellido', 'cedula'] },
        { model: Materia,    as: 'materia',    attributes: ['id', 'nombre', 'codigo'] },
        { model: User,       as: 'registradoPor', attributes: ['id', 'nombre', 'apellido'] },
      ],
      order: [['fecha', 'DESC']],
    });
    res.json({ success: true, count: asistencias.length, data: asistencias });
  } catch (err) { next(err); }
};

const getReporteAsistencia = async (req, res, next) => {
  try {
    const { estudianteId } = req.params;
    const { materiaId } = req.query;
    const where = { estudianteId };
    if (materiaId) where.materiaId = materiaId;

    const asistencias = await Asistencia.findAll({
      where,
      include: [{ model: Materia, as: 'materia', attributes: ['id', 'nombre', 'codigo'] }],
    });

    const reporte = {};
    asistencias.forEach(a => {
      const key = a.materiaId;
      if (!reporte[key]) reporte[key] = { materia: a.materia, total: 0, presente: 0, ausente: 0, tardanza: 0 };
      reporte[key].total++;
      reporte[key][a.estado]++;
    });

    const resultado = Object.values(reporte).map(r => ({
      ...r,
      porcentaje: r.total > 0 ? Math.round((r.presente / r.total) * 100) : 0,
    }));

    res.json({ success: true, data: resultado });
  } catch (err) { next(err); }
};

module.exports = { registrarAsistencia, getAsistencia, getReporteAsistencia };
