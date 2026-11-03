# Cómo entender esta práctica

> **Hecho con IA.** Esta guía de estudio la generó Codex el 02-11-2026 al simplificar la práctica, y Claude la actualizó el 03-11-2026 cuando se reescribió el código. Explica qué hace cada archivo y en qué orden leerlos. La hemos leído y la usamos para estudiar y preparar la presentación; no es un requisito del enunciado.

No hace falta memorizarla palabra por palabra: el enunciado exige poder explicar lo entregado. Los comentarios de cada archivo te indican su función.

## Quién usa la página

El encargado de Linguinis mantiene la carta: añade una pizza nueva, cambia un precio o marca un plato agotado con Editar → desmarcar Disponible hoy → Guardar cambios. Eliminar retira el plato de la carta. Es un prototipo de gestión; los cambios se pierden al reiniciar el servidor.

## Qué es cada cosa

| Nombre | Para qué se usa aquí |
| --- | --- |
| HTML | Coloca títulos, lista, botones y formulario: public/index.html. |
| CSS | Da colores, tamaños y distribución: public/styles.css. |
| JavaScript del navegador | Lee el formulario y actualiza la pantalla: public/app.js. |
| Node.js | Ejecuta JavaScript en tu ordenador como servidor. Lo arrancas con npm start. |
| Express | Librería que conecta una dirección y un método HTTP con una función. |
| API | Las rutas que reciben peticiones sobre platos y devuelven datos: src/routes/platos.js. |
| fetch | Función del navegador que manda una petición a la API. |
| JSON | Formato de texto para intercambiar datos, por ejemplo {"precio":10}. |
| .webp, .jpg, .png | Formatos de imagen. Las fotos ya venían en tus laboratorios. |

La API se ha creado escribiendo las rutas en src/routes/platos.js y conectándolas a Express en src/app.js con el prefijo /platos. Por ejemplo, router.get('/', controller.list) atiende GET /platos. Al arrancar src/server.js, el servidor escucha en el puerto 3000. Puedes ver los datos abriendo http://localhost:3000/platos.

## La idea en una frase

El navegador manda una petición; Express decide qué función ejecuta, valida los datos, usa la memoria y devuelve JSON; el navegador actualiza la pantalla.

```text
public/app.js → routes → controller → service → store
                              ↓
                          validators
```

## Orden para estudiarla

| Archivo | Qué debes poder explicar |
| --- | --- |
| `src/server.js` | Abre el puerto 3000 al ejecutar npm start. |
| `src/app.js` | Instala JSON, rutas, archivos estáticos y errores, en ese orden. |
| `src/routes/platos.js` | Relaciona una URL y un método HTTP con una función. |
| `src/controllers/platosController.js` | Lee req, valida con los validadores, llama al servicio y responde con res y el status correcto (`return res.status(404)...`). |
| `src/services/platosService.js` | Filtra, ordena, pagina y calcula estadísticas. Es el único que usa el almacén. |
| `src/data/store.js` | Guarda los platos en un array; los datos desaparecen al reiniciar. |
| `src/validators/` | Comprueba campos y consultas, y reúne todas las incidencias. |
| `src/middleware/` | Registra peticiones y responde a errores de forma común. |
| `public/index.html` | Estructura semántica: cabecera, carta, buscador y formulario. |
| `public/styles.css` | Flexbox, Grid, colores, foco visible y adaptación a móvil. |
| `public/app.js` | 7 bloques: hablar con la API (fetch + response.ok), mensajes y errores, pintar la carta, cargar con filtros, formulario (POST/PUT), borrar (DELETE) y botones. |
| `AI/` | Pruebas HTTP del agente y registro de su revisión. Es obligatorio. |

Ejemplo para explicarlo: «Al añadir Pizza Diavola, el formulario convierte el precio a número y manda POST /platos. La ruta llama al controlador, el controlador valida los datos (si fallan, responde 400), el servicio pide al almacén que lo guarde y el almacén genera un id. La respuesta es 201 con Location; después el cliente vuelve a pedir la carta».

## Seis operaciones que sí debes distinguir

- GET: consultar; POST: crear; DELETE: eliminar.
- PUT: sustituye los cuatro campos. Es lo que utiliza el formulario de edición.
- PATCH: cambia solo los campos enviados. También está implementado y se prueba por HTTP.
- GET /platos/stats: calcula el resumen de todos los platos.

## Ejecutarlo sin problemas con las imágenes

Desde la carpeta que contiene package.json: `npm install` y después `npm start`. Mantén esa terminal abierta y visita http://localhost:3000. Si Node está apagado, una pestaña antigua puede mostrar texto e imágenes guardados en caché, pero fallarán las nuevas descargas y las peticiones. No abras el HTML con doble clic.

En una segunda terminal, con el servidor encendido: `npm test`. Ejecuta el tester HTTP de AI/; se ha retirado Jest/Supertest, que eran una ampliación opcional.

`node_modules/` contiene Express y sus dependencias descargadas, no código escrito para la práctica: no se estudia ni se sube. `package-lock.json` se genera automáticamente para fijar versiones; tampoco se memoriza. README.md es el contrato y la explicación que pide la entrega.
