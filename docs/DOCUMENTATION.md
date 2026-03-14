# 📘 Documentación del Proyecto  
## Sistema de Gestión de Transporte de Carga

---

# 1. Introducción

## 1.1 Propósito del documento
Este documento describe la arquitectura, diseño, funcionamiento y decisiones técnicas del sistema **Sistema de Gestión de Transporte de Carga**.

Su objetivo es servir como guía para:

- desarrolladores del proyecto  
- evaluación académica  
- mantenimiento futuro del sistema  

---

## 1.2 Alcance del sistema

El sistema permitirá digitalizar el proceso administrativo de una empresa de transporte, facilitando:

- registro de viajes  
- registro de gastos  
- consulta de historial  
- generación de reportes básicos  

---

## 1.3 Definiciones y términos

| Término | Descripción |
|--------|------------|
| Viaje | Operación de transporte realizada por un vehículo |
| Gasto | Costo asociado a un viaje |
| Vehículo | Camión utilizado para transporte |
| Cliente | Persona o empresa que solicita el servicio |

---

# 2. Descripción general del sistema

## 2.1 Perspectiva del sistema

El sistema es una aplicación web compuesta por:

- interfaz de usuario (frontend)
- API backend
- base de datos relacional

Funcionará inicialmente en entorno local y posteriormente en un servidor web.

---

## 2.2 Funciones principales

- Registrar viajes
- Registrar gastos
- Gestionar vehículos
- Consultar historial
- Filtrar información
- Generar reportes básicos

---

## 2.3 Características de los usuarios

| Usuario | Nivel técnico | Funciones |
|--------|--------------|----------|
| Administrador | Básico | Registro y consulta de información |

---

## 2.4 Restricciones

- Sistema diseñado para bajo volumen de usuarios
- Interfaz simple orientada a facilidad de uso
- Dependencia futura de conexión a internet en versión desplegada

---

# 3. Arquitectura del sistema

## 3.1 Arquitectura general


Frontend (Interfaz Web)
│
Backend (API REST)
│
Base de Datos PostgreSQL


---

## 3.2 Modelo cliente-servidor

El cliente (navegador web) realiza solicitudes HTTP al servidor backend, el cual procesa la lógica de negocio y accede a la base de datos.

---

# 4. Diseño de la base de datos

## 4.1 Entidades principales

- Vehículos
- Conductores
- Clientes
- Viajes
- Gastos

---

## 4.2 Relaciones

- Un vehículo puede tener muchos viajes
- Un viaje puede tener muchos gastos
- Un cliente puede solicitar múltiples viajes

---

## 4.3 Diagrama entidad–relación

*(Insertar aquí imagen o diagrama ER en el futuro)*

---

# 5. Diseño del backend

## 5.1 Estructura de carpetas

backend/
├── controllers/
├── routes/
├── models/
├── services/
└── app.js



---

## 5.2 Endpoints principales

### Viajes

- `POST /viajes`
- `GET /viajes`
- `GET /viajes/:id`
- `DELETE /viajes/:id`

### Gastos

- `POST /gastos`
- `GET /gastos`

### Vehículos

- `POST /vehiculos`
- `GET /vehiculos`

---

# 6. Diseño del frontend

## 6.1 Estructura de vistas

- Dashboard principal
- Registro de viaje
- Registro de gasto
- Historial de viajes
- Reportes

---

## 6.2 Componentes principales

- FormularioViaje
- FormularioGasto
- TablaHistorial
- FiltrosBusqueda
- GraficoReportes

---

# 7. Flujo de funcionamiento

1. El usuario registra un viaje
2. El sistema almacena el viaje en la base de datos  
3. El usuario registra gastos asociados  
4. El sistema calcula totales automáticamente  
5. El usuario consulta la información mediante filtros  

---

# 8. Seguridad

- Autenticación mediante usuario y contraseña  
- Encriptación de contraseñas con hash seguro  
- Uso de HTTPS en despliegue en servidor  

---

# 9. Despliegue

## 9.1 Entorno local

- Backend ejecutándose en localhost  
- Base de datos local PostgreSQL  
- Frontend en servidor de desarrollo  

## 9.2 Entorno producción (futuro)

- Frontend alojado en plataforma cloud  
- Backend desplegado en servidor web  
- Base de datos gestionada en la nube  

---

# 10. Plan de mejoras futuras

- Dashboard con gráficos avanzados
- Facturación Automatica afiliada a el Ministerio de Hacienda 
- Exportación a Excel y PDF  
- Control de mantenimiento de vehículos  
- Multiusuario  
- Notificaciones de vencimientos de revisión técnica  

---

# 11. Conclusión

Este sistema busca digitalizar y optimizar la gestión administrativa de una empresa de transporte, al mismo tiempo que sirve como proyecto práctico de formación en ingeniería informática.
