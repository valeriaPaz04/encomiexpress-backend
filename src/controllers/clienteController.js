const clienteService = require('../services/clienteService');

const listarClientes = async (req, res, next) => {
  try {
    const clientes = await clienteService.getAll();
    res.json({ success: true, data: clientes });
  } catch (error) {
    next(error);
  }
};

const obtenerCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await clienteService.getById(id);
    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
};

const registrarCliente = async (req, res, next) => {
  try {
    const nuevoCliente = await clienteService.create(req.body);
    res.status(201).json({ success: true, message: 'Cliente registrado exitosamente', data: nuevoCliente });
  } catch (error) {
    next(error);
  }
};

const actualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await clienteService.update(id, req.body);
    res.json({ success: true, message: 'Cliente actualizado exitosamente', data: cliente });
  } catch (error) {
    next(error);
  }
};

const toggleHabilitadoCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await clienteService.toggleHabilitado(id);
    res.json({
      success: true,
      message: `Cliente ${cliente.habilitado ? 'habilitado' : 'inhabilitado'} exitosamente`,
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarClientes,
  obtenerCliente,
  registrarCliente,
  actualizarCliente,
  toggleHabilitadoCliente
};
