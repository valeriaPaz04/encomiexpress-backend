const { Ruta, Vehiculo, Conductor, Destino, EncomiendaVenta } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { habilitado } = req.query;
    
    const where = {};
    if (habilitado !== undefined) where.habilitado = habilitado === 'true';

    const rutas = await Ruta.findAll({
      where,
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Conductor, as: 'conductor', include: [{ model: require('../models').Usuario, as: 'usuario' }] },
        { model: Destino, as: 'destino' }
      ]
    });

    res.json({
      success: true,
      data: rutas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener rutas',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const ruta = await Ruta.findByPk(id, {
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Conductor, as: 'conductor', include: [{ model: require('../models').Usuario, as: 'usuario' }] },
        { model: Destino, as: 'destino' }
      ]
    });

    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    }

    res.json({
      success: true,
      data: ruta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ruta',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { idVehiculo, idConductor, idDestino, horaSalida, horaLlegadaEstimada } = req.body;

    // Verificar que el vehículo existe y está disponible
    const vehiculo = await Vehiculo.findByPk(idVehiculo);
    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Verificar que el conductor existe y está activo
    const conductor = await Conductor.findByPk(idConductor);
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }

    // Verificar que el destino existe
    const destino = await Destino.findByPk(idDestino);
    if (!destino) {
      return res.status(404).json({
        success: false,
        message: 'Destino no encontrado'
      });
    }

    const ruta = await Ruta.create({
      idVehiculo,
      idConductor,
      idDestino,
      horaSalida,
      horaLlegadaEstimada
    });

    res.status(201).json({
      success: true,
      message: 'Ruta creada exitosamente',
      data: ruta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear ruta',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { idVehiculo, idConductor, idDestino, horaSalida, horaLlegadaEstimada, habilitado } = req.body;

    const ruta = await Ruta.findByPk(id);

    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    }

    await ruta.update({
      idVehiculo: idVehiculo || ruta.idVehiculo,
      idConductor: idConductor || ruta.idConductor,
      idDestino: idDestino || ruta.idDestino,
      horaSalida: horaSalida !== undefined ? horaSalida : ruta.horaSalida,
      horaLlegadaEstimada: horaLlegadaEstimada !== undefined ? horaLlegadaEstimada : ruta.horaLlegadaEstimada,
      habilitado: habilitado !== undefined ? habilitado : ruta.habilitado
    });

    res.json({
      success: true,
      message: 'Ruta actualizada exitosamente',
      data: ruta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar ruta',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const ruta = await Ruta.findByPk(id);

    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    }

    await ruta.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Ruta deshabilitada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar ruta',
      error: error.message
    });
  }
};

exports.getEncomiendas = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ruta = await Ruta.findByPk(id);
    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    }

    const encomiendas = await EncomiendaVenta.findAll({
      where: { idRuta: id },
      include: [{ model: require('../models').Cliente, as: 'cliente' }]
    });

    res.json({
      success: true,
      data: encomiendas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener encomiendas de la ruta',
      error: error.message
    });
  }
};

exports.getAvailable = async (req, res) => {
  try {
    const { idDestino } = req.query;
    
    const where = { habilitado: true };
    if (idDestino) where.idDestino = idDestino;

    const rutas = await Ruta.findAll({
      where,
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Conductor, as: 'conductor', include: [{ model: require('../models').Usuario, as: 'usuario' }] },
        { model: Destino, as: 'destino' }
      ]
    });

    res.json({
      success: true,
      data: rutas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener rutas disponibles',
      error: error.message
    });
  }
};

module.exports = {
  getAll: exports.getAll,
  getById: exports.getById,
  create: exports.create,
  update: exports.update,
  remove: exports.delete,
  getEncomiendas: exports.getEncomiendas,
  getAvailable: exports.getAvailable
};
