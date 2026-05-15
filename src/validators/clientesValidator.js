const { body } = require('express-validator');

const createValidation = [
  body('tipoIdentificacion').notEmpty().withMessage('Tipo de identificación es requerido'),
  body('numeroIdentificacion').notEmpty().withMessage('Número de identificación es requerido'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido'),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('direccion').optional().isString().withMessage('Dirección debe ser un texto')
];

const updateValidation = [
  body('nombre').optional(),
  body('apellido').optional(),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('direccion').optional().isString().withMessage('Dirección debe ser un texto')
];

module.exports = {
  createValidation,
  updateValidation
};
