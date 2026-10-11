# Resultados de verificación

## Resumen

**47 pruebas aprobadas, 0 fallidas y 0 omitidas.** Verificación registrada el 2026-10-10 para VeriQ 0.1.0.

| Nivel | Aprobadas | Alcance |
| --- | ---: | --- |
| Unitarias | 24 | Validación, paginación, Unicode y escape de texto. |
| HTTP / servidor | 10 | Salud, disponibilidad, errores y archivos estáticos. |
| API con PostgreSQL real | 13 | Casos, ejecuciones, bugs, dashboard e integridad relacional. |
| **Total** | **47** | **Sin fallos ni omisiones.** |

La revisión de sintaxis con `npm run check` también pasó. No se ha medido un porcentaje de cobertura de líneas.

## Entorno y reproducción

- Linux.
- Node.js 26.8.1 y npm 12.0.2.
- PostgreSQL 18.6.
- `DATABASE_URL` y `TEST_DATABASE_URL` configuradas con bases diferentes.
- Esquema aleatorio por prueba de BD, eliminado al finalizar.

Después de seguir [SETUP.md](SETUP.md):

```sh
node --env-file=.env --test --test-reporter=spec
npm run check
```

[Salida completa de la suite](verification/node-test.txt) · [Salida de la revisión de sintaxis](verification/syntax-check.txt).

`npm test` sin la variable de pruebas exportada omite explícitamente los casos PostgreSQL. Ese resultado parcial no equivale al total registrado aquí.

## Hallazgo y regresión

La integración de casos detectó que borrar un caso con ejecuciones devolvía 500 en lugar de 409. La ejecución de ese incremento tuvo 36 pruebas aprobadas y una fallida. Se corrigió la traducción del error de PostgreSQL y se volvió a verificar el comportamiento. [Reporte VQ-001](BUG_REPORTS.md).

## Revisión de interfaz

La comprobación de navegador utilizó una base independiente de desarrollo. Se observaron:

- Creación y edición de casos, con campos obligatorios.
- Registro de una ejecución y conservación del título original tras editar el caso.
- Texto con marcado HTML mostrado literalmente.
- Error por relación de bug inexistente con el formulario conservado.
- Creación, cierre y filtrado de bugs, con actualización del dashboard.
- Diseño de escritorio y móvil; sin desbordamiento horizontal de la página en la vista móvil inspeccionada.

No se observaron errores de consola en la consulta realizada. La [captura del dashboard](images/dashboard.png) corresponde al entorno de verificación y muestra sus datos de prueba.

## Límites de la evidencia

La revisión de navegador no es una suite E2E repetible ni una auditoría completa de accesibilidad. El borrado se comprobó mediante la API automatizada, no mediante la interfaz. No hay una matriz registrada de todos los navegadores o resoluciones.

La colección Postman tiene JSON y scripts revisados, pero **su ejecución no está registrada**. Tampoco se han realizado pruebas de carga o una evaluación de seguridad completa. La [matriz de pruebas](TEST_CASES.md) distingue verificaciones existentes y pendientes.
