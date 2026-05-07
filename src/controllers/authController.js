const bcrypt = require('bcryptjs');
const { Usuario, Rol, Permiso, RolPermiso, Conductor } = require('../models');
const { generateToken } = require('../middlewares/auth');
const { sendPasswordRecoveryEmail } = require('../config/email');
const AppError = require('../utils/AppError');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new AppError('Email y password son requeridos', 400));
    }
    
    const usuario = await Usuario.findOne({ 
      where: { email }, 
      include: [{
        model: Rol, 
        as: 'rol',
        include: [{ model: Permiso, as: 'permisos' }]
      }] 
    });

    // DEBUG: Ver qué trae Sequelize
    console.log('USUARIO JSON:', JSON.stringify(usuario?.toJSON(), null, 2));
    
    if (!usuario) {
      return next(new AppError('Credenciales inválidas', 401));
    }
    
    if (!usuario.habilitado) {
      return next(new AppError('Usuario deshabilitado', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return next(new AppError('Credenciales inválidas', 401));
    }
    
    // Permisos directos desde el include
    const permisos = usuario.rol?.permisos?.map(p => p.nombre) ?? [];
    console.log('ROL:', usuario.rol?.nombre, '| PERMISOS:', permisos);
    
    // Generar token con idRol y rol seguros
    const token = generateToken({ 
      idUsuario: usuario.idUsuario, 
      email: usuario.email, 
      idRol: usuario.idRol,
      rol: usuario.rol?.nombre ?? null
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
          nombre: usuario.nombre, 
          apellido: usuario.apellido, 
          telefono: usuario.telefono,
          tipoIdentificacion: usuario.tipoIdentificacion,
          numeroIdentificacion: usuario.numeroIdentificacion,
          rol: usuario.rol?.nombre ?? null,
          permisos
        },
        conductor: conductorData
      } 
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { tipoIdentificacion, numeroIdentificacion, nombre, apellido, telefono, email, password, idRol } = req.body;
    
    const existingEmail = await Usuario.findOne({ where: { email } });
    if (existingEmail) {
      return next(new AppError('El email ya está registrado', 400));
    }
    
    const existingDoc = await Usuario.findOne({ where: { numeroIdentificacion } });
    if (existingDoc) {
      return next(new AppError('El número de identificación ya está registrado', 400));
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
      idRol: usuario.idRol,
      rol: 'usuario' 
    });
    
    // Obtener permisos del rol para la respuesta
    const rol = await Rol.findByPk(usuario.idRol, {
      include: [{ model: Permiso, as: 'permisos' }]
    });
    const permisos = rol?.permisos?.map(p => p.nombre) ?? [];
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente', 
      data: { 
        token, 
        usuario: { 
          nombre: usuario.nombre, 
          apellido: usuario.apellido,
          telefono: usuario.telefono,
          tipoIdentificacion: usuario.tipoIdentificacion,
          numeroIdentificacion: usuario.numeroIdentificacion,
          rol: 'usuario',
          permisos
        } 
      } 
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.idUsuario, { 
      include: [{ 
        model: Rol, 
        as: 'rol',
        include: [{ model: Permiso, as: 'permisos' }]
      }], 
      attributes: { exclude: ['password'] } 
    });
    
    if (!usuario) {
      return next(new AppError('Usuario no encontrado', 404));
    }
    
    const permisos = usuario.rol?.permisos?.map(p => p.nombre) ?? [];
    
    res.json({ 
      success: true, 
      data: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        tipoIdentificacion: usuario.tipoIdentificacion,
        numeroIdentificacion: usuario.numeroIdentificacion,
        rol: usuario.rol?.nombre ?? null,
        permisos
      }
    });
  } catch (error) {
    next(error);
  }
};

// Nueva función para obtener perfil de conductor desde el token
const getConductorProfile = async (req, res, next) => {
  try {
    const idUsuario = req.usuario.idUsuario;
    
    // Verificar que el usuario sea conductor
    if (req.usuario.rol?.nombre !== 'conductor') {
      return next(new AppError('Acceso denegado. Solo los conductores pueden acceder a este recurso', 403));
    }
    
    // Buscar el conductor asociado al usuario
    const conductor = await Conductor.findOne({ 
      where: { idUsuario },
      include: [{ model: Usuario, as: 'usuario', attributes: { exclude: ['password'] } }]
    });
    
    if (!conductor) {
      return next(new AppError('Conductor no encontrado', 404));
    }
    
     res.json({ 
       success: true, 
       data: {
         nombre: conductor.usuario.nombre,
         apellido: conductor.usuario.apellido,
         telefono: conductor.usuario.telefono,
         tipoIdentificacion: conductor.usuario.tipoIdentificacion,
         numeroIdentificacion: conductor.usuario.numeroIdentificacion,
         idConductor: conductor.idConductor,
         categoriaLicencia: conductor.categoriaLicencia,
         numeroLicencia: conductor.numeroLicencia,
         vencimientoLicencia: conductor.vencimientoLicencia,
         estado: conductor.estado,
         habilitado: conductor.habilitado,
         rol: conductor.usuario.rol?.nombre
       }
     });
  } catch (error) {
    next(error);
  }
};

const recoverPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new AppError('Email es requerido', 400));
    }
    
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      return next(new AppError('No existe usuario con ese email', 404));
    }
    
    // Generar nueva contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await usuario.update({ password: hashedPassword });
    
    // Enviar email con la contraseña temporal
    try {
      await sendPasswordRecoveryEmail(email, tempPassword);
    } catch (emailError) {
      console.error('Error al enviar email:', emailError.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Se ha enviado una contraseña temporal a tu email' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  login, 
  register, 
  getProfile,
  getConductorProfile,
  recoverPassword
};
