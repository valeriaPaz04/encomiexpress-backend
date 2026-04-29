const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const vehiculoController = require('../controllers/vehiculoController');

// Validaciones
const createValidation = [
  body('idConductor').notEmpty().withMessage('Conductor es requerido'),
  body('idPropietario').notEmpty().withMessage('Propietario es requerido'),
  body('placa').notEmpty().withMessage('Placa es requerida'),
  body('marca').notEmpty().withMessage('Marca es requerida'),
  body('modelo').notEmpty().withMessage('Modelo es requerido')
];

// Rutas PÚBLICAS
router.get('/', vehiculoController.getAll);
router.get('/:id', vehiculoController.getById);
router.post('/', createValidation, validate, vehiculoController.create);
router.put('/:id', vehiculoController.update);
router.delete('/:id', vehiculoController.delete);

module.exports = router;
