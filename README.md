# Task Manager API

API REST para la gestión de tareas con autenticación JWT y roles de usuario. Construida con Node.js, Express, TypeScript y MySQL.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Docker](#docker)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [Scripts Disponibles](#scripts-disponibles)
- [Documentación API (Swagger)](#documentación-api-swagger)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
- [Base de Datos](#base-de-datos)
- [Pruebas](#pruebas)
- [CI/CD](#cicd)
- [Despliegue](#despliegue)

## Requisitos

- Node.js >= 22
- MySQL >= 8.0
- npm

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Inicializar la base de datos (la tabla se crea automáticamente con docker o manualmente)
```

## Docker

```bash
# Iniciar servicios (MySQL + API)
docker compose -f docker/docker-compose.yml up -d

# Detener servicios
docker compose -f docker/docker-compose.yml down

# Ver logs
docker compose -f docker/docker-compose.yml logs -f
```

## Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `API_VERSION` | Versión del API | `v1` |
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | `root` |
| `DB_NAME` | Nombre de la base de datos | `task_manager` |
| `JWT_SECRET` | Secreto para firmar JWT | — |
| `JWT_EXPIRES_IN` | Expiración del token | `24h` |
| `DEFAULT_ADMIN_EMAIL` | Email del admin por defecto | `admin@taskmanager.com` |
| `DEFAULT_ADMIN_PASSWORD` | Contraseña del admin por defecto | `Admin123!` |
| `DEFAULT_ADMIN_NOMBRE` | Nombre del admin por defecto | `Administrador` |

## Ejecución

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Compilar TypeScript
npm run build

# Modo producción
npm start
```

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor en modo desarrollo con `ts-node-dev` |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Ejecuta la versión compilada |
| `npm test` | Ejecuta las pruebas con Vitest |
| `npm run test:watch` | Ejecuta pruebas en modo watch |

## Documentación API (Swagger)

La documentación interactiva de la API está disponible en:

```
http://localhost:3000/api/v1/docs
```

El esquema OpenAPI también está disponible en formato JSON:

```
http://localhost:3000/api/v1/docs.json
```

## Estructura del Proyecto

```
src/
├── config/                  # Configuración (entorno, logger, swagger)
│   ├── env.config.ts
│   ├── logger.ts
│   └── swagger.ts
├── controllers/             # Manejadores HTTP
│   ├── auth.controller.ts
│   ├── task.controller.ts
│   ├── user.controller.ts
│   └── error-handler.ts
├── database/                # Conexión MySQL y seed
│   ├── mysql.connection.ts
│   └── seed.ts
├── domain/                  # Entidades, errores e interfaces de repositorio
│   ├── task.entity.ts
│   ├── user.entity.ts
│   ├── errors/
│   └── repositories/
├── infrastructure/          # Implementaciones concretas (MySQL)
│   └── repositories/
├── middleware/              # Middleware de Express (auth)
├── routes/                  # Definición de rutas HTTP
├── services/                # Lógica de negocio
├── index.ts                 # Punto de entrada
└── server.ts                # Configuración del servidor Express
```

## Autenticación

La API usa autenticación mediante **JWT (JSON Web Tokens)**.

### Registro

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "nombre": "Usuario",
  "email": "usuario@example.com",
  "password": "MiPassword123!"
}
```

### Inicio de Sesión

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "MiPassword123!"
}
```

### Uso del Token

Incluir el token en el header `Authorization`:

```
Authorization: Bearer <token>
```

### Roles

- **usuario**: Puede gestionar sus propias tareas.
- **admin**: Puede gestionar usuarios y tareas.

## Endpoints

### Autenticación (`/api/v1/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | — | Registrar nuevo usuario |
| `POST` | `/auth/login` | — | Iniciar sesión |
| `GET` | `/auth/me` | ✅ | Obtener perfil actual |
| `PUT` | `/auth/profile` | ✅ | Actualizar perfil |
| `PUT` | `/auth/password` | ✅ | Cambiar contraseña |

### Tareas (`/api/v1/tasks`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/tasks` | ✅ | Listar tareas del usuario |
| `GET` | `/tasks/:id` | ✅ | Obtener tarea por ID |
| `POST` | `/tasks` | ✅ | Crear tarea |
| `PUT` | `/tasks/:id` | ✅ | Actualizar tarea |
| `DELETE` | `/tasks/:id` | ✅ | Eliminar tarea (soft delete) |

### Usuarios (`/api/v1/users`) — Solo admin

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/users` | Admin | Listar usuarios |
| `GET` | `/users/deleted` | Admin | Listar usuarios eliminados |
| `GET` | `/users/:id` | Admin | Obtener usuario por ID |
| `POST` | `/users` | Admin | Crear usuario |
| `PUT` | `/users/:id` | Admin | Actualizar usuario |
| `PUT` | `/users/:id/restore` | Admin | Restaurar usuario eliminado |
| `DELETE` | `/users/:id` | Admin | Eliminar usuario (soft delete) |

## Base de Datos

### Esquema

**Tabla `users`**

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `nombre` | VARCHAR(255) | Nombre del usuario |
| `email` | VARCHAR(255) (UNIQUE) | Correo electrónico |
| `password` | VARCHAR(255) | Contraseña hasheada |
| `rol` | ENUM('usuario', 'admin') | Rol del usuario |
| `fecha_creacion` | DATETIME | Fecha de creación |
| `fecha_actualizacion` | DATETIME | Fecha de última modificación |
| `fecha_eliminacion` | DATETIME (NULL) | Soft delete |

**Tabla `tasks`**

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | VARCHAR(36) (PK) | UUID de la tarea |
| `user_id` | INT (FK → users.id) | Propietario de la tarea |
| `titulo` | VARCHAR(255) | Título de la tarea |
| `descripcion` | TEXT | Descripción |
| `estado` | ENUM('pendiente', 'en progreso', 'completada') | Estado actual |
| `fecha_creacion` | DATETIME | Fecha de creación |
| `fecha_actualizacion` | DATETIME | Fecha de última modificación |
| `fecha_eliminacion` | DATETIME (NULL) | Soft delete |

### Seed

Al iniciar el servidor, se crea automáticamente un usuario administrador por defecto si no existe ninguno.

## Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Modo watch
npm run test:watch
```

## CI/CD

El proyecto incluye un pipeline de CI en GitHub Actions (`.github/workflows/ci.yml`) que:

1. Se ejecuta en push y pull requests a `main`
2. Instala dependencias con `npm ci`
3. Ejecuta las pruebas con `npm test`

## Despliegue

### Construir imagen Docker

```bash
docker build -t task-manager-api .
```

### Desplegar con Docker Compose

```bash
docker compose -f docker/docker-compose.yml up -d
```
