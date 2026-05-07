const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const usuarioController = require('../controllers/usuarioController');
const { authenticate, authorize, authorizePermission } = require('../middlewares/auth');

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
router.get('/', authorizePermission('listar_usuario'), usuarioController.getAll);
router.get('/:id', authorizePermission('consultar_usuario'), usuarioController.getById);
router.post('/', authorizePermission('registrar_usuario'), createValidation, validate, usuarioController.create);
router.put('/:id', authorizePermission('actualizar_usuario'), updateValidation, validate, usuarioController.update);
router.patch('/:id/toggle-habilitado', authorizePermission('inhabilitar_usuario'), usuarioController.toggleHabilitado);
router.delete('/:id', authorizePermission('inhabilitar_usuario'), usuarioController.delete);
router.post('/:id/change-password', authorizePermission('actualizar_usuario'),
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  validate,
  usuarioController.changePassword
);

module.exports = router;
