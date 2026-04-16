const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Estudiante = sequelize.define('Estudiante', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:          { type: DataTypes.STRING(100), allowNull: false },
  apellido:        { type: DataTypes.STRING(100), allowNull: false },
  cedula:          { type: DataTypes.STRING(20),  allowNull: false, unique: true },
  email:           { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  telefono:        { type: DataTypes.STRING(20) },
  fechaNacimiento: { type: DataTypes.DATEONLY },
  grado:           { type: DataTypes.STRING(50),  allowNull: false },
  activo:          { type: DataTypes.BOOLEAN, defaultValue: true },
  userId:          { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'estudiantes',
  getterMethods: {
    nombreCompleto() { return `${this.nombre} ${this.apellido}`; },
  },
});

module.exports = Estudiante;
