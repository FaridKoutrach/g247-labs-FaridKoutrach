// LOGGER: un middleware que escribe en la terminal cada petición.
// Ejemplo de lo que verás: GET /platos?categoria=pizza
function logger(req, res, next) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next(); // ¡Importante! Sin next() la petición se quedaría aquí parada.
}

module.exports = logger;
