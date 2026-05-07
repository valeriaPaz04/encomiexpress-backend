const express = require('express');
const router = express.Router();
const { Permiso } = require('../models');
const { authenticate } = require('../middlewares/auth');

// GET /api/permisos - Listar todos los permisos
router.get('/', authenticate, async (req, res, next) => {
  try {
    const permisos = await Permiso.findAll({
      where: { habilitado: true },
      order: [['nombre', 'ASC']]
    });
    res.json({ success: true, data: permisos });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
