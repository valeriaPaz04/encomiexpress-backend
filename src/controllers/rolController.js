const { Rol, Permiso, RolPermiso } = require('../models');

const rolController = {
  // Obtener todos los roles
  getAll: async (req, res) => {
    try {
      const roles = await Rol.findAll({
        where: { habilitado: true },
        order: [['idRol', 'ASC']]
      });
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener roles',
        error: error.message
      });
    }
  },

  // Obtener rol por ID
  getById: async (req, res) => {
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
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      res.json({
        success: true,
        data: rol
      });
    } catch (error) {
      console.error('Error al obtener rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener rol',
        error: error.message
      });
    }
  },

  // Crear nuevo rol
  create: async (req, res) => {
    try {
      const { nombre, descripcion, permisos } = req.body;

      // Verificar si ya existe un rol con ese nombre
      const existingRol = await Rol.findOne({ where: { nombre } });
      if (existingRol) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un rol con ese nombre'
        });
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
      console.error('Error al crear rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear rol',
        error: error.message
      });
    }
  },

  // Actualizar rol
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, habilitado, permisos } = req.body;

      const rol = await Rol.findByPk(id);
      if (!rol) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      // Verificar si el nombre ya existe en otro rol
      if (nombre && nombre !== rol.nombre) {
        const existingRol = await Rol.findOne({ where: { nombre } });
        if (existingRol) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un rol con ese nombre'
          });
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
      console.error('Error al actualizar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar rol',
        error: error.message
      });
    }
  },

  // Eliminar (deshabilitar) rol
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const rol = await Rol.findByPk(id);
      if (!rol) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      // Deshabilitar en lugar de eliminar
      await rol.update({ habilitado: false });

      res.json({
        success: true,
        message: 'Rol eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar rol',
        error: error.message
      });
    }
  },

  // Obtener todos los permisos
  getAllPermisos: async (req, res) => {
    try {
      const permisos = await Permiso.findAll({
        order: [['idPermiso', 'ASC']]
      });
      res.json({
        success: true,
        data: permisos
      });
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener permisos',
        error: error.message
      });
    }
  }
};

module.exports = rolController;
