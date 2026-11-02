# Cómo entender esta práctica

No hace falta memorizarla palabra por palabra: el enunciado exige poder explicar lo entregado. Los comentarios de cada archivo te indican su función.

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
| `src/controllers/platosController.js` | Lee req y responde con res y el status correcto. |
| `src/services/platosService.js` | Valida, filtra, ordena y calcula estadísticas. |
| `src/data/store.js` | Guarda platos en un Map; los datos desaparecen al reiniciar. |
| `src/validators/` | Comprueba campos y consultas, y reúne todas las incidencias. |
| `src/middleware/` | Registra peticiones y responde a errores de forma común. |
| `public/index.html` | Estructura semántica, formulario y plantilla de una fila. |
| `public/styles.css` | Flexbox, Grid, colores, foco visible y adaptación a móvil. |
| `public/app.js` | fetch, validación inicial y eventos de crear/editar/borrar/buscar. |
| `AI/` | Pruebas HTTP del agente y registro de su revisión. Es obligatorio. |

Ejemplo para explicarlo: «Al añadir Pizza Diavola, el formulario convierte el precio a número y manda POST /platos. La ruta llama al controlador, el servicio valida y el almacén genera un id. La respuesta es 201 con Location; después el cliente vuelve a pedir la carta».

## Seis operaciones que sí debes distinguir

- GET: consultar; POST: crear; DELETE: eliminar.
- PUT: sustituye los cuatro campos. Es lo que utiliza el formulario de edición.
- PATCH: cambia solo los campos enviados. También está implementado y se prueba por HTTP.
- GET /platos/stats: calcula el resumen de todos los platos.

## Ejecutarlo sin problemas con las imágenes

Desde la carpeta que contiene package.json: `npm install` y después `npm start`. Mantén esa terminal abierta y visita http://localhost:3000. Si Node está apagado, una pestaña antigua puede mostrar texto e imágenes guardados en caché, pero fallarán las nuevas descargas y las peticiones. No abras el HTML con doble clic.

En una segunda terminal, con el servidor encendido: `npm test`. Ejecuta el tester HTTP de AI/; se ha retirado Jest/Supertest, que eran una ampliación opcional.

`node_modules/` contiene Express y sus dependencias descargadas, no código escrito para la práctica: no se estudia ni se sube. `package-lock.json` se genera automáticamente para fijar versiones; tampoco se memoriza. README.md es el contrato y la explicación que pide la entrega.
