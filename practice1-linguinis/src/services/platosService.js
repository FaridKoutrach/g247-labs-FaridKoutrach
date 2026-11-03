// SERVICIO: la "cocina". Hace el trabajo con los datos (filtrar, ordenar,
// calcular estadísticas) y es el único que habla con el almacén.
// No sabe nada de req ni de res: eso es cosa del controlador.
const store = require('../data/store');

// Lista con filtros, orden y paginación.
// "opciones" ya viene validada, p. ej.:
// { search: 'pizza', categoria: 'pizza', sort: 'precio', order: 'desc', limit: 6, offset: 0 }
function list(opciones) {
  let resultado = store.getAll();

  // 1) FILTRAR: nos quedamos solo con los platos que cumplen cada condición.
  const texto = opciones.search.toLowerCase();
  resultado = resultado.filter(plato => plato.nombre.toLowerCase().includes(texto));

  if (opciones.disponible !== undefined) {
    resultado = resultado.filter(plato => plato.disponible === opciones.disponible);
  }
  if (opciones.categoria) {
    resultado = resultado.filter(plato => plato.categoria === opciones.categoria);
  }

  // 2) ORDENAR: sort compara los platos de dos en dos (a y b).
  //    Número negativo = a va antes; positivo = b va antes; 0 = se quedan como estaban.
  resultado.sort((a, b) => {
    let comparacion;
    if (opciones.sort === 'precio') {
      comparacion = a.precio - b.precio;
    } else {
      comparacion = a.nombre.localeCompare(b.nombre, 'es'); // Orden alfabético en español.
    }
    if (opciones.order === 'desc') return -comparacion; // Al revés.
    return comparacion;
  });

  // 3) PAGINAR: slice corta un trozo. offset = cuántos me salto; limit = cuántos devuelvo.
  return resultado.slice(opciones.offset, opciones.offset + opciones.limit);
}

function getById(id) {
  return store.getById(id);
}

function create(datos) {
  return store.create(datos);
}

function update(id, datos) {
  return store.update(id, datos);
}

function remove(id) {
  store.remove(id);
}

// Estadísticas: se calculan cada vez que alguien las pide.
function stats() {
  const platos = store.getAll();

  // Sumamos en CÉNTIMOS (números enteros) para que no salgan cosas como 9.299999.
  let totalCentimos = 0;
  for (const plato of platos) {
    totalCentimos += Math.round(plato.precio * 100);
  }

  let precioMedio = 0; // Si no hay platos, la media es 0 (no podemos dividir entre 0).
  if (platos.length > 0) {
    precioMedio = Math.round(totalCentimos / platos.length) / 100; // Volvemos a euros.
  }

  return {
    total: platos.length,
    disponibles: platos.filter(plato => plato.disponible).length,
    precioMedio: precioMedio,
    porCategoria: {
      pizza: platos.filter(plato => plato.categoria === 'pizza').length,
      pasta: platos.filter(plato => plato.categoria === 'pasta').length
    }
  };
}

module.exports = { list, getById, create, update, remove, stats };
