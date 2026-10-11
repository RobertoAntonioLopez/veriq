# VeriQ: arquitectura y alcance

## Decisión
MVC tradicional funciona bien para vistas renderizadas en servidor, pero aquí el navegador consume JSON. Las capas globales separan responsabilidades, aunque dispersan cada funcionalidad. Elegimos módulos por funcionalidad con capas internas: router → controlador HTTP → servicio de negocio → repositorio SQL. No habrá clases base, ORM ni contenedor de dependencias.

La aplicación Express se construye separada del servidor para probarla sin arrancar el proceso de producción. Las validaciones serán funciones puras. PostgreSQL mantendrá restricciones además de las validaciones del servicio. Todas las entradas SQL usarán parámetros.

## MVP exacto
- Casos: crear, listar, consultar, editar y eliminar cuando no tengan ejecuciones.
- Ejecuciones: registrar Passed, Failed o Blocked, observaciones y fecha; consultar historial inmutable.
- Bugs: crear, listar, consultar y editar; vínculo opcional a un caso.
- Dashboard: total de casos y ejecuciones, ejecuciones por resultado y bugs no cerrados.
- Una instalación local, sin usuarios ni autenticación. No publicar en Internet tal cual.
- UI vanilla, navegación lateral, tablas, formularios accesibles, estados vacíos y mensajes de error/éxito. Gris claro, blanco y azul; logo tipográfico VeriQ. Sin badges decorativos ni cifras simuladas.

Fuera: roles, múltiples proyectos, hitos, adjuntos, exportaciones, notificaciones, microservicios y gráficos secundarios.

## Árbol propuesto
```text
veriq/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/db.js
│   ├── middleware/error-handler.js
│   └── modules/
│       ├── test-cases/  # routes, controller, service, repository, validation
│       ├── test-runs/
│       ├── bugs/
│       └── dashboard/
├── public/
│   ├── index.html
│   ├── css/styles.css
│   └── js/             # api y DOM por pantalla
├── database/
│   ├── schema.sql
│   └── seed.sql
├── tests/
│   ├── unit/
│   └── integration/
├── postman/
├── docs/
├── .env.example
├── package.json
└── README.md
```
Solo se crean directorios cuando contienen una implementación útil.

## Modelo de datos
IDs INTEGER GENERATED ALWAYS AS IDENTITY; fechas TIMESTAMPTZ en UTC.

| Tabla | Campos |
| --- | --- |
| test_cases | id, title (1–200), description, preconditions, steps (obligatorio), expected_result (obligatorio), priority (low/medium/high), created_at, updated_at |
| test_runs | id, test_case_id obligatorio, result (passed/failed/blocked), notes, case_snapshot JSONB, created_at |
| bugs | id, test_case_id opcional, title (1–200), description, steps_to_reproduce, expected_result, actual_result, severity (minor/major/critical), priority (low/medium/high), status (open/in_progress/resolved/closed), created_at, updated_at |

Un caso tiene muchas ejecuciones y muchos bugs. FK de ejecuciones con ON DELETE RESTRICT: borrar un caso ejecutado responde 409. FK de bugs con ON DELETE SET NULL. Cada ejecución conserva una copia de los campos del caso para que las ediciones posteriores no alteren lo probado; insertar mediante INSERT…SELECT en una sola sentencia. No hay endpoint para editar/borrar ejecuciones. Títulos repetidos se permiten: no son identificadores únicos.

Severidad representa impacto técnico; prioridad representa urgencia de atención. Bugs abiertos en el dashboard significa status distinto de closed, incluyendo resolved pendiente de cierre. Conteos de Passed/Failed/Blocked corresponden a todas las ejecuciones, no al último estado de cada caso.

## Contrato REST previsto
Base /api. JSON de éxito: {data: …}; error: {error: {code, message}}.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | /health | 200 proceso vivo |
| GET | /ready | 200 BD accesible; 503 si no lo está |
| GET, POST | /test-cases | lista paginada / creación 201 |
| GET, PATCH, DELETE | /test-cases/:id | detalle / edición parcial / borrado 204 |
| GET, POST | /test-runs | historial paginado, filtro testCaseId / registro 201 |
| GET | /test-runs/:id | detalle con snapshot |
| GET, POST | /bugs | lista paginada, filtro status / creación 201 |
| GET, PATCH | /bugs/:id | detalle / edición parcial |
| GET | /dashboard | los seis conteos reales |

Listas: limit por defecto 20, máximo 100; offset por defecto 0; orden created_at DESC, id DESC. Validar IDs enteros positivos, enums, campos desconocidos y PATCH vacío. Texto libre máximo 10 000 caracteres; recortar espacios de títulos. Errores: 400 entrada inválida, 404 recurso inexistente, 409 relación impide borrado, 413 payload excesivo, 500 error inesperado. No filtrar trazas ni mensajes internos de PostgreSQL.

## Estrategia de QA
node:test para validación pura, servicios y contratos HTTP. Integración real en una BD exclusiva de pruebas con TEST_DATABASE_URL, distinta de DATABASE_URL; no truncar la BD de desarrollo. Las pruebas HTTP de infraestructura usan un adaptador simulado; las pruebas de módulos ejecutan consultas sobre PostgreSQL real en esquemas aislados. Postman cubrirá positivos, negativos, límites, inexistentes, títulos repetidos y restricciones de borrado. Registrar únicamente ejecuciones realizadas y defectos observados. Las verificaciones automatizadas continúan durante cada incremento.

## Simplificación del dashboard
El dashboard solo expone una lectura agregada. Su router gestiona HTTP y su repositorio contiene la consulta. No se añade un servicio que únicamente reenvíe la misma llamada. Los módulos con reglas de negocio mantienen sus servicios separados.
