const usuarioService = require('../services/usuarioService');

exports.getAll = async (req, res, next) => {
  try {
    const usuarios = await usuarioService.getAll();
    res.json({ success: true, data: usuarios });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.getById(id);
    res.json({ success: true, data: usuario });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const usuario = await usuarioService.create(req.body);
    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: { idUsuario: usuario.idUsuario, email: usuario.email, nombre: usuario.nombre } });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.update(id, req.body);
    res.json({ success: true, message: 'Usuario actualizado exitosamente', data: { idUsuario: usuario.idUsuario, email: usuario.email, nombre: usuario.nombre } });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    await usuarioService.delete(id);
    res.json({ success: true, message: 'Usuario deshabilitado exitosamente' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    await usuarioService.changePassword(id, req.body);
    res.json({ success: true, message: 'Password actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
};

exports.toggleHabilitado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.toggleHabilitado(id);
    res.json({ success: true, message: usuario.habilitado ? 'Usuario habilitado exitosamente' : 'Usuario inhabilitado exitosamente', data: usuario });
  } catch (error) {
    next(error);
  }
};
