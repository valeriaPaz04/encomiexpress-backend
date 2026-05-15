const { body } = require('express-validator');

const ESTADOS_VALIDOS = ['activo', 'inactivo'];

const createValidation = [
  body('tipoIdentificacion').notEmpty().withMessage('Tipo de identificación es requerido'),
  body('numeroIdentificacion').notEmpty().withMessage('Número de identificación es requerido'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido'),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
  body('categoriaLicencia').optional().notEmpty().withMessage('Categoría de licencia es requerida'),
  body('numeroLicencia').optional().notEmpty().withMessage('Número de licencia es requerido'),
  body('vencimientoLicencia').optional().isDate().withMessage('Fecha de vencimiento inválida'),
  body('idConductor').optional().isInt().withMessage('ID de conductor debe ser un número entero'),
  body('idRol').optional().isInt().withMessage('ID de rol debe ser un número entero')
];

const updateValidation = [
  body('nombre').optional(),
  body('apellido').optional(),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('categoriaLicencia').optional(),
  body('numeroLicencia').optional(),
  body('vencimientoLicencia').optional().isDate().withMessage('Fecha de vencimiento inválida')
];

const cambiarEstadoValidation = [
  body('estado')
    .notEmpty().withMessage('El campo "estado" es requerido')
    .isIn(ESTADOS_VALIDOS).withMessage(`Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}`)
];

module.exports = {
  createValidation,
  updateValidation,
  cambiarEstadoValidation
};
