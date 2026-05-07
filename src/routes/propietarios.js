const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const propietarioController = require('../controllers/propietarioVehiculoController');
const { authenticate, authorizePermission } = require('../middlewares/auth');

// Validaciones
const createValidation = [
  body('tipoIdentificacion').notEmpty().withMessage('Tipo de identificación es requerido'),
  body('numeroIdentificacion').notEmpty().withMessage('Número de identificación es requerido'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido')
];

router.use(authenticate);

router.get('/', authorizePermission('gestion_transporte'), propietarioController.getAll);
router.get('/:id', authorizePermission('gestion_transporte'), propietarioController.getById);
router.post('/', authorizePermission('gestion_transporte'), createValidation, validate, propietarioController.create);
router.put('/:id', authorizePermission('gestion_transporte'), propietarioController.update);
router.delete('/:id', authorizePermission('gestion_transporte'), propietarioController.delete);

module.exports = router;
