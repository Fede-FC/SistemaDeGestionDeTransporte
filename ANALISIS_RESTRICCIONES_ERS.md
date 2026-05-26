# Análisis de Restricciones - ERS SiGeCarga v1.0

## Resumen Ejecutivo
Este documento analiza cómo se cumplen todas las restricciones especificadas en el ERS de SiGeCarga para cada caso de uso. Se evalúan las restricciones técnicas, operacionales, de negocio y de seguridad.

---

## 1. RF-01: Registrar Vehículo

### Restricciones del ERS
1. **R-01.1**: La placa debe cumplir formato oficial MOPT (ej. ABC-123 o ABC-1234)
2. **R-01.2**: El año debe estar entre 1990 y año actual
3. **R-01.3**: No se permiten placas duplicadas
4. **R-01.4**: El vehículo se crea con estado 'Activo'
5. **R-01.5**: El vehículo debe aparecer inmediatamente en el listado

### Estado de Implementación

#### ✅ IMPLEMENTADO:
- **Duplicidad de placas**: El código usa `INSERT INTO vehicles` que puede fallar por constraint
- **Estado inicial**: Se crea en estado activo (por defecto en BD)
- **Listado inmediato**: Se retorna el vehículo creado en la respuesta

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Validación de placa**: Falta validación del formato MOPT en backend
- **Validación de año**: Falta validación del rango (1990-actual) en backend

#### ❌ NO IMPLEMENTADO:
- **Formato MOPT**: No hay validación regex para formatos ABC-123 o ABC-1234
- **Validación de año**: No se valida que esté entre 1990 y año actual

### Código Afectado
```javascript
// backend/controllers/vehicleController.js - createVehicle()
// FALTA: Validar formato de placa MOPT
// FALTA: Validar año entre 1990 y año actual
```

### Criterios de Aceptación (CA)
- **CA-01.1**: ✅ Placa en formato MOPT - NECESITA VALIDACIÓN
- **CA-01.2**: ✅ Año entre 1990 y actual - NECESITA VALIDACIÓN  
- **CA-01.3**: ✅ Vehículo aparece inmediata en listado

### Criterios de Rechazo (CR)
- **CR-01.1**: ⚠️ Placa duplicada - Depende de constraint BD
- **CR-01.2**: ✅ Formato de placa inválido - NECESITA IMPLEMENTACIÓN
- **CR-01.3**: ⚠️ Año duplicado o fuera de rango - NECESITA VALIDACIÓN

---

## 2. RF-02: Consultar y Editar Vehículo

### Restricciones del ERS
1. **R-02.1**: No se permite eliminación física, solo lógica (desactivación)
2. **R-02.2**: La desactivación requiere confirmación explícita del usuario
3. **R-02.3**: Un vehículo inactivo no puede ser asignado a nuevos viajes
4. **R-02.4**: Los cambios se reflejan inmediatamente en el listado

### Estado de Implementación

#### ✅ IMPLEMENTADO:
- **Desactivación lógica**: `UPDATE vehicles SET active = false` (deleteVehicle function)
- **Cambios inmediatos**: Se retorna el vehículo actualizado

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Confirmación explícita**: El backend no verifica que el frontend haya solicitado confirmación
- **Control de vehículos inactivos**: Falta validación al registrar viajes

#### ❌ NO IMPLEMENTADO:
- **Validación de vehículos inactivos en viajes**: No se valida en tripController.js

### Código Afectado
```javascript
// backend/controllers/vehicleController.js - deleteVehicle()
// ✅ Implementa desactivación lógica correctamente

// backend/controllers/tripController.js - createTrip()
// ❌ FALTA: Verificar que vehicle.active === true
```

### Criterios de Aceptación (CA)
- **CA-02.1**: ✅ Cambios reflejados inmediatamente
- **CA-02.2**: ⚠️ Vehículo inactivo excluido de selector - NECESITA VALIDACIÓN
- **CA-02.3**: ✅ Desactivación requiere confirmación

---

## 3. RF-03: Registrar Conductor

### Restricciones del ERS
1. **R-03.1**: La cédula debe tener entre 9 y 12 dígitos (física o DIMEX)
2. **R-03.2**: La fecha de contratación no puede ser futura
3. **R-03.3**: No se permiten cédulas duplicadas

### Estado de Implementación

#### ✅ IMPLEMENTADO:
- **Cédulas únicas**: Depende de constraint en BD

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Validación de cédula**: Falta validación de rango (9-12 dígitos)
- **Validación de fecha**: Falta validación de fecha no futura

### Código Afectado
```javascript
// backend/controllers/employeeController.js - createEmployee()
// FALTA: Validar cédula entre 9-12 dígitos numéricos
// FALTA: Validar fecha contratación <= hoy
```

### Criterios de Aceptación (CA)
- **CA-03.1**: ⚠️ Cédula 9-12 dígitos - NECESITA VALIDACIÓN
- **CA-03.2**: ⚠️ Fecha no futura - NECESITA VALIDACIÓN
- **CA-03.3**: ✅ Conductor aparece en listado activo

---

## 4. RF-04: Consultar y Editar Conductor

### Restricciones del ERS
1. **R-04.1**: La fecha de salida debe ser posterior a fecha de contratación
2. **R-04.2**: Un conductor inactivo no puede ser asignado a nuevos viajes
3. **R-04.3**: El historial de viajes permanece visible aunque esté inactivo

### Estado de Implementación

#### ✅ IMPLEMENTADO:
- **Desactivación lógica**: Similar a vehículos

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Validación de fecha salida**: Falta comparación con fecha contratación
- **Control de conductores inactivos en viajes**: Falta validación

#### ❌ NO IMPLEMENTADO:
- **Validación de fecha salida > fecha contratación**: No existe

---

## 5. RF-05: Registrar y Gestionar Cliente

### Restricciones del ERS
1. **R-05.1**: El nombre/razón social es obligatorio con mínimo 3 caracteres
2. **R-05.2**: El correo (si se ingresa) debe tener formato válido (xxx@xxx.xx)
3. **R-05.3**: El teléfono es opcional

### Estado de Implementación

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Validación de nombre**: Falta validación de mínimo 3 caracteres
- **Validación de email**: Falta validación de formato

### Código Afectado
```javascript
// backend/controllers/clientController.js - createClient()
// FALTA: Validar nombre >= 3 caracteres
// FALTA: Validar formato email (regex o validator)
```

---

## 6. RF-06: Registrar Viaje

### Restricciones del ERS
1. **R-06.1**: Todos los campos obligatorios: fecha, vehículo, conductor, cliente, origen, destino, pago
2. **R-06.2**: La fecha del viaje no puede ser futura
3. **R-06.3**: El pago recibido debe ser número positivo > 0
4. **R-06.4**: La ganancia inicial se calcula: pago - total_gastos

### Estado de Implementación

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Validaciones básicas**: El código valida presencia de campos
- **Cálculo de ganancia**: Se implementa `pago - gastos`

#### ❌ NO IMPLEMENTADO:
- **Validación: fecha no futura**: No valida que fecha <= hoy
- **Validación: pago > 0**: No valida que sea número positivo > 0
- **Verificación de vehículo/conductor activos**: Falta validación

### Código Afectado
```javascript
// backend/controllers/tripController.js - createTrip()
// FALTA: Validar fecha <= hoy
// FALTA: Validar pago > 0
// FALTA: Validar que vehículo.active === true
// FALTA: Validar que employee.active === true
```

---

## 7. RF-07: Consultar y Editar Viaje

### Restricciones del ERS
1. **R-07.1**: Los viajes no pueden eliminarse físicamente, solo desactivarse
2. **R-07.2**: La desactivación requiere confirmación explícita
3. **R-07.3**: Cualquier cambio en pago/gastos recalcula ganancia inmediatamente

### Estado de Implementación

#### ✅ IMPLEMENTADO:
- **Desactivación lógica**: Se usa UPDATE con active = false
- **Recálculo de ganancia**: `pago - total_gastos`

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Confirmación explícita**: No verificada en backend

---

## 8. RF-08: Registrar Gasto Operativo

### Restricciones del ERS
1. **R-08.1**: El monto debe ser número positivo > 0
2. **R-08.2**: El tipo de gasto es obligatorio (Combustible, Peajes, Mantenimiento, Reparaciones, Otros)
3. **R-08.3**: La ganancia del viaje se recalcula inmediatamente

### Estado de Implementación

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Validación de monto**: Falta validación que sea > 0
- **Tipos de gasto fijos**: Pueden estar en BD, falta validación en API

#### ❌ NO IMPLEMENTADO:
- **Validación: monto > 0**: No existe validación
- **Validación: tipo en lista permitida**: No valida contra conjunto fijo

### Código Afectado
```javascript
// backend/controllers/expenseController.js - createExpense()
// FALTA: Validar monto > 0
// FALTA: Validar tipo en ['Combustible', 'Peajes', 'Mantenimiento', 'Reparaciones', 'Otros']
```

---

## 9. RF-09: Consultar Historial de Viajes con Filtros

### Restricciones del ERS
1. **R-09.1**: Los filtros deben ser acumulables (AND logic)
2. **R-09.2**: Si solo se especifica una fecha, la otra es abierta
3. **R-09.3**: Si no hay resultados, mostrar mensaje informativo

### Estado de Implementación

#### ✅ IMPLEMENTADO:
- **Filtros acumulables**: Usa WHERE con condiciones AND
- **Fechas abiertas**: Si solo fecha_inicio, usa WHERE fecha >= fecha_inicio

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Mensaje cuando no hay resultados**: Retorna array vacío, no mensaje

---

## 10. RF-10: Consultar Historial de Gastos

### Restricciones del ERS
1. **R-10.1**: Los gastos deben mostrarse con: tipo, monto, descripción, viaje, vehículo y fecha
2. **R-10.2**: El total de gastos del filtro se muestra al pie
3. **R-10.3**: Los gastos pueden editarse directamente desde el listado

### Estado de Implementación

#### ✅ IMPLEMENTADO:
- **Listado de gastos**: Retorna campos requeridos
- **Total de gastos**: Calculable con SUM(monto)

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- **Edición desde listado**: Depende del frontend

---

## 11. RF-11: Generar Reporte de Ingresos Mensuales

### Restricciones del ERS
1. **R-11.1**: Los datos se agrupan por mes calendario
2. **R-11.2**: Los totales deben coincidir exactamente con suma individual de viajes
3. **R-11.3**: El reporte debe poder imprimirse o exportarse como PDF

### Estado de Implementación

#### ❌ NO IMPLEMENTADO:
- No existe endpoint para este reporte
- No hay lógica de agrupación por mes
- No hay soporte para exportación PDF

### Código Afectado
```javascript
// backend/routes - FALTA: endpoint GET /reports/income-monthly
// FALTA: SELECT DATE_TRUNC('month', trip_date) as month, SUM(profit) as total_profit...
```

---

## 12. RF-12: Generar Reporte de Gastos por Vehículo

### Restricciones del ERS
1. **R-12.1**: Incluye todos los vehículos con al menos un gasto en período
2. **R-12.2**: Gastos desglosados por tipo (Combustible, Peajes, Mantenimiento, Reparaciones, Otros)
3. **R-12.3**: Total general al pie corresponde suma de todos los vehículos

### Estado de Implementación

#### ❌ NO IMPLEMENTADO:
- No existe endpoint para este reporte
- No hay lógica de agrupación por vehículo y tipo
- Falta validación de total general

---

## Restricciones Transversales

### RT-01: Formato de Fechas (RI-05)
- **Especificación ERS**: Formato DD/MM/AAAA
- **Estado**: ⚠️ PARCIALMENTE - Depende del frontend, backend usa SQL dates

### RT-02: Formato de Moneda (RI-06)
- **Especificación ERS**: Símbolo ₡ con separadores de miles, sin decimales
- **Estado**: ❌ NO IMPLEMENTADO - Backend retorna números crudos

### RT-03: Idioma (RI-03)
- **Especificación ERS**: Español (Costa Rica)
- **Estado**: ✅ IMPLEMENTADO - Mensajes de error en español

### RT-04: Autenticación Obligatoria (RSI-01)
- **Especificación ERS**: Todo acceso requiere sesión autenticada con JWT
- **Estado**: ⚠️ PARCIALMENTE - JWT implementado, falta validación en algunos endpoints

### RT-05: Validación SQL Injection (RSI-04)
- **Especificación ERS**: ORM y parámetros preparados obligatorios
- **Estado**: ✅ IMPLEMENTADO - Usa pool.query con parámetros ($1, $2, etc.)

### RT-06: Hashing de Contraseñas (RSI-03)
- **Especificación ERS**: bcrypt con salt
- **Estado**: ⚠️ IMPLEMENTADO - authController usa bcrypt

### RT-07: Disponibilidad 95% (RO-02)
- **Especificación ERS**: Sistema disponible 95% del tiempo en producción
- **Estado**: ⚠️ NECESITA MONITOREO - Requiere setup de alertas

### RT-08: Tiempo de Respuesta (RO-03)
- **Especificación ERS**: < 3 segundos con conexión estándar
- **Estado**: ⚠️ NECESITA VALIDACIÓN - Depende de optimización de BD

---

## Resumen de Brechas Críticas

### 🔴 CRÍTICAS (Bloquean Aceptación)

1. **Validación de Formato de Placa MOPT**
   - Afecta: RF-01, RF-02
   - Impacto: Violación de restricción RI-03 (identificación Costa Rica)
   - Solución: Implementar regex `^[A-Z]{3}-\d{3,4}$`

2. **Validación de Año de Vehículo**
   - Afecta: RF-01
   - Impacto: Datos inválidos en BD
   - Solución: Validar `1990 <= year <= new Date().getFullYear()`

3. **Validación de Pago Positivo en Viajes**
   - Afecta: RF-06
   - Impacto: Cálculos incorrectos de ganancia
   - Solución: Validar `pago > 0`

4. **Reportes de Ingresos Mensuales**
   - Afecta: RF-11
   - Impacto: Funcionalidad requerida no existe
   - Solución: Crear endpoint `/api/reports/income-monthly`

5. **Reportes de Gastos por Vehículo**
   - Afecta: RF-12
   - Impacto: Funcionalidad requerida no existe
   - Solución: Crear endpoint `/api/reports/expenses-by-vehicle`

### 🟡 IMPORTANTES (Afectan Usabilidad)

1. **Validación de Cédula de Conductor**
   - Afecta: RF-03
   - Impacto: Aceptación de cédulas inválidas
   - Solución: Validar `9 <= cedula.digits <= 12`

2. **Validación de Correo Electrónico**
   - Afecta: RF-05
   - Impacto: Datos de contacto inválidos
   - Solución: Usar regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

3. **Validación de Tipo de Gasto**
   - Afecta: RF-08
   - Impacto: Gastos con categoría inválida
   - Solución: Validar contra enum fijo

4. **Validación de Fecha No Futura**
   - Afecta: RF-06
   - Impacto: Viajes con fecha futura
   - Solución: Validar `fecha <= hoy`

5. **Control de Activos en Viajes**
   - Afecta: RF-06
   - Impacto: Asignar vehículos/conductores inactivos
   - Solución: Validar `vehicle.active === true AND employee.active === true`

### 🟢 MENORES (Mejoras)

1. **Mensajes de Error Más Descriptivos**
   - Solución: Crear validador centralizado
   
2. **Formato de Moneda ₡**
   - Solución: Implementar en frontend/API response

3. **Exportación PDF de Reportes**
   - Solución: Integrar librería como pdf-lib

---

## Plan de Acción Recomendado

### Fase 1 - Crítico (Semana 1)
- [ ] Implementar validación de placa MOPT en `vehicleController.js`
- [ ] Implementar validación de año en `vehicleController.js`
- [ ] Implementar validación de pago > 0 en `tripController.js`
- [ ] Crear endpoint `/api/reports/income-monthly`
- [ ] Crear endpoint `/api/reports/expenses-by-vehicle`

### Fase 2 - Importante (Semana 2)
- [ ] Implementar validación de cédula en `employeeController.js`
- [ ] Implementar validación de correo en `clientController.js`
- [ ] Implementar validación de tipo de gasto en `expenseController.js`
- [ ] Implementar validación de fecha no futura en `tripController.js`
- [ ] Implementar validación de activos en `tripController.js`

### Fase 3 - Mejoras (Semana 3)
- [ ] Crear validador centralizado
- [ ] Implementar formato de moneda en responses
- [ ] Agregar exportación PDF a reportes

---

## Matriz de Trazabilidad ERS-Código

| Caso de Uso | Restricción | Implemented | Status | Owner |
|---|---|---|---|---|
| RF-01 | R-01.1 (Formato MOCA) | No | 🔴 Critical | backend |
| RF-01 | R-01.2 (Año 1990+) | No | 🔴 Critical | backend |
| RF-01 | R-01.3 (No duplicados) | Yes | ✅ | BD |
| RF-03 | R-03.1 (Cédula 9-12) | No | 🟡 Important | backend |
| RF-03 | R-03.2 (Fecha no futura) | No | 🟡 Important | backend |
| RF-05 | R-05.1 (Nombre >= 3) | No | 🟡 Important | backend |
| RF-05 | R-05.2 (Email format) | No | 🟡 Important | backend |
| RF-06 | R-06.2 (Fecha no futura) | No | 🟡 Important | backend |
| RF-06 | R-06.3 (Pago > 0) | No | 🔴 Critical | backend |
| RF-08 | R-08.1 (Monto > 0) | No | 🟡 Important | backend |
| RF-08 | R-08.2 (Tipo fijo) | No | 🟡 Important | backend |
| RF-11 | Generar Reporte | No | 🔴 Critical | backend |
| RF-12 | Generar Reporte | No | 🔴 Critical | backend |

---

## Conclusión

El sistema implementa la mayoría de la lógica de negocio básica, pero tiene **5 brechas críticas** que impiden la aceptación según el ERS:

1. ❌ Validaciones de formato no implementadas
2. ❌ Reportes mensuales no existen
3. ❌ Reportes por vehículo no existen
4. ⚠️ Validaciones de restricciones de negocio débiles

**Recomendación**: Implementar las fases de acción propuestas en orden prioritario antes de testing de aceptación.

