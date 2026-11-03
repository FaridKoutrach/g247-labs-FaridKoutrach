// RUTAS: relacionan "método + dirección" con la función del controlador.
// Todas empiezan por /platos porque así se montó en app.js.
const express = require('express');
const controller = require('../controllers/platosController');
const { validateQuery } = require('../validators/queryValidator');

const router = express.Router();

// Comprobaciones comunes antes de llegar a cualquier ruta de /platos.
function comprobarPeticion(req, res, next) {
  // 1) Solo GET /platos admite parámetros (?search=...). En las demás rutas
  //    no se permite ninguno: validateQuery sin { collection: true } los rechaza todos.
  const esLaLista = req.method === 'GET' && req.path === '/';
  if (!esLaLista) {
    const { errors } = validateQuery(req.query);
    if (errors.length > 0) return res.status(400).json({ errors });
  }

  // 2) Si el cliente manda datos (POST, PUT o PATCH), tienen que venir en JSON.
  const mandaDatos = ['POST', 'PUT', 'PATCH'].includes(req.method);
  if (mandaDatos && !req.is('application/json')) {
    return res.status(415).json({ error: 'Utiliza Content-Type: application/json.' });
  }

  next(); // Todo correcto: sigue hacia la ruta que toque.
}

router.use(comprobarPeticion);

router.get('/', controller.list);          // GET    /platos
router.post('/', controller.create);       // POST   /platos
router.get('/stats', controller.stats);    // GET    /platos/stats  (¡antes de /:id! si no, "stats" se tomaría como un id)
router.get('/:id', controller.get);        // GET    /platos/123
router.put('/:id', controller.replace);    // PUT    /platos/123
router.patch('/:id', controller.patch);    // PATCH  /platos/123
router.delete('/:id', controller.remove);  // DELETE /platos/123

module.exports = router;
