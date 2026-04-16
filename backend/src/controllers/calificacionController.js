const { Calificacion, Estudiante, Materia } = require('../models');

const getCalificaciones = async (req, res, next) => {
  try {
    const { estudianteId, materiaId, periodo } = req.query;
    const where = {};
    if (estudianteId) where.estudianteId = estudianteId;
    if (materiaId)    where.materiaId    = materiaId;
    if (periodo)      where.periodo      = periodo;

    if (req.user.rol === 'estudiante') {
      const est = await Estudiante.findOne({ where: { userId: req.user.id } });
      if (est) where.estudianteId = est.id;
    }

    const calificaciones = await Calificacion.findAll({
      where,
      include: [
        { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombre', 'apellido', 'cedula'] },
        { model: Materia,    as: 'materia',    attributes: ['id', 'nombre', 'codigo'] },
      ],
      order: [['periodo', 'DESC']],
    });
    res.json({ success: true, count: calificaciones.length, data: calificaciones });
  } catch (err) { next(err); }
};

const createCalificacion = async (req, res, next) => {
  try {
    const calificacion = await Calificacion.create(req.body);
    res.status(201).json({ success: true, data: calificacion });
  } catch (err) { next(err); }
};

const updateCalificacion = async (req, res, next) => {
  try {
    const cal = await Calificacion.findByPk(req.params.id);
    if (!cal) return res.status(404).json({ success: false, message: 'Calificación no encontrada.' });
    if (!cal.periodoAbierto)
      return res.status(400).json({ success: false, message: 'El periodo está cerrado.' });
    await cal.update(req.body);
    res.json({ success: true, data: cal });
  } catch (err) { next(err); }
};

const cerrarPeriodo = async (req, res, next) => {
  try {
    const { materiaId, periodo } = req.body;
    await Calificacion.update({ periodoAbierto: false }, { where: { materiaId, periodo } });
    res.json({ success: true, message: 'Periodo cerrado correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { getCalificaciones, createCalificacion, updateCalificacion, cerrarPeriodo };
