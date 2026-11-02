# Registro del único tester agent

Fecha: 27 de octubre de 2026. Rol: tester de caja negra de la API HTTP. No se han creado agentes adicionales desde este tester.

## Prompt recibido

> Actúa como el único tester agent de caja negra exigido por el enunciado del usuario. Proyecto: `practice1-linguinis`. API activa en `http://localhost:3000`. SOLO puedes leer README.md (contrato) y tus propios archivos AI; NO accedas a src/, public/, tests/, node_modules ni a la implementación. No crees otros agentes. Lee el contrato y genera AI/blackbox.cjs: comprobaciones HTTP ejecutables con node >=18, fetch y assert, sin importar app ni dependencias. Cubre CRUD, Location, id/extra ignorados, validaciones múltiples, PUT vs PATCH, filtros combinados, orden, ventana, consultas incorrectas, stats dinámicas, JSON inválido, 404, DELETE 204. Aísla pruebas mediante nombres únicos y limpia SOLO los ids creados por ti en finally, sin borrar datos preexistentes ni suponer colección vacía. Ejecuta tus comprobaciones contra la API y devuelve resultados reales. Documenta AI/agents.md con prompt, contrato recibido (puedes resumir con enlace README), lista comprobaciones y limitaciones. Devuelve al padre hallazgos; no escribas review-log.md (lo elaborará el revisor). Puedes usar tools exec_command para HTTP/local Node; cualquier fallo red de sandbox requiere escalación según instrucciones. No toques archivos fuera de AI/.

## Contrato recibido

La única fuente consultada fue [README.md](../README.md), especialmente «Recurso y reglas», «Contrato HTTP» y «Consulta combinable de GET /platos». El tester accedió únicamente a ese README y a sus propios artefactos de `AI/`; no leyó `src/`, `public/`, `tests/`, `node_modules` ni otros archivos de implementación.

El recurso tiene UUID de servidor y cuatro campos editables: nombre recortado de 1 a 80 caracteres, precio numérico finito de 0.01 a 100 con dos decimales como máximo, disponibilidad booleana y categoría pizza/pasta. Los campos desconocidos y los ids del cliente se ignoran. POST crea; PUT exige sustitución completa; PATCH admite cambios parciales y exige algún campo editable; DELETE devuelve 204 sin cuerpo. Las consultas aplican filtro, orden estable y ventana; los parámetros desconocidos, repetidos o inválidos se rechazan. `/platos/stats` calcula el agregado global actualizado. Los errores 400 contienen una lista de incidencias; los demás, una propiedad `error`.

## Artefacto y ejecución

[blackbox.cjs](blackbox.cjs) utiliza exclusivamente `fetch`, `node:assert/strict` y `node:crypto`. No importa la aplicación ni dependencias del proyecto. Requiere Node.js 18 o superior y un servidor iniciado por separado.

```sh
node AI/blackbox.cjs
```

La URL predeterminada es `http://localhost:3000`. Para otro servidor, establecer `BASE_URL`. Cada ejecución usa un prefijo UUID propio; los casos de nombres repetidos comparten deliberadamente un nombre que pertenece únicamente a esa ejecución. Los ids devueltos por POST se registran inmediatamente, y `finally` intenta borrar exclusivamente esos ids. No se borra ni se modifica ningún recurso preexistente. Las estadísticas se contrastan con todas las páginas obtenidas públicamente, sin asumir que la colección esté vacía o contenga los seis ejemplos iniciales.

## Comprobaciones

1. GET de colección paginada y coherencia de estadísticas globales.
2. POST 201, UUID, Location, recorte de nombre, id y campos adicionales ignorados, GET individual.
3. Incidencias múltiples; campos obligatorios; tipos inválidos; valores de precio fuera de rango, con más decimales y no finitos; nombres vacíos/largos; categorías y booleanos inválidos; cuerpos escalares, arrays y null.
4. Precios mínimos/máximos inclusivos, nombre de 80 caracteres y aceptación de nombres repetidos.
5. PUT completo frente a PATCH parcial; conservación del id y del resto de campos; rechazo de PATCH vacío o sin campos editables; ausencia de cambios parciales tras validación fallida.
6. Filtros combinados, búsqueda recortada sin distinguir mayúsculas, orden predeterminado y descendente, precio ascendente/descendente, empates estables, ventana después del filtrado y orden, resultados vacíos.
7. Parámetros desconocidos, repetidos y mal formados; varios errores simultáneos; rechazo de consultas en endpoints que no las admiten y ausencia de mutación al rechazarlas.
8. Estadísticas contrastadas tras POST, PATCH, PUT y DELETE, e independientes de consultas filtradas.
9. JSON truncado, tipo de contenido incorrecto y límite de 16 KB en POST, PUT y PATCH.
10. 404 JSON para ids ausentes válidos e inválidos, ruta desconocida y métodos no definidos; DELETE repetido; ausencia de la propiedad `stack` en errores comprobados.
11. DELETE 204 sin contenido y verificación posterior de ausencia de todos los recursos propios.

## Resultados reales

La primera ejecución dentro del sandbox no pudo conectar: `fetch failed`, cero respuestas HTTP comprobadas. Este resultado corresponde a una restricción del entorno, no demuestra un fallo de la API. Se solicitó y obtuvo ejecución fuera del sandbox para acceder al servidor local.

La ejecución HTTP fuera del sandbox pasó los 11 grupos, sin fallos ni ids propios pendientes de limpiar. Tras retirar un caso de nombre de un solo carácter para que todos los nombres creados incluyan el prefijo único, se volvió a ejecutar la versión final: **11/11 grupos correctos, 163 respuestas HTTP comprobadas, 0 fallos y 0 ids propios pendientes**, código de salida 0. Su salida exacta se conserva en [blackbox-results.txt](blackbox-results.txt).

## Limitaciones

- Es una comprobación externa del contrato: no revisa código, arquitectura, pruebas unitarias ni interfaz del navegador.
- No fuerza un error interno 500 ni prueba reinicios/persistencia, carga, concurrencia, cobertura exhaustiva de Unicode o todos los métodos HTTP posibles.
- La lectura de páginas y estadísticas no es una transacción; modificaciones de otros clientes durante esas lecturas podrían provocar diferencias legítimas. No se ha alterado el servidor para evitarlo.
- La comprobación del precio medio utiliza redondeo monetario a dos decimales, coherente con el ejemplo del contrato; el README no formaliza otro criterio para empates de redondeo.
- `finally` limpia las creaciones identificadas por respuestas POST exitosas. Una caída del proceso o pérdida de la respuesta de una creación impediría garantizar esa limpieza; no ocurrió en la ejecución registrada.
- No se afirma cobertura total ni ausencia de defectos fuera de los casos ejecutados. La revisión independiente se documenta por el responsable en `review-log.md`, que este tester no ha leído ni escrito.
