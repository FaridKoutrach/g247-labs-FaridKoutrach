# Linguinis Pizzeria · Foundations API

**Integrante:** Farid Koutrach. Modalidad individual.

**Tema:** la pizzería de los laboratorios del bloque I. El único recurso es el **plato** (`/platos`): las pizzas y las pastas son categorías del mismo recurso, no recursos distintos.

**Ubicación en el repositorio de laboratorios:** carpeta `practice1-linguinis/` de [g247-labs-FaridKoutrach](https://github.com/FaridKoutrach/g247-labs-FaridKoutrach).

## Recurso y reglas (contrato definido antes de implementar)

| Campo | Tipo | Regla |
| --- | --- | --- |
| `id` | string | UUID generado exclusivamente por el servidor. Se ignora cualquier id enviado por el cliente. |
| `nombre` | string | Obligatorio; entre 1 y 80 caracteres después de eliminar espacios exteriores. |
| `precio` | number | Obligatorio; finito, entre 0.01 y 100 euros inclusive, con un máximo de dos decimales. No se aceptan strings numéricos. |
| `disponible` | boolean | Obligatorio; solo `true` o `false`, nunca sus equivalentes en texto. |
| `categoria` | string | Obligatorio; exactamente `pizza` o `pasta`. |

Ejemplo (el identificador de la respuesta será diferente):

```json
{"id":"UUID","nombre":"Pizza Margherita","precio":9.9,"disponible":true,"categoria":"pizza"}
```

Los campos desconocidos del cuerpo se ignoran y no se guardan. Un PATCH sin ningún campo editable devuelve 400. Se aceptan nombres repetidos. Los datos viven únicamente en memoria: reiniciar el proceso restaura los seis platos de ejemplo y elimina los cambios.

## Ejecutar

Requiere Node.js 18 o superior y npm. Desde esta carpeta:

```sh
npm install
npm start
```

Abrir http://localhost:3000. No abrir `public/index.html` directamente: `fetch` necesita el servidor. Para elegir otro puerto en PowerShell: `$env:PORT=3001; npm start`.

**Para estudiar:** empieza por [LEEME-PRIMERO.md](LEEME-PRIMERO.md). Mantén abierta la terminal de `npm start`: con el servidor apagado una pestaña antigua puede mostrar contenido en caché mientras fallan imágenes y peticiones nuevas.

```sh
npm test
```

Ejecutar `npm test` en una segunda terminal, con el servidor ya iniciado. Lanza las comprobaciones HTTP de caja negra del agente. `npm run test:blackbox` es un alias del mismo comando. Admite `BASE_URL` para un puerto diferente y limpia los platos que crea. La ampliación opcional de Jest/Supertest se ha retirado para reducir el contenido a estudiar; se mantiene el tester de IA obligatorio.

## Contrato HTTP

Todas las respuestas de la API son JSON salvo DELETE exitoso (sin cuerpo). POST, PUT y PATCH requieren `Content-Type: application/json`. El tamaño máximo del cuerpo es 16 KB.

| Método | Ruta | Consulta / cuerpo | Éxito | Errores |
| --- | --- | --- | --- | --- |
| GET | `/platos` | Filtros indicados abajo | 200, array de platos; `[]` si no hay resultados | 400 consulta inválida; 500 error interno |
| POST | `/platos` | Los cuatro campos editables | 201, plato creado; cabecera `Location: /platos/<id>` | 400 validación/JSON; 413 cuerpo demasiado grande; 415 tipo de contenido; 500 |
| GET | `/platos/stats` | Sin parámetros | 200, resumen global calculado en esa petición | 400 consulta; 500 |
| GET | `/platos/:id` | Sin parámetros | 200, plato | 400 consulta; 404 inexistente; 500 |
| PUT | `/platos/:id` | Los cuatro campos editables | 200, plato sustituido conservando id | 400 consulta/validación/JSON; 404 inexistente; 413; 415; 500 |
| PATCH | `/platos/:id` | Uno o varios campos editables | 200, plato actualizado conservando el resto | 400 consulta/validación/JSON; 404 inexistente; 413; 415; 500 |
| DELETE | `/platos/:id` | Sin cuerpo ni parámetros | 204, sin cuerpo | 400 consulta; 404 inexistente; 500 |

Una ruta no definida o un método no implementado con una petición bien formada responde 404 JSON. Express también proporciona HEAD y OPTIONS automáticamente. Un id que no existe, incluso si no tiene formato UUID, responde 404. Los errores 400 siempre tienen forma `{"errors":[{"field":"precio","message":"…"}]}` y contienen todas las incidencias de la validación aplicada. Los demás errores usan `{"error":"mensaje"}`. Nunca se envían trazas al cliente.

### Consulta combinable de GET /platos

| Parámetro | Valores / comportamiento |
| --- | --- |
| `search` | Subcadena de `nombre`, sin distinguir mayúsculas, eliminando espacios exteriores; máximo 80 caracteres. Vacío equivale a no buscar. |
| `disponible` | Literal `true` o `false`. |
| `categoria` | `pizza` o `pasta`. |
| `sort` | `nombre` o `precio`; por defecto `nombre`. Empates conservan el orden de inserción. |
| `order` | `asc` o `desc`; por defecto `asc`. Puede usarse sin `sort`. |
| `limit` | Entero decimal entre 1 y 100; por defecto 100. |
| `offset` | Entero decimal entre 0 y 1000000; por defecto 0. |

**Política única:** los parámetros de consulta desconocidos, repetidos o mal formados producen 400; no se ignoran. Los demás endpoints no aceptan parámetros de consulta. Primero se filtra, después se ordena y finalmente se aplica la ventana `offset/limit`. El resumen de `/stats` siempre considera la colección completa.

### Ejemplos de petición y respuesta

En PowerShell usar `curl.exe` en lugar del alias `curl`. Los ejemplos con cuerpos usan archivos para evitar diferencias de comillas entre terminales. Crear `plato.json` con el JSON siguiente:

```json
{"nombre":"Pizza Margherita","precio":9.9,"disponible":true,"categoria":"pizza"}
```

```sh
curl -i -X POST http://localhost:3000/platos -H "Content-Type: application/json" --data-binary @plato.json
```

Respuesta: 201, `Location: /platos/<id>` y el objeto de ejemplo con su UUID real. Sustituir `ID` en los ejemplos siguientes por ese UUID.

```sh
curl "http://localhost:3000/platos?search=mar&disponible=true&categoria=pizza&sort=precio&order=asc&limit=10&offset=0"
curl http://localhost:3000/platos/ID
curl -i -X PUT http://localhost:3000/platos/ID -H "Content-Type: application/json" --data-binary @plato.json
```

Respuestas: 200 y un array de objetos en la colección; 200 y un objeto en GET individual y PUT. Para PATCH, crear `cambio.json` con `{"disponible":false}`:

```sh
curl -i -X PATCH http://localhost:3000/platos/ID -H "Content-Type: application/json" --data-binary @cambio.json
```

Respuesta 200: `{"id":"ID","nombre":"Pizza Margherita","precio":9.9,"disponible":false,"categoria":"pizza"}`.

```sh
curl http://localhost:3000/platos/stats
```

Con los seis platos iniciales: `{"total":6,"disponibles":5,"precioMedio":9.52,"porCategoria":{"pizza":3,"pasta":3}}` (200). Se recalcula tras cualquier cambio. El precio medio se calcula en céntimos enteros y se redondea al céntimo más cercano (medio céntimo hacia arriba); en una colección vacía vale 0. Los precios proceden de los laboratorios; la disponibilidad inicial es de demostración.

```sh
curl -i -X DELETE http://localhost:3000/platos/ID
curl -i http://localhost:3000/platos/ID
curl -i "http://localhost:3000/platos?disponible=si&limit=-1"
```

Respuestas respectivas: 204 sin cuerpo; 404 `{"error":"Plato no encontrado."}`; 400 con incidencias para `disponible` y `limit`. Un POST con `{}` genera las cuatro incidencias de campos obligatorios.

**PUT frente a PATCH:** PUT sustituye todos los campos editables y exige los cuatro; PATCH solo valida y actualiza los recibidos. La edición del navegador usa PUT y envía los cuatro campos del formulario. PATCH está disponible para clientes HTTP y se comprueba con el tester.

## Arquitectura

```text
src/server.js                  Inicio y puerto
src/app.js                     Configuración Express exportable
src/routes/platos.js           Rutas ligeras; /stats antes de /:id
src/controllers/platosController.js  Traducción HTTP
src/services/platosService.js  Operaciones, filtros y agregado
src/data/store.js              Adaptador sustituible de memoria
src/validators/platoValidator.js     Validación completa/parcial
src/validators/queryValidator.js     Consulta estricta
src/middleware/logger.js      Método, URL, estado y duración
src/middleware/errors.js      404 y errores centralizados
public/                       HTML, CSS, JS e imágenes locales
AI/                           Tester HTTP, contrato y revisión
```

El controlador solo llama al servicio. El servicio recibe un almacén con `list`, `get`, `create`, `replace` y `remove`; no conoce el Map interno. Sustituir el adaptador permite cambiar el almacenamiento. `createApp({ store })` permite conectar otro adaptador.

`express.static` se instala en `src/app.js`, después de las rutas de la API y antes del 404. Sirve `public/` usando una ruta absoluta independiente del directorio de ejecución. Página y API comparten origen; se usan URLs relativas y no hace falta CORS. El manejador de errores es el último middleware.

El filtrado se hace en el servidor para aplicar las mismas reglas a cualquier cliente y no tener que descargar toda la colección. El navegador solo construye la query con `URLSearchParams`. La interfaz es un panel para el encargado: permite buscar por nombre y categoría, añadir platos, editar precio y disponibilidad, y retirar platos. Los filtros por disponibilidad y las ordenaciones siguen disponibles en la API, aunque se han retirado sus controles de la pantalla para simplificarla. Comprueba `response.ok`, muestra actividad durante las peticiones, presenta errores junto a los campos, confirma los borrados y actualiza la lista sin recargar. Los nombres se insertan con `textContent` para que se traten como texto.

Las seis fotos se asocian a los nombres iniciales sin distinguir mayúsculas. Un plato nuevo o renombrado sin foto conocida muestra el logo; no se inventa una fotografía ni se incorpora subida de archivos. La página muestra seis resultados y solicita uno adicional para saber si hay una página siguiente.

## Comprobación contra el enunciado

| Requisito | Dónde se cumple |
| --- | --- |
| Tema propio y cinco campos | Platos de los laboratorios: id, nombre, precio, disponible, categoria. |
| CRUD, PUT y PATCH, Location y 204 | routes/platos.js y controllers/platosController.js. |
| Capas separadas y memoria sustituible | routes → controllers → services → data/store.js. |
| Filtros, dos ordenaciones y ventana combinables | validators/queryValidator.js y services/platosService.js. |
| Agregado calculado y errores JSON | /platos/stats y middleware/errors.js. |
| Validación completa/parcial y todas las incidencias | validators/platoValidator.js. |
| HTML semántico, fetch, errores de campo, carga y lista vacía | public/index.html y public/app.js. |
| Flexbox, Grid, foco y breakpoint | public/styles.css, con bloques comentados. |
| Tester agent y revisión crítica | AI/agents.md, AI/blackbox.cjs y AI/review-log.md. |

Los requisitos externos al código son publicar la versión en GitHub y entregar su enlace y SHA en Canvas. No se ha encontrado código de una API de laboratorio entre los materiales aportados; esa limitación se declara abajo.

## Relación con los laboratorios

Se retoman el tema, el nombre del restaurante, los seis platos, las imágenes aportadas, la estructura semántica, la identidad de la pizzería (ahora con una interfaz blanca y roja) y los patrones Flexbox, Grid y breakpoint del laboratorio. Se corrigen las rutas absolutas de imágenes para que funcionen en otros equipos. Los ejercicios JavaScript disponibles son de sintaxis inicial; no se ha encontrado una API Express previa entre los archivos facilitados. Por eso el backend se implementa aquí desde cero y no se afirma reutilizar uno inexistente. No se incorporan login, Python ni páginas ajenas al recurso.

## IA, revisión y entrega

`AI/agents.md` documenta el único tester agent, su contrato y sus comprobaciones HTTP. `AI/review-log.md` distingue las aportaciones, la revisión real y las limitaciones. La aplicación se ha elaborado con asistencia de IA; el estudiante debe revisar y poder explicar el contenido antes de entregar.

La entrega en Canvas es el **3 de noviembre de 2026**, antes de la hora indicada en la actividad. La entrega requiere un repositorio GitHub y el SHA de la versión publicada. No basta con esta carpeta local. Tras publicar, ejecutar `git rev-parse HEAD` en el repositorio para obtener el SHA. No se inventan contribuciones, tutorías pasadas ni identidades de colaboradores.
