// SERVICIO: contiene las operaciones y conecta validadores con almacenamiento.
const { validatePlato } = require('../validators/platoValidator');
const { validateQuery } = require('../validators/queryValidator');

// Si hay incidencias, lanza un error que recogerá el middleware centralizado.
function checked(result) {
  if (result.errors.length) {
    const error = new Error('Validación incorrecta.');
    error.status = 400;
    error.errors = result.errors;
    throw error;
  }
  return result.data;
}

// Recibe el almacén como parámetro: se puede sustituir sin cambiar el controlador.
function createPlatosService(store) {
  function get(id) {
    const plato = store.get(id);
    if (!plato) {
      const error = new Error('Plato no encontrado.');
      error.status = 404;
      throw error;
    }
    return plato;
  }
  return {
    checkQuery: query => checked(validateQuery(query)),
    list(query) {
      const options = checked(validateQuery(query, { collection: true }));
      // filter selecciona elementos; sort los ordena; slice aplica la ventana.
      const result = store.list().filter(plato =>
        plato.nombre.toLowerCase().includes(options.search.toLowerCase()) &&
        (options.disponible === undefined || plato.disponible === options.disponible) &&
        (!options.categoria || plato.categoria === options.categoria)
      );
      result.sort((a, b) => {
        const comparison = options.sort === 'precio' ? a.precio - b.precio : a.nombre.localeCompare(b.nombre, 'es');
        return options.order === 'desc' ? -comparison : comparison;
      });
      return result.slice(options.offset, options.offset + options.limit);
    },
    get,
    create: body => store.create(checked(validatePlato(body))),
    update(id, body, partial) {
      const current = get(id);
      const data = checked(validatePlato(body, { partial }));
      // ... copia campos. PATCH mezcla antiguos y nuevos; PUT usa solo los nuevos.
      return store.replace(id, partial ? { ...current, ...data } : data);
    },
    remove(id) {
      get(id);
      store.remove(id);
    },
    stats() { // Se calcula en cada petición, no se guarda en memoria como otro dato.
      const platos = store.list();
      // Sumar céntimos enteros evita errores binarios al redondear dinero.
      const totalCents = platos.reduce((total, plato) => total + Math.round(plato.precio * 100), 0);
      return {
        total: platos.length,
        disponibles: platos.filter(plato => plato.disponible).length,
        precioMedio: platos.length ? Math.round(totalCents / platos.length) / 100 : 0,
        porCategoria: {
          pizza: platos.filter(plato => plato.categoria === 'pizza').length,
          pasta: platos.filter(plato => plato.categoria === 'pasta').length
        }
      };
    }
  };
}

module.exports = { createPlatosService };
