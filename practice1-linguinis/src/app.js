// MONTAJE DEL SERVIDOR: conecta las piezas. No abre el puerto; lo hace server.js.
const express = require('express');
const path = require('node:path');
const { createMemoryStore } = require('./data/store');
const { createPlatosService } = require('./services/platosService');
const { createPlatosRouter } = require('./routes/platos');
const { logger } = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errors');

function createApp({ store = createMemoryStore() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('query parser', 'simple'); // Convierte ?search=pizza en req.query.
  app.use(logger); // Un middleware se ejecuta antes de pasar a la siguiente pieza.
  app.use(express.json({ limit: '16kb' })); // Convierte el JSON recibido en req.body.
  app.use('/platos', createPlatosRouter(createPlatosService(store)));
  app.use(express.static(path.join(__dirname, '..', 'public'))); // Página e imágenes.
  app.use(notFound); // Si ninguna ruta anterior respondió, enviamos 404.
  app.use(errorHandler); // Siempre al final: recibe los errores de las otras piezas.
  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
