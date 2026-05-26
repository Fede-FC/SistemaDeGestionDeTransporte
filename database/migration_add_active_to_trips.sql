-- Migración: Agregar columna active a trips para desactivación lógica (RF-07, R-07.1)
-- Ejecutar en producción antes de desplegar los cambios del backend
ALTER TABLE trips ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
