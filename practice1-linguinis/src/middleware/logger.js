// LOGGER: escribe método, URL, estado y tiempo cuando termina cada respuesta.
function logger(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`);
    }
  });
  next();
}

module.exports = { logger };
