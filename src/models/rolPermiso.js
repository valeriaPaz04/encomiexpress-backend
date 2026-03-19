const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolPermiso = sequelize.define('RolPermiso', {
  idRolPermiso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idRolPermiso'
  },
  idRol: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idPermiso: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'rolPermiso',
  timestamps: false
});

module.exports = RolPermiso;
