# API implementada

Base local: http://127.0.0.1:3000/api. JSON con Content-Type: application/json.

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | /health | 200: proceso vivo |
| GET | /ready | 200: conexión PostgreSQL; 503: no disponible |
| POST | /test-cases | 201 + Location + {data: caso} |
| GET | /test-cases?limit=20&offset=0 | 200 + {data: [...], pagination: {limit, offset}} |
| GET | /test-cases/:id | 200 + {data: caso} |
| PATCH | /test-cases/:id | 200 + {data: caso actualizado} |
| DELETE | /test-cases/:id | 204 sin cuerpo |

Ejemplo de creación:
```json
{
  "title": "Crear un caso válido",
  "description": "Verificar el flujo principal",
  "preconditions": "API disponible",
  "steps": "1. Enviar POST.\n2. Consultar el ID recibido.",
  "expectedResult": "Se devuelve 201 y el caso queda persistido.",
  "priority": "high"
}
```

Obligatorios: title, steps, expectedResult. description y preconditions toman texto vacío; priority toma medium si se omite. Prioridades: low, medium, high. Título de 1–200 caracteres; otros textos hasta 10 000. Se recortan espacios de los extremos. No se permiten nulos, carácter NUL ni campos desconocidos. Se permiten títulos repetidos.

PATCH acepta un subconjunto no vacío de los mismos campos; no modifica los omitidos. IDs, createdAt y updatedAt son de solo lectura. Respuestas usan camelCase; PostgreSQL usa snake_case. Fechas ISO 8601 UTC.

Listas ordenadas por created_at DESC, id DESC. limit entre 1 y 100, offset entero no negativo. No hay búsqueda ni otros filtros en esta etapa.

Errores con forma {"error":{"code":"…","message":"…"}}:
- 400 VALIDATION_ERROR: entrada fuera del contrato.
- 400 INVALID_JSON: JSON malformado.
- 404 TEST_CASE_NOT_FOUND: ID válido que no existe.
- 409 TEST_CASE_HAS_RUNS: borrar afectaría el historial; no se borra nada.
- 413 PAYLOAD_TOO_LARGE: cuerpo superior a 64 KB.
- 503 DATABASE_UNAVAILABLE: BD sin configurar (o no disponible en /ready).
- 500 INTERNAL_ERROR: fallo inesperado, incluyendo errores del repositorio; detalles solo en logs.

/ready verifica SELECT 1, no la versión del esquema. Aplicar schema.sql antes de usar el CRUD. La interfaz web se sirve en la raíz /.

## Ejecuciones

| Método | Ruta | Respuesta |
| --- | --- | --- |
| POST | /test-runs | 201 + Location + {data: ejecución} |
| GET | /test-runs?testCaseId=1&limit=20&offset=0 | 200, historial paginado; filtro opcional |
| GET | /test-runs/:id | 200, detalle e instantánea del caso |

Creación: {"testCaseId":1,"result":"passed","notes":"Observaciones"}. testCaseId debe ser número entero positivo, result es passed/failed/blocked, notes es opcional y admite hasta 10 000 caracteres. 404 si el caso no existe. La copia caseSnapshot se crea en la misma sentencia SQL que la ejecución. No hay edición ni borrado de ejecuciones; esas rutas devuelven 404. Un ID de ejecución inexistente devuelve TEST_RUN_NOT_FOUND.

## Bugs

| Método | Ruta | Respuesta |
| --- | --- | --- |
| POST | /bugs | 201 + Location + {data: bug} |
| GET | /bugs?status=open&limit=20&offset=0 | 200, lista paginada; filtro opcional |
| GET | /bugs/:id | 200, detalle |
| PATCH | /bugs/:id | 200, edición parcial |

Obligatorios: title (hasta 200), description, stepsToReproduce, expectedResult, actualResult (hasta 10 000 cada uno) y severity (minor/major/critical). priority es low/medium/high, por defecto medium; status es open/in_progress/resolved/closed, por defecto open. testCaseId es opcional: número entero o null. Se puede quitar la relación mediante PATCH con testCaseId:null. 404 si el bug o el caso relacionado no existe. Las transiciones entre estados son libres, incluyendo reaperturas. No hay endpoint de borrado de bugs en el MVP.

## Dashboard

GET /dashboard devuelve {data:{testCases,testRuns,passed,failed,blocked,openBugs}}. Todos los valores son números calculados en una sola consulta. Las ejecuciones cuentan todo el historial; openBugs incluye open, in_progress y resolved, y excluye closed. No se calculan porcentajes sobre datos simulados.
