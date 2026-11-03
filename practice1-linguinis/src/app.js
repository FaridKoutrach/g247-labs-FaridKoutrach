// APP: aquí se monta el servidor pieza a pieza.
// El ORDEN importa: Express prueba los app.use de arriba abajo.
const express = require('express');
const path = require('node:path');
const platosRouter = require('./routes/platos');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

// 1) Escribe en la terminal cada petición que llega (GET /platos ...).
app.use(logger);

// 2) Convierte el JSON que manda el cliente en un objeto: req.body.
//    Si ocupa más de 16 KB, se rechaza (error 413).
app.use(express.json({ limit: '16kb' }));

// 3) La API: todo lo que empiece por /platos lo atiende el router.
app.use('/platos', platosRouter);

// 4) La página web: index.html, styles.css, app.js e imágenes de la carpeta public/.
app.use(express.static(path.join(__dirname, '..', 'public')));

// 5) Si nadie ha respondido todavía, la ruta no existe: 404.
app.use(notFound);

// 6) Siempre el último: recoge los errores que lancen las piezas anteriores.
app.use(errorHandler);

// Se exporta sin abrir el puerto: así server.js (y el tester) pueden usarla.
module.exports = app;
