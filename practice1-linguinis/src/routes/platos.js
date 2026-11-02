// RUTAS: asocian cada combinación de método y URL con un controlador.
const express = require('express');
const { createPlatosController } = require('../controllers/platosController');

function createPlatosRouter(service) {
  const router = express.Router();
  const controller = createPlatosController(service);
  router.use((req, res, next) => {
    // La colección admite filtros; los demás endpoints no admiten query.
    if (!(req.method === 'GET' && req.path === '/')) service.checkQuery(req.query);
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
      const error = new Error('Utiliza Content-Type: application/json.');
      error.status = 415;
      return next(error);
    }
    next(); // Continúa hacia la ruta que coincide con la petición.
  });
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/stats', controller.stats); // Antes de /:id: stats no es un id.
  router.get('/:id', controller.get);
  router.put('/:id', controller.replace);
  router.patch('/:id', controller.patch);
  router.delete('/:id', controller.remove);
  return router;
}

module.exports = { createPlatosRouter };
