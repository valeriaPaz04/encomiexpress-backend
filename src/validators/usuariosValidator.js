const { body } = require('express-validator');

const createValidation = [
  body('tipoIdentificacion').notEmpty().withMessage('Tipo de identificación es requerido'),
  body('numeroIdentificacion').notEmpty().withMessage('Número de identificación es requerido'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
  body('idRol').isInt().withMessage('ID de rol debe ser un número entero')
];

const updateValidation = [
  body('nombre').optional(),
  body('apellido').optional(),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('idRol').optional().isInt().withMessage('ID de rol debe ser un número entero'),
  body('habilitado').optional().isBoolean().withMessage('El campo habilitado debe ser booleano')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Password actual es requerido'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nuevo password debe tener al menos 6 caracteres')
];

module.exports = {
  createValidation,
  updateValidation,
  changePasswordValidation
};
