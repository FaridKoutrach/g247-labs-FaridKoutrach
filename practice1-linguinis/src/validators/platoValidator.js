// VALIDADOR: devuelve datos limpios y TODAS las incidencias, sin guardar nada.
const fields = ['nombre', 'precio', 'disponible', 'categoria'];

// partial=false: POST/PUT exigen todo. partial=true: PATCH solo valida lo recibido.
function validatePlato(body, { partial = false } = {}) {
  const errors = [];
  const data = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data, errors: [{ field: 'body', message: 'El cuerpo debe ser un objeto JSON.' }] };
  }
  // Recorrer solo estos campos hace que id y propiedades desconocidas se ignoren.
  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      if (!partial) errors.push({ field, message: 'Este campo es obligatorio.' });
      continue;
    }
    const value = body[field];
    if (field === 'nombre') {
      if (typeof value !== 'string' || !value.trim() || value.trim().length > 80) {
        errors.push({ field, message: 'Escribe un nombre de entre 1 y 80 caracteres.' });
      } else data.nombre = value.trim();
    }
    if (field === 'precio') {
      // El precio * 100 debe ser entero; la tolerancia compensa decimales binarios.
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0.01 || value > 100 || Math.abs(value * 100 - Math.round(value * 100)) > 1e-8) {
        errors.push({ field, message: 'El precio debe ser un número entre 0,01 y 100, con hasta dos decimales.' });
      } else data.precio = value;
    }
    if (field === 'disponible') {
      if (typeof value !== 'boolean') errors.push({ field, message: 'La disponibilidad debe ser true o false.' });
      else data.disponible = value;
    }
    if (field === 'categoria') {
      if (!['pizza', 'pasta'].includes(value)) errors.push({ field, message: 'Selecciona pizza o pasta.' });
      else data.categoria = value;
    }
  }
  if (partial && !fields.some(field => Object.prototype.hasOwnProperty.call(body, field))) {
    errors.push({ field: 'body', message: 'Envía al menos un campo editable.' });
  }
  return { data, errors };
}

module.exports = { validatePlato };
