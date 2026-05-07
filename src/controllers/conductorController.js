const { Conductor, Usuario, Vehiculo, AnticipoExcedente, Ruta } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { estado, habilitado } = req.query;
    
    const where = {};
    if (estado) where.estado = estado;
    if (habilitado !== undefined) where.habilitado = habilitado === 'true';

    const conductores = await Conductor.findAll({
      where,
      include: [{ model: Usuario, as: 'usuario' }]
    });

    res.json({
      success: true,
      data: conductores
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conductor = await Conductor.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }]
    });

    if (!conductor) {
      return next(new AppError('Conductor no encontrado', 404));
    }

    res.json({
      success: true,
      data: conductor
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    console.log('=== POST /conductores - Datos recibidos ===');
    console.log(req.body);
    
    const { 
      tipoIdentificacion, 
      numeroIdentificacion, 
      nombre, 
      apellido, 
      telefono, 
      email, 
      password,
      categoriaLicencia,
      numeroLicencia,
      vencimientoLicencia
    } = req.body;

    // Generar identificador único
    const uniqueId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const finalNumId = numeroIdentificacion || uniqueId;
    const finalEmail = email || `conductor${uniqueId}@test.com`;
    
    console.log('=== Creando usuario con: ===');
    console.log({
      tipoIdentificacion: tipoIdentificacion || 'CC',
      numeroIdentificacion: finalNumId,
      nombre: nombre || 'Conductor',
      apellido: apellido || 'Nuevo',
      telefono: telefono || uniqueId,
      email: finalEmail
    });
    
    // Crear usuario primero
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    const usuarioData = {
      tipoIdentificacion: tipoIdentificacion || 'CC',
      numeroIdentificacion: finalNumId,
      nombre: nombre || 'Conductor',
      apellido: apellido || 'Nuevo',
      telefono: telefono || uniqueId,
      email: finalEmail,
      password: hashedPassword,
      idRol: 3, // Rol de conductor por defecto
      habilitado: true
    };
    
    // Agregar rol si se proporciona
    if (req.body.idRol) {
      usuarioData.idRol = req.body.idRol;
    }
    
    const usuario = await Usuario.create(usuarioData);
    console.log('Usuario creado con ID:', usuario.idUsuario);

    // Crear conductor
    const conductor = await Conductor.create({
      idUsuario: usuario.idUsuario,
      categoriaLicencia: categoriaLicencia || 'B1',
      numeroLicencia: numeroLicencia || uniqueId,
      vencimientoLicencia: vencimientoLicencia,
      estado: 'activo'
    });
    
    console.log('Conductor creado con ID:', conductor.idConductor);

    res.status(201).json({
      success: true,
      message: 'Conductor creado exitosamente',
      data: {
        idConductor: conductor.idConductor,
        idUsuario: conductor.idUsuario,
        nombre: `${nombre || 'Conductor'} ${apellido || 'Nuevo'}`,
        email: finalEmail
      }
    });
  } catch (error) {
    // Validar si es un error de llave única de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Revisar qué campo causó el error
      if (error.errors.some(e => e.path === 'numeroLicencia')) {
        return next(new (require('../utils/AppError'))('El número de licencia ya está registrado para otro conductor.', 400));
      }
      if (error.errors.some(e => e.path === 'idUsuario')) {
        return next(new (require('../utils/AppError'))('Este usuario ya está registrado como conductor.', 400));
      }
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      categoriaLicencia,
      numeroLicencia,
      vencimientoLicencia,
      estado,
      habilitado 
    } = req.body;

    const conductor = await Conductor.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }]
    });

    if (!conductor) {
      return next(new AppError('Conductor no encontrado', 404));
    }

    await conductor.update({
      categoriaLicencia: categoriaLicencia !== undefined ? categoriaLicencia : conductor.categoriaLicencia,
      numeroLicencia: numeroLicencia !== undefined ? numeroLicencia : conductor.numeroLicencia,
      vencimientoLicencia: vencimientoLicencia !== undefined ? vencimientoLicencia : conductor.vencimientoLicencia,
      estado: estado || conductor.estado,
      habilitado: habilitado !== undefined ? habilitado : conductor.habilitado
    });

    res.json({
      success: true,
      message: 'Conductor actualizado exitosamente',
      data: conductor
    });
  } catch (error) {
    // Validar si es un error de llave única de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.errors.some(e => e.path === 'numeroLicencia')) {
        return next(new AppError('El número de licencia ya está registrado para otro conductor.', 400));
      }
    }
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conductor = await Conductor.findByPk(id);

    if (!conductor) {
      return next(new AppError('Conductor no encontrado', 404));
    }

    await conductor.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Conductor deshabilitado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.getVehiculos = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const conductor = await Conductor.findByPk(id);
    if (!conductor) {
      return next(new AppError('Conductor no encontrado', 404));
    }

    const vehiculos = await Vehiculo.findAll({
      where: { idConductor: id }
    });

    res.json({
      success: true,
      data: vehiculos
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnticipos = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const conductor = await Conductor.findByPk(id);
    if (!conductor) {
      return next(new AppError('Conductor no encontrado', 404));
    }

    const anticipos = await AnticipoExcedente.findAll({
      where: { idConductor: id },
      include: [{ model: Ruta, as: 'ruta' }]
    });

    res.json({
      success: true,
      data: anticipos
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// MÉTODOS PARA CONDUCTOR LOGUEADO
// ============================================

// Obtener mis anticipos como conductor logueado
exports.getMisAnticipos = async (req, res, next) => {
  try {
    // Verificar que sea conductor
    if (req.usuario.rol?.nombre !== 'conductor') {
      return next(new AppError('Solo los conductores pueden acceder a esta información', 403));
    }
    
    // Buscar el conductor por el idUsuario del token
    const conductor = await Conductor.findOne({ 
      where: { idUsuario: req.usuario.idUsuario }
    });
    
    if (!conductor) {
      return next(new AppError('Conductor no encontrado', 404));
    }

    // Obtener anticipos del conductor
    const anticipos = await AnticipoExcedente.findAll({
      where: { idConductor: conductor.idConductor },
      include: [{ model: Ruta, as: 'ruta' }]
    });

    res.json({
      success: true,
      data: anticipos
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
  getVehiculos: exports.getVehiculos,
  getAnticipos: exports.getAnticipos,
  getMisAnticipos: exports.getMisAnticipos
};
