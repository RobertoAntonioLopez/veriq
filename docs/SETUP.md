# Configuración local

## Requisitos

- Node.js 24 o superior y npm.
- PostgreSQL activo, con `psql`, `createuser` y `createdb` disponibles.
- Un rol PostgreSQL que pueda crear las bases, o bases creadas previamente por un administrador.

La verificación registrada se realizó con Node.js 26.8.1, npm 12.0.2 y PostgreSQL 18.6 en Linux. No se ha registrado una matriz de compatibilidad con otros sistemas o versiones de PostgreSQL.

## 1. Instalar dependencias

Desde la raíz del repositorio:

```sh
npm ci
cp .env.example .env
```

## 2. Configurar PostgreSQL

Los ejemplos siguientes utilizan el rol `veriq` y el puerto predeterminado `5432`. Si el rol aún no existe, un administrador puede crearlo con:

```sh
createuser --createdb --pwprompt veriq
```

Ese comando utiliza la conexión administrativa predeterminada de PostgreSQL; puede necesitar opciones de host y usuario según la instalación. El permiso `CREATEDB` facilita la configuración local. Una alternativa es que el administrador cree las bases y otorgue al rol únicamente los permisos necesarios sobre ellas.

```sh
createdb -h 127.0.0.1 -U veriq veriq
createdb -h 127.0.0.1 -U veriq veriq_test
```

Configura `.env` con las credenciales reales. Ejemplo de estructura, con contraseña de marcador:

```dotenv
PORT=3000
DATABASE_URL=postgresql://veriq:TU_CONTRASENA@127.0.0.1:5432/veriq
TEST_DATABASE_URL=postgresql://veriq:TU_CONTRASENA@127.0.0.1:5432/veriq_test
```

Codifica los caracteres reservados de la contraseña si los incluyes en la URL. `.env` está excluido de Git. Las URLs de desarrollo y pruebas deben usar nombres de base distintos; la segunda debe terminar en `_test`.

## 3. Inicializar el esquema y arrancar

```sh
psql -h 127.0.0.1 -U veriq -d veriq -v ON_ERROR_STOP=1 -f database/schema.sql
npm start
```

El esquema se aplica una sola vez sobre una base vacía. Si ya existen las tablas, falla y revierte su transacción; no es un mecanismo de actualización ni elimina tablas existentes. Las pruebas crean su propio esquema, por lo que no es necesario aplicar `schema.sql` manualmente en `veriq_test`.

Opcionalmente, antes de iniciar o mientras la API está disponible:

```sh
psql -h 127.0.0.1 -U veriq -d veriq -v ON_ERROR_STOP=1 -f database/seed.sql
```

El seed inserta un caso de ejemplo. Ejecutarlo más de una vez crea duplicados. No inserta ejecuciones ni bugs.

Abre [http://127.0.0.1:3000](http://127.0.0.1:3000). `npm run dev` reinicia el servidor al detectar cambios. La aplicación sirve directamente HTML, CSS y módulos JavaScript.

## 4. Verificar

```sh
npm run check
node --env-file=.env --test --test-reporter=spec
```

El segundo comando carga ambas URLs y permite ejecutar la suite completa. Las pruebas reales crean un esquema aleatorio por caso y eliminan solo ese esquema al terminar. Requieren permiso `CREATE` sobre la base de pruebas.

`npm test` no carga `.env`; las pruebas de PostgreSQL se omiten si `TEST_DATABASE_URL` no está exportada. `npm run test:db` sí lee `.env` y ejecuta solo la parte de PostgreSQL.

## Diagnóstico

| Síntoma | Comprobación |
| --- | --- |
| `/api/health` responde 200, pero `/api/ready` responde 503 | El proceso está vivo; revisar PostgreSQL y `DATABASE_URL`. |
| `/api/ready` responde 200, pero el CRUD devuelve 500 | Confirmar que el esquema se aplicó a la misma base indicada en la URL. Readiness solo ejecuta `SELECT 1`. |
| Fallo de autenticación PostgreSQL | Revisar usuario, contraseña, host y configuración local de acceso. |
| Error de permisos al crear bases o esquemas | Crear las bases con un administrador; conceder `CREATE` en la base de pruebas. |
| Error `EADDRINUSE` | Elegir otro `PORT` y abrir ese puerto en el navegador. |
| Pruebas de BD omitidas | Configurar `TEST_DATABASE_URL` y usar el comando que carga `.env`. |
| Tablas ya existentes al inicializar | Usar la instalación existente o crear otra base vacía; no volver a aplicar el esquema como una migración. |

La escucha está limitada a `127.0.0.1`. No hay un despliegue público ni autenticación implementada.
