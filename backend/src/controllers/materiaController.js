const { Materia, User, Calificacion } = require('../models');

const getMaterias = async (req, res, next) => {
  try {
    const where = { activa: true };
    if (req.query.grado) where.grado = req.query.grado;
    const materias = await Materia.findAll({
      where,
      include: [{ model: User, as: 'profesor', attributes: ['id', 'nombre', 'apellido', 'email'] }],
      order: [['nombre', 'ASC']],
    });
    res.json({ success: true, count: materias.length, data: materias });
  } catch (err) { next(err); }
};

const getMateria = async (req, res, next) => {
  try {
    const materia = await Materia.findByPk(req.params.id, {
      include: [{ model: User, as: 'profesor', attributes: ['id', 'nombre', 'apellido'] }],
    });
    if (!materia) return res.status(404).json({ success: false, message: 'Materia no encontrada.' });
    res.json({ success: true, data: materia });
  } catch (err) { next(err); }
};

const createMateria = async (req, res, next) => {
  try {
    const materia = await Materia.create(req.body);
    res.status(201).json({ success: true, data: materia });
  } catch (err) { next(err); }
};

const updateMateria = async (req, res, next) => {
  try {
    const materia = await Materia.findByPk(req.params.id);
    if (!materia) return res.status(404).json({ success: false, message: 'Materia no encontrada.' });
    await materia.update(req.body);
    res.json({ success: true, data: materia });
  } catch (err) { next(err); }
};

const deleteMateria = async (req, res, next) => {
  try {
    const tieneCalificaciones = await Calificacion.findOne({ where: { materiaId: req.params.id } });
    if (tieneCalificaciones)
      return res.status(400).json({ success: false, message: 'No se puede eliminar una materia con calificaciones registradas.' });
    const materia = await Materia.findByPk(req.params.id);
    if (!materia) return res.status(404).json({ success: false, message: 'Materia no encontrada.' });
    await materia.update({ activa: false });
    res.json({ success: true, message: 'Materia desactivada correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { getMaterias, getMateria, createMateria, updateMateria, deleteMateria };
