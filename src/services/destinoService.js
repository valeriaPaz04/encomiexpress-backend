const { Destino, Ruta } = require('../models');
const AppError = require('../errors/appError');

const getAll = async ({ habilitado }) => {
  const where = {};
  if (habilitado !== undefined) where.habilitado = habilitado === 'true';

  const destinos = await Destino.findAll({ where });
  return destinos;
};

const getById = async (id) => {
  const destino = await Destino.findByPk(id);

  if (!destino) {
    throw new AppError('Destino no encontrado', 404);
  }

  return destino;
};

const create = async (data) => {
  const { departamento, ciudad, tarifaBase } = data;

  const destino = await Destino.create({
    departamento,
    ciudad,
    tarifaBase: tarifaBase || 0
  });

  return destino;
};

const update = async (id, data) => {
  const { departamento, ciudad, tarifaBase, habilitado } = data;

  const destino = await Destino.findByPk(id);

  if (!destino) {
    throw new AppError('Destino no encontrado', 404);
  }

  await destino.update({
    departamento: departamento || destino.departamento,
    ciudad: ciudad || destino.ciudad,
    tarifaBase: tarifaBase !== undefined ? tarifaBase : destino.tarifaBase,
    habilitado: habilitado !== undefined ? habilitado : destino.habilitado
  });

  return destino;
};

const deleteDestino = async (id) => {
  const destino = await Destino.findByPk(id);

  if (!destino) {
    throw new AppError('Destino no encontrado', 404);
  }

  await destino.update({ habilitado: false });

  return { message: 'Destino deshabilitado exitosamente' };
};

const getRutas = async (id) => {
  const destino = await Destino.findByPk(id);
  if (!destino) {
    throw new AppError('Destino no encontrado', 404);
  }

  const rutas = await Ruta.findAll({
    where: { idDestino: id }
  });

  return rutas;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteDestino,
  getRutas
};