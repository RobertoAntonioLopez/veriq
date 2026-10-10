# Evidencia de la etapa inicial

Fecha: 2026-10-10. Node.js v26.8.1.

- `node --test --test-reporter=spec tests/integration/app.test.js`: 7 pruebas aprobadas, 0 fallidas.
- `npm run check`: aprobado.
- Instalación de dependencias: 80 paquetes auditados, 0 vulnerabilidades reportadas en ese momento.

Cobertura: salud HTTP sin BD, readiness con adaptador disponible, BD ausente, BD fallida sin exposición de detalles, 404 JSON, JSON malformado 400 y límite de cuerpo 413.

No se verificó PostgreSQL real, UI ni flujos de negocio. No se ejecutó Postman. No hay defectos funcionales confirmados que reportar en esta etapa.

## Archivos del incremento
- `package.json`, `package-lock.json`: dependencias y comandos reproducibles.
- `.gitignore`, `.env.example`: configuración sin secretos.
- `src/app.js`: aplicación y endpoints health/ready.
- `src/server.js`: escucha local y cierre de conexiones.
- `src/config/db.js`: pool PostgreSQL opcional con límites de espera.
- `src/middleware/error-handler.js`: errores JSON sin detalles internos.
- `tests/integration/app.test.js`: contratos HTTP con dependencia de BD simulada.

Verificación local: `npm ci`, `npm test`, `npm run check`, `npm start`; consultar `/api/health` y `/api/ready` como explica README.

Commit del incremento: `chore: initialize Express application with health checks`.

## Esquema PostgreSQL — 2026-10-10

Instancia PostgreSQL temporal en localhost:55439, BD veriq_test, separada de desarrollo. Se aplicó schema.sql con ON_ERROR_STOP: tres tablas y cinco índices creados. Se aplicó seed.sql y se comprobó la existencia del caso de ejemplo. Los datos del seed no representan pruebas ejecutadas ni defectos reales.

Archivos: database/schema.sql y database/seed.sql. Commit: feat(database): add QA schema and sample seed.

## CRUD de casos — 2026-10-10

- Comando: TEST_DATABASE_URL apuntando a PostgreSQL temporal, node --test --test-reporter=spec.
- Resultado final: 39 pruebas aprobadas, 0 fallidas, 0 omitidas (22 unitarias, 9 HTTP con dependencia simulada y 8 de API/BD real).
- Primera ejecución: 36 aprobadas y 1 fallida. VQ-001 detectado, corregido y verificado antes del commit; después se añadieron dos pruebas HTTP de manejo de errores.
- npm run check: todos los JavaScript de src, tests y scripts pasaron la revisión de sintaxis.
- PostgreSQL real: creación y lectura persistida, edición parcial, borrado, listas y paginación, títulos repetidos, validación sin mutaciones, inexistentes, texto similar a SQL, Unicode, límites, protección del historial, conservación de bugs y restricciones de BD.
- Cada prueba PostgreSQL utilizó un esquema aleatorio propio, eliminado al terminar. No se modificó una BD de desarrollo.

Archivos principales: src/modules/test-cases/{routes,controller,service,repository,validation}.js, src/utils/{http-error,validation}.js, src/app.js, src/middleware/error-handler.js, tests/unit/validation.test.js, tests/database/test-cases.test.js y tests/integration/app.test.js. Se amplió la comprobación de sintaxis con scripts/check.js y la configuración de pruebas con package.json y .env.example.

Commit: feat(test-cases): implement validated CRUD with database tests.

## Colección de API

La colección postman/VeriQ.postman_collection.json incluye diez solicitudes ordenadas y aserciones. Se comprobaron su JSON y la sintaxis de sus scripts; su ejecución en Postman no está registrada.
