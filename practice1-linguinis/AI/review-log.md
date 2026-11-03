# Revisión de las aportaciones de IA

Este registro identifica cada aportación relevante de la IA: qué se pidió, qué devolvió, qué se aceptó, corrigió o rechazó y por qué. Al final, cada integrante escribe su revisión personal.

## Herramientas de IA utilizadas

| Herramienta | Para qué se usó |
| --- | --- |
| **Codex** (OpenAI) | 27-10 a 03-11 (mañana): implementación inicial de la API y del cliente, primer tester agent y varias simplificaciones. |
| **Claude** (chat de claude.ai) | 03-11: explicaciones y tutoría, simplificación de `src/` y de `public/app.js` a lo visto en clase, agente y skill de `.claude/`, interfaz de pizzería y documentación. |
| **Claude Code** (VS Code) | 03-11: los integrantes lanzaron el agente `api-tester`, que generó `AI/tester-report.md`. |
| **Comentarios y guía de estudio** | Los comentarios `//` de `src/` y de `public/app.js`, y la guía `LEEME-PRIMERO.md`, los escribió la IA (Codex y después Claude). Los mantenemos a propósito: nos han servido para entender qué hace cada parte y como guía para explicarlo. Los hemos leído y comprobado con el código. |

## Registro de aportaciones

| Fecha | Quién | Qué se pidió | Qué devolvió | Decisión y motivo |
| --- | --- | --- | --- | --- |
| 27-10 | Codex | Implementar la práctica a partir del enunciado y del tema de los laboratorios (Linguinis). | API Express por capas y cliente con fetch, reutilizando tema, platos, precios e imágenes de los labs. | **Aceptado con revisión.** No había una API de laboratorio previa entre nuestros archivos; se creó desde cero y se dice en el README. |
| 27-10 | Tester agent (Codex) | Generar pruebas HTTP de caja negra leyendo solo el README (prompt completo en `agents.md`). | `AI/blackbox.cjs`: 11 grupos de comprobaciones. | **Aceptado.** Se revisó que no importara `src/` ni dependencias, que usara nombres con prefijo único y que borrara solo sus propios platos. |
| 27-10 | Tester agent (Codex) | Ejecutar las pruebas contra la API. | 11/11 grupos, 163 respuestas correctas (`blackbox-results.txt`). | **Aceptado.** La primera ejecución no conectó por el entorno; no se contó como fallo de la API y se repitió. |
| 27-10 | Codex | Revisar qué no cubría el tester. | Detectó que `toFixed` podía redondear mal el precio medio. | **Corregido:** el precio medio se calcula en céntimos enteros y se explica en el README. |
| 02-11 | Codex | Las imágenes no cargaban y había demasiado código. | El fallo era el servidor apagado. Quitó Jest/Supertest (opcional) y decoración; el cliente pasó a usar PUT. | **Aceptado.** La API completa y el tester obligatorio se conservan. |
| 03-11 | Codex | Rediseño del panel. | Interfaz blanca y roja con controles reducidos. | **Rechazado más tarde:** no parecía una pizzería (ver fila «Interfaz de pizzería»). |
| 03-11 | Claude | Reescribir `src/` a nuestro nivel: el código de Codex era demasiado complejo para explicarlo. | Mismas rutas, códigos y mensajes; capas rutas → controlador → servicio → almacén con funciones normales; almacén con un array. | **Aceptado** tras pasar el tester: 11/11 grupos, 163 respuestas. |
| 03-11 | Claude | Montar el agente como en clase: archivo de agente con reglas y una skill. | `.claude/agents/api-tester.md` y `.claude/skills/api-test-conventions/SKILL.md`. | **Aceptado.** La skill la escribimos a partir de lo que ya hacía el tester; no es de la comunidad. Se acotó qué secciones del README lee para gastar menos tokens. |
| 03-11 | Agente `api-tester` (Claude Code) | Prompt: «Usa el agente api-tester para comprobar que la API cumple el contrato del README. El servidor ya está arrancado en http://localhost:3000. Sigue sus reglas y termina con el reporte en AI/tester-report.md». | `AI/tester-report.md`: 1 ejecución de `npm test`, 11/11 grupos, 163 respuestas, 0 fallos. | **Aceptado.** Comprobamos que solo escribió en `AI/` y que el resultado coincidía con el nuestro. Corregimos una frase desactualizada de `agents.md` que el propio agente señaló. |
| 03-11 | Claude | Interfaz de pizzería «de verdad» y después «más roja». | `styles.css` nuevo (cabecera roja, portada con foto, carta en tarjetas, 2 breakpoints) y textos de `index.html`. | **Aceptado.** Se aclara en la página y en el README que es el panel del personal, no la web de clientes. |
| 03-11 | Claude | Un agente que buscara una foto cada vez que el personal añade un plato. | Explicó por qué no encaja. | **Rechazado:** un agente trabaja cuando lo lanza quien programa, no dentro de la web; haría falta una API externa de imágenes con clave y licencias dudosas. En su lugar, dos dibujos propios (`pizza-generica.svg`, `pasta-generica.svg`). |
| 03-11 | Integrantes | Probar la página a mano. | Encontramos que el filtro de categoría no se aplicaba hasta pulsar «Buscar» y que el buscador no filtraba al escribir. | **Corregido por nosotros** con un evento `change` y un evento `input` en `public/app.js`. |
| 03-11 | Claude | Reducir `public/app.js` a lo visto en clase. | 7 bloques comentados; se quitaron la paginación del cliente, el diálogo propio (ahora `confirm`), `<template>`, `Promise.all` e `Intl.NumberFormat`. | **Aceptado.** Siguen todos los requisitos del cliente; comprobado en el navegador a 1280 y 390 px. |

## Límites de la revisión

- El tester no ve la implementación; quien escribió el código sí. Son papeles distintos.
- El tester no comprueba la interfaz, la arquitectura, errores 500 forzados ni peticiones simultáneas. La interfaz la comprobamos a mano.
- Pasar las 163 comprobaciones no garantiza que no haya fallos fuera de esos casos.

## Revisión personal de los integrantes

Cada integrante escribe su parte con sus palabras y la sube con su propia cuenta de GitHub. Guía de preguntas: ¿qué has leído y probado tú mismo?, ¿qué salida de la IA aceptaste, cuál corregiste o rechazaste y por qué?, ¿qué problema te encontraste y cómo lo resolviste?, ¿qué has aprendido sobre cliente-servidor y sobre dirigir un agente?







### Farid Koutrach

**Qué he probado.** Crear un plato (aparece en la carta), dejar el nombre vacío o el precio a 0 (sale el error debajo de cada campo), editar el precio y pasar un plato a agotado (se ve al momento) y eliminar (pide confirmación). En `AI/tester-report.md` el agente comprobó 163 respuestas en 11 grupos sin fallos.

**Errores que encontré y corregí yo.** El filtro de categoría no se aplicaba hasta pulsar «Buscar» y el buscador no filtraba al escribir. Añadí un evento `change` a la categoría y un evento `input` al buscador; el filtrado lo sigue haciendo el servidor.

**Qué rechacé o pedí cambiar a la IA.** El código de Codex funcionaba, pero era demasiado complejo para explicarlo, así que pedí reescribirlo con lo visto en clase y comprobé con el agente tester que seguía pasando todo. Pedí cambiar el diseño blanco por uno de pizzería. Descartamos un agente que buscara fotos al añadir un plato, porque un agente no funciona dentro de la web y haría falta una API externa; en su lugar se usa un dibujo genérico.

**Problemas que tuve.** PowerShell bloqueaba `npm` (política de ejecución); `npm start` fuera de la carpeta del proyecto daba `ENOENT`; `EADDRINUSE` porque un servidor viejo ocupaba el puerto 3000 (lo cerré con `Stop-Process`); y el navegador guardaba el CSS antiguo (Ctrl + F5).

**Qué he aprendido.** Cliente-servidor: `fetch` → ruta → controlador → servicio → almacén → JSON → la página se actualiza sin recargar. Que `fetch` no falla con un 400 o un 404 y hay que mirar `response.ok`. Y que un agente es un markdown con reglas y skills; nuestro tester es de caja negra y su reporte lo revisamos nosotros.

*Las pruebas, los errores encontrados y las decisiones son míos; le conté a Claude lo que había hecho y me ayudó a redactarlo.*


### Jorge Nuño

_(pendiente)_
