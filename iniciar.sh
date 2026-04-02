#!/bin/bash

echo "========================================="
echo "  Heavy Transport - Iniciando sistema..."
echo "========================================="

# 1. Iniciar Docker DB
echo "[1/3] Iniciando base de datos..."
docker start heavy-transport-db
sleep 3

# 2. Iniciar backend en segundo plano
echo "[2/3] Iniciando backend..."
cd ~/proyectos/heavy-transport/backend
npm run dev &> ~/proyectos/heavy-transport/backups/backend.log &
BACKEND_PID=$!
sleep 4

# 3. Verificar que el backend respondió
curl -s http://localhost:3000/health > /dev/null
if [ $? -eq 0 ]; then
  echo "       Backend OK"
else
  echo "       Error en backend - revisá backend.log"
fi

# 4. Iniciar frontend en segundo plano
echo "[3/3] Iniciando frontend..."
cd ~/proyectos/heavy-transport/frontend
npm start &> ~/proyectos/heavy-transport/backups/frontend.log &
sleep 8

echo ""
echo "========================================="
echo "  Sistema listo."
echo "  Abrí el navegador en:"
echo "  http://localhost:3001"
echo "========================================="
echo ""
echo "  Para cerrar el sistema presioná Ctrl+C"
echo "========================================="

# Mantener el script activo
wait
