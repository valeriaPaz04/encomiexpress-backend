const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol' }],
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { 
      tipoIdentificacion, 
      numeroIdentificacion, 
      nombre, 
      apellido, 
      telefono, 
      email, 
      password,
      idRol 
    } = req.body;

    // Verificar duplicados
    const existingEmail = await Usuario.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const existingDoc = await Usuario.findOne({ where: { numeroIdentificacion } });
    if (existingDoc) {
      return res.status(400).json({
        success: false,
        message: 'El número de identificación ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      tipoIdentificacion,
      numeroIdentificacion,
      nombre,
      apellido,
      telefono,
      email,
      password: hashedPassword,
      idRol
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        nombre: usuario.nombre
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      tipoIdentificacion, 
      numeroIdentificacion, 
      nombre, 
      apellido, 
      telefono, 
      email,
      idRol,
      habilitado 
    } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar email duplicado
    if (email && email !== usuario.email) {
      const existingEmail = await Usuario.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Verificar documento duplicado
    if (numeroIdentificacion && numeroIdentificacion !== usuario.numeroIdentificacion) {
      const existingDoc = await Usuario.findOne({ where: { numeroIdentificacion } });
      if (existingDoc) {
        return res.status(400).json({
          success: false,
          message: 'El número de identificación ya está registrado'
        });
      }
    }

    await usuario.update({
      tipoIdentificacion: tipoIdentificacion || usuario.tipoIdentificacion,
      numeroIdentificacion: numeroIdentificacion || usuario.numeroIdentificacion,
      nombre: nombre || usuario.nombre,
      apellido: apellido || usuario.apellido,
      telefono: telefono !== undefined ? telefono : usuario.telefono,
      email: email || usuario.email,
      idRol: idRol || usuario.idRol,
      habilitado: habilitado !== undefined ? habilitado : usuario.habilitado
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        nombre: usuario.nombre
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Deshabilitar en lugar de eliminar
    await usuario.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Usuario deshabilitado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al deshabilitar usuario',
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar password actual
    const isValid = await bcrypt.compare(currentPassword, usuario.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password actual incorrecto'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await usuario.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar password',
      error: error.message
    });
  }
};
