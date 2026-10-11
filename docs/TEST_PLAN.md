# Plan de pruebas de VeriQ

## Objetivo y alcance
Verificar persistencia, reglas de negocio, contratos HTTP y los flujos principales de la interfaz. Cubrir casos de prueba, ejecuciones, bugs y conteos del dashboard. Autenticación, concurrencia avanzada, rendimiento masivo y despliegue quedan fuera del MVP.

## Entornos
- Desarrollo: base veriq, datos del usuario.
- Integración automatizada: base terminada en _test, esquema aleatorio por prueba; limpieza limitada a ese esquema.
- Revisión de interfaz: base veriq_ui_test separada de desarrollo.

## Criterios de aceptación
- Crear, consultar, editar y borrar casos sin historial.
- Rechazar entradas inválidas sin escrituras parciales.
- Conservar todas las ejecuciones y su instantánea; impedir borrado de casos ejecutados.
- Registrar defectos y actualizar estado, severidad y prioridad independientemente.
- Reflejar datos reales en el dashboard, incluyendo ceros.
- Escapar texto introducido por usuarios y mostrar errores sin perder el formulario.
- Mantener navegación, formularios y tablas utilizables en escritorio y móvil.

## Ejecución
Las pruebas unitarias y HTTP se ejecutan con npm test; las de BD requieren TEST_DATABASE_URL, también disponible mediante npm run test:db. npm run check revisa la sintaxis del código. Resultados y limitaciones en EXECUTION_RESULTS.md.

La ejecución manual y la colección de Postman no tienen resultados registrados. Los defectos confirmados se registran en BUG_REPORTS.md, con pasos, esperado, observado y regresión.

## Riesgos y cierre
Priorizar pérdida de datos, resultados históricos alterados y estadísticas incorrectas. No dar por aprobada una prueba omitida. El cierre de desarrollo exige suite sin fallos y comprobación de los flujos principales; la verificación manual requiere su propio registro de resultados.
