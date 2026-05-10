const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolPermiso = sequelize.define('RolPermiso', {

  idRol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },

  idPermiso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }

}, {
  tableName: 'RolPermiso',
  timestamps: false
});

module.exports = RolPermiso;