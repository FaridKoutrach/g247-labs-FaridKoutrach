// ERRORES: respuestas comunes cuando algo va mal. Siempre en JSON.

// Ninguna ruta ha respondido: la dirección no existe.
function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada.' });
}

// Manejador de errores. Express lo reconoce porque tiene 4 parámetros (err primero).
// Le llegan sobre todo errores de express.json() al leer el cuerpo.
function errorHandler(err, req, res, next) {
  // El cliente dijo "te mando JSON" pero el texto no es JSON válido, p. ej. {"nombre":
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ errors: [{ field: 'body', message: 'El cuerpo no contiene JSON válido.' }] });
  }
  // El cuerpo ocupa más de 16 KB.
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo supera el límite de 16 KB.' });
  }
  // Codificación que express.json() no sabe leer.
  if (err.status === 415) {
    return res.status(415).json({ error: 'Utiliza Content-Type: application/json.' });
  }
  // Cualquier otro fallo es culpa nuestra: 500, sin enseñar detalles internos al cliente.
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = { notFound, errorHandler };
