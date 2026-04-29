const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const rutaController = require('../controllers/rutaController');

// Validaciones
const createValidation = [
  body('idVehiculo').notEmpty().withMessage('Vehículo es requerido'),
  body('idConductor').notEmpty().withMessage('Conductor es requerido'),
  body('idDestino').notEmpty().withMessage('Destino es requerido')
];

// Rutas PÚBLICAS
router.get('/', rutaController.getAll);
router.get('/:id', rutaController.getById);
router.post('/', createValidation, validate, rutaController.create);
router.put('/:id', rutaController.update);
router.delete('/:id', rutaController.delete);

module.exports = router;
