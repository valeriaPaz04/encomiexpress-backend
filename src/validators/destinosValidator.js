const { body } = require('express-validator');

const createValidation = [
  body('departamento').notEmpty().withMessage('Departamento es requerido'),
  body('ciudad').notEmpty().withMessage('Ciudad es requerida'),
  body('tarifaBase').optional().isFloat({ min: 0 }).withMessage('Tarifa base debe ser un número positivo')
];

const updateValidation = [
  body('departamento').optional().notEmpty().withMessage('Departamento no puede estar vacío'),
  body('ciudad').optional().notEmpty().withMessage('Ciudad no puede estar vacía'),
  body('tarifaBase').optional().isFloat({ min: 0 }).withMessage('Tarifa base debe ser un número positivo'),
  body('habilitado').optional().isBoolean().withMessage('El campo habilitado debe ser booleano')
];

module.exports = {
  createValidation,
  updateValidation
};
