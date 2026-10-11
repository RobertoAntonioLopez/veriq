# Despliegue en Cloudflare Workers

Demo: https://veriq.roberto-antonio-lopez.workers.dev

Verificado el 11 de octubre de 2026: interfaz y recursos estáticos, disponibilidad de API y PostgreSQL, consultas de dashboard/ejecuciones/bugs, y ciclo de creación, consulta, actualización, validación y eliminación de un caso temporal. La comprobación pública devolvió 201, 200, 400, 204 y 404 según el escenario; el registro temporal fue retirado.

VeriQ conserva Express y PostgreSQL. Workers sirve los archivos de `public/` y ejecuta la API mediante `src/worker.js`; el servidor local sigue usando `src/server.js`.

## Base de datos

Crear una base PostgreSQL exclusiva para la demo, por ejemplo en Neon. Aplicar `database/schema.sql` una sola vez a la base vacía. El esquema no debe ejecutarse sobre una base con datos sin revisar primero sus instrucciones. Los datos de `database/seed.sql` son opcionales.

Usar la cadena de conexión proporcionada por el proveedor con TLS. Configurarla como secreto de Cloudflare; nunca guardarla en el repositorio:

```sh
npx wrangler login
npx wrangler secret put DATABASE_URL
npm run deploy
```

El comando de secretos solicita el valor de forma interactiva. La configuración también admite un binding `HYPERDRIVE`; cuando existe, tiene prioridad sobre `DATABASE_URL`. Si se configura Hyperdrive, desactivar la caché de consultas para que las lecturas reflejen inmediatamente las modificaciones.

## Verificación local

```sh
npm ci
npm run check:worker
npm run dev:worker
```

La demo local de Workers se abre en http://127.0.0.1:8787. Wrangler puede leer `DATABASE_URL` desde `.env` o `.dev.vars`; ambos archivos están excluidos de Git.

Después de publicar, comprobar `/`, `/api/health`, `/api/ready` y el ciclo de creación, consulta, edición y eliminación de un caso temporal. Una respuesta correcta de `/api/health` no sustituye la comprobación de conexión de `/api/ready`.

## Alcance de la demo

El MVP no incluye autenticación: una demo pública permite a sus visitantes consultar y modificar los datos mediante la interfaz y la API. Usar una base exclusiva con datos ficticios. Para un espacio privado o información real, añadir control de acceso antes de usarlo.
