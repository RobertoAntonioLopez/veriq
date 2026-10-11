# Colección de API

[VeriQ.postman_collection.json](VeriQ.postman_collection.json) contiene diez solicitudes ordenadas para verificar el CRUD de casos. Su JSON y sus scripts se han revisado; no hay una ejecución registrada en Postman. La suite `node:test` es la evidencia automatizada disponible.

## Configuración

Importar la colección y establecer `baseUrl` con la URL de una instancia local de verificación, por defecto `http://127.0.0.1:3000`. No incluye credenciales. La instancia necesita el esquema PostgreSQL inicializado.

## Secuencia

1. Comprobar disponibilidad de la base.
2. Crear un caso y guardar su ID.
3. Consultarlo.
4. Editar su prioridad.
5. Comprobar paginación.
6. Verificar el rechazo de una creación sin título.
7. Crear un caso con título repetido y comprobar que tiene otro ID.
8. Eliminar el duplicado creado por la colección.
9. Eliminar el primer caso creado.
10. Verificar que la consulta del caso eliminado devuelve 404.

Las variables `caseId` y `duplicateId` se rellenan con las respuestas de creación. Las aserciones comprueban códigos HTTP y campos relevantes. La colección no cubre todavía ejecuciones, bugs ni dashboard; esos módulos sí tienen pruebas de integración con PostgreSQL.

## Datos y evidencia

La colección crea y elimina sus propios registros. Ejecutar en orden y detenerse ante una creación fallida antes de continuar con operaciones sobre IDs. Si la ejecución se interrumpe, revisar los registros que quedaron en la base antes de repetirla.

Registrar versión del proyecto, entorno, fecha y resultado de las aserciones cuando se ejecute. No inferir resultados de Postman a partir de las pruebas de otro ejecutor.
