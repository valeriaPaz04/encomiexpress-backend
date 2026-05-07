const { Vehiculo, Conductor, PropietarioVehiculo, Ruta } = require('../models');

exports.getAll = async (req, res, next) => {
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
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findByPk(id, {
      include: [
        { model: Conductor, as: 'conductor', include: [{ model: require('../models').Usuario, as: 'usuario' }] },
        { model: PropietarioVehiculo, as: 'propietario' }
      ]
    });

    if (!vehiculo) {
      return next(new AppError('Vehículo no encontrado', 404));
    }

    res.json({
      success: true,
      data: vehiculo
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
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
      return next(new AppError('La placa ya está registrada', 400));
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
    next(error);
  }
};

exports.update = async (req, res, next) => {
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
      return next(new AppError('Vehículo no encontrado', 404));
    }

    // Verificar placa duplicada
    if (placa && placa !== vehiculo.placa) {
      const existing = await Vehiculo.findOne({ where: { placa } });
      if (existing) {
        return next(new AppError('La placa ya está registrada', 400));
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
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return next(new AppError('Vehículo no encontrado', 404));
    }

    await vehiculo.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Vehículo deshabilitado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.getRutas = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) {
      return next(new AppError('Vehículo no encontrado', 404));
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
    next(error);
  }
};

exports.assignDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { idConductor } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return next(new AppError('Vehículo no encontrado', 404));
    }

    // Verificar que el conductor existe
    const conductor = await Conductor.findByPk(idConductor);
    if (!conductor) {
      return next(new AppError('Conductor no encontrado', 404));
    }

    await vehiculo.update({ idConductor });

    res.json({
      success: true,
      message: 'Conductor asignado exitosamente',
      data: vehiculo
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
  getRutas: exports.getRutas,
  assignDriver: exports.assignDriver
};
