const { Router } = require('express');
const { listarClientes, obtenerCliente, registrarCliente, actualizarCliente, toggleHabilitadoCliente } = require('../controllers/clienteController');
const { authenticate, authorizePermission } = require('../middlewares/auth');
const router = Router();

router.use(authenticate);
router.get('/', authorizePermission('listar_cliente'), listarClientes);
router.get('/:id', authorizePermission('consultar_cliente'), obtenerCliente);
router.post('/', authorizePermission('registrar_cliente'), registrarCliente);
router.put('/:id', authorizePermission('actualizar_cliente'), actualizarCliente);
router.patch('/:id/toggle-habilitado', authorizePermission('inhabilitar_cliente'), toggleHabilitadoCliente);

module.exports = router;
