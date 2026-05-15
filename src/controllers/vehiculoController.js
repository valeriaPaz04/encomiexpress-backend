const vehiculoService = require('../services/vehiculoService');

exports.getAll = async (req, res, next) => {
  try {
    const filters = { estado: req.query.estado, habilitado: req.query.habilitado };
    const vehiculos = await vehiculoService.getAll(filters);
    res.json({ success: true, data: vehiculos });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehiculo = await vehiculoService.getById(id);
    res.json({ success: true, data: vehiculo });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const vehiculo = await vehiculoService.create(req.body);
    res.status(201).json({ success: true, message: 'Vehículo creado exitosamente', data: vehiculo });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehiculo = await vehiculoService.update(id, req.body);
    res.json({ success: true, message: 'Vehículo actualizado exitosamente', data: vehiculo });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    await vehiculoService.delete(id);
    res.json({ success: true, message: 'Vehículo deshabilitado exitosamente' });
  } catch (error) {
    next(error);
  }
};

exports.getRutas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rutas = await vehiculoService.getRutas(id);
    res.json({ success: true, data: rutas });
  } catch (error) {
    next(error);
  }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await vehiculoService.cambiarEstado(id, req.body.estado);
    res.json({ success: true, message: 'Estado del vehículo actualizado correctamente', data: result });
  } catch (error) {
    next(error);
  }
};

exports.assignDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehiculo = await vehiculoService.assignDriver(id, req.body.idConductor);
    res.json({ success: true, message: 'Conductor asignado exitosamente', data: vehiculo });
  } catch (error) {
    next(error);
  }
};
