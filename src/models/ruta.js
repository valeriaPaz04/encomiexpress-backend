const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ruta = sequelize.define('Ruta', {
  idRuta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idRuta'
  },
  idVehiculo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idConductor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idDestino: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  horaSalida: {
    type: DataTypes.TIME,
    allowNull: true
  },
  horaLlegadaEstimada: {
    type: DataTypes.TIME,
    allowNull: true
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fechaCreacion: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ruta',
  timestamps: false
});

module.exports = Ruta;
