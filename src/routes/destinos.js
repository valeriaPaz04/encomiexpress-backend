const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const destinoController = require('../controllers/destinoController');
const { authenticate, authorizePermission } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', authorizePermission('listar_destino'), destinoController.getAll);
router.get('/:id', authorizePermission('consultar_destino'), destinoController.getById);
router.post('/', authorizePermission('registrar_destino'), [body('departamento').notEmpty(), body('ciudad').notEmpty()], validate, destinoController.create);
router.put('/:id', authorizePermission('actualizar_destino'), destinoController.update);
router.delete('/:id', authorizePermission('actualizar_destino'), destinoController.delete);

module.exports = router;

