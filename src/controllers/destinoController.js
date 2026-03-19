const { Destino, Ruta } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { habilitado } = req.query;
    
    const where = {};
    if (habilitado !== undefined) where.habilitado = habilitado === 'true';

    const destinos = await Destino.findAll({ where });

    res.json({
      success: true,
      data: destinos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener destinos',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const destino = await Destino.findByPk(id);

    if (!destino) {
      return res.status(404).json({
        success: false,
        message: 'Destino no encontrado'
      });
    }

    res.json({
      success: true,
      data: destino
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener destino',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { departamento, ciudad, tarifaBase } = req.body;

    const destino = await Destino.create({
      departamento,
      ciudad,
      tarifaBase: tarifaBase || 0
    });

    res.status(201).json({
      success: true,
      message: 'Destino creado exitosamente',
      data: destino
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear destino',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { departamento, ciudad, tarifaBase, habilitado } = req.body;

    const destino = await Destino.findByPk(id);

    if (!destino) {
      return res.status(404).json({
        success: false,
        message: 'Destino no encontrado'
      });
    }

    await destino.update({
      departamento: departamento || destino.departamento,
      ciudad: ciudad || destino.ciudad,
      tarifaBase: tarifaBase !== undefined ? tarifaBase : destino.tarifaBase,
      habilitado: habilitado !== undefined ? habilitado : destino.habilitado
    });

    res.json({
      success: true,
      message: 'Destino actualizado exitosamente',
      data: destino
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar destino',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const destino = await Destino.findByPk(id);

    if (!destino) {
      return res.status(404).json({
        success: false,
        message: 'Destino no encontrado'
      });
    }

    await destino.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Destino deshabilitado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar destino',
      error: error.message
    });
  }
};

exports.getRutas = async (req, res) => {
  try {
    const { id } = req.params;
    
    const destino = await Destino.findByPk(id);
    if (!destino) {
      return res.status(404).json({
        success: false,
        message: 'Destino no encontrado'
      });
    }

    const rutas = await Ruta.findAll({
      where: { idDestino: id }
    });

    res.json({
      success: true,
      data: rutas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener rutas del destino',
      error: error.message
    });
  }
};
