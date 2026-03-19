const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const encomiendaVentaController = require('../controllers/encomiendaVentaController');
const { authenticate, authorize } = require('../middlewares/auth');

// ============================================
// Rutas públicas
// ============================================

// GET /api/encomiendas - Listar todas las encomiendas
router.get('/', encomiendaVentaController.getAll);

// GET /api/encomiendas/:id - Obtener una encomienda por ID
router.get('/:id', encomiendaVentaController.getById);

// GET /api/encomiendas/guia/:numeroGuia - Buscar por número de guía
router.get('/guia/:numeroGuia', encomiendaVentaController.getByGuia);

// ============================================
// Rutas protegidas
// ============================================

router.use(authenticate);

// POST /api/encomiendas - Crear una nueva encomienda
router.post('/',
  body('idCliente').notEmpty().withMessage('Cliente es requerido'),
  body('idRuta').notEmpty().withMessage('Ruta es requerida'),
  validate,
  encomiendaVentaController.create
);

// PUT /api/encomiendas/:id - Actualizar una encomienda
router.put('/:id', encomiendaVentaController.update);

// PATCH /api/encomiendas/:id/estado - Cambiar estado
router.patch('/:id/estado', 
  body('estado').notEmpty().withMessage('Estado es requerido'),
  validate,
  encomiendaVentaController.cambiarEstado
);

// DELETE /api/encomiendas/:id - Inhabilitar una encomienda
router.delete('/:id', authorize('admin'), encomiendaVentaController.delete);

// POST /api/encomiendas/:idEncomiendaVenta/paquetes - Agregar paquete
router.post('/:idEncomiendaVenta/paquetes', 
  body('descripcionContenido').notEmpty().withMessage('Descripción del contenido es requerida'),
  validate,
  encomiendaVentaController.agregarPaquete
);

// POST /api/encomiendas/:idEncomiendaVenta/destinatario - Agregar destinatario
router.post('/:idEncomiendaVenta/destinatario',
  body('nombreDestinatario').notEmpty().withMessage('Nombre del destinatario es requerido'),
  validate,
  encomiendaVentaController.agregarDestinatario
);

module.exports = router;
