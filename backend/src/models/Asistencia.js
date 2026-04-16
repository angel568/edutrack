const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Asistencia = sequelize.define('Asistencia', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  estudianteId:  { type: DataTypes.INTEGER, allowNull: false },
  materiaId:     { type: DataTypes.INTEGER, allowNull: false },
  fecha:         { type: DataTypes.DATEONLY, allowNull: false },
  estado:        { type: DataTypes.ENUM('presente', 'ausente', 'tardanza'), allowNull: false },
  registradoPorId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'asistencias',
  indexes: [{ unique: true, fields: ['estudianteId', 'materiaId', 'fecha'] }],
});

module.exports = Asistencia;
