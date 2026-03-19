const { Cliente, EncomiendaVenta } = require('../models');

// ============================================
// Listar todos los clientes
// ============================================
const listarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: { habilitado: true },
      attributes: { exclude: [] },
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

    // Verificar si el número de identificación ya existe
    const existingCliente = await Cliente.findOne({ where: { numeroIdentificacion } });
    if (existingCliente) {
      return res.status(400).json({
        success: false,
        message: 'El número de identificación ya está registrado'
      });
    }

    // Verificar si el email ya existe
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

    // Verificar si el nuevo número de identificación ya existe en otro cliente
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

    // Verificar si el nuevo email ya existe en otro cliente
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
// Eliminar (inhabilitar) un cliente
// ============================================
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar si tiene encomiendas asociadas
    const encomiendasCount = await EncomiendaVenta.count({ where: { idCliente: id } });
    if (encomiendasCount > 0) {
      // En lugar de eliminar, lo inhabilitamos
      await cliente.update({ habilitado: false });
      return res.json({
        success: true,
        message: 'Cliente inhabilitado (tiene encomiendas asociadas)',
        data: cliente
      });
    }

    // Si no tiene encomiendas, eliminar lógicamente
    await cliente.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      data: cliente
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: error.message
    });
  }
};

// ============================================
// Exportar controladores
// ============================================
module.exports = {
  listarClientes,
  obtenerCliente,
  registrarCliente,
  actualizarCliente,
  eliminarCliente
};
