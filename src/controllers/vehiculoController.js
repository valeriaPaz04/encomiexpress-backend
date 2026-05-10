const { Vehiculo, Conductor, PropietarioVehiculo, Ruta } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { estado, habilitado } = req.query;
    
    const where = {};
    if (estado) where.estado = estado;
    if (habilitado !== undefined) where.habilitado = habilitado === 'true';

    const vehiculos = await Vehiculo.findAll({
      where,
      include: [
        { model: Conductor, as: 'conductor', include: [{ model: require('../models').Usuario, as: 'usuario' }] },
        { model: PropietarioVehiculo, as: 'propietario' }
      ]
    });

    res.json({
      success: true,
      data: vehiculos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículos',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findByPk(id, {
      include: [
        { model: Conductor, as: 'conductor', include: [{ model: require('../models').Usuario, as: 'usuario' }] },
        { model: PropietarioVehiculo, as: 'propietario' }
      ]
    });

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    res.json({
      success: true,
      data: vehiculo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículo',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { 
      idConductor,
      idPropietario,
      placa,
      marca,
      modelo,
      color,
      tipo,
      capacidad,
      vencimientoSOAT,
      vencimientoRevisionTecnica,
      vencimientoSeguroTerceros
    } = req.body;

    // Verificar duplicados de placa
    const existing = await Vehiculo.findOne({ where: { placa } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'La placa ya está registrada'
      });
    }

    const vehiculo = await Vehiculo.create({
      idConductor,
      idPropietario,
      placa,
      marca,
      modelo,
      color,
      tipo,
      capacidad,
      estado: 'disponible',
      fechaRegistro: new Date(),
      vencimientoSOAT,
      vencimientoRevisionTecnica,
      vencimientoSeguroTerceros
    });

    res.status(201).json({
      success: true,
      message: 'Vehículo creado exitosamente',
      data: vehiculo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear vehículo',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      idConductor,
      idPropietario,
      placa,
      marca,
      modelo,
      color,
      tipo,
      capacidad,
      estado,
      vencimientoSOAT,
      vencimientoRevisionTecnica,
      vencimientoSeguroTerceros,
      habilitado
    } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Verificar placa duplicada
    if (placa && placa !== vehiculo.placa) {
      const existing = await Vehiculo.findOne({ where: { placa } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'La placa ya está registrada'
        });
      }
    }

    await vehiculo.update({
      idConductor: idConductor || vehiculo.idConductor,
      idPropietario: idPropietario || vehiculo.idPropietario,
      placa: placa || vehiculo.placa,
      marca: marca !== undefined ? marca : vehiculo.marca,
      modelo: modelo !== undefined ? modelo : vehiculo.modelo,
      color: color !== undefined ? color : vehiculo.color,
      tipo: tipo !== undefined ? tipo : vehiculo.tipo,
      capacidad: capacidad !== undefined ? capacidad : vehiculo.capacidad,
      estado: estado || vehiculo.estado,
      vencimientoSOAT: vencimientoSOAT !== undefined ? vencimientoSOAT : vehiculo.vencimientoSOAT,
      vencimientoRevisionTecnica: vencimientoRevisionTecnica !== undefined ? vencimientoRevisionTecnica : vehiculo.vencimientoRevisionTecnica,
      vencimientoSeguroTerceros: vencimientoSeguroTerceros !== undefined ? vencimientoSeguroTerceros : vehiculo.vencimientoSeguroTerceros,
      habilitado: habilitado !== undefined ? habilitado : vehiculo.habilitado
    });

    res.json({
      success: true,
      message: 'Vehículo actualizado exitosamente',
      data: vehiculo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar vehículo',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    await vehiculo.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Vehículo deshabilitado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar vehículo',
      error: error.message
    });
  }
};

exports.getRutas = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    const rutas = await Ruta.findAll({
      where: { idVehiculo: id },
      include: [
        { model: Conductor, as: 'conductor' },
        { model: require('../models').Destino, as: 'destino' }
      ]
    });

    res.json({
      success: true,
      data: rutas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener rutas del vehículo',
      error: error.message
    });
  }
};

// Estados válidos del vehículo
const ESTADOS_VALIDOS = ['disponible', 'ocupado', 'en reparacion'];

exports.cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que se envió el estado
    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'El campo "estado" es requerido'
      });
    }

    // Validar que el estado sea uno de los permitidos
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Los estados permitidos son: ${ESTADOS_VALIDOS.join(', ')}`
      });
    }

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    if (!vehiculo.habilitado) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cambiar el estado de un vehículo deshabilitado'
      });
    }

    const estadoAnterior = vehiculo.estado;
    await vehiculo.update({ estado });

    res.json({
      success: true,
      message: `Estado del vehículo actualizado correctamente`,
      data: {
        idVehiculo: vehiculo.idVehiculo,
        placa: vehiculo.placa,
        estadoAnterior,
        estadoActual: estado
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del vehículo',
      error: error.message
    });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { idConductor } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Verificar que el conductor existe
    const conductor = await Conductor.findByPk(idConductor);
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }

    await vehiculo.update({ idConductor });

    res.json({
      success: true,
      message: 'Conductor asignado exitosamente',
      data: vehiculo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al asignar conductor',
      error: error.message
    });
  }
};