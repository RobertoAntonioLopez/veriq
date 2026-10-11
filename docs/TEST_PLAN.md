# Plan de pruebas

## Objetivo

Verificar que VeriQ conserva los datos de QA, mantiene la trazabilidad entre casos y ejecuciones y expone contratos HTTP predecibles. La prioridad es detectar pérdida de información, escrituras parciales y alteraciones del historial.

## Alcance y prioridades

| Riesgo | Prioridad | Verificación |
| --- | --- | --- |
| Pérdida de historial al editar o borrar casos | Alta | Instantáneas persistidas, FK y respuesta 409 ante borrado restringido. |
| Entradas inválidas que producen escrituras | Alta | Campos obligatorios, tipos, límites, enums, referencias inexistentes y PATCH vacío. |
| Estadísticas que no representan los datos | Alta | Base vacía, varios resultados de ejecución y distintos estados de bugs. |
| Consultas inseguras o exposición de datos internos | Alta | Texto similar a SQL almacenado literalmente, errores genéricos y archivos internos no públicos. |
| Confusión entre severidad y prioridad | Media | Guardar y editar valores independientes. |
| Formularios difíciles de recuperar tras un error | Media | Error visible y conservación del contenido introducido. |
| Interfaz inutilizable en móvil | Media | Inspección visual y desplazamiento de tablas. |

No se incluyen pruebas de carga, despliegue público, autenticación ni concurrencia avanzada. La aplicación no implementa esos flujos en el MVP.

## Niveles de prueba

| Nivel | Herramienta | Propósito |
| --- | --- | --- |
| Unitarias | `node:test`, `node:assert/strict` | Validación pura, límites, Unicode, paginación y escape de texto. |
| HTTP con dependencia controlada | Express, Fetch, `node:test` | Salud, errores de infraestructura y entrega de recursos estáticos. |
| API con PostgreSQL real | `pg`, Fetch, `node:test` | Persistencia, restricciones, relaciones y comportamiento de módulos. |
| Revisión de interfaz | Navegador | Comprobar flujos principales y presentación responsive. |
| Colección de API | Postman | Escenarios de CRUD importables; ejecución pendiente de registro. |

Las pruebas HTTP con una dependencia simulada no verifican SQL ni restricciones. Esa responsabilidad corresponde a la integración con PostgreSQL real.

## Aislamiento

`TEST_DATABASE_URL` debe identificar una base cuyo nombre termine en `_test` y sea diferente del nombre de `DATABASE_URL`. Cada prueba crea un esquema con un identificador aleatorio, configura su `search_path` y elimina exclusivamente ese esquema al terminar. Los puertos HTTP son temporales. Las pruebas no requieren datos previos.

[Implementación del aislamiento](../tests/helpers/database.js).

## Criterios de aceptación

1. Crear y consultar casos demuestra persistencia real; editar no modifica campos omitidos.
2. Las entradas rechazadas no dejan cambios parciales.
3. Registrar ejecuciones agrega resultados y conserva la versión del caso probado.
4. Borrar un caso con historial responde 409 y conserva las relaciones.
5. Los bugs mantienen reproducción, severidad, prioridad y estado independientes.
6. Los conteos corresponden a los datos almacenados, incluyendo el estado vacío.
7. La interfaz muestra errores sin descartar el formulario y representa texto libre sin interpretarlo como HTML.

Para una verificación completa de la suite, el resultado debe tener cero fallos y cero pruebas omitidas. Los comandos están en [SETUP.md](SETUP.md); la evidencia y sus límites, en [EXECUTION_RESULTS.md](EXECUTION_RESULTS.md).

## Gestión de defectos

Cada hallazgo incluye entorno, precondiciones, pasos, esperado, observado, severidad, prioridad, causa y regresión. [VQ-001](BUG_REPORTS.md) documenta un error confirmado y corregido. La matriz de escenarios permite localizar la cobertura existente y las comprobaciones aún pendientes.
