const { Conductor, Usuario, Vehiculo, AnticipoExcedente, Ruta } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error al obtener conductores',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const conductor = await Conductor.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }]
    });

    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }

    res.json({
      success: true,
      data: conductor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener conductor',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
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
    console.error('=== ERROR en create conductor ===');
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear conductor',
      error: error.message,
      stack: error.stack
    });
  }
};

exports.update = async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
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
    res.status(500).json({
      success: false,
      message: 'Error al actualizar conductor',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const conductor = await Conductor.findByPk(id);

    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }

    await conductor.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Conductor deshabilitado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar conductor',
      error: error.message
    });
  }
};

exports.getVehiculos = async (req, res) => {
  try {
    const { id } = req.params;
    
    const conductor = await Conductor.findByPk(id);
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }

    const vehiculos = await Vehiculo.findAll({
      where: { idConductor: id }
    });

    res.json({
      success: true,
      data: vehiculos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículos del conductor',
      error: error.message
    });
  }
};

exports.getAnticipos = async (req, res) => {
  try {
    const { id } = req.params;
    
    const conductor = await Conductor.findByPk(id);
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
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
    res.status(500).json({
      success: false,
      message: 'Error al obtener anticipos del conductor',
      error: error.message
    });
  }
};

// ============================================
// MÉTODOS PARA CONDUCTOR LOGUEADO
// ============================================

// Obtener mis anticipos como conductor logueado
exports.getMisAnticipos = async (req, res) => {
  try {
    // Verificar que sea conductor
    if (req.usuario.rol?.nombre !== 'conductor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los conductores pueden acceder a esta información'
      });
    }
    
    // Buscar el conductor por el idUsuario del token
    const conductor = await Conductor.findOne({ 
      where: { idUsuario: req.usuario.idUsuario }
    });
    
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
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
    res.status(500).json({
      success: false,
      message: 'Error al obtener anticipos',
      error: error.message
    });
  }
};
