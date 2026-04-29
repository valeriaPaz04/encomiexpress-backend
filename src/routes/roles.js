const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const rolController = require('../controllers/rolController');

// Validaciones para crear rol
const createValidation = [
  body('nombre').notEmpty().withMessage('El nombre del rol es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres'),
  body('descripcion').optional().isLength({ max: 200 }).withMessage('La descripción no puede exceder 200 caracteres'),
  body('permisos').optional().isArray().withMessage('Los permisos deben ser un array de IDs')
];

// Validaciones para actualizar rol
const updateValidation = [
  body('nombre').optional().notEmpty().withMessage('El nombre del rol no puede estar vacío')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres'),
  body('descripcion').optional().isLength({ max: 200 }).withMessage('La descripción no puede exceder 200 caracteres'),
  body('habilitado').optional().isBoolean().withMessage('El campo habilitado debe ser un valor booleano'),
  body('permisos').optional().isArray().withMessage('Los permisos deben ser un array de IDs')
];

// Rutas de roles
router.get('/', rolController.getAll);
router.get('/permisos', rolController.getAllPermisos);
router.get('/:id', rolController.getById);
router.post('/', createValidation, validate, rolController.create);
router.put('/:id', updateValidation, validate, rolController.update);
router.delete('/:id', rolController.delete);

module.exports = router;
