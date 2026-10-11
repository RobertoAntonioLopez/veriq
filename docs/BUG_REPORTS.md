# Reporte de defecto

## VQ-001 — Borrado de caso con historial responde 500 en lugar de 409

| Campo | Valor |
| --- | --- |
| Estado | Corregido; regresión aprobada. |
| Fecha de detección | 2026-10-10. |
| Entorno | API local y PostgreSQL 18.6 en base de pruebas aislada. |
| Detección | Prueba automatizada de integración con PostgreSQL real. |
| Severidad | Menor: los datos se conservaban, pero el contrato HTTP era incorrecto. |
| Prioridad | Alta: afecta una regla central del historial y su explicación al cliente. |

### Precondición y reproducción

Un caso tiene al menos una ejecución relacionada. En la versión afectada:

1. Crear un caso mediante `POST /api/test-cases`.
2. Añadir una ejecución relacionada en la base de pruebas. Durante la detección, el fixture la insertaba por SQL; el endpoint de ejecuciones se implementó posteriormente.
3. Enviar `DELETE /api/test-cases/:id`.

La versión actual permite establecer la misma precondición mediante `POST /api/test-runs`. La regresión mantiene el fixture SQL para aislar el comportamiento del borrado.

### Esperado y observado

| | Resultado |
| --- | --- |
| Esperado | HTTP 409, código `TEST_CASE_HAS_RUNS`, caso y ejecución conservados. |
| Observado en la versión afectada | HTTP 500, código `INTERNAL_ERROR`, caso y ejecución conservados. |

La aserción de la ejecución inicial registró `500 !== 409`. PostgreSQL devolvió SQLSTATE `23001` (`restrict_violation`); el servicio solo reconocía `23503` como conflicto de relación.

### Corrección

El [servicio de casos](../src/modules/test-cases/service.js) traduce ambos códigos a un error de conflicto 409 en el borrado. No se debilitaron las restricciones de PostgreSQL ni se eliminó el historial.

### Regresión

La prueba `existing runs prevent deletion and retain their snapshot after editing`, en [test-cases.test.js](../tests/database/test-cases.test.js), verifica el 409, la conservación del caso y el contenido de la instantánea después de editar el título.

La última suite completa incluye esta regresión aprobada. [Ver evidencia](EXECUTION_RESULTS.md).

### Implicación técnica

Un repositorio simulado no reproduce necesariamente los códigos reales de PostgreSQL. La integración con la base permitió detectar un error de traducción HTTP aun cuando la restricción de integridad funcionaba correctamente.
