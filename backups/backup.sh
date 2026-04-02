#!/bin/bash

BACKUP_DIR=~/proyectos/heavy-transport/backups
DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/heavy_transport_$DATE.sql"

# Hacer el backup
PGPASSWORD=F3d3.rick pg_dump -h localhost -U postgres heavy_transport > "$FILE"

if [ $? -eq 0 ]; then
  echo "✓ Backup creado: $FILE"
else
  echo "✗ Error al crear backup"
  exit 1
fi

# Eliminar backups con más de 30 días
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
echo "✓ Backups antiguos eliminados"
echo "✓ Proceso completado: $(date)"
