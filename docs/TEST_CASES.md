# Casos de prueba

Estos escenarios están diseñados; el estado manual continúa pendiente. La cobertura automatizada se documenta por separado.

| ID | Escenario | Resultado esperado | Estado manual |
| --- | --- | --- | --- |
| TC-01 | Crear caso con campos obligatorios | 201, ID y persistencia al consultar | Pendiente |
| TC-02 | Omitir título o enviarlo solo con espacios | 400, sin inserción | Pendiente |
| TC-03 | Títulos de 199, 200 y 201 caracteres | Aceptar 199/200, rechazar 201 | Pendiente |
| TC-04 | Crear dos casos con el mismo título | Dos IDs distintos | Pendiente |
| TC-05 | PATCH solo de prioridad | Conservar los demás campos | Pendiente |
| TC-06 | Consultar un ID inexistente o inválido | 404 o 400, respectivamente | Pendiente |
| TC-07 | Borrar caso sin ejecuciones | 204; consulta posterior 404 | Pendiente |
| TC-08 | Registrar Passed, Failed y Blocked | Tres registros independientes | Pendiente |
| TC-09 | Editar un caso después de ejecutarlo | Mantener la instantánea original | Pendiente |
| TC-10 | Borrar caso con historial | 409, conservar caso y ejecuciones | Pendiente |
| TC-11 | Registrar bug con prioridad baja y severidad crítica | Guardar ambos valores sin confundirlos | Pendiente |
| TC-12 | Relacionar bug con caso inexistente | 404 sin guardar parcialmente | Pendiente |
| TC-13 | Cerrar y reabrir un bug | Reflejar estado y conteos reales | Pendiente |
| TC-14 | Dashboard sin datos | Todos los conteos en cero | Pendiente |
| TC-15 | Introducir texto similar a HTML | Mostrar texto literal, sin ejecutarlo | Pendiente |
| TC-16 | Error al guardar un formulario | Mensaje visible y contenido conservado | Pendiente |
| TC-17 | Navegar en móvil y mediante teclado | Controles accesibles y tablas desplazables | Pendiente |
