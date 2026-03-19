const bcrypt = require('bcryptjs');
const { Usuario, Rol, Permiso, RolPermiso, Conductor } = require('../models');
const { generateToken } = require('../middlewares/auth');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y password son requeridos' 
      });
    }
    
    const usuario = await Usuario.findOne({ 
      where: { email }, 
      include: [{ model: Rol, as: 'rol' }] 
    });
    
    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }
    
    if (!usuario.habilitado) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario deshabilitado' 
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }
    
    // Obtener permisos del rol
    const rolPermisos = await RolPermiso.findAll({ 
      where: { idRol: usuario.idRol }, 
      include: [{ model: Permiso, as: 'permiso' }] 
    });
    const permisos = rolPermisos.map(rp => rp.Permiso?.nombre).filter(Boolean);
    
    // Generar token
    const token = generateToken({ 
      idUsuario: usuario.idUsuario, 
      email: usuario.email, 
      rol: usuario.rol?.nombre 
    });
    
    // Si el usuario es conductor, obtener sus datos de conductor
    let conductorData = null;
    if (usuario.rol?.nombre === 'conductor') {
      const conductor = await Conductor.findOne({ 
        where: { idUsuario: usuario.idUsuario } 
      });
      
      if (conductor) {
        conductorData = {
          idConductor: conductor.idConductor,
          categoriaLicencia: conductor.categoriaLicencia,
          numeroLicencia: conductor.numeroLicencia,
          vencimientoLicencia: conductor.vencimientoLicencia,
          estado: conductor.estado,
          habilitado: conductor.habilitado
        };
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Login exitoso', 
      data: { 
        token, 
        usuario: { 
          idUsuario: usuario.idUsuario, 
          nombre: usuario.nombre, 
          apellido: usuario.apellido, 
          email: usuario.email, 
          rol: usuario.rol?.nombre,
          permisos 
        },
        conductor: conductorData
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error en el login', 
      error: error.message 
    });
  }
};

const register = async (req, res) => {
  try {
    const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, telefono, email, password, idRol } = req.body;
    
    const existingEmail = await Usuario.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }
    
    const existingDoc = await Usuario.findOne({ where: { numeroIdentificacion } });
    if (existingDoc) {
      return res.status(400).json({ 
        success: false, 
        message: 'El número de identificación ya está registrado' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ 
      tipoIdentificacion, 
      numeroIdentificacion, 
      nombre, 
      apellido, 
      telefono, 
      email, 
      password: hashedPassword, 
      idRol: idRol || 2 
    });
    
    const token = generateToken({ 
      idUsuario: usuario.idUsuario, 
      email: usuario.email, 
      rol: 'usuario' 
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente', 
      data: { 
        token, 
        usuario: { 
          idUsuario: usuario.idUsuario, 
          nombre: usuario.nombre, 
          apellido: usuario.apellido, 
          email: usuario.email 
        } 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar usuario', 
      error: error.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.idUsuario, { 
      include: [{ model: Rol, as: 'rol' }], 
      attributes: { exclude: ['password'] } 
    });
    
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      data: usuario 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener perfil', 
      error: error.message 
    });
  }
};

// Nueva función para obtener perfil de conductor desde el token
const getConductorProfile = async (req, res) => {
  try {
    const idUsuario = req.usuario.idUsuario;
    
    // Verificar que el usuario sea conductor
    if (req.usuario.rol?.nombre !== 'conductor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Solo los conductores pueden acceder a este recurso' 
      });
    }
    
    // Buscar el conductor asociado al usuario
    const conductor = await Conductor.findOne({ 
      where: { idUsuario },
      include: [{ model: Usuario, as: 'usuario', attributes: { exclude: ['password'] } }]
    });
    
    if (!conductor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conductor no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      data: conductor 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener perfil de conductor', 
      error: error.message 
    });
  }
};

module.exports = { 
  login, 
  register, 
  getProfile,
  getConductorProfile 
};
