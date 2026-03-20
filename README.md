# ENCOMIEXPRESS API

API REST para el sistema de gestión de encomiendas ENCOMIEXPRESS.

## 🚀 Características

- Autenticación JWT con roles y permisos
- Gestión completa de usuarios, clientes, conductores y vehículos
- Sistema de rutas y destinos
- Gestión de encomiendas con seguimiento en tiempo real
- Control de anticipos y excedentes para conductores
- API RESTful con validaciones

## 🛠️ Tecnologías

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Sequelize** - ORM
- **JWT** - Autenticación
- **Bcryptjs** - Encriptación de contraseñas

## 📋 Requisitos

- Node.js >= 14
- PostgreSQL >= 12

## ⚡ Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno en `.env`:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=encomiexpress
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=tu_secret_key
```

4. Crear la base de datos:
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE encomiexpress;

# Ejecutar script de inicialización
\i database/init.sql
```

5. Iniciar el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (requiere token)

### Usuarios
- `GET /api/usuarios` - Listar usuarios (admin)
- `GET /api/usuarios/:id` - Obtener usuario
- `POST /api/usuarios` - Crear usuario (admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (admin)
- `DELETE /api/usuarios/:id` - Eliminar usuario (admin)

### Roles y Permisos
- `GET /api/roles` - Listar roles
- `GET /api/roles/:id` - Obtener rol por ID
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar (inhabilitar) rol
- `GET /api/roles/permisos` - Listar todos los permisos

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `GET /api/clientes/:id/encomiendas` - Ver encomiendas del cliente

### Conductores
- `GET /api/conductores` - Listar conductores
- `GET /api/conductores/:id` - Obtener conductor
- `POST /api/conductores` - Crear conductor
- `GET /api/conductores/:id/vehiculos` - Ver vehículos del conductor

### Vehículos
- `GET /api/vehiculos` - Listar vehículos
- `GET /api/vehiculos/:id` - Obtener vehículo
- `POST /api/vehiculos` - Crear vehículo
- `PUT /api/vehiculos/:id` - Actualizar vehículo

### Destinos
- `GET /api/destinos` - Listar destinos
- `GET /api/destinos/:id` - Obtener destino
- `POST /api/destinos` - Crear destino
- `PUT /api/destinos/:id` - Actualizar destino

### Rutas
- `GET /api/rutas` - Listar rutas
- `GET /api/rutas/disponibles` - Rutas disponibles
- `GET /api/rutas/:id` - Obtener ruta
- `POST /api/rutas` - Crear ruta
- `GET /api/rutas/:id/encomiendas` - Ver encomiendas de la ruta

### Anticipos
- `GET /api/anticipos` - Listar anticipos
- `POST /api/anticipos` - Crear anticipo
- `POST /api/anticipos/liquidar/:id` - Liquidar anticipo

### Encomiendas
- `GET /api/encomiendas` - Listar encomiendas
- `GET /api/encomiendas/track/:numeroGuia` - Rastrear encomienda (público)
- `GET /api/encomiendas/:id` - Obtener encomienda
- `POST /api/encomiendas` - Crear encomienda
- `PUT /api/encomiendas/:id/estado` - Actualizar estado
- `POST /api/encomiendas/:id/pagar` - Registrar pago

## 🔐 Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| admin | Acceso completo al sistema |
| usuario | Puede gestionar clientes y encomiendas |
| conductor | Puede gestionar rutas, vehículos y encomiendas |

## 📝 Ejemplo de Uso

> **Nota:** El puerto por defecto es `3000`, pero se configura mediante la variable de entorno `PORT`

### Iniciar sesión
```bash
curl -X POST http://localhost:${PORT:-3000}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@encomiexpress.com", "password": "admin123"}'
```

### Crear encomienda
```bash
curl -X POST http://localhost:${PORT:-3000}/api/encomiendas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "idCliente": 1,
    "idRuta": 1,
    "valorServicio": 25000,
    "destinatario": {
      "nombreDestinatario": "Juan Pérez",
      "telefonoDestinatario": "3001234567",
      "direccionDestinatario": "Calle 123 #45-67"
    },
    "paquetes": [
      {
        "descripcionContenido": "Ropa",
        "peso": 2.5
      }
    ]
  }'
```

### Rastrear encomienda
```bash
curl http://localhost:${PORT:-3000}/api/encomiendas/track/ENCOMIEXPRESS-123
```

## 📄 Licencia

ISC