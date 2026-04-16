const { Op } = require('sequelize');
const { Estudiante, User } = require('../models');

const getEstudiantes = async (req, res, next) => {
  try {
    const { busqueda, grado, activo } = req.query;
    const where = {};
    if (busqueda) {
      where[Op.or] = [
        { nombre:   { [Op.like]: `%${busqueda}%` } },
        { apellido: { [Op.like]: `%${busqueda}%` } },
        { cedula:   { [Op.like]: `%${busqueda}%` } },
      ];
    }
    if (grado)  where.grado  = grado;
    if (activo !== undefined) where.activo = activo === 'true';

    const estudiantes = await Estudiante.findAll({ where, order: [['apellido', 'ASC'], ['nombre', 'ASC']] });
    res.json({ success: true, count: estudiantes.length, data: estudiantes });
  } catch (err) { next(err); }
};

const getEstudiante = async (req, res, next) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id);
    if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado.' });
    res.json({ success: true, data: estudiante });
  } catch (err) { next(err); }
};

const createEstudiante = async (req, res, next) => {
  try {
    const estudiante = await Estudiante.create(req.body);
    res.status(201).json({ success: true, data: estudiante });
  } catch (err) { next(err); }
};

const updateEstudiante = async (req, res, next) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id);
    if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado.' });
    await estudiante.update(req.body);
    res.json({ success: true, data: estudiante });
  } catch (err) { next(err); }
};

const deleteEstudiante = async (req, res, next) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id);
    if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado.' });
    await estudiante.update({ activo: false });
    res.json({ success: true, message: 'Estudiante desactivado correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { getEstudiantes, getEstudiante, createEstudiante, updateEstudiante, deleteEstudiante };
