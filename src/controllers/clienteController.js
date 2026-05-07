const { Cliente } = require('../models');
const AppError = require('../utils/AppError');

// ============================================
// Listar todos los clientes (habilitados e inhabilitados)
// ============================================
const listarClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.findAll({
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Obtener un cliente por ID
// ============================================
const obtenerCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return next(new AppError('Cliente no encontrado', 404));
    }

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Registrar un nuevo cliente
// ============================================
const registrarCliente = async (req, res, next) => {
  try {
    const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, telefono, email, direccion } = req.body;

    const existingCliente = await Cliente.findOne({ where: { numeroIdentificacion } });
    if (existingCliente) {
      return next(new AppError('El número de identificación ya está registrado', 400));
    }

    if (email) {
      const existingEmail = await Cliente.findOne({ where: { email } });
      if (existingEmail) {
        return next(new AppError('El email ya está registrado', 400));
      }
    }

    const nuevoCliente = await Cliente.create({
      tipoIdentificacion,
      numeroIdentificacion,
      nombre,
      apellido,
      telefono,
      email,
      direccion,
      habilitado: true
    });

    res.status(201).json({
      success: true,
      message: 'Cliente registrado exitosamente',
      data: nuevoCliente
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Actualizar un cliente
// ============================================
const actualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, telefono, email, direccion } = req.body;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return next(new AppError('Cliente no encontrado', 404));
    }

    if (numeroIdentificacion && numeroIdentificacion !== cliente.numeroIdentificacion) {
      const existingCliente = await Cliente.findOne({
        where: { numeroIdentificacion, id: { [require('sequelize').Op.ne]: id } }
      });
      if (existingCliente) {
        return next(new AppError('El número de identificación ya está registrado', 400));
      }
    }

    if (email && email !== cliente.email) {
      const existingEmail = await Cliente.findOne({
        where: { email, id: { [require('sequelize').Op.ne]: id } }
      });
      if (existingEmail) {
        return next(new AppError('El email ya está registrado', 400));
      }
    }

    await cliente.update({
      tipoIdentificacion: tipoIdentificacion || cliente.tipoIdentificacion,
      numeroIdentificacion: numeroIdentificacion || cliente.numeroIdentificacion,
      nombre: nombre || cliente.nombre,
      apellido: apellido || cliente.apellido,
      telefono: telefono || cliente.telefono,
      email: email || cliente.email,
      direccion: direccion || cliente.direccion
    });

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Toggle habilitado/inhabilitado
// ============================================
const toggleHabilitadoCliente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return next(new AppError('Cliente no encontrado', 404));
    }

    await cliente.update({ habilitado: !cliente.habilitado });

    res.json({
      success: true,
      message: `Cliente ${cliente.habilitado ? 'habilitado' : 'inhabilitado'} exitosamente`,
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarClientes,
  obtenerCliente,
  registrarCliente,
  actualizarCliente,
  toggleHabilitadoCliente,
};
