# 📘 Documentación del Proyecto
## Sistema de Gestión de Transporte de Carga

---

# 1. Introducción

## 1.1 Propósito del documento
Este documento describe la arquitectura, diseño, funcionamiento y decisiones técnicas del sistema. Sirve como guía para desarrolladores, evaluación académica y mantenimiento futuro.

## 1.2 Alcance del sistema
El sistema digitaliza el proceso administrativo de una empresa de transporte de carga pesada, cubriendo registro de viajes, gastos, vehículos, empleados y clientes, con un dashboard de resumen financiero. Está desplegado en producción y disponible desde cualquier dispositivo con internet.

## 1.3 URLs de producción

| Servicio | URL |
|---------|-----|
| Frontend | https://sistema-de-gestion-de-transporte-6g.vercel.app |
| Backend API | https://heavy-transport-api.fly.dev |
| Repositorio | https://github.com/Fede-FC/SistemaDeGestionDeTransporte |

## 1.4 Definiciones y términos

| Término | Descripción |
|--------|------------|
| Viaje | Operación de transporte realizada por un vehículo |
| Gasto | Costo asociado a un viaje, vehículo, o sin asociación |
| DUA | Documento Único Administrativo — documento aduanero |
| Soft delete | Desactivación lógica sin eliminar físicamente el registro |
| JWT | JSON Web Token — mecanismo de autenticación sin sesión |
| Trigger | Función de base de datos que se ejecuta automáticamente |
| CORS | Cross-Origin Resource Sharing — control de acceso entre dominios |

---

# 2. Descripción general del sistema

## 2.1 Perspectiva del sistema
Aplicación web de tres capas desplegada en la nube: frontend React en Vercel, API backend Node.js/Express en Fly.io (contenedor Docker), y base de datos PostgreSQL en Fly.io.

## 2.2 Funciones principales
- Autenticación segura con JWT
- Dashboard con resumen financiero filtrable por período
- CRUD completo de viajes, gastos, vehículos, empleados y clientes
- Filtros por fecha, vehículo, cliente y conductor
- Búsqueda de viajes por número de contenedor
- Cálculo automático de gastos totales y ganancia por viaje
- Soft delete en todas las entidades principales

## 2.3 Características de los usuarios

| Usuario | Nivel técnico | Funciones |
|--------|--------------|----------|
| Administrador | Básico | Acceso completo al sistema |

---

# 3. Arquitectura del sistema

## 3.1 Arquitectura general

```
Usuario (navegador)
│
Frontend React — Vercel
│  axios con interceptores JWT
│  react-router-dom para navegación
│
Backend Express API — Fly.io (Docker)
│  middleware verifyToken
│  controllers con queries parametrizadas
│
PostgreSQL — Fly.io (Fly Postgres)
│  triggers de validación
│  índices para rendimiento
```

## 3.2 Flujo de autenticación
1. Usuario envía credenciales al endpoint `/api/auth/login`
2. Backend valida con bcrypt y genera token JWT (8h de vigencia)
3. Frontend guarda el token en `localStorage`
4. Cada request incluye `Authorization: Bearer <token>`
5. Middleware `verifyToken` valida el token antes de cada operación
6. Al expirar, el interceptor de axios redirige automáticamente al login

## 3.3 Entornos

| Entorno | Frontend | Backend | Base de datos |
|---------|---------|---------|--------------|
| Local | localhost:3001 | localhost:3000 | PostgreSQL local :5432 |
| Producción | Vercel | Fly.io (Docker) | Fly Postgres |

## 3.4 CORS
El backend acepta requests únicamente desde los orígenes configurados en la variable `FRONTEND_URL`. En producción apunta al dominio de Vercel. En desarrollo acepta `localhost:3001`.

---

# 4. Diseño de la base de datos

## 4.1 Entidades y campos principales

### users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| userid | SERIAL PK | Identificador único |
| username | VARCHAR(50) | Nombre de usuario |
| password_hash | VARCHAR(200) | Contraseña con hash bcrypt |
| active | BOOLEAN | Estado del usuario |

### employees
| Campo | Tipo | Descripción |
|-------|------|-------------|
| employeeid | SERIAL PK | Identificador único |
| id_number | VARCHAR(20) | Cédula |
| fullname | VARCHAR(80) | Nombre completo |
| hire_date | DATE | Fecha de contratación |
| termination_date | DATE | Fecha de salida (opcional) |
| active | BOOLEAN | Soft delete |

### vehicles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| vehicleid | SERIAL PK | Identificador único |
| plate | VARCHAR(20) | Placa |
| brand | VARCHAR(40) | Marca |
| model | VARCHAR(40) | Modelo |
| year | INT | Año (1980 - año actual) |
| active | BOOLEAN | Soft delete |

### clients
| Campo | Tipo | Descripción |
|-------|------|-------------|
| clientid | SERIAL PK | Identificador único |
| name | VARCHAR(80) | Nombre del cliente |
| contact | VARCHAR(100) | Teléfono o email |
| active | BOOLEAN | Soft delete |

### trips
| Campo | Tipo | Descripción |
|-------|------|-------------|
| tripid | SERIAL PK | Identificador único |
| trip_date | DATE | Fecha del viaje |
| vehicleid | FK | Vehículo asignado |
| driverid | FK | Conductor asignado |
| clientid | FK | Cliente del servicio |
| origin | VARCHAR(100) | Origen |
| destination | VARCHAR(100) | Destino |
| payment_received | NUMERIC(12,2) | Pago recibido |
| container_number | VARCHAR(30) | Número de contenedor |
| dua_number | VARCHAR(30) | Número de DUA |
| equipment_size | VARCHAR(20) | Tamaño (20ft, 40ft, etc.) |
| weight | NUMERIC(10,2) | Peso en kg |
| operation_type | VARCHAR(20) | Import / Export / National |
| invoice_number | VARCHAR(30) | Número de factura |
| description | VARCHAR(200) | Descripción adicional |
| stateid | FK | Estado de facturación |

### expenses
| Campo | Tipo | Descripción |
|-------|------|-------------|
| expenseid | SERIAL PK | Identificador único |
| expense_type | VARCHAR(40) | Fuel / Tolls / Maintenance / Repairs / Other |
| amount | NUMERIC(12,2) | Monto del gasto |
| tripid | FK nullable | Viaje asociado (opcional) |
| vehicleid | FK nullable | Vehículo asociado (opcional) |
| expense_date | TIMESTAMP | Fecha del gasto |

### trip_states
| Estado | Descripción |
|--------|-------------|
| Trip completed | Viaje finalizado |
| Pending billing | Pendiente de facturación (default) |
| Invoice sent | Factura enviada |
| Invoice accepted | Factura aceptada |
| Invoice paid | Factura pagada |

## 4.2 Triggers

### trg_default_trip_state
Asigna "Pending billing" por defecto al crear un viaje, buscando el estado por nombre. Soluciona la limitación de PostgreSQL que no permite subqueries en expresiones DEFAULT.

### trg_check_expense_vehicle
Valida que si un gasto especifica tanto un viaje como un vehículo, el vehículo coincida con el del viaje. Permite gastos sin ninguna asociación.

## 4.3 Índices
```sql
CREATE INDEX idx_trips_date       ON trips(trip_date);
CREATE INDEX idx_trips_client     ON trips(clientid);
CREATE INDEX idx_trips_driver     ON trips(driverid);
CREATE INDEX idx_expenses_trip    ON expenses(tripid);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicleid);
```

---

# 5. Diseño del backend

## 5.1 Estructura de carpetas

```
backend/
├── config/
│   └── db.js           ← Pool pg, soporta DATABASE_URL (Fly.io) y variables separadas (local)
├── controllers/         ← Lógica de negocio y queries
├── middleware/
│   └── auth.js         ← Verificación JWT
├── routes/              ← Definición de endpoints
├── Dockerfile           ← Imagen Docker para Fly.io
├── fly.toml             ← Configuración de Fly.io
├── .env.example         ← Variables de entorno requeridas
└── app.js               ← Express + CORS + registro de rutas
```

## 5.2 Conexión a base de datos
`config/db.js` detecta automáticamente el entorno:
- **Producción (Fly.io)**: usa `DATABASE_URL` con SSL habilitado (Fly Postgres la inyecta automáticamente al adjuntar la base de datos)
- **Local**: usa variables separadas `DB_HOST`, `DB_PORT`, etc.

## 5.3 Endpoints completos

### Autenticación — `/api/auth`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /login | Iniciar sesión, retorna JWT |

### Vehículos — `/api/vehicles`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar vehículos |
| GET | /:id | Obtener por ID |
| POST | / | Crear |
| PUT | /:id | Actualizar / activar / desactivar |
| DELETE | /:id | Soft delete |

### Empleados — `/api/employees`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar empleados |
| GET | /:id | Obtener por ID |
| POST | / | Crear |
| PUT | /:id | Actualizar |
| DELETE | /:id | Soft delete |

### Clientes — `/api/clients`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar clientes |
| GET | /:id | Obtener por ID |
| POST | / | Crear |
| PUT | /:id | Actualizar |
| DELETE | /:id | Soft delete |

### Viajes — `/api/trips`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar con gastos y ganancia calculados |
| GET | /states | Listar estados de facturación |
| GET | /:id | Obtener viaje individual |
| POST | / | Crear viaje |
| PUT | /:id | Actualizar / cambiar estado |
| DELETE | /:id | Eliminar |

Filtros: `?from=`, `?to=`, `?vehicleid=`, `?clientid=`, `?driverid=`

### Gastos — `/api/expenses`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar gastos |
| POST | / | Crear |
| PUT | /:id | Actualizar |
| DELETE | /:id | Eliminar |

Filtros: `?tripid=`, `?vehicleid=`

---

# 6. Diseño del frontend

## 6.1 Estructura de carpetas

```
frontend/src/
├── pages/
│   ├── Login.js
│   ├── Dashboard.js
│   ├── Vehicles.js
│   ├── Employees.js
│   ├── Clients.js
│   ├── Trips.js
│   └── Expenses.js
├── services/
│   └── api.js        ← axios + interceptores JWT + URL dinámica
├── styles/
│   └── common.js     ← Estilos compartidos
└── App.js            ← Router + sidebar + protección de rutas
```

## 6.2 URL de API dinámica
`services/api.js` usa `REACT_APP_API_URL` si está definida, o `localhost:3000/api` por defecto:
```js
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
```

## 6.3 Sistema de estilos compartidos
`styles/common.js` exporta cinco objetos: `tableStyles`, `formStyles`, `buttonStyles`, `badgeStyles`, `pageStyles`. Cada página los combina con spread operator para evitar duplicación.

---

# 7. Despliegue

## 7.1 Variables de entorno

### Backend (Fly.io)
```
DATABASE_URL=<inyectada automáticamente por fly postgres attach>
JWT_SECRET=<secreto seguro de al menos 32 caracteres>
NODE_ENV=production
FRONTEND_URL=https://sistema-de-gestion-de-transporte-6g.vercel.app
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://heavy-transport-api.fly.dev/api
CI=false
```

## 7.2 Primer despliegue en Fly.io

```bash
# 1. Instalar flyctl
curl -L https://fly.io/install.sh | sh

# 2. Autenticarse
flyctl auth login

# 3. Desde /backend, crear la app (usa fly.toml existente)
flyctl launch --no-deploy

# 4. Crear base de datos Fly Postgres
flyctl postgres create --name heavy-transport-db --region mia

# 5. Adjuntar la BD a la app (inyecta DATABASE_URL automáticamente)
flyctl postgres attach heavy-transport-db

# 6. Configurar variables de entorno
flyctl secrets set JWT_SECRET=<secreto_seguro>
flyctl secrets set FRONTEND_URL=https://sistema-de-gestion-de-transporte-6g.vercel.app

# 7. Desplegar
flyctl deploy
```

## 7.3 Proceso de actualización
```bash
git add .
git commit -m "Descripción del cambio"
git push
```
Vercel despliega el frontend automáticamente. Para el backend, ejecutar `flyctl deploy` desde `/backend`, o configurar un GitHub Action para deploy automático.

## 7.4 Backup de base de datos
```bash
# Backup desde Fly Postgres
flyctl postgres connect -a heavy-transport-db
pg_dump heavy_transport > backup_$(date +%Y%m%d).sql

# Restaurar
flyctl postgres connect -a heavy-transport-db < backup.sql
```

---

# 8. Seguridad

- Contraseñas con hash bcrypt (10 salt rounds)
- JWT con expiración de 8 horas
- Queries parametrizadas (anti SQL injection)
- CORS restringido al dominio del frontend
- HTTPS en producción (Fly.io y Vercel lo proveen automáticamente)
- El endpoint `/setup-password` fue eliminado — para cambiar contraseñas usar el script local `scripts/hash-password.js` (ver sección 8.1)

## 8.1 Cambio de contraseña de usuario

Sin el endpoint `/setup-password`, el cambio de contraseña se realiza localmente con el siguiente script:

```js
// Ejecutar una vez: node scripts/hash-password.js
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const hash = await bcrypt.hash('NUEVA_CONTRASEÑA', 10);
await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hash, 'admin']);
pool.end();
```

---

# 9. Decisiones técnicas destacadas

| Decisión | Justificación |
|----------|--------------|
| Soft delete en todas las entidades | Preservar historial operativo |
| Triggers para defaults y validaciones | PostgreSQL no permite subqueries en DEFAULT ni CHECK |
| DATABASE_URL con SSL en producción | Requerimiento de Fly Postgres para conexiones externas |
| Dockerfile con node:20-alpine | Imagen mínima (~50MB) para deploy rápido en Fly.io |
| fly.toml con auto_stop_machines | Máquina se detiene cuando no hay tráfico (ahorra créditos) |
| CI=false en Vercel | create-react-app genera warnings que Vercel trata como errores |
| Estilos en common.js | Evita duplicación y facilita cambios globales |
| Gastos sin asociación obligatoria | Refleja realidad del negocio (repuestos de bodega) |

---

# 10. Plan de mejoras futuras

- Gráficos de ingresos y gastos por mes
- Facturación electrónica con Ministerio de Hacienda
- Exportación a Excel y PDF
- Control de mantenimiento de vehículos con alertas
- Multiusuario con roles
- Notificaciones de vencimiento de revisión técnica

---

# 11. Conclusión

El sistema implementa una arquitectura full-stack completa con React, Node.js y PostgreSQL, desplegada en producción en Vercel (frontend) y Fly.io (backend + BD). Cubre todas las necesidades operativas identificadas para la empresa de transporte y tiene una base sólida para escalar con nuevas funcionalidades.
