const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../errors/appError');

const getAll = async () => {
  const usuarios = await Usuario.findAll({
    include: [{ model: Rol, as: 'rol' }],
    attributes: { exclude: ['password'] }
  });

  return usuarios;
};

const getById = async (id) => {
  const usuario = await Usuario.findByPk(id, {
    include: [{ model: Rol, as: 'rol' }],
    attributes: { exclude: ['password'] }
  });

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return usuario;
};

const create = async (data) => {
  const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, telefono, email, password, idRol } = data;

  const existingEmail = await Usuario.findOne({ where: { email } });
  if (existingEmail) {
    throw new AppError('El email ya está registrado', 400);
  }

  const existingDoc = await Usuario.findOne({ where: { numeroIdentificacion } });
  if (existingDoc) {
    throw new AppError('El número de identificación ya está registrado', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const usuario = await Usuario.create({
    tipoIdentificacion,
    numeroIdentificacion,
    nombre,
    apellido,
    telefono,
    email,
    password: hashedPassword,
    idRol
  });

  return {
    idUsuario: usuario.idUsuario,
    email: usuario.email,
    nombre: usuario.nombre
  };
};

const update = async (id, data) => {
  const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, telefono, email, idRol, habilitado } = data;

  const usuario = await Usuario.findByPk(id);

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  if (email && email !== usuario.email) {
    const existingEmail = await Usuario.findOne({ where: { email } });
    if (existingEmail) {
      throw new AppError('El email ya está registrado', 400);
    }
  }

  if (numeroIdentificacion && numeroIdentificacion !== usuario.numeroIdentificacion) {
    const existingDoc = await Usuario.findOne({ where: { numeroIdentificacion } });
    if (existingDoc) {
      throw new AppError('El número de identificación ya está registrado', 400);
    }
  }

  await usuario.update({
    tipoIdentificacion: tipoIdentificacion || usuario.tipoIdentificacion,
    numeroIdentificacion: numeroIdentificacion || usuario.numeroIdentificacion,
    nombre: nombre || usuario.nombre,
    apellido: apellido || usuario.apellido,
    telefono: telefono !== undefined ? telefono : usuario.telefono,
    email: email || usuario.email,
    idRol: idRol || usuario.idRol,
    habilitado: habilitado !== undefined ? habilitado : usuario.habilitado
  });

  return {
    idUsuario: usuario.idUsuario,
    email: usuario.email,
    nombre: usuario.nombre
  };
};

const deleteUsuario = async (id) => {
  const usuario = await Usuario.findByPk(id);

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  await usuario.update({ habilitado: false });

  return { message: 'Usuario deshabilitado exitosamente' };
};

const changePassword = async (id, { currentPassword, newPassword }) => {
  const usuario = await Usuario.findByPk(id);

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  const isValid = await bcrypt.compare(currentPassword, usuario.password);
  if (!isValid) {
    throw new AppError('Password actual incorrecto', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await usuario.update({ password: hashedPassword });

  return { message: 'Password actualizado exitosamente' };
};

const toggleHabilitado = async (id) => {
  const usuario = await Usuario.findByPk(id);

  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }

  await usuario.update({ habilitado: !usuario.habilitado });

  return usuario;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteUsuario,
  changePassword,
  toggleHabilitado
};