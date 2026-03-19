require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');

// Importar rutas (solo las necesarias)
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuarios');
const conductorRoutes = require('./routes/conductores');
const propietarioRoutes = require('./routes/propietarios');
const vehiculoRoutes = require('./routes/vehiculos');
const destinoRoutes = require('./routes/destinos');
const rutaRoutes = require('./routes/rutas');
const anticipoRoutes = require('./routes/anticipos');
const clienteRoutes = require('./routes/clientes'); // Rutas de clientes
const encomiendaRoutes = require('./routes/encomiendas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/conductores', conductorRoutes);
app.use('/api/propietarios', propietarioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/destinos', destinoRoutes);
app.use('/api/rutas', rutaRoutes);
app.use('/api/anticipos', anticipoRoutes);
app.use('/api/clientes', clienteRoutes); // Rutas de clientes
app.use('/api/encomiendas', encomiendaRoutes);

// Ruta de verificación de estado
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API ENCOMIEXPRESS funcionando correctamente' });
});

// Endpoint para inicializar datos de la base de datos
app.post('/api/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { Rol, Permiso, Usuario } = require('./models');
    
    // Verificar si ya existen roles
    const existingRoles = await Rol.count();
    if (existingRoles === 0) {
      // Crear roles
      await Rol.bulkCreate([
        { nombre: 'admin', descripcion: 'Administrador del sistema con acceso total', habilitado: true },
        { nombre: 'usuario', descripcion: 'Usuario que puede registrar encomiendas', habilitado: true },
        { nombre: 'conductor', descripcion: 'Conductor de vehículo', habilitado: true }
      ]);
      
      // Crear permisos
      await Permiso.bulkCreate([
        { nombre: 'usuarios', descripcion: 'Gestión de usuarios' },
        { nombre: 'roles', descripcion: 'Gestión de roles y permisos' },
        { nombre: 'clientes', descripcion: 'Gestión de clientes' },
        { nombre: 'conductores', descripcion: 'Gestión de conductores' },
        { nombre: 'vehiculos', descripcion: 'Gestión de vehículos' },
        { nombre: 'destinos', descripcion: 'Gestión de destinos' },
        { nombre: 'rutas', descripcion: 'Gestión de rutas' },
        { nombre: 'encomiendas', descripcion: 'Gestión de encomiendas' },
        { nombre: 'anticipos', descripcion: 'Gestión de anticipos' }
      ]);
    }
    
    // Eliminar usuario admin existente si existe
    await Usuario.destroy({ where: { email: 'admin@encomiexpress.com' } });
    
    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Usuario.create({
      idRol: 1,
      tipoIdentificacion: 'CC',
      numeroIdentificacion: '12345678',
      nombre: 'Administrador',
      apellido: 'Sistema',
      telefono: '3000000000',
      email: 'admin@encomiexpress.com',
      password: hashedPassword,
      habilitado: true
    });
    
    res.json({ 
      success: true, 
      message: 'Usuario admin recreado correctamente. Login con: admin@encomiexpress.com / admin123',
      data: {
        email: 'admin@encomiexpress.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Error al inicializar datos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al inicializar datos',
      error: error.message 
    });
  }
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Modelos sincronizados con la base de datos');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`📋 Documentación: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
