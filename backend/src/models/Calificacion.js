const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Calificacion = sequelize.define('Calificacion', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  estudianteId: { type: DataTypes.INTEGER, allowNull: false },
  materiaId:    { type: DataTypes.INTEGER, allowNull: false },
  periodo:      { type: DataTypes.STRING(10), allowNull: false },
  parcial1:     { type: DataTypes.FLOAT, validate: { min: 0, max: 100 } },
  parcial2:     { type: DataTypes.FLOAT, validate: { min: 0, max: 100 } },
  parcial3:     { type: DataTypes.FLOAT, validate: { min: 0, max: 100 } },
  final:        { type: DataTypes.FLOAT, validate: { min: 0, max: 100 } },
  promedio:     { type: DataTypes.FLOAT },
  aprobado:     { type: DataTypes.BOOLEAN },
  periodoAbierto: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'calificaciones',
  indexes: [{ unique: true, fields: ['estudianteId', 'materiaId', 'periodo'] }],
  hooks: {
    beforeSave: (cal) => {
      const notas = [cal.parcial1, cal.parcial2, cal.parcial3, cal.final]
        .filter(n => n !== null && n !== undefined);
      if (notas.length > 0) {
        cal.promedio = Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100;
        cal.aprobado = cal.promedio >= 60;
      }
    },
  },
});

module.exports = Calificacion;
