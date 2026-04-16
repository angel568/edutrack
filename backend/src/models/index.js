const User        = require('./User');
const Estudiante  = require('./Estudiante');
const Materia     = require('./Materia');
const Asistencia  = require('./Asistencia');
const Calificacion = require('./Calificacion');

// User → Estudiante
User.hasOne(Estudiante, { foreignKey: 'userId', as: 'perfil' });
Estudiante.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });

// User (profesor) → Materia
User.hasMany(Materia, { foreignKey: 'profesorId', as: 'materias' });
Materia.belongsTo(User, { foreignKey: 'profesorId', as: 'profesor' });

// Asistencia
Estudiante.hasMany(Asistencia, { foreignKey: 'estudianteId', as: 'asistencias' });
Asistencia.belongsTo(Estudiante, { foreignKey: 'estudianteId', as: 'estudiante' });

Materia.hasMany(Asistencia, { foreignKey: 'materiaId', as: 'asistencias' });
Asistencia.belongsTo(Materia, { foreignKey: 'materiaId', as: 'materia' });

User.hasMany(Asistencia, { foreignKey: 'registradoPorId', as: 'asistenciasRegistradas' });
Asistencia.belongsTo(User, { foreignKey: 'registradoPorId', as: 'registradoPor' });

// Calificaciones
Estudiante.hasMany(Calificacion, { foreignKey: 'estudianteId', as: 'calificaciones' });
Calificacion.belongsTo(Estudiante, { foreignKey: 'estudianteId', as: 'estudiante' });

Materia.hasMany(Calificacion, { foreignKey: 'materiaId', as: 'calificaciones' });
Calificacion.belongsTo(Materia, { foreignKey: 'materiaId', as: 'materia' });

module.exports = { User, Estudiante, Materia, Asistencia, Calificacion };
