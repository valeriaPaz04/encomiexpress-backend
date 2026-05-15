const propietarioService = require('../services/propietarioService');

exports.getAll = async (req, res, next) => {
  try {
    const filters = { habilitado: req.query.habilitado };
    const propietarios = await propietarioService.getAll(filters);
    res.json({ success: true, data: propietarios });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const propietario = await propietarioService.getById(id);
    res.json({ success: true, data: propietario });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const propietario = await propietarioService.create(req.body);
    res.status(201).json({ success: true, message: 'Propietario creado exitosamente', data: propietario });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const propietario = await propietarioService.update(id, req.body);
    res.json({ success: true, message: 'Propietario actualizado exitosamente', data: propietario });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    await propietarioService.delete(id);
    res.json({ success: true, message: 'Propietario deshabilitado exitosamente' });
  } catch (error) {
    next(error);
  }
};

exports.getVehiculos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehiculos = await propietarioService.getVehiculos(id);
    res.json({ success: true, data: vehiculos });
  } catch (error) {
    next(error);
  }
};
