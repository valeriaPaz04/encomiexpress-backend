const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const usuarioController = require('../controllers/usuarioController');
const { authenticate, authorize } = require('../middlewares/auth');

// Validaciones
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
  body('idRol').optional().isInt().withMessage('ID de rol debe ser un número entero')
];

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de usuarios
router.get('/', authorize('admin'), usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', authorize('admin'), createValidation, validate, usuarioController.create);
router.put('/:id', authorize('admin'), updateValidation, validate, usuarioController.update);
router.patch('/:id/toggle-habilitado', authorize('admin'), usuarioController.toggleHabilitado);
router.delete('/:id', authorize('admin'), usuarioController.delete);
router.post('/:id/change-password', authorize('admin'), 
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  validate,
  usuarioController.changePassword
);

module.exports = router;
