// VALIDADOR DE LA CONSULTA: lo que va después del ? en la URL.
// Ejemplo: /platos?categoria=pizza&sort=precio&limit=6  →  req.query = { categoria: 'pizza', sort: 'precio', limit: '6' }
// OJO: en la URL todo llega como TEXTO ('6', 'true'). Aquí se comprueba y se convierte.
// Regla elegida: un parámetro desconocido, repetido o con un valor no válido → 400.
const PERMITIDOS = ['search', 'disponible', 'categoria', 'sort', 'order', 'limit', 'offset'];

// ¿Es un texto formado solo por dígitos y está entre min y max? ('6' sí; '-1', '2.5' o 'abc' no)
function esEnteroEntre(texto, min, max) {
  if (!/^\d+$/.test(texto)) return false; // /^\d+$/ = "solo dígitos del principio al final".
  const numero = Number(texto);
  return numero >= min && numero <= max;
}

// collection = true  → GET /platos: se aceptan los parámetros PERMITIDOS.
// collection = false → resto de rutas: no se acepta ningún parámetro.
function validateQuery(query, { collection = false } = {}) {
  const errors = [];
  // Valores por defecto si el cliente no dice nada.
  const data = { search: '', sort: 'nombre', order: 'asc', limit: 100, offset: 0 };

  // Object.entries convierte { a: '1', b: '2' } en [['a', '1'], ['b', '2']] para recorrerlo.
  for (const [campo, valor] of Object.entries(query)) {
    if (!collection || !PERMITIDOS.includes(campo)) {
      errors.push({ field: campo, message: 'Parámetro de consulta desconocido.' });
      continue;
    }
    // Si el parámetro se repite (?limit=1&limit=2) llega como lista, no como texto.
    if (typeof valor !== 'string') {
      errors.push({ field: campo, message: 'El parámetro debe aparecer una sola vez como texto.' });
      continue;
    }

    let valido = true;
    if (campo === 'search') valido = valor.trim().length <= 80;
    if (campo === 'disponible') valido = valor === 'true' || valor === 'false';
    if (campo === 'categoria') valido = valor === 'pizza' || valor === 'pasta';
    if (campo === 'sort') valido = valor === 'nombre' || valor === 'precio';
    if (campo === 'order') valido = valor === 'asc' || valor === 'desc';
    if (campo === 'limit') valido = esEnteroEntre(valor, 1, 100);
    if (campo === 'offset') valido = esEnteroEntre(valor, 0, 1000000);

    if (!valido) {
      errors.push({ field: campo, message: 'Valor de consulta no permitido. Consulta las reglas del README.' });
    } else if (campo === 'disponible') {
      data.disponible = valor === 'true'; // 'true' (texto) → true (booleano)
    } else if (campo === 'limit' || campo === 'offset') {
      data[campo] = Number(valor); // '6' (texto) → 6 (número)
    } else {
      data[campo] = valor.trim();
    }
  }

  return { data, errors };
}

module.exports = { validateQuery };
