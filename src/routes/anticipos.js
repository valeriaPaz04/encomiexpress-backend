const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const anticipoController = require('../controllers/anticipoExcedenteController');
const { authenticate, authorize } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

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
  body('valorAnticipo').notEmpty().withMessage('Valor del anticipo es requerido'),
  validate, 
  anticipoController.create
);

// Actualizar anticipo - admin o conductor (solo el conductor owner o admin)
router.put('/:id', authenticate, authorize('admin', 'conductor'), anticipoController.update);

// Subir soporte a Cloudinary
router.post('/:id/soporte', authenticate, authorize('admin', 'conductor'), 
  upload.single('soporte'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
      }
      const fileUrl = req.file.path;
      await anticipoController.updateSoporte(req, res, fileUrl);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al subir soporte', error: error.message });
    }
  }
);

// Eliminar anticipo - solo admin
router.delete('/:id', authenticate, authorize('admin'), anticipoController.delete);

module.exports = router;