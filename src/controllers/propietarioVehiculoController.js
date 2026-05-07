const { PropietarioVehiculo, Vehiculo } = require('../models');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { habilitado } = req.query;
    
    const where = {};
    if (habilitado !== undefined) where.habilitado = habilitado === 'true';

    const propietarios = await PropietarioVehiculo.findAll({ where });

    res.json({
      success: true,
      data: propietarios
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const propietario = await PropietarioVehiculo.findByPk(id);

    if (!propietario) {
      return next(new AppError('Propietario no encontrado', 404));
    }

    res.json({
      success: true,
      data: propietario
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { 
      tipoIdentificacion, 
      numeroIdentificacion, 
      nombre, 
      apellido, 
      telefono, 
      email, 
      tarjetaPropiedad,
      tipoFlota
    } = req.body;

    const propietario = await PropietarioVehiculo.create({
      tipoIdentificacion,
      numeroIdentificacion,
      nombre,
      apellido,
      telefono,
      email,
      tarjetaPropiedad,
      tipoFlota
    });

    res.status(201).json({
      success: true,
      message: 'Propietario creado exitosamente',
      data: propietario
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      tipoIdentificacion, 
      numeroIdentificacion, 
      nombre, 
      apellido, 
      telefono, 
      email, 
      tarjetaPropiedad,
      tipoFlota,
      habilitado 
    } = req.body;

    const propietario = await PropietarioVehiculo.findByPk(id);

    if (!propietario) {
      return next(new AppError('Propietario no encontrado', 404));
    }

    await propietario.update({
      tipoIdentificacion: tipoIdentificacion || propietario.tipoIdentificacion,
      numeroIdentificacion: numeroIdentificacion || propietario.numeroIdentificacion,
      nombre: nombre || propietario.nombre,
      apellido: apellido || propietario.apellido,
      telefono: telefono !== undefined ? telefono : propietario.telefono,
      email: email !== undefined ? email : propietario.email,
      tarjetaPropiedad: tarjetaPropiedad !== undefined ? tarjetaPropiedad : propietario.tarjetaPropiedad,
      tipoFlota: tipoFlota !== undefined ? tipoFlota : propietario.tipoFlota,
      habilitado: habilitado !== undefined ? habilitado : propietario.habilitado
    });

    res.json({
      success: true,
      message: 'Propietario actualizado exitosamente',
      data: propietario
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const propietario = await PropietarioVehiculo.findByPk(id);

    if (!propietario) {
      return next(new AppError('Propietario no encontrado', 404));
    }

    await propietario.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Propietario deshabilitado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.getVehiculos = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const propietario = await PropietarioVehiculo.findByPk(id);
    if (!propietario) {
      return next(new AppError('Propietario no encontrado', 404));
    }

    const vehiculos = await Vehiculo.findAll({
      where: { idPropietario: id }
    });

    res.json({
      success: true,
      data: vehiculos
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll: exports.getAll,
  getById: exports.getById,
  create: exports.create,
  update: exports.update,
  delete: exports.delete,
  getVehiculos: exports.getVehiculos
};
