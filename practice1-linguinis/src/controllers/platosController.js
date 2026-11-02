// CONTROLADOR: req contiene la petición; res construye la respuesta HTTP.
// Solo usa el servicio. Nunca lee ni modifica el almacén directamente.
function createPlatosController(service) {
  return {
    list: (req, res) => res.json(service.list(req.query)),
    stats: (req, res) => res.json(service.stats()),
    get: (req, res) => res.json(service.get(req.params.id)),
    create(req, res) {
      const plato = service.create(req.body);
      res.location(`/platos/${plato.id}`).status(201).json(plato); // Dirección del creado.
    },
    replace: (req, res) => res.json(service.update(req.params.id, req.body, false)),
    patch: (req, res) => res.json(service.update(req.params.id, req.body, true)),
    remove(req, res) {
      service.remove(req.params.id);
      res.status(204).end(); // 204 significa éxito sin cuerpo de respuesta.
    }
  };
}

module.exports = { createPlatosController };
