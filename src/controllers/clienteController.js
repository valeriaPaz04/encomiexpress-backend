const { Cliente } = require('../models');

// ============================================
// Listar todos los clientes (habilitados e inhabilitados)
// ============================================
const listarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar clientes',
      error: error.message
    });
  }
};

// ============================================
// Obtener un cliente por ID
// ============================================
const obtenerCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error.message
    });
  }
};

// ============================================
// Registrar un nuevo cliente
// ============================================
const registrarCliente = async (req, res) => {
  try {
    const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, telefono, email, direccion } = req.body;

    const existingCliente = await Cliente.findOne({ where: { numeroIdentificacion } });
    if (existingCliente) {
      return res.status(400).json({
        success: false,
        message: 'El número de identificación ya está registrado'
      });
    }

    if (email) {
      const existingEmail = await Cliente.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
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
    console.error('Error al registrar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar cliente',
      error: error.message
    });
  }
};

// ============================================
// Actualizar un cliente
// ============================================
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, telefono, email, direccion } = req.body;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (numeroIdentificacion && numeroIdentificacion !== cliente.numeroIdentificacion) {
      const existingCliente = await Cliente.findOne({
        where: { numeroIdentificacion, id: { [require('sequelize').Op.ne]: id } }
      });
      if (existingCliente) {
        return res.status(400).json({
          success: false,
          message: 'El número de identificación ya está registrado'
        });
      }
    }

    if (email && email !== cliente.email) {
      const existingEmail = await Cliente.findOne({
        where: { email, id: { [require('sequelize').Op.ne]: id } }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
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
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error.message
    });
  }
};

// ============================================
// Toggle habilitado/inhabilitado
// ============================================
const toggleHabilitadoCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    await cliente.update({ habilitado: !cliente.habilitado });

    res.json({
      success: true,
      message: `Cliente ${cliente.habilitado ? 'habilitado' : 'inhabilitado'} exitosamente`,
      data: cliente
    });
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del cliente',
      error: error.message
    });
  }
};

module.exports = {
  listarClientes,
  obtenerCliente,
  registrarCliente,
  actualizarCliente,
  toggleHabilitadoCliente,
};