const jwt = require('jsonwebtoken');
const { Usuario, Rol, Permiso } = require('../models');
const AppError = require('../errors/appError');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No se proporcionó token de autenticación', 401));
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const usuario = await Usuario.findByPk(decoded.idUsuario, {
      include: [
        { model: Rol, as: 'rol', include: [{ model: Permiso, as: 'permisos' }] }
      ]
    });

    if (!usuario) {
      return next(new AppError('Usuario no encontrado', 401));
    }

    if (!usuario.habilitado) {
      return next(new AppError('Usuario deshabilitado', 401));
    }

    // 👇 LOG TEMPORAL — quitar después de diagnosticar
    console.log('✅ Usuario autenticado:', usuario.email);
    console.log('✅ Rol cargado:', JSON.stringify(usuario.rol?.dataValues));

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado', 401));
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    // 👇 LOG TEMPORAL — quitar después de diagnosticar
    console.log('🔐 Rol del usuario:', req.usuario.rol?.nombre);
    console.log('🔐 Roles permitidos:', roles);
    console.log('🔐 Tiene acceso:', roles.includes(req.usuario.rol?.nombre));

    if (!roles.includes(req.usuario.rol?.nombre)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para esta acción'
      });
    }

    next();
  };
};

const authorizePermission = (permiso) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const permisos = req.usuario.rol?.permisos?.map(p => p.nombre);

    // 👇 LOG TEMPORAL — quitar después de diagnosticar
    console.log('🛡️ Permiso requerido:', permiso);
    console.log('🛡️ Permisos del usuario:', permisos);

    if (!permisos?.includes(permiso)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    next();
  };
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

module.exports = {
  authenticate,
  authorize,
  authorizePermission,
  generateToken
};