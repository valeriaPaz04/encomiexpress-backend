const express = require('express');
const router = express.Router();
const conductorController = require('../controllers/conductorController');
const anticipoController = require('../controllers/anticipoExcedenteController');
const { authenticate, authorize } = require('../middlewares/auth');

// ============================================
// RUTAS PÚBLICAS (solo lectura - para la app Flutter)
// ============================================
router.get('/', conductorController.getAll);
router.get('/:id', conductorController.getById);
router.get('/:id/vehiculos', conductorController.getVehiculos);
router.get('/:id/anticipos', conductorController.getAnticipos);

// ============================================
// RUTAS PROTEGIDAS - TODOS LOS USUARIOS AUTENTICADOS
// ============================================
router.use(authenticate);

// Actualizar perfil del conductor logueado
router.put('/perfil', async (req, res) => {
  try {
    if (req.usuario.rol?.nombre !== 'conductor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los conductores pueden actualizar su perfil'
      });
    }
    
    const { Conductor } = require('../models');
    const conductor = await Conductor.findOne({ 
      where: { idUsuario: req.usuario.idUsuario }
    });
    
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }
    
    const { 
      categoriaLicencia,
      numeroLicencia,
      vencimientoLicencia,
      estado,
      habilitado 
    } = req.body;

    await conductor.update({
      categoriaLicencia: categoriaLicencia !== undefined ? categoriaLicencia : conductor.categoriaLicencia,
      numeroLicencia: numeroLicencia !== undefined ? numeroLicencia : conductor.numeroLicencia,
      vencimientoLicencia: vencimientoLicencia !== undefined ? vencimientoLicencia : conductor.vencimientoLicencia,
      estado: estado || conductor.estado,
      habilitado: habilitado !== undefined ? habilitado : conductor.habilitado
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: conductor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
});

// ============================================
// RUTAS PROTEGIDAS - ADMIN
// ============================================

// Crear conductor - solo admin
router.post('/', authorize('admin'), conductorController.create);

// Actualizar conductor - admin puede actualizar cualquier conductor
router.put('/:id', authorize('admin'), conductorController.update);

// Deshabilitar conductor - solo admin
router.delete('/:id', authorize('admin'), conductorController.delete);

// ============================================
// RUTAS PARA GESTIONAR PROPIOS ANTICIPOS (desde el token)
// ============================================

// Obtener mis anticipos como conductor logueado
router.get('/mis-anticipos', async (req, res) => {
  try {
    // Verificar que sea conductor
    if (req.usuario.rol?.nombre !== 'conductor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los conductores pueden acceder a esta información'
      });
    }
    
    // Buscar el conductor por el idUsuario del token
    const { Conductor } = require('../models');
    const conductor = await Conductor.findOne({ 
      where: { idUsuario: req.usuario.idUsuario }
    });
    
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }
    
    // Llamar al controlador de anticipos con el id del conductor
    req.params.id = conductor.idConductor;
    return conductorController.getAnticipos(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener anticipos',
      error: error.message
    });
  }
});

// Crear anticipo como conductor logueado
router.post('/mis-anticipos', async (req, res) => {
  try {
    // Verificar que sea conductor
    if (req.usuario.rol?.nombre !== 'conductor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los conductores pueden crear anticipos'
      });
    }
    
    // Buscar el conductor por el idUsuario del token
    const { Conductor } = require('../models');
    const conductor = await Conductor.findOne({ 
      where: { idUsuario: req.usuario.idUsuario }
    });
    
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }
    
    // Agregar el idConductor al body de la solicitud
    req.body.idConductor = conductor.idConductor;
    
    // Llamar al controlador de anticipos
    return anticipoController.create(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear anticipo',
      error: error.message
    });
  }
});

module.exports = router;
