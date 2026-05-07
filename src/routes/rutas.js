const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const rutaController = require('../controllers/rutaController');
const { authenticate, authorizePermission } = require('../middlewares/auth');

// Validaciones
const createValidation = [
  body('idVehiculo').notEmpty().withMessage('Vehículo es requerido'),
  body('idConductor').notEmpty().withMessage('Conductor es requerido'),
  body('idDestino').notEmpty().withMessage('Destino es requerido')
];

router.use(authenticate);

router.get('/', authorizePermission('listar_ruta'), rutaController.getAll);
router.get('/:id', authorizePermission('consultar_ruta'), rutaController.getById);
router.post('/', authorizePermission('registrar_ruta'), createValidation, validate, rutaController.create);
router.put('/:id', authorizePermission('actualizar_ruta'), rutaController.update);
router.delete('/:id', authorizePermission('actualizar_ruta'), rutaController.remove);

module.exports = router;
