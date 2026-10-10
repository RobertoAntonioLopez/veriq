# Defectos observados

## VQ-001 — Borrar un caso con historial devuelve 500 en vez de 409

- Fecha: 2026-10-10.
- Estado: corregido durante el desarrollo; regresión automatizada aprobada.
- Entorno: API local, PostgreSQL temporal, BD veriq_test.
- Severidad: minor; el historial permanece protegido, pero la respuesta HTTP es incorrecta.
- Prioridad: high; afecta un contrato importante del MVP y la explicación al usuario.
- Precondición: existe un caso y una ejecución relacionada.
- Pasos: crear caso por POST /api/test-cases; insertar ejecución de prueba en la BD (el endpoint de ejecuciones todavía no existe); enviar DELETE /api/test-cases/:id.
- Esperado: 409, código TEST_CASE_HAS_RUNS; caso y ejecución conservados.
- Observado inicialmente: 500, código INTERNAL_ERROR; ambos registros conservados.
- Evidencia: suite inicial, 36 aprobadas y 1 fallida; aserción 500 !== 409. Diagnóstico: PostgreSQL devolvió SQLSTATE 23001 (restrict_violation).
- Causa: el servicio solo traducía SQLSTATE 23503 a conflicto.
- Corrección: traducir 23503 y 23001 a 409 en el borrado de casos.
- Regresión: prueba «existing runs prevent deletion and retain their snapshot after editing».

Hallazgo detectado mediante integración automatizada con PostgreSQL real.
