# Reporte del tester de caja negra · Linguinis

## Ejecución del 03-11-2026

**Qué se pidió:** comprobar por HTTP (caja negra, sin leer `src/`) que la API de platos cumple el contrato del README («Recurso y reglas», «Contrato HTTP», «Consulta combinable de GET /platos», «Ejemplos»), con el servidor ya arrancado en `http://localhost:3000`, siguiendo la convención `api-test-conventions`.

**Pruebas usadas:** `AI/blackbox.cjs` sin cambios: ya cubría todas las rutas pedidas (`GET /platos`, `POST /platos`, `GET /platos/stats`, `GET|PUT|PATCH|DELETE /platos/:id` y ruta inexistente 404), en 11 grupos.

### Ejecuciones de `npm test`

| Nº | Grupos | PASS | FAIL | Respuestas comprobadas | Ids propios pendientes | Código de salida |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 11 | 11 | 0 | 163 | `[]` | 0 |

Prefijo único de la ejecución: `BB-43692158-1445-4303-93d4-88bc422064ca`. La salida exacta está en `AI/blackbox-results.txt`.

### Fallos encontrados

Ninguno. No hubo nada que corregir, así que no hizo falta otra ejecución.

### Lo que no se puede comprobar desde fuera

- **Arquitectura:** la separación en rutas, controladores, servicios y validadores no se puede ver por HTTP.
- **Interfaz:** el panel del navegador (`public/`) no se prueba.
- **Errores 500:** no se pueden provocar sin tocar el servidor, así que no se comprueba que respondan `{"error":...}` sin traza.
- **Concurrencia y carga:** no se prueban peticiones simultáneas. Las estadísticas se comparan con un recorrido paginado que no es atómico: si otro cliente cambiara datos durante la prueba, podría salir una diferencia que no sería un fallo de la API.
- **Persistencia y reinicio:** no se comprueba que al reiniciar vuelvan los seis platos iniciales (el servidor no se para).
- Pasar estas pruebas no garantiza que no haya defectos fuera de los casos ejecutados.
