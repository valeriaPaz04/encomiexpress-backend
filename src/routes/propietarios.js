const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const propietarioController = require('../controllers/propietarioVehiculoController');

// Validaciones
const createValidation = [
  body('tipoIdentificacion').notEmpty().withMessage('Tipo de identificación es requerido'),
  body('numeroIdentificacion').notEmpty().withMessage('Número de identificación es requerido'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido')
];

// Rutas PÚBLICAS
router.get('/', propietarioController.getAll);
router.get('/:id', propietarioController.getById);
router.post('/', createValidation, validate, propietarioController.create);
router.put('/:id', propietarioController.update);
router.delete('/:id', propietarioController.delete);

module.exports = router;
