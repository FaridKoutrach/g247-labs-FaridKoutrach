// CONSULTA: los valores de la URL llegan como texto; aquí se validan y convierten.
// Política elegida: un parámetro desconocido, repetido o inválido produce 400.
function validateQuery(query, { collection = false } = {}) {
  const allowed = collection ? ['search', 'disponible', 'categoria', 'sort', 'order', 'limit', 'offset'] : [];
  const errors = [];
  const data = { search: '', sort: 'nombre', order: 'asc', limit: 100, offset: 0 };
  for (const [field, value] of Object.entries(query)) {
    if (!allowed.includes(field)) {
      errors.push({ field, message: 'Parámetro de consulta desconocido.' });
      continue;
    }
    if (typeof value !== 'string') {
      errors.push({ field, message: 'El parámetro debe aparecer una sola vez como texto.' });
      continue;
    }
    let valid = true;
    if (field === 'search') valid = value.trim().length <= 80;
    if (field === 'disponible') valid = ['true', 'false'].includes(value);
    if (field === 'categoria') valid = ['pizza', 'pasta'].includes(value);
    if (field === 'sort') valid = ['nombre', 'precio'].includes(value);
    if (field === 'order') valid = ['asc', 'desc'].includes(value);
    if (field === 'limit' || field === 'offset') {
      const min = field === 'limit' ? 1 : 0;
      const max = field === 'limit' ? 100 : 1000000;
      // La expresión regular exige solo dígitos: nada de negativos, letras o puntos.
      valid = /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= min && Number(value) <= max;
    }
    if (!valid) errors.push({ field, message: 'Valor de consulta no permitido. Consulta las reglas del README.' });
    else if (field === 'disponible') data[field] = value === 'true';
    else if (field === 'limit' || field === 'offset') data[field] = Number(value);
    else data[field] = value.trim();
  }
  return { data, errors };
}

module.exports = { validateQuery };
