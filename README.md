# Lab7-ARSW — Blueprints (Frontend + Backend)

Este repositorio contiene dos servicios:

- `backend/` — API en Java (Spring Boot, Maven). Escucha en el puerto 8080.
- `frontend/` — cliente React + Vite. Está configurado para servirse en el puerto 4173.

Hay 2 formas de ejecutar el proyecto:

1) Ejecutar carpetas por separado (desarrollo rápido)
2) Ejecutar ambos servicios con Docker Compose (una sola orden)

---

## 1) Ejecutar por carpetas separadas (desarrollo)

Requisitos:

- Java 21 (para el backend)
- Maven
- Node.js 20+ y npm

Backend (desde la raíz del repo):

- Nos movemos a la carpeta que contiene el back
```powershell
cd backend
```

- Instalamos dependencias y demás que necesite maven y el back para correr
```powershell
mvn clean install
```

- Ejecutamos la aplicación
```powershell
mvn spring-boot:run
```

El backend estará disponible en http://localhost:8080. 

Frontend (desde la raíz del repo):

- Nos movemos a la carpeta que contiene el front
```powershell
cd frontend
```

- Instalamos librerias y demás cosas que necesite el front
```powershell
npm install
```

- Ejecutamos la aplicación
```powershell
npm run dev
```

---

## 2) Ejecutar con Docker Compose

Se añadió un `docker-compose.yml` en la raíz que construye y levanta ambos servicios:

- backend: construido desde `./backend` y publicado en el puerto `8080`.
- frontend: construido desde `./frontend`, sirve el bundle estático con `serve` en `4173`.

- Comando para levantar ambos servicios:

```powershell
docker compose up --build
```
- Comandos varios
```powershell
# Reconstruir solo el frontend
docker compose build frontend
docker compose up -d

# Ver logs
docker compose logs -f --tail=200

# Parar y eliminar contenedores
docker compose down
```

Notas importantes sobre la configuración del frontend dentro del contenedor:

- El frontend usa una variable de entorno de build llamada ```VITE_API_BASE_URL```. Esta variable define la URL base del backend. En el archivo docker-compose.yml está configurada como ```http://localhost:8080```, ya que el backend expone el puerto ```8080``` en el host.
---
