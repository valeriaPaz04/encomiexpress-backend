const { EncomiendaVenta, Destinatario, Paquete, Cliente, Ruta, sequelize } = require('../models');

// Generar número de guía único
const generarNumeroGuia = async () => {
  const prefix = 'EE';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Validar estados de encomienda
const ESTADOS_VALIDOS = ['Pendiente de Recogida', 'En Recogida', 'Programada', 'En Tránsito', 'Entregado', 'Devuelto'];
const METODOS_PAGO_VALIDOS = ['Contraentrega', 'Efectivo', 'Transferencia', 'Nequi'];
const ESTADOS_PAGO_VALIDOS = ['Pendiente', 'Pagado'];

// Listar todas las encomiendas
exports.getAll = async (req, res) => {
  try {
    const { estado, idCliente, fechaInicio, fechaFin } = req.query;
    
    const where = {};
    if (estado) where.estado = estado;
    if (idCliente) where.idCliente = idCliente;
    if (fechaInicio && fechaFin) {
      where.fechaRegistro = {
        [sequelize.Sequelize.Op.between]: [fechaInicio, fechaFin]
      };
    }

    const encomiendas = await EncomiendaVenta.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Ruta, as: 'ruta', include: [
          { model: require('../models').Vehiculo, as: 'vehiculo' },
          { model: require('../models').Destino, as: 'destino' }
        ]},
        { model: Destinatario, as: 'destinatarios' },
        { model: Paquete, as: 'paquetes' }
      ],
      order: [['fechaRegistro', 'DESC']]
    });

    res.json({
      success: true,
      data: encomiendas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener encomiendas',
      error: error.message
    });
  }
};

// Obtener una encomienda por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const encomienda = await EncomiendaVenta.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Ruta, as: 'ruta', include: [
          { model: require('../models').Vehiculo, as: 'vehiculo' },
          { model: require('../models').Conductor, as: 'conductor', include: [
            { model: require('../models').Usuario, as: 'usuario' }
          ]},
          { model: require('../models').Destino, as: 'destino' }
        ]},
        { model: Destinatario, as: 'destinatarios' },
        { model: Paquete, as: 'paquetes' }
      ]
    });

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    res.json({
      success: true,
      data: encomienda
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener encomienda',
      error: error.message
    });
  }
};

// Obtener una encomienda por número de guía
exports.getByGuia = async (req, res) => {
  try {
    const { numeroGuia } = req.params;
    
    const encomienda = await EncomiendaVenta.findOne({
      where: { numeroGuia },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Ruta, as: 'ruta', include: [
          { model: require('../models').Vehiculo, as: 'vehiculo' },
          { model: require('../models').Destino, as: 'destino' }
        ]},
        { model: Destinatario, as: 'destinatarios' },
        { model: Paquete, as: 'paquetes' }
      ]
    });

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    res.json({
      success: true,
      data: encomienda
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar encomienda',
      error: error.message
    });
  }
};

// Crear una nueva encomienda con destinatario y paquetes
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      idCliente,
      idRuta,
      numeroFactura,
      fechaEstimadaEntrega,
      observaciones,
      valorServicio,
      impuestos,
      metodoPago,
      estadoPago,
      // Datos del destinatario
      destinatario,
      // Array de paquetes
      paquetes
    } = req.body;

    // Validar cliente existe
    const cliente = await Cliente.findByPk(idCliente);
    if (!cliente) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Validar ruta existe (opcional por ahora — módulo de rutas pendiente)
    if (idRuta) {
      const ruta = await Ruta.findByPk(idRuta);
      if (!ruta) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Ruta no encontrada'
        });
      }
    }

    // Validar método de pago
    if (metodoPago && !METODOS_PAGO_VALIDOS.some(v => v.toLowerCase() === metodoPago.toLowerCase())) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Método de pago inválido. Opciones: ${METODOS_PAGO_VALIDOS.join(', ')}`
      });
    }

    // Validar estado de pago
    if (estadoPago && !ESTADOS_PAGO_VALIDOS.some(v => v.toLowerCase() === estadoPago.toLowerCase())) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Estado de pago inválido. Opciones: ${ESTADOS_PAGO_VALIDOS.join(', ')}`
      });
    }

    // Generar número de guía único
    let numeroGuia = await generarNumeroGuia();
    let guiaExistente = await EncomiendaVenta.findOne({ where: { numeroGuia } });
    while (guiaExistente) {
      numeroGuia = await generarNumeroGuia();
      guiaExistente = await EncomiendaVenta.findOne({ where: { numeroGuia } });
    }

    // Calcular total
    const valorImpuestos = impuestos || 0;
    const total = (valorServicio || 0) + valorImpuestos;

    // Crear la encomienda
    const encomienda = await EncomiendaVenta.create({
      idCliente,
      idRuta,
      numeroGuia,
      numeroFactura: numeroFactura || null,
      fechaEstimadaEntrega: fechaEstimadaEntrega || null,
      observaciones: observaciones || null,
      valorServicio: valorServicio || 0,
      impuestos: valorImpuestos,
      total,
      metodoPago: metodoPago || null,
      estadoPago: estadoPago || 'pendiente',
      estado: 'pendiente de recogida'
    }, { transaction });

    // Crear destinatario si existe
    if (destinatario) {
      await Destinatario.create({
        idEncomiendaVenta: encomienda.idEncomiendaVenta,
        nombreDestinatario: destinatario.nombreDestinatario,
        telefonoDestinatario: destinatario.telefonoDestinatario || null,
        direccionDestinatario: destinatario.direccionDestinatario || null
      }, { transaction });
    }

    // Crear paquetes si existen
    if (paquetes && paquetes.length > 0) {
      for (const pkg of paquetes) {
        await Paquete.create({
          idEncomiendaVenta: encomienda.idEncomiendaVenta,
          descripcionContenido: pkg.descripcionContenido || null,
          peso: pkg.peso || null,
          alto: pkg.alto || null,
          ancho: pkg.ancho || null,
          profundidad: pkg.profundidad || null,
          valorDeclarado: pkg.valorDeclarado || null
        }, { transaction });
      }
    }

    await transaction.commit();

    // Obtener la encomienda completa con relaciones
    const encomiendaCompleta = await EncomiendaVenta.findByPk(encomienda.idEncomiendaVenta, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Ruta, as: 'ruta' },
        { model: Destinatario, as: 'destinatarios' },
        { model: Paquete, as: 'paquetes' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Encomienda creada exitosamente',
      data: encomiendaCompleta
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Error al crear encomienda',
      error: error.message
    });
  }
};

// Actualizar una encomienda
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      idRuta,
      numeroFactura,
      fechaEstimadaEntrega,
      observaciones,
      valorServicio,
      impuestos,
      metodoPago,
      estadoPago,
      habilitado
    } = req.body;

    const encomienda = await EncomiendaVenta.findByPk(id);

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    // Validar método de pago
    if (metodoPago && !METODOS_PAGO_VALIDOS.some(v => v.toLowerCase() === metodoPago.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Método de pago inválido. Opciones: ${METODOS_PAGO_VALIDOS.join(', ')}`
      });
    }

    // Validar estado de pago
    if (estadoPago && !ESTADOS_PAGO_VALIDOS.some(v => v.toLowerCase() === estadoPago.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Estado de pago inválido. Opciones: ${ESTADOS_PAGO_VALIDOS.join(', ')}`
      });
    }

    // Calcular total si se actualiza valor
    const nuevoImpuestos = impuestos !== undefined ? impuestos : encomienda.impuestos;
    const nuevoValorServicio = valorServicio !== undefined ? valorServicio : encomienda.valorServicio;
    const nuevoTotal = nuevoImpuestos + nuevoValorServicio;

    await encomienda.update({
      idRuta: idRuta !== undefined ? idRuta : encomienda.idRuta,
      numeroFactura: numeroFactura !== undefined ? numeroFactura : encomienda.numeroFactura,
      fechaEstimadaEntrega: fechaEstimadaEntrega !== undefined ? fechaEstimadaEntrega : encomienda.fechaEstimadaEntrega,
      observaciones: observaciones !== undefined ? observaciones : encomienda.observaciones,
      valorServicio: nuevoValorServicio,
      impuestos: nuevoImpuestos,
      total: nuevoTotal,
      metodoPago: metodoPago !== undefined ? metodoPago : encomienda.metodoPago,
      estadoPago: estadoPago !== undefined ? estadoPago : encomienda.estadoPago,
      habilitado: habilitado !== undefined ? habilitado : encomienda.habilitado
    });

    // Obtener la encomienda actualizada
    const encomiendaActualizada = await EncomiendaVenta.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Ruta, as: 'ruta' },
        { model: Destinatario, as: 'destinatarios' },
        { model: Paquete, as: 'paquetes' }
      ]
    });

    res.json({
      success: true,
      message: 'Encomienda actualizada exitosamente',
      data: encomiendaActualizada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar encomienda',
      error: error.message
    });
  }
};

// Cambiar estado de la encomienda
exports.cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const encomienda = await EncomiendaVenta.findByPk(id);

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    // Validar estado
    if (!ESTADOS_VALIDOS.some(v => v.toLowerCase() === estado.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}`
      });
    }

    await encomienda.update({ estado: estado.toLowerCase() });

    res.json({
      success: true,
      message: 'Estado de encomienda actualizado exitosamente',
      data: encomienda
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: error.message
    });
  }
};

// Eliminar (inhabilitar) una encomienda
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const encomienda = await EncomiendaVenta.findByPk(id);

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    await encomienda.update({ habilitado: false });

    res.json({
      success: true,
      message: 'Encomienda deshabilitada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar encomienda',
      error: error.message
    });
  }
};

// Agregar paquete a una encomienda existente
exports.agregarPaquete = async (req, res) => {
  try {
    const { idEncomiendaVenta } = req.params;
    const {
      descripcionContenido,
      peso,
      alto,
      ancho,
      profundidad,
      valorDeclarado
    } = req.body;

    const encomienda = await EncomiendaVenta.findByPk(idEncomiendaVenta);

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    const paquete = await Paquete.create({
      idEncomiendaVenta,
      descripcionContenido: descripcionContenido || null,
      peso: peso || null,
      alto: alto || null,
      ancho: ancho || null,
      profundidad: profundidad || null,
      valorDeclarado: valorDeclarado || null
    });

    res.status(201).json({
      success: true,
      message: 'Paquete agregado exitosamente',
      data: paquete
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar paquete',
      error: error.message
    });
  }
};

// Habilitar/Inhabilitar una encomienda (toggle)
exports.toggleHabilitado = async (req, res) => {
  try {
    const { id } = req.params;

    const encomienda = await EncomiendaVenta.findByPk(id);

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    await encomienda.update({ habilitado: !encomienda.habilitado });

    res.json({
      success: true,
      message: `Encomienda ${encomienda.habilitado ? 'habilitada' : 'inhabilitada'} exitosamente`,
      data: encomienda
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de habilitado',
      error: error.message
    });
  }
};

// Agregar destinatario a una encomienda existente
exports.agregarDestinatario = async (req, res) => {
  try {
    const { idEncomiendaVenta } = req.params;
    const {
      nombreDestinatario,
      telefonoDestinatario,
      direccionDestinatario
    } = req.body;

    const encomienda = await EncomiendaVenta.findByPk(idEncomiendaVenta);

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    const destinatario = await Destinatario.create({
      idEncomiendaVenta,
      nombreDestinatario,
      telefonoDestinatario: telefonoDestinatario || null,
      direccionDestinatario: direccionDestinatario || null
    });

    res.status(201).json({
      success: true,
      message: 'Destinatario agregado exitosamente',
      data: destinatario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar destinatario',
      error: error.message
    });
  }
};
