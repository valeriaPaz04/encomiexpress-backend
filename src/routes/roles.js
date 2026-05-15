const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validation');
const rolController = require('../controllers/rolController');
const { createValidation, updateValidation } = require('../validators/rolesValidator');

// Rutas de roles
router.get('/', rolController.getAll);
router.get('/permisos', rolController.getAllPermisos);
router.get('/:id', rolController.getById);
router.post('/', createValidation, validate, rolController.create);
router.put('/:id', updateValidation, validate, rolController.update);
router.delete('/:id', rolController.delete);

module.exports = router;
