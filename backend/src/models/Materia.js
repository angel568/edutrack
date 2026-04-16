const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Materia = sequelize.define('Materia', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:    { type: DataTypes.STRING(100), allowNull: false },
  codigo:    { type: DataTypes.STRING(20),  allowNull: false, unique: true },
  creditos:  { type: DataTypes.INTEGER,     allowNull: false, validate: { min: 1, max: 6 } },
  grado:     { type: DataTypes.STRING(50),  allowNull: false },
  profesorId:{ type: DataTypes.INTEGER, allowNull: true },
  activa:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'materias',
  hooks: {
    beforeValidate: (materia) => {
      if (materia.codigo) materia.codigo = materia.codigo.toUpperCase();
    },
  },
});

module.exports = Materia;
