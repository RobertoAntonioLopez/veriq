# VeriQ

Plataforma de gestión de QA con Node.js, Express, PostgreSQL y JavaScript vanilla.

## Estado
Etapa inicial: decisiones de arquitectura, servidor Express, conexión PostgreSQL configurable, salud del proceso, disponibilidad de BD y manejo de errores. Los módulos de negocio y la interfaz están planificados, aún no implementados.

Consulta [arquitectura, modelo y endpoints](docs/ARCHITECTURE.md).

## Ejecutar
Requisitos: Node.js 24 o superior y PostgreSQL para comprobar disponibilidad.

```sh
npm ci
cp .env.example .env
# Configura DATABASE_URL con tus credenciales locales.
npm start
```

El servidor escucha solo en 127.0.0.1:3000. GET http://127.0.0.1:3000/api/health debe responder 200. GET /api/ready ejecuta SELECT 1: devuelve 200 con BD accesible, 503 sin configuración o sin conexión. No se crean usuarios, bases de datos ni tablas automáticamente en esta etapa.

```sh
npm test
npm run check
```

Las pruebas HTTP usan un puerto local temporal y una BD simulada; no modifican datos. La integración PostgreSQL real se incorpora con el esquema y los repositorios.
