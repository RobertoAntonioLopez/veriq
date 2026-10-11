# Matriz de pruebas y trazabilidad

La columna de evidencia indica dónde se verifica cada comportamiento. «Automatizada» se refiere a una aserción existente en la suite; «Revisión de navegador» se refiere a la comprobación documentada y no a una prueba E2E repetible. La ejecución de Postman no está registrada.

| ID | Escenario | Resultado esperado | Evidencia |
| --- | --- | --- | --- |
| TC-01 | Crear y consultar un caso válido | 201, ID, Location y registro persistido. | Automatizada: [CRUD](../tests/database/test-cases.test.js). |
| TC-02 | Omitir título o usar solo espacios | 400 sin inserción. | Automatizada: [validación](../tests/unit/validation.test.js) y [API](../tests/database/test-cases.test.js). |
| TC-03 | Título de 200 y 201 caracteres, incluyendo Unicode | Aceptar 200; rechazar 201. | Automatizada: [backend](../tests/unit/validation.test.js), [frontend](../tests/unit/frontend.test.js) y [persistencia](../tests/database/test-cases.test.js). |
| TC-04 | Crear dos casos con el mismo título | Dos IDs distintos. | Automatizada: [paginación y duplicados](../tests/database/test-cases.test.js). |
| TC-05 | Editar únicamente la prioridad | Conservar los demás campos y la fecha de creación. | Automatizada: [CRUD](../tests/database/test-cases.test.js). |
| TC-06 | ID inválido o inexistente | 400 o 404, según corresponda. | Automatizada: [validación](../tests/unit/validation.test.js) y [API](../tests/database/test-cases.test.js). |
| TC-07 | Borrar caso sin ejecuciones | 204 sin cuerpo; consulta posterior 404. | Automatizada: [CRUD](../tests/database/test-cases.test.js). |
| TC-08 | Registrar Passed, Failed y Blocked | Tres resultados independientes. | Automatizada: [ejecuciones](../tests/database/test-runs.test.js). |
| TC-09 | Editar un caso ya ejecutado | La instantánea conserva la versión original. | Automatizada: [historial](../tests/database/test-runs.test.js); revisión de navegador. |
| TC-10 | Borrar un caso con historial | 409; caso y ejecuciones conservados. | Automatizada: [regresión del borrado](../tests/database/test-cases.test.js); defecto [VQ-001](BUG_REPORTS.md). |
| TC-11 | Bug con severidad mayor y prioridad baja | Persistir ambas sin vincular sus valores. | Automatizada: [bugs](../tests/database/bugs.test.js). |
| TC-12 | Asociar bug a caso inexistente | 404 sin escritura parcial. | Automatizada: [bugs](../tests/database/bugs.test.js); revisión de navegador. |
| TC-13 | Cerrar y reabrir un bug | Actualizar estado y permitir filtros coherentes. | Automatizada: [ciclo de estado](../tests/database/bugs.test.js). |
| TC-14 | Dashboard vacío y con varios resultados | Ceros iniciales; conteos del historial y bugs no cerrados. | Automatizada: [dashboard](../tests/database/dashboard.test.js). |
| TC-15 | Texto similar a SQL o HTML | Guardar SQL como texto y escapar HTML al mostrarlo. | Automatizada: [persistencia](../tests/database/test-cases.test.js) y [escape](../tests/unit/frontend.test.js); revisión de navegador. |
| TC-16 | Error al guardar un formulario | Mostrar el error y conservar lo escrito. | Revisión de navegador: [resultados](EXECUTION_RESULTS.md). |
| TC-17 | Escritorio, móvil y teclado | Navegación utilizable y controles accesibles. | Parcial: escritorio/móvil inspeccionados; recorrido completo con teclado pendiente. |
| TC-18 | JSON inválido o cuerpo excesivo | 400 o 413, respectivamente. | Automatizada: [HTTP](../tests/integration/app.test.js). |
| TC-19 | BD ausente o fallo interno | 503 en disponibilidad; error genérico en fallos inesperados. | Automatizada: [HTTP](../tests/integration/app.test.js). |
| TC-20 | Acceder a archivos internos por HTTP | 404 para .env, esquema y código del servidor. | Automatizada: [archivos estáticos](../tests/integration/app.test.js). |

## Cobertura pendiente

- Ejecución registrada de la colección Postman.
- Automatización E2E del navegador.
- Recorrido completo con teclado y auditoría de accesibilidad.
- Matriz de navegadores y sistemas operativos.
- Conflictos concurrentes y pruebas de carga.

Los casos diseñados y la cobertura automatizada no implican que estas comprobaciones pendientes se hayan ejecutado.
