// CONTROLADOR: el "camarero". Lee la petición (req), comprueba los datos,
// pide el trabajo al servicio y contesta con res + el código de estado correcto.
// Nunca toca el almacén directamente: siempre pasa por el servicio.
const service = require('../services/platosService');
const { validatePlato } = require('../validators/platoValidator');
const { validateQuery } = require('../validators/queryValidator');

// GET /platos  (admite ?search=...&categoria=...&sort=...&order=...&limit=...&offset=...)
function list(req, res) {
  const { data: opciones, errors } = validateQuery(req.query, { collection: true });
  if (errors.length > 0) return res.status(400).json({ errors });
  res.json(service.list(opciones));
}

// GET /platos/stats
function stats(req, res) {
  res.json(service.stats());
}

// GET /platos/:id
function get(req, res) {
  const plato = service.getById(req.params.id);
  if (!plato) return res.status(404).json({ error: 'Plato no encontrado.' });
  res.json(plato);
}

// POST /platos  → 201 Created + cabecera Location con la dirección del plato nuevo.
function create(req, res) {
  const { data, errors } = validatePlato(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const plato = service.create(data);
  res.status(201).location(`/platos/${plato.id}`).json(plato);
}

// PUT /platos/:id  → sustituye el plato entero: exige los 4 campos.
function replace(req, res) {
  const actual = service.getById(req.params.id);
  if (!actual) return res.status(404).json({ error: 'Plato no encontrado.' });

  const { data, errors } = validatePlato(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  res.json(service.update(req.params.id, data));
}

// PATCH /platos/:id  → cambia solo los campos que lleguen.
function patch(req, res) {
  const actual = service.getById(req.params.id);
  if (!actual) return res.status(404).json({ error: 'Plato no encontrado.' });

  const { data, errors } = validatePlato(req.body, { partial: true });
  if (errors.length > 0) return res.status(400).json({ errors });

  // ...actual pone los campos antiguos; ...data encima pisa solo los que han cambiado.
  res.json(service.update(req.params.id, { ...actual, ...data }));
}

// DELETE /platos/:id  → 204 No Content (todo bien, pero sin cuerpo).
function remove(req, res) {
  const actual = service.getById(req.params.id);
  if (!actual) return res.status(404).json({ error: 'Plato no encontrado.' });

  service.remove(req.params.id);
  res.status(204).end();
}

module.exports = { list, stats, get, create, replace, patch, remove };
