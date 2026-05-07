const { Rol, Permiso, RolPermiso } = require('../models');
const AppError = require('../utils/AppError');

const rolController = {
  // Obtener todos los roles
  getAll: async (req, res, next) => {
    try {
      const roles = await Rol.findAll({
        where: { habilitado: true },
        order: [['idRol', 'ASC']],
        include: [{
          model: Permiso,
          as: 'permisos',
          through: { attributes: [] }
        }]
      });
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtener rol por ID
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const rol = await Rol.findByPk(id, {
        include: [
          {
            model: Permiso,
            as: 'permisos',
            through: { attributes: [] }
          }
        ]
      });

      if (!rol) {
        return next(new AppError('Rol no encontrado', 404));
      }

      res.json({
        success: true,
        data: rol
      });
    } catch (error) {
      next(error);
    }
  },

  // Crear nuevo rol
  create: async (req, res, next) => {
    try {
      const { nombre, descripcion, permisos } = req.body;

      // Verificar si ya existe un rol con ese nombre
      const existingRol = await Rol.findOne({ where: { nombre } });
      if (existingRol) {
        return next(new AppError('Ya existe un rol con ese nombre', 400));
      }

      // Crear el rol
      const rol = await Rol.create({
        nombre,
        descripcion,
        habilitado: true
      });

      // Si se proporcionan permisos, asociarlos
      if (permisos && Array.isArray(permisos)) {
        const rolPermisos = permisos.map(idPermiso => ({
          idRol: rol.idRol,
          idPermiso
        }));
        await RolPermiso.bulkCreate(rolPermisos);
      }

      // Obtener el rol con sus permisos
      const rolCreado = await Rol.findByPk(rol.idRol, {
        include: [
          {
            model: Permiso,
            as: 'permisos',
            through: { attributes: [] }
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Rol creado correctamente',
        data: rolCreado
      });
    } catch (error) {
      next(error);
    }
  },

  // Actualizar rol
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, habilitado, permisos } = req.body;

      const rol = await Rol.findByPk(id);
      if (!rol) {
        return next(new AppError('Rol no encontrado', 404));
      }

      // Verificar si el nombre ya existe en otro rol
      if (nombre && nombre !== rol.nombre) {
        const existingRol = await Rol.findOne({ where: { nombre } });
        if (existingRol) {
          return next(new AppError('Ya existe un rol con ese nombre', 400));
        }
      }

      // Actualizar el rol
      await rol.update({
        nombre: nombre || rol.nombre,
        descripcion: descripcion || rol.descripcion,
        habilitado: habilitado !== undefined ? habilitado : rol.habilitado
      });

      // Actualizar permisos si se proporcionan
      if (permisos && Array.isArray(permisos)) {
        // Eliminar permisos actuales
        await RolPermiso.destroy({ where: { idRol: id } });
        
        // Crear nuevos permisos
        const rolPermisos = permisos.map(idPermiso => ({
          idRol: id,
          idPermiso
        }));
        await RolPermiso.bulkCreate(rolPermisos);
      }

      // Obtener el rol actualizado con sus permisos
      const rolActualizado = await Rol.findByPk(id, {
        include: [
          {
            model: Permiso,
            as: 'permisos',
            through: { attributes: [] }
          }
        ]
      });

      res.json({
        success: true,
        message: 'Rol actualizado correctamente',
        data: rolActualizado
      });
    } catch (error) {
      next(error);
    }
  },

  // Eliminar (deshabilitar) rol
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const rol = await Rol.findByPk(id);
      if (!rol) {
        return next(new AppError('Rol no encontrado', 404));
      }

      // Deshabilitar en lugar de eliminar
      await rol.update({ habilitado: false });

      res.json({
        success: true,
        message: 'Rol eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtener todos los permisos
  getAllPermisos: async (req, res, next) => {
    try {
      const permisos = await Permiso.findAll({
        order: [['idPermiso', 'ASC']]
      });
      res.json({
        success: true,
        data: permisos
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = rolController;
