---
name: api-test-conventions
description: Convención para escribir y ejecutar las pruebas HTTP de caja negra de la API de platos (AI/blackbox.cjs). Úsala siempre que crees, amplíes o ejecutes esas pruebas.
---

# Convención de pruebas de la API (Linguinis)

## Dónde va cada cosa
- Pruebas: `AI/blackbox.cjs` (un solo archivo).
- Salida de la última ejecución: `AI/blackbox-results.txt`.
- Registro del agente (prompt, contrato, comprobaciones, límites): `AI/agents.md`.
- Nada de pruebas dentro de `src/` ni de `public/`.

## Cómo se escriben
- Node 18+ y solo `fetch`, `node:assert/strict` y `node:crypto`. Sin Jest, sin Supertest, sin `require` de la app: se prueba por HTTP como un cliente cualquiera.
- La URL sale de `BASE_URL` (por defecto `http://localhost:3000`).
- Las pruebas se agrupan con `group('qué se comprueba', async () => { ... })`. Cada grupo imprime `PASS` o `FAIL` con su nombre.
- Un grupo por tema: listado y stats; POST y Location; validación del cuerpo; límites de precio y nombre; PUT frente a PATCH; filtros, orden y paginación; query inválida; stats tras cambios; JSON mal formado, 415 y 413; 404; limpieza.
- Cada comprobación compara tres cosas: código de estado, cabeceras importantes (`Location`, `Content-Type`) y cuerpo.
- Errores 400: el cuerpo es `{ errors: [{ field, message }] }` y se comprueba la lista de `field`, no el texto del mensaje. Resto de errores: `{ error: '...' }`.

## Datos de prueba
- Cada ejecución genera un prefijo único `BB-<uuid>` y todos los platos que crea llevan ese prefijo en el nombre.
- No se supone que la colección esté vacía ni que tenga los 6 platos iniciales.
- Se apunta cada id creado y en `finally` se borran SOLO esos ids. Nunca se borra un plato que no haya creado la prueba.

## Cómo se ejecuta y se informa
1. Servidor arrancado en una terminal: `npm start`.
2. En otra terminal: `npm test` (equivale a `node AI/blackbox.cjs`).
3. Al final se imprime un resumen JSON: `groups`, `passed`, `failed`, `responsesChecked`, `leftoverOwnedIds` (debe ser `[]`).
4. La salida real se copia a `AI/blackbox-results.txt`. Nunca se inventan resultados.
