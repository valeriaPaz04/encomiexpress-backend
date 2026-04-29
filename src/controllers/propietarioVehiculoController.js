const { PropietarioVehiculo, Vehiculo } = require('../models');

exports.getAll = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error al obtener propietarios',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const propietario = await PropietarioVehiculo.findByPk(id);

    if (!propietario) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

    res.json({
      success: true,
      data: propietario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener propietario',
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
      tarjetaPropiedad,
      tipoFlota
    } = req.body;

    // Verificar duplicados
    const existing = await PropietarioVehiculo.findOne({ where: { numeroIdentificacion } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'El número de identificación ya está registrado'
      });
    }

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
    res.status(500).json({
      success: false,
      message: 'Error al crear propietario',
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
      tarjetaPropiedad,
      tipoFlota,
      habilitado 
    } = req.body;

    const propietario = await PropietarioVehiculo.findByPk(id);

    if (!propietario) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

    // Verificar documento duplicado
    if (numeroIdentificacion && numeroIdentificacion !== propietario.numeroIdentificacion) {
      const existing = await PropietarioVehiculo.findOne({ where: { numeroIdentificacion } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'El número de identificación ya está registrado'
        });
      }
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
    res.status(500).json({
      success: false,
      message: 'Error al actualizar propietario',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const propietario = await PropietarioVehiculo.findByPk(id);

    if (!propietario) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

    await propietario.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Propietario deshabilitado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar propietario',
      error: error.message
    });
  }
};

exports.getVehiculos = async (req, res) => {
  try {
    const { id } = req.params;
    
    const propietario = await PropietarioVehiculo.findByPk(id);
    if (!propietario) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }

    const vehiculos = await Vehiculo.findAll({
      where: { idPropietario: id }
    });

    res.json({
      success: true,
      data: vehiculos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículos del propietario',
      error: error.message
    });
  }
};
