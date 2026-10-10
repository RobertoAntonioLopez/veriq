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
