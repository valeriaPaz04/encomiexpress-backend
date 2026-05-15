const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validation');
const vehiculoController = require('../controllers/vehiculoController');
const { createValidation, cambiarEstadoValidation } = require('../validators/vehiculosValidator');

// Rutas PÚBLICAS
router.get('/', vehiculoController.getAll);
router.get('/:id', vehiculoController.getById);
router.post('/', createValidation, validate, vehiculoController.create);
router.put('/:id', vehiculoController.update);
router.delete('/:id', vehiculoController.delete);

// Ruta específica para cambiar estado del vehículo
router.patch('/:id/estado', cambiarEstadoValidation, validate, vehiculoController.cambiarEstado);

module.exports = router;