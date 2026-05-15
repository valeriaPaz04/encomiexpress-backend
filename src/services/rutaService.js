const { Ruta, Vehiculo, Conductor, Destino, EncomiendaVenta, Usuario, Cliente } = require('../models');
const AppError = require('../errors/appError');

const getAll = async ({ habilitado }) => {
  const where = {};
  if (habilitado !== undefined) where.habilitado = habilitado === 'true';

  const rutas = await Ruta.findAll({
    where,
    include: [
      { model: Vehiculo, as: 'vehiculo' },
      { model: Conductor, as: 'conductor', include: [{ model: Usuario, as: 'usuario' }] },
      { model: Destino, as: 'destino' }
    ]
  });

  return rutas;
};

const getById = async (id) => {
  const ruta = await Ruta.findByPk(id, {
    include: [
      { model: Vehiculo, as: 'vehiculo' },
      { model: Conductor, as: 'conductor', include: [{ model: Usuario, as: 'usuario' }] },
      { model: Destino, as: 'destino' }
    ]
  });

  if (!ruta) {
    throw new AppError('Ruta no encontrada', 404);
  }

  return ruta;
};

const create = async (data) => {
  const { idVehiculo, idConductor, idDestino, horaSalida, horaLlegadaEstimada } = data;

  const vehiculo = await Vehiculo.findByPk(idVehiculo);
  if (!vehiculo) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  const conductor = await Conductor.findByPk(idConductor);
  if (!conductor) {
    throw new AppError('Conductor no encontrado', 404);
  }

  const destino = await Destino.findByPk(idDestino);
  if (!destino) {
    throw new AppError('Destino no encontrado', 404);
  }

  const ruta = await Ruta.create({
    idVehiculo,
    idConductor,
    idDestino,
    horaSalida,
    horaLlegadaEstimada
  });

  return ruta;
};

const update = async (id, data) => {
  const { idVehiculo, idConductor, idDestino, horaSalida, horaLlegadaEstimada, habilitado } = data;

  const ruta = await Ruta.findByPk(id);

  if (!ruta) {
    throw new AppError('Ruta no encontrada', 404);
  }

  await ruta.update({
    idVehiculo: idVehiculo || ruta.idVehiculo,
    idConductor: idConductor || ruta.idConductor,
    idDestino: idDestino || ruta.idDestino,
    horaSalida: horaSalida !== undefined ? horaSalida : ruta.horaSalida,
    horaLlegadaEstimada: horaLlegadaEstimada !== undefined ? horaLlegadaEstimada : ruta.horaLlegadaEstimada,
    habilitado: habilitado !== undefined ? habilitado : ruta.habilitado
  });

  return ruta;
};

const deleteRuta = async (id) => {
  const ruta = await Ruta.findByPk(id);

  if (!ruta) {
    throw new AppError('Ruta no encontrada', 404);
  }

  await ruta.update({ habilitado: false });

  return { message: 'Ruta deshabilitada exitosamente' };
};

const getEncomiendas = async (id) => {
  const ruta = await Ruta.findByPk(id);
  if (!ruta) {
    throw new AppError('Ruta no encontrada', 404);
  }

  const encomiendas = await EncomiendaVenta.findAll({
    where: { idRuta: id },
    include: [{ model: Cliente, as: 'cliente' }]
  });

  return encomiendas;
};

const getAvailable = async ({ idDestino }) => {
  const where = { habilitado: true };
  if (idDestino) where.idDestino = idDestino;

  const rutas = await Ruta.findAll({
    where,
    include: [
      { model: Vehiculo, as: 'vehiculo' },
      { model: Conductor, as: 'conductor', include: [{ model: Usuario, as: 'usuario' }] },
      { model: Destino, as: 'destino' }
    ]
  });

  return rutas;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteRuta,
  getEncomiendas,
  getAvailable
};