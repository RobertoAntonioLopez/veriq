# Arquitectura

## Contexto y decisión

VeriQ es una aplicación local de gestión de QA con una interfaz que consume JSON. Su alcance requiere separación de responsabilidades, persistencia relacional y facilidad para verificar las reglas de negocio.

| Alternativa | Evaluación |
| --- | --- |
| MVC tradicional | Es una opción adecuada para vistas renderizadas en servidor; aporta menos valor en esta interfaz estática que consume una API. |
| Capas globales | Separa HTTP, negocio y datos, pero distribuye los archivos de una funcionalidad entre varias carpetas. |
| Módulos por funcionalidad | Mantiene juntos los componentes de cada flujo y permite conservar capas internas. Es la opción implementada. |

Cada módulo con reglas de negocio contiene router, controlador, servicio, repositorio y validación. El dashboard es una consulta agregada: su router y repositorio cubren la responsabilidad sin una capa de servicio adicional.

## Responsabilidades y referencias

| Componente | Responsabilidad | Ejemplo |
| --- | --- | --- |
| Aplicación | Componer rutas, servir archivos estáticos y manejar errores. | [app.js](../src/app.js) |
| Servidor | Leer configuración, escuchar en localhost y cerrar conexiones. | [server.js](../src/server.js) |
| Controlador | Traducir solicitudes y resultados a HTTP. | [Controlador de casos](../src/modules/test-cases/controller.js) |
| Servicio | Aplicar reglas, resolver inexistentes y traducir conflictos. | [Servicio de casos](../src/modules/test-cases/service.js) |
| Validación | Comprobar tipos, campos, límites y enumeraciones. | [Validación de casos](../src/modules/test-cases/validation.js) |
| Repositorio | Ejecutar SQL parametrizado y devolver registros. | [Repositorio de ejecuciones](../src/modules/test-runs/repository.js) |
| Interfaz | Gestionar navegación, formularios y presentación. | [Aplicación del navegador](../public/js/app.js) |

Las validaciones de API son independientes de HTTP y pueden probarse como funciones puras. El navegador valida entradas para facilitar el uso; la API vuelve a validarlas y PostgreSQL aplica restricciones de integridad.

## Estructura

```text
veriq/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── middleware/
│   ├── utils/
│   └── modules/
│       ├── test-cases/
│       ├── test-runs/
│       ├── bugs/
│       └── dashboard/
├── public/
│   ├── index.html
│   ├── css/
│   └── js/
├── database/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── database/
│   └── helpers/
├── scripts/
├── postman/
└── docs/
```

## Modelo de datos

El [esquema SQL](../database/schema.sql) es la definición de referencia. Los IDs son enteros generados por PostgreSQL y las fechas son `TIMESTAMPTZ`.

| Entidad | Datos principales | Relación |
| --- | --- | --- |
| `test_cases` | Título, descripción, precondiciones, pasos, resultado esperado y prioridad. | Un caso puede tener muchas ejecuciones y muchos bugs. |
| `test_runs` | Caso, resultado, observaciones, instantánea JSONB y fecha. | El caso es obligatorio; `ON DELETE RESTRICT`. |
| `bugs` | Descripción del defecto, reproducción, esperado/actual, severidad, prioridad y estado. | El caso es opcional; `ON DELETE SET NULL`. |

Un caso con ejecuciones no se elimina. Un caso sin ejecuciones puede eliminarse, conservando sus bugs con el vínculo en `null`. Los títulos repetidos están permitidos: el ID es el identificador del recurso.

## Decisiones de integridad

### Historial de ejecuciones

Cada resultado es una nueva fila. Una sentencia `INSERT … SELECT` lee el caso y almacena su instantánea con la ejecución. Esto evita separar la captura y la inserción en dos solicitudes SQL. La instantánea utiliza los nombres camelCase del contrato de API.

No hay endpoints para editar o borrar ejecuciones. Editar un caso modifica su versión actual, pero no sus instantáneas históricas.

### Severidad y prioridad

La severidad expresa el impacto del defecto (`minor`, `major`, `critical`). La prioridad indica la urgencia de atención (`low`, `medium`, `high`). El estado permite `open`, `in_progress`, `resolved` y `closed`, incluyendo reapertura.

### Estadísticas

El dashboard calcula seis conteos en una única consulta. Passed, Failed y Blocked cuentan todas las ejecuciones históricas, no el último resultado por caso. `openBugs` cuenta todos los bugs pendientes de cierre: abiertos, en progreso y resueltos. La tabla «Bugs abiertos» filtra únicamente `open`.

## API y acceso a datos

- SQL parametrizado para los valores de entrada; columnas de edición tomadas de mapas fijos.
- Listas con límite, desplazamiento y orden estable por fecha e ID descendentes.
- Respuestas JSON consistentes; los errores internos se registran en el servidor y no se exponen en el cuerpo HTTP.
- Frontend estático servido desde `public/`, sin acceso HTTP al código del servidor o `.env`.
- Aplicación y servidor separados para que las pruebas puedan abrir puertos temporales.

El contrato completo está en [API.md](API.md).

## Compromisos del MVP

Se utiliza JavaScript con ES Modules y `pg`, sin ORM ni framework de frontend. El SQL explícito permite revisar las restricciones y la persistencia junto a sus pruebas. El esquema inicial es transaccional, pero todavía no existe un sistema de migraciones versionadas.

La paginación usa offset por simplicidad. No hay control de conflictos entre ediciones concurrentes. El servidor escucha en localhost y no incorpora autenticación. Estas decisiones delimitan una aplicación local, no un servicio listo para acceso público.
