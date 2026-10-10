-- Datos de ejemplo opcionales, no evidencia de una ejecución de QA.
-- Ejecutar una sola vez sobre una instalación vacía.
BEGIN;
INSERT INTO test_cases (title, description, preconditions, steps, expected_result, priority)
VALUES (
  'Crear un caso con los campos obligatorios',
  'Verificación del flujo de creación y consulta de casos.',
  'La API está disponible y la base de datos está configurada.',
  E'1. Enviar POST /api/test-cases con title, steps y expectedResult.\n2. Consultar el ID recibido.',
  'La creación devuelve 201 y la consulta devuelve los datos guardados.',
  'high'
);
COMMIT;
