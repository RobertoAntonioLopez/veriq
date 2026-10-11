# VeriQ

Plataforma de gestión de QA con Node.js, Express, PostgreSQL y JavaScript vanilla.

## Estado
MVP funcional: casos de prueba, historial de ejecuciones, reportes de bugs y dashboard con datos reales. Interfaz responsive en HTML, CSS y JavaScript vanilla, con logo tipográfico VeriQ.

- [Arquitectura y alcance](docs/ARCHITECTURE.md)
- [Contrato de la API implementada](docs/API.md)
- [Evidencia automatizada](docs/EXECUTION_RESULTS.md)
- [Defecto encontrado y corregido](docs/BUG_REPORTS.md)

## Preparar y ejecutar

Requisitos: Node.js 24 o superior, PostgreSQL activo y utilidades psql/createdb. Configura un usuario PostgreSQL local con permiso para crear tus bases. Los siguientes comandos usan las credenciales y el host predeterminados de tu instalación; ajusta -h y -U si corresponde.

```sh
npm ci
cp .env.example .env
createdb veriq
createdb veriq_test
```

Edita .env con las URLs de tus bases, incluyendo usuario, contraseña, host y puerto reales. DATABASE_URL debe apuntar a veriq y TEST_DATABASE_URL a veriq_test. No subas .env a Git.

Aplica el esquema una sola vez en la base de desarrollo vacía:

```sh
psql -d veriq -v ON_ERROR_STOP=1 -f database/schema.sql
# Opcional: un caso de ejemplo, sin resultados de QA inventados.
psql -d veriq -v ON_ERROR_STOP=1 -f database/seed.sql
npm start
```

Si configuraste otro host o usuario en .env, usa los mismos en psql. El esquema no borra tablas existentes: una segunda aplicación fallará y revertirá su transacción. El seed es opcional y debe ejecutarse una sola vez para evitar duplicados.

La API escucha en http://127.0.0.1:3000. /api/health comprueba el proceso; /api/ready comprueba PostgreSQL. /api/test-cases devuelve la lista real. Abre la raíz / en el navegador para usar la interfaz.

## Pruebas

```sh
npm test
npm run check
npm run test:db
```

npm test ejecuta unitarias y HTTP; las pruebas PostgreSQL se omiten explícitamente si TEST_DATABASE_URL no está exportada. npm run test:db lee .env: configura TEST_DATABASE_URL para ejecutar las pruebas reales de PostgreSQL (sin ella aparecerán como omitidas).

Las pruebas reales exigen una base cuyo nombre termine en _test y sea distinto del nombre de DATABASE_URL. Cada prueba crea y elimina exclusivamente su propio esquema aleatorio. No usa ni limpia las tablas públicas de desarrollo. El usuario de pruebas necesita permiso CREATE en esa BD.

La colección [Postman](postman/VeriQ.postman_collection.json) permite verificar creación, consulta, edición y borrado de casos. Su ejecución no está registrada.

## Uso de la interfaz

- **Resumen:** conteos reales y últimas ejecuciones. Un proyecto vacío muestra ceros.
- **Casos de prueba:** crear, consultar, editar y ejecutar; el detalle permite eliminar casos sin historial.
- **Ejecuciones:** registrar desde un caso, consultar el resultado y la versión probada; filtrar por ID del caso.
- **Bugs:** registrar y editar defectos, distinguir severidad de prioridad y filtrar por estado.

Los formularios conservan lo escrito cuando falla una solicitud. Las tablas tienen paginación y desplazamiento horizontal en pantallas pequeñas. La aplicación utiliza la zona horaria del navegador para mostrar fechas; la API conserva fechas UTC.

## Límites del MVP

Un solo espacio local, sin usuarios, autenticación, adjuntos ni despliegue público. El historial es inmutable por API; un administrador con acceso SQL puede modificar la base. No hay exportación, búsqueda de texto ni edición simultánea con detección de conflictos. La persistencia se guarda en PostgreSQL, no en el navegador.
