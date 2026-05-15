const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { loginValidation, registerValidation, recoverPasswordValidation } = require('../validators/authValidator');

// Rutas públicas
router.post('/login', loginValidation, validate, authController.login);
router.post('/register', registerValidation, validate, authController.register);
router.post('/recover-password', recoverPasswordValidation, validate, authController.recoverPassword);

// Rutas protegidas
router.get('/profile', authenticate, authController.getProfile);

// Nueva ruta para obtener datos del conductor desde el token
router.get('/conductor-profile', authenticate, authController.getConductorProfile);

module.exports = router;
