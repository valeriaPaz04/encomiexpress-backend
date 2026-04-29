const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/recover-password', authController.recoverPassword);

// Rutas protegidas
router.get('/profile', authenticate, authController.getProfile);

// Nueva ruta para obtener datos del conductor desde el token
router.get('/conductor-profile', authenticate, authController.getConductorProfile);

module.exports = router;
