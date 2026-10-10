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

/ready verifica SELECT 1, no la versión del esquema. Aplicar schema.sql antes de usar el CRUD. Las rutas de ejecuciones, bugs y dashboard todavía no están implementadas.
