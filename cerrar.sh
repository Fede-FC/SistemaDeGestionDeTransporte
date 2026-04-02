#!/bin/bash

echo "Cerrando Heavy Transport..."

# Cerrar procesos de Node
pkill -f "node app.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null

# Detener Docker
docker stop heavy-transport-db

echo "Sistema cerrado correctamente."
