const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const anticipoController = require('../controllers/anticipoExcedenteController');
const { authenticate, authorize } = require('../middlewares/auth');

// Disable cache
router.get('/', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

// ============================================
// RUTAS PÚBLICAS (solo lectura para admin/conductor)
// ============================================
router.get('/', authenticate, anticipoController.getAll);
router.get('/:id', authenticate, anticipoController.getById);

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Crear anticipo - admin o conductor
router.post('/', authenticate, authorize('admin', 'conductor'), 
  body('idConductor').notEmpty().withMessage('Conductor es requerido'),
  body('valorAnticipo').notEmpty().withMessage('Valor del anticipo es requerido'),
  validate, 
  anticipoController.create
);

// Actualizar anticipo - admin o conductor (solo el conductor owner o admin)
router.put('/:id', authenticate, authorize('admin', 'conductor'), anticipoController.update);

// Eliminar anticipo - solo admin
router.delete('/:id', authenticate, authorize('admin'), anticipoController.delete);

module.exports = router;
