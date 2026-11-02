# Revisión de las aportaciones de IA

Este registro lo escribe el asistente principal que implementó y revisó la práctica. No se atribuye al estudiante una revisión que todavía no ha realizado.

| Fecha | Qué se pidió / aportación | Revisión y decisión |
| --- | --- | --- |
| 27-10-2026 | Implementar la práctica a partir del enunciado y los laboratorios de Linguinis. | Se reutilizaron tema, platos, precios e imágenes. No había backend Express entre los materiales disponibles; se creó uno y se declaró esta limitación en README. |
| 27-10-2026 | Un único tester agent recibió README y acceso HTTP, sin leer implementación. | Generó AI/blackbox.cjs con 11 grupos. Se revisó que no importase src ni dependencias, que usase nombres únicos y que borrase únicamente sus propios ids. Se aceptó el aislamiento mediante prefijo UUID y limpieza en finally. |
| 27-10-2026 | El tester informó 11 grupos y 163 respuestas HTTP correctas. | La primera ejecución no conectó por restricciones del entorno; no se contó como fallo de la API. La ejecución autorizada quedó en blackbox-results.txt. Se repitió desde el asistente principal y volvió a pasar con cero registros propios pendientes. |
| 27-10-2026 | Evaluar la cobertura del agente, no aceptar su salida como prueba total. | La revisión adicional identificó que toFixed puede redondear mal una media monetaria (2 y 2.01). Se cambió a sumar céntimos enteros, se explicitó el criterio en README y se comprobó con una prueba de regresión. La suite opcional de aquel momento pasó 44 tests. |
| 27-10-2026 | Verificar cliente en navegador. | Crear, editar, filtros, vacío y móvil comprobados. La confirmación nativa bloqueó la automatización; se sustituyó por dialog HTML y se verificaron Cancelar y Sí, eliminar. Se corrigió también Siguiente para no mostrar páginas vacías al haber exactamente seis platos. |
| 02-11-2026 | El usuario notificó imágenes ausentes y pidió menos código, comentado. | Se observaron cinco imágenes sin cargar y un servidor apagado. Tras reiniciarlo, las ocho imágenes de la página cargaron con dimensiones válidas. Se añadió alternativa al logo para fallos de foto y correspondencia de nombres sin distinguir mayúsculas. |
| 02-11-2026 | Simplificar el material que debe explicar el estudiante. | Se retiraron Jest/Supertest y su suite opcional, decoración y documentación duplicada. Se conservó la API completa y el tester obligatorio. El cliente pasó a PUT completo para evitar comparar campos; PATCH sigue disponible. Se añadieron comentarios por función y LEEME-PRIMERO.md. |

## Límites de la revisión

Verificación de la versión simplificada (02-11-2026): `npm test` pasó 11 grupos y 163 respuestas HTTP, con cero fallos y cero ids propios pendientes. En navegador se comprobaron campos vacíos, creación, edición PUT, paginación, búsqueda con disponibilidad, borrado y lista vacía. Las ocho imágenes cargaron correctamente; a 390 px el contenido midió 375 px (sin desbordamiento horizontal). No se observaron errores de JavaScript durante esas operaciones.

- El tester no ha visto la implementación; el asistente principal sí. Son papeles distintos.
- Las 44 pruebas Jest describen una versión anterior y ya no forman parte de la entrega simplificada. `npm test` ejecuta ahora el tester HTTP con el servidor iniciado.
- El tester no verifica arquitectura, interfaz, fallos 500 forzados ni concurrencia. Sus lecturas de colección y estadísticas requieren que nadie cambie los datos mientras compara.
- El criterio de redondeo quedó explicitado después del contrato inicial recibido por el tester; su comprobación por céntimos es compatible con el contrato final.
- Falta la revisión personal del estudiante: debe leer, probar y poder explicar los archivos, y completar su entrega en Canvas. No se fabrican evidencias de tutorías anteriores ni contribuciones de otra persona.

## Rediseño solicitado el 03-11-2026

El asistente principal cambió el cliente a blanco y rojo y aclaró que lo usa el encargado del restaurante. Se retiraron la foto decorativa, las tarjetas grandes de estadísticas y los controles de disponibilidad/ordenación; la API conserva todas esas consultas. Se mantiene búsqueda y filtro por categoría. Los avisos de campo se retiran al corregirlos y se validan de nuevo al guardar.

Comprobaciones de esta versión: npm test pasó 11 grupos, 163 respuestas y cero fallos; no dejó ids propios. En navegador se verificaron creación de un plato temporal, edición de precio y disponibilidad, búsqueda combinada con categoría, paginación, cancelación del diálogo de borrado y vuelta de edición a creación. El dato temporal se eliminó después por HTTP (204). Se revisó el diseño a 1280 px y 390 px; en móvil el contenido midió 375 px, sin desbordamiento. Las siete imágenes cargaron y no se observaron errores JavaScript. La API y sus capas no se modificaron. Sigue pendiente la revisión personal del estudiante.
