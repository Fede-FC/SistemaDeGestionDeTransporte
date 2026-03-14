# Sistema de Gestión de Transporte de Carga

## 📌 Descripción del proyecto

Este proyecto consiste en el desarrollo de un sistema web para la **gestión de viajes, gastos y vehículos** de una empresa familiar dedicada al transporte de carga pesada.


El sistema propuesto permitirá **centralizar toda la información en una base de datos**, facilitando el registro, consulta, análisis de las operaciones y permitir la facturación automtica con el Ministerio de Hacienda.

El desarrollo iniciará como una **aplicación local** y posteriormente podrá ser desplegado en un **servidor web**, permitiendo acceso desde computadora o dispositivos móviles.

---

## 🎯 Objetivos

### Objetivo general

Desarrollar una aplicación que permita **gestionar de forma digital los viajes, gastos y vehículos** de una empresa de transporte.

### Objetivos específicos

- Registrar viajes realizados por los vehículos
- Registrar gastos asociados a cada viaje
- Consultar el historial de operaciones
- Filtrar información por fechas, vehículos o clientes
- Calcular automáticamente ingresos, gastos y ganancias
- Generar reportes básicos para análisis administrativo

---

## 👤 Usuarios del sistema

El sistema está diseñado para uso interno de la empresa.

Usuario principal:

**Administrador**
- Registra viajes
- Registra gastos
- Consulta historial
- Visualiza reportes

La interfaz será **simple e intuitiva**, considerando que los usuarios no poseen experiencia avanzada en tecnología.

---

## ⚙️ Funcionalidades principales

El sistema se divide en dos módulos principales.

### 📥 Módulo de registro

Permite ingresar información operativa al sistema.

**Registro de viajes**
- Fecha
- Vehículo
- Conductor
- Origen
- Destino
- Cliente
- Pago recibido
- numero de contenedor
- numero de factura
- Descripcion

**Registro de gastos**
- Tipo de gasto (combustible, peajes, mantenimiento, reparaciones, etc.)
- Monto
- Descripción
- Asociación a un viaje
- Asociar a un camion

**Gestión de vehículos**
- Placa
- Marca
- Modelo
- Año

** Empleados/Choferes**
- Cedula
- Nombre
- Contradado
- Renuncia/salida
- Activo

---

### 📊 Módulo de consulta y análisis

Permite visualizar la información almacenada en forma de tabla similar a una hoja de cálculo.

Incluye:

- Historial de viajes
- Cálculo automático de gastos totales por viaje
- Cálculo de ganancias

**Filtros disponibles**
- Por rango de fechas
- Por vehículo
- Por cliente
- Por conductor

---

## 📈 Reportes

El sistema permitirá visualizar información resumida como:

- Ingresos mensuales
- Gastos por vehículo
- Cantidad de viajes realizados
- Ganancia total

Esto facilitará la **toma de decisiones administrativas**.

---

## 🏗️ Arquitectura del sistema

El sistema estará compuesto por tres capas principales:

Interfaz de usuario (Frontend)
│
Lógica de negocio (Backend / API)
│
Base de datos (SQL)

---

## 💻 Tecnologías previstas

- Frontend: React
- Backend: Node.js + Express
- Base de datos: PostgreSQL
- Despliegue futuro: servicios cloud (ej. Vercel, Railway o similares)

---

## 🚀 Plan de desarrollo

### Fase 1 – Análisis de requisitos
Identificación del flujo actual de registro de información en la empresa.

### Fase 2 – Diseño de base de datos
Modelado de entidades como:
- vehículos
- viajes
- gastos
- clientes
- conductores

### Fase 3 – Desarrollo local
Implementación inicial del sistema para pruebas en entorno local.

### Fase 4 – Pruebas y ajustes
Validación del sistema con datos reales y mejoras de usabilidad.

### Fase 5 – Despliegue en servidor
Publicación del sistema para acceso desde múltiples dispositivos.
Integración de facturación electrónica


---

## ✅ Beneficios esperados

- Centralización de la información operativa
- Reducción del uso de registros en papel
- Acceso rápido al historial de viajes
- Mejor control financiero del negocio
- Base tecnológica para futuras mejoras del sistema

---

## 📚 Propósito académico

Este proyecto se desarrolla como **proyecto personal de formación en Ingeniería Informática**, aplicando conocimientos en:

- diseño de bases de datos
- desarrollo web
- arquitectura de software
- experiencia de usuario
- digitalización de procesos reales

