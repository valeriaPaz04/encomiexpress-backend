const { Router } = require('express');
const { 
  listarClientes, 
  obtenerCliente, 
  registrarCliente, 
  actualizarCliente, 
  eliminarCliente 
} = require('../controllers/clienteController');

const router = Router();

// ============================================
// Rutas para clientes
// ============================================

// GET /api/clientes - Listar todos los clientes
router.get('/', listarClientes);

// GET /api/clientes/:id - Obtener un cliente por ID
router.get('/:id', obtenerCliente);

// POST /api/clientes - Registrar un nuevo cliente
router.post('/', registrarCliente);

// PUT /api/clientes/:id - Actualizar un cliente
router.put('/:id', actualizarCliente);

// DELETE /api/clientes/:id - Eliminar (inhabilitar) un cliente
router.delete('/:id', eliminarCliente);

module.exports = router;
