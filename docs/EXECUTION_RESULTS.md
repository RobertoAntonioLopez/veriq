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

## MVP completo — 2026-10-10

Resultado final de node --test --test-reporter=spec con TEST_DATABASE_URL configurada: **47 aprobadas, 0 fallidas, 0 omitidas**. Distribución: 24 unitarias, 10 HTTP/servidor y 13 de API con PostgreSQL real. npm run check aprobado para src, tests, scripts y public/js.

### Incrementos verificados
- Ejecuciones: registro append-only, filtro por caso, instantáneas y errores de entrada; regresión del CRUD de casos.
- Bugs: creación, estados, severidad/prioridad independientes, relaciones opcionales y ediciones atómicas.
- Dashboard: ceros iniciales y conteos de historial y bugs no cerrados.
- Interfaz: archivos estáticos, formularios, tablas, paginación, detalle de registros, filtros, estados vacíos y mensajes. Pruebas unitarias de escape de texto y límites Unicode, más comprobación HTTP de que .env y archivos internos no son públicos.

### Revisión de navegador
Entorno separado: veriq_ui_test, API en puerto 3001. Se verificaron creación y edición de un caso, campos obligatorios, registro de ejecución, conservación del título original en el historial, texto HTML mostrado literalmente, error por relación de bug inexistente sin perder el formulario, creación y cierre de bug, filtro por estado y dashboard actualizado. Se inspeccionaron vistas de escritorio y móvil; en móvil se comprobó ausencia de desbordamiento horizontal de la página. Sin errores de consola en la consulta realizada.

La revisión visual fue una comprobación de desarrollo, no una suite de extremo a extremo repetible. La suite automatizada cubre el borrado; no se ejecutó ese flujo mediante el navegador. Tampoco se realizó una auditoría completa de accesibilidad o de todos los tamaños de pantalla.

La base de uso local veriq permanece separada y vacía, disponible en el puerto 3000. No se trasladaron los datos de verificación. La ejecución en Postman no está registrada.
