const { Destino, Ruta } = require('../models');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { habilitado } = req.query;
    
    const where = {};
    if (habilitado !== undefined) where.habilitado = habilitado === 'true';

    const destinos = await Destino.findAll({ where });

    res.json({
      success: true,
      data: destinos
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const destino = await Destino.findByPk(id);

    if (!destino) {
      return next(new AppError('Destino no encontrado', 404));
    }

    res.json({
      success: true,
      data: destino
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { departamento, ciudad, tarifaBase } = req.body;

    const destino = await Destino.create({
      departamento,
      ciudad,
      tarifaBase: tarifaBase || 0
    });

    res.status(201).json({
      success: true,
      message: 'Destino creado exitosamente',
      data: destino
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departamento, ciudad, tarifaBase, habilitado } = req.body;

    const destino = await Destino.findByPk(id);

    if (!destino) {
      return next(new AppError('Destino no encontrado', 404));
    }

    await destino.update({
      departamento: departamento || destino.departamento,
      ciudad: ciudad || destino.ciudad,
      tarifaBase: tarifaBase !== undefined ? tarifaBase : destino.tarifaBase,
      habilitado: habilitado !== undefined ? habilitado : destino.habilitado
    });

    res.json({
      success: true,
      message: 'Destino actualizado exitosamente',
      data: destino
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const destino = await Destino.findByPk(id);

    if (!destino) {
      return next(new AppError('Destino no encontrado', 404));
    }

    await destino.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Destino deshabilitado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

exports.getRutas = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const destino = await Destino.findByPk(id);
    if (!destino) {
      return next(new AppError('Destino no encontrado', 404));
    }

    const rutas = await Ruta.findAll({
      where: { idDestino: id }
    });

    res.json({
      success: true,
      data: rutas
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
  getRutas: exports.getRutas
};
