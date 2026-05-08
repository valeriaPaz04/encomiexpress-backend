const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolPermiso = sequelize.define('RolPermiso', {
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