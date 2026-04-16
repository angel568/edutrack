const { sequelize } = require('../config/db');
const { User, Estudiante, Materia, Asistencia, Calificacion } = require('../models');

const getDashboard = async (req, res, next) => {
  try {
    const [totalEstudiantes, totalProfesores, totalMaterias, calificaciones, asistencias] =
      await Promise.all([
        Estudiante.count({ where: { activo: true } }),
        User.count({ where: { rol: 'profesor', activo: true } }),
        Materia.count({ where: { activa: true } }),
        Calificacion.findAll({ include: [{ model: Materia, as: 'materia', attributes: ['nombre'] }] }),
        Asistencia.findAll(),
      ]);

    // Promedio por materia
    const promediosPorMateria = {};
    calificaciones.forEach(c => {
      if (c.materia && c.promedio != null) {
        const key = c.materia.nombre;
        if (!promediosPorMateria[key]) promediosPorMateria[key] = { suma: 0, count: 0 };
        promediosPorMateria[key].suma += c.promedio;
        promediosPorMateria[key].count++;
      }
    });
    const promediosMaterias = Object.entries(promediosPorMateria).map(([nombre, { suma, count }]) => ({
      nombre, promedio: Math.round((suma / count) * 100) / 100,
    }));

    // Asistencia global
    let totalRegistros = asistencias.length, totalPresentes = 0;
    asistencias.forEach(a => { if (a.estado === 'presente') totalPresentes++; });
    const porcentajeAsistencia = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0;

    res.json({
      success: true,
      data: {
        resumen: { totalEstudiantes, totalProfesores, totalMaterias },
        promediosMaterias,
        asistencia: { porcentajeAsistencia, totalRegistros, totalPresentes },
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getDashboard };
