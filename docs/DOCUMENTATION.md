# 📘 Documentación del Proyecto
## Sistema de Gestión de Transporte de Carga

---

# 1. Introducción

## 1.1 Propósito del documento
Este documento describe la arquitectura, diseño, funcionamiento y decisiones técnicas del sistema. Sirve como guía para desarrolladores, evaluación académica y mantenimiento futuro.

## 1.2 Alcance del sistema
El sistema digitaliza el proceso administrativo de una empresa de transporte de carga pesada, cubriendo registro de viajes, gastos, vehículos, empleados y clientes, con un dashboard de resumen financiero.

## 1.3 Definiciones y términos

| Término | Descripción |
|--------|------------|
| Viaje | Operación de transporte realizada por un vehículo |
| Gasto | Costo asociado a un viaje, vehículo, o sin asociación |
| Soft delete | Desactivación lógica de un registro sin eliminarlo físicamente |
| DUA | Documento Único Administrativo — documento aduanero |
| JWT | JSON Web Token — mecanismo de autenticación sin sesión |
| Trigger | Función de base de datos que se ejecuta automáticamente |

---

# 2. Descripción general del sistema

## 2.1 Perspectiva del sistema
Aplicación web de tres capas: frontend React, API backend Node.js/Express, y base de datos PostgreSQL en Docker. Funciona en entorno local durante el período de prueba.

## 2.2 Funciones principales
- Autenticación segura con JWT
- Dashboard con resumen financiero
- CRUD completo de viajes, gastos, vehículos, empleados y clientes
- Filtros por fecha, vehículo, cliente y conductor
- Cálculo automático de gastos totales y ganancia por viaje
- Soft delete en todas las entidades principales

## 2.3 Características de los usuarios

| Usuario | Nivel técnico | Funciones |
|--------|--------------|----------|
| Administrador | Básico | Acceso completo al sistema |

## 2.4 Restricciones
- Versión local para un único usuario (OWNER_ID = 1)
- Requiere Docker Desktop con integración WSL2 activa
- Sin HTTPS en versión local

---

# 3. Arquitectura del sistema

## 3.1 Arquitectura general

```
Frontend React (puerto 3001)
│  axios con interceptores JWT
│  react-router-dom para navegación
│
Backend Express API (puerto 3000)
│  middleware verifyToken en rutas protegidas
│  controllers con queries parametrizadas
│
PostgreSQL en Docker (puerto 5432)
│  triggers de validación y defaults
│  índices para rendimiento
│  volumen persistente heavy_transport_data
```

## 3.2 Flujo de autenticación
1. Usuario envía credenciales al endpoint `/api/auth/login`
2. Backend valida con bcrypt y genera token JWT (8h de vigencia)
3. Frontend guarda el token en `localStorage`
4. Cada request incluye `Authorization: Bearer <token>` en el header
5. Middleware `verifyToken` valida el token antes de cada operación
6. Al expirar, el interceptor de axios redirige automáticamente al login

## 3.3 Entorno de desarrollo

| Componente | Tecnología | Puerto |
|-----------|-----------|--------|
| Frontend | React 18 (create-react-app) | 3001 |
| Backend | Node.js v24 + Express | 3000 |
| Base de datos | PostgreSQL 16 en Docker | 5432 |
| Sistema operativo | Ubuntu WSL2 en Windows | — |

---

# 4. Diseño de la base de datos

## 4.1 Entidades y campos principales

### users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| userid | SERIAL PK | Identificador único |
| username | VARCHAR(50) | Nombre de usuario |
| email | VARCHAR(100) | Correo electrónico |
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
| description | VARCHAR(200) | Descripción |
| tripid | FK (nullable) | Viaje asociado (opcional) |
| vehicleid | FK (nullable) | Vehículo asociado (opcional) |
| expense_date | TIMESTAMP | Fecha del gasto |

### trip_states
| Estado | Descripción |
|--------|-------------|
| Trip completed | Viaje finalizado |
| Pending billing | Pendiente de facturación (default) |
| Invoice sent | Factura enviada |
| Invoice accepted | Factura aceptada |
| Invoice paid | Factura pagada |

## 4.2 Relaciones
- Un vehículo puede tener muchos viajes
- Un empleado puede conducir muchos viajes
- Un cliente puede tener muchos viajes
- Un viaje puede tener muchos gastos
- Un gasto puede existir sin viaje ni vehículo

## 4.3 Triggers

### trg_default_trip_state
Asigna "Pending billing" como estado por defecto al crear un viaje, buscando el estado por nombre en lugar de por ID numérico. Esto protege el sistema ante cambios en los IDs de la tabla `trip_states`.

### trg_check_expense_vehicle
Valida que si un gasto especifica tanto un viaje como un vehículo, el vehículo del gasto coincida con el del viaje. Permite gastos sin ninguna asociación (repuestos de bodega).

## 4.4 Índices
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
│   └── db.js              ← Pool de conexión PostgreSQL (pg)
├── controllers/           ← Lógica de negocio y queries
├── middleware/
│   └── auth.js            ← Verificación de token JWT
├── routes/                ← Definición de endpoints
├── app.js                 ← Configuración Express y registro de rutas
└── .env                   ← Variables de entorno
```

## 5.2 Endpoints completos

### Autenticación — `/api/auth`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /login | Iniciar sesión, retorna JWT |
| POST | /setup-password | Configurar contraseña inicial (solo setup local) |

### Vehículos — `/api/vehicles`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar todos los vehículos |
| GET | /:id | Obtener vehículo por ID |
| POST | / | Crear vehículo |
| PUT | /:id | Actualizar vehículo (incluye activar/desactivar) |
| DELETE | /:id | Soft delete — marca `active = false` |

### Empleados — `/api/employees`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar todos los empleados |
| GET | /:id | Obtener empleado por ID |
| POST | / | Crear empleado |
| PUT | /:id | Actualizar empleado |
| DELETE | /:id | Soft delete |

### Clientes — `/api/clients`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar todos los clientes |
| GET | /:id | Obtener cliente por ID |
| POST | / | Crear cliente |
| PUT | /:id | Actualizar cliente |
| DELETE | /:id | Soft delete |

### Viajes — `/api/trips`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar viajes con gastos y ganancia calculados |
| GET | /states | Listar estados de facturación |
| GET | /:id | Obtener viaje individual |
| POST | / | Crear viaje |
| PUT | /:id | Actualizar viaje y/o estado |
| DELETE | /:id | Eliminar viaje |

Filtros disponibles en GET `/api/trips`:
- `?from=YYYY-MM-DD` — fecha inicio
- `?to=YYYY-MM-DD` — fecha fin
- `?vehicleid=N` — por vehículo
- `?clientid=N` — por cliente
- `?driverid=N` — por conductor

### Gastos — `/api/expenses`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Listar gastos |
| POST | / | Crear gasto |
| PUT | /:id | Actualizar gasto |
| DELETE | /:id | Eliminar gasto |

Filtros disponibles en GET `/api/expenses`:
- `?tripid=N` — gastos de un viaje
- `?vehicleid=N` — gastos de un vehículo

## 5.3 Manejo del usuario local
En la versión local todas las queries filtran por `OWNER_ID = 1` definido en `.env`. En producción este valor se reemplaza por el ID extraído del token JWT.

## 5.4 Seguridad de queries
Todas las queries usan parámetros preparados (`$1, $2, ...`) para prevenir SQL injection. Ejemplo:
```js
pool.query('SELECT * FROM vehicles WHERE userid = $1', [OWNER_ID])
```

---

# 6. Diseño del frontend

## 6.1 Estructura de carpetas

```
frontend/src/
├── pages/
│   ├── Login.js       ← Formulario de autenticación
│   ├── Dashboard.js   ← Resumen financiero y últimos viajes
│   ├── Vehicles.js    ← CRUD de vehículos
│   ├── Employees.js   ← CRUD de empleados
│   ├── Clients.js     ← CRUD de clientes
│   ├── Trips.js       ← CRUD de viajes con filtros
│   └── Expenses.js    ← CRUD de gastos con filtros
├── services/
│   └── api.js         ← Instancia axios con interceptores JWT
├── styles/
│   └── common.js      ← Estilos compartidos entre páginas
└── App.js             ← Router + sidebar + protección de rutas
```

## 6.2 Sistema de estilos compartidos
`styles/common.js` exporta cinco objetos de estilos reutilizables:
- `tableStyles` — tabla, encabezados, filas, celdas
- `formStyles` — tarjeta de formulario, grilla, inputs, selects, textareas
- `buttonStyles` — botones primario, secundario, editar, eliminar, activar
- `badgeStyles` — badges de estado activo e inactivo
- `pageStyles` — encabezado de página, título, mensaje de error

Cada página los combina así:
```js
const styles = { ...tableStyles, ...formStyles, ...buttonStyles, ...badgeStyles, ...pageStyles };
```

## 6.3 Servicio de API
`services/api.js` centraliza todas las llamadas HTTP con dos interceptores:
- **Request**: agrega el token JWT al header `Authorization`
- **Response**: redirige al login si el servidor retorna 401 o 403

## 6.4 Rutas del frontend

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| / | → /dashboard | Redirección automática |
| /dashboard | Dashboard | Resumen financiero |
| /trips | Trips | Historial y registro de viajes |
| /expenses | Expenses | Registro de gastos |
| /vehicles | Vehicles | Gestión de vehículos |
| /employees | Employees | Gestión de empleados |
| /clients | Clients | Gestión de clientes |

---

# 7. Flujo de funcionamiento

1. Usuario inicia sesión — backend valida y retorna JWT
2. Frontend almacena el token y muestra el dashboard
3. Usuario registra clientes, vehículos y empleados
4. Usuario registra viajes asociando vehículo, conductor y cliente
5. Sistema asigna automáticamente el estado "Pending billing"
6. Usuario registra gastos asociados a los viajes
7. Sistema calcula gastos totales y ganancia en cada viaje
8. Usuario actualiza el estado del viaje conforme avanza la facturación
9. Dashboard muestra el resumen financiero actualizado

---

# 8. Seguridad

- Contraseñas almacenadas con hash bcrypt (10 salt rounds)
- Autenticación JWT con expiración de 8 horas
- Todas las queries usan parámetros preparados (anti SQL injection)
- CORS habilitado para comunicación frontend-backend local
- El endpoint `/api/auth/setup-password` debe eliminarse antes de producción
- HTTPS pendiente para versión de producción

---

# 9. Despliegue

## 9.1 Entorno local (actual)
- Backend en Ubuntu WSL2, puerto 3000
- Frontend en Ubuntu WSL2, puerto 3001
- PostgreSQL en contenedor Docker, puerto 5432
- Datos persistidos en volumen Docker `heavy_transport_data`

## 9.2 Comandos de inicio diario
```bash
docker start heavy-transport-db
cd ~/proyectos/heavy-transport/backend && npm run dev
cd ~/proyectos/heavy-transport/frontend && npm start
```

## 9.3 Entorno producción (futuro)
- Frontend en Vercel o similar
- Backend en Railway o similar
- Base de datos PostgreSQL gestionada en la nube
- Variables de entorno configuradas en el servidor
- Eliminación del endpoint setup-password
- HTTPS habilitado

---

# 10. Decisiones técnicas destacadas

| Decisión | Justificación |
|----------|--------------|
| Soft delete en todas las entidades | Preservar historial de operaciones |
| Triggers para defaults y validaciones | PostgreSQL no permite subqueries en DEFAULT ni CHECK |
| OWNER_ID constante en versión local | Simplifica queries durante período de prueba |
| Estilos en common.js | Evita duplicación y facilita cambios globales de diseño |
| axios interceptors | Manejo centralizado del JWT sin repetir código |
| Gastos sin asociación obligatoria | Refleja la realidad del negocio (repuestos de bodega) |

---

# 11. Plan de mejoras futuras

- Gráficos de ingresos y gastos por mes (Chart.js o Recharts)
- Facturación electrónica con Ministerio de Hacienda
- Exportación a Excel y PDF
- Control de mantenimiento de vehículos con alertas
- Multiusuario con roles (admin, conductor, contador)
- Notificaciones de vencimiento de revisión técnica
- Despliegue en servidor cloud

---

# 12. Conclusión

El sistema implementa una arquitectura full-stack completa con React, Node.js y PostgreSQL, cubriendo todas las necesidades operativas identificadas para la empresa de transporte. La versión local constituye una base sólida para el período de prueba, con una arquitectura diseñada para escalar hacia producción sin cambios estructurales mayores.
