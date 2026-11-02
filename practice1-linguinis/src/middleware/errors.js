// ERRORES: todas las respuestas de error son JSON y ninguna expone la traza.
function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada.' });
}

// Los cuatro argumentos son necesarios para que Express lo reconozca.
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ errors: [{ field: 'body', message: 'El cuerpo no contiene JSON válido.' }] });
  }
  if (error.status === 400) {
    return res.status(400).json({ errors: error.errors || [{ field: 'request', message: 'Petición incorrecta.' }] });
  }
  const messages = { 404: 'Plato no encontrado.', 413: 'El cuerpo supera el límite de 16 KB.', 415: 'Utiliza Content-Type: application/json.' };
  if (messages[error.status]) return res.status(error.status).json({ error: messages[error.status] });
  if (process.env.NODE_ENV !== 'test') console.error(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = { notFound, errorHandler };
