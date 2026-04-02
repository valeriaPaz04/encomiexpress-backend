const { Router } = require('express');
const {
  listarClientes,
  obtenerCliente,
  registrarCliente,
  actualizarCliente,
  toggleHabilitadoCliente,
} = require('../controllers/clienteController');

const router = Router();

router.get('/', listarClientes);
router.get('/:id', obtenerCliente);
router.post('/', registrarCliente);
router.put('/:id', actualizarCliente);
router.patch('/:id/toggle-habilitado', toggleHabilitadoCliente);

module.exports = router;
