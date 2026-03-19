const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const destinoController = require('../controllers/destinoController');

// Validaciones
const createValidation = [
  body('departamento').notEmpty().withMessage('Departamento es requerido'),
  body('ciudad').notEmpty().withMessage('Ciudad es requerida')
];

// Rutas PÚBLICAS
router.get('/', destinoController.getAll);
router.get('/:id', destinoController.getById);
router.post('/', createValidation, validate, destinoController.create);
router.put('/:id', destinoController.update);
router.delete('/:id', destinoController.delete);

module.exports = router;
