const { body } = require('express-validator');

const createValidation = [
  body('nombre').notEmpty().withMessage('El nombre del rol es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres'),
  body('descripcion').optional().isLength({ max: 200 }).withMessage('La descripción no puede exceder 200 caracteres'),
  body('permisos').optional().isArray().withMessage('Los permisos deben ser un array de IDs'),
  body('habilitado').optional().isBoolean().withMessage('El campo habilitado debe ser booleano')
];

const updateValidation = [
  body('nombre').optional().notEmpty().withMessage('El nombre del rol no puede estar vacío')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres'),
  body('descripcion').optional().isLength({ max: 200 }).withMessage('La descripción no puede exceder 200 caracteres'),
  body('permisos').optional().isArray().withMessage('Los permisos deben ser un array de IDs'),
  body('habilitado').optional().isBoolean().withMessage('El campo habilitado debe ser booleano')
];

module.exports = {
  createValidation,
  updateValidation
};
