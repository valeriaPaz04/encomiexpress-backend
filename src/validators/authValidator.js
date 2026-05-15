const { body } = require('express-validator');

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password es requerido')
];

const registerValidation = [
  body('tipoIdentificacion').notEmpty().withMessage('Tipo de identificación es requerido'),
  body('numeroIdentificacion').notEmpty().withMessage('Número de identificación es requerido'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido'),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
  body('idRol').optional({ nullable: true }).isInt({ min: 1 }).withMessage('ID de rol debe ser un número entero mayor a 0')
];

const recoverPasswordValidation = [
  body('email').isEmail().withMessage('Email inválido')
];

module.exports = {
  loginValidation,
  registerValidation,
  recoverPasswordValidation
};
