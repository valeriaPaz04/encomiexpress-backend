const { AnticipoExcedente, Conductor, Ruta, Vehiculo, Destino } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { idConductor, estado } = req.query;
    
    const where = {};
    if (idConductor) where.idConductor = idConductor;
    if (estado) where.estado = estado;

    const anticipos = await AnticipoExcedente.findAll({
      where,
      include: [
        { model: Conductor, as: 'conductor', include: [{ model: require('../models').Usuario, as: 'usuario' }] },
        { 
          model: Ruta, 
          as: 'ruta',
          include: [
            { model: Vehiculo, as: 'vehiculo' },
            { model: Destino, as: 'destino' }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: anticipos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener anticipos',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const anticipo = await AnticipoExcedente.findByPk(id, {
      include: [
        { model: Conductor, as: 'conductor', include: [{ model: require('../models').Usuario, as: 'usuario' }] },
        { 
          model: Ruta, 
          as: 'ruta',
          include: [
            { model: Vehiculo, as: 'vehiculo' },
            { model: Destino, as: 'destino' }
          ]
        }
      ]
    });

    if (!anticipo) {
      return res.status(404).json({
        success: false,
        message: 'Anticipo no encontrado'
      });
    }

    res.json({
      success: true,
      data: anticipo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener anticipo',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { idConductor, idRuta, valorAnticipo, soporte, fechaEntrega } = req.body;

    // Verificar que el conductor existe
    const conductor = await Conductor.findByPk(idConductor);
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }

    // idRuta es opcional (nullable)
    let ruta = null;
    if (idRuta) {
      ruta = await Ruta.findByPk(idRuta);
      if (!ruta) {
        return res.status(404).json({
          success: false,
          message: 'Ruta no encontrada'
        });
      }
    }

    const anticipo = await AnticipoExcedente.create({
      idConductor,
      idRuta: ruta?.idRuta || null,
      valorAnticipo: valorAnticipo || 0,
      valorGastado: 0,
      excedente: 0,
      estado: 'pendiente',
      soporte,
      fechaEntrega
    });

    res.status(201).json({
      success: true,
      message: 'Anticipo creado exitosamente',
      data: anticipo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear anticipo',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      valorGastado, 
      excedente, 
      estado, 
      soporte, 
      fechaEntrega, 
      fechaLegalizacion,
      fechaEntregaExcedente 
    } = req.body;

    const anticipo = await AnticipoExcedente.findByPk(id);

    if (!anticipo) {
      return res.status(404).json({
        success: false,
        message: 'Anticipo no encontrado'
      });
    }

    // Calcular excedente si se proporciona valorGastado
    let newExcedente = excedente;
    if (valorGastado !== undefined) {
      newExcedente = anticipo.valorAnticipo - valorGastado;
    }

    await anticipo.update({
      valorGastado: valorGastado !== undefined ? valorGastado : anticipo.valorGastado,
      excedente: newExcedente !== undefined ? newExcedente : anticipo.excedente,
      estado: estado || anticipo.estado,
      soporte: soporte !== undefined ? soporte : anticipo.soporte,
      fechaEntrega: fechaEntrega !== undefined ? fechaEntrega : anticipo.fechaEntrega,
      fechaLegalizacion: fechaLegalizacion !== undefined ? fechaLegalizacion : anticipo.fechaLegalizacion,
      fechaEntregaExcedente: fechaEntregaExcedente !== undefined ? fechaEntregaExcedente : anticipo.fechaEntregaExcedente
    });

    res.json({
      success: true,
      message: 'Anticipo actualizado exitosamente',
      data: anticipo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar anticipo',
      error: error.message
    });
  }
};

exports.liquidar = async (req, res) => {
  try {
    const { id } = req.params;
    const { valorGastado, soporte } = req.body;

    const anticipo = await AnticipoExcedente.findByPk(id);

    if (!anticipo) {
      return res.status(404).json({
        success: false,
        message: 'Anticipo no encontrado'
      });
    }

    if (anticipo.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'El anticipo ya fue liquidado'
      });
    }

    const excedente = anticipo.valorAnticipo - valorGastado;

    await anticipo.update({
      valorGastado,
      excedente,
      estado: excedente >= 0 ? 'liquidado' : 'con excedente',
      soporte,
      fechaLegalizacion: new Date()
    });

    res.json({
      success: true,
      message: 'Anticipo liquidado exitosamente',
      data: anticipo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al liquidar anticipo',
      error: error.message
    });
  }
};

exports.entregarExcedente = async (req, res) => {
  try {
    const { id } = req.params;
    const { soporte } = req.body;

    const anticipo = await AnticipoExcedente.findByPk(id);

    if (!anticipo) {
      return res.status(404).json({
        success: false,
        message: 'Anticipo no encontrado'
      });
    }

    if (anticipo.excedente <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay excedente para entregar'
      });
    }

    await anticipo.update({
      estado: 'excedente entregado',
      soporte: soporte || anticipo.soporte,
      fechaEntregaExcedente: new Date()
    });

    res.json({
      success: true,
      message: 'Excedente entregado exitosamente',
      data: anticipo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al entregar excedente',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const anticipo = await AnticipoExcedente.findByPk(id);

    if (!anticipo) {
      return res.status(404).json({
        success: false,
        message: 'Anticipo no encontrado'
      });
    }

    await anticipo.destroy();

    res.json({
      success: true,
      message: 'Anticipo eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar anticipo',
      error: error.message
    });
  }
};

// ============================================
// MÉTODOS PARA CONDUCTOR LOGUEADO
// ============================================

// Crear anticipo como conductor logueado
exports.createMisAnticipo = async (req, res) => {
  try {
    // Verificar que sea conductor
    if (req.usuario.rol?.nombre !== 'conductor') {
      return res.status(403).json({
        success: false,
        message: 'Solo los conductores pueden crear anticipos'
      });
    }
    
    // Buscar el conductor por el idUsuario del token
    const conductor = await Conductor.findOne({ 
      where: { idUsuario: req.usuario.idUsuario }
    });
    
    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor no encontrado'
      });
    }
    
    const { idRuta, valorAnticipo, soporte, fechaEntrega } = req.body;

    // Verificar que la ruta existe
    const ruta = await Ruta.findByPk(idRuta);
    if (!ruta) {
      return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    }

    const anticipo = await AnticipoExcedente.create({
      idConductor: conductor.idConductor,
      idRuta,
      valorAnticipo: valorAnticipo || 0,
      valorGastado: 0,
      excedente: 0,
      estado: 'pendiente',
      soporte,
      fechaEntrega
    });

    res.status(201).json({
      success: true,
      message: 'Anticipo creado exitosamente',
      data: anticipo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear anticipo',
      error: error.message
    });
  }
};
