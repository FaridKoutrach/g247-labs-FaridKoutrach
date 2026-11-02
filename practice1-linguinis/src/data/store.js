// ALMACÉN: única pieza que guarda los platos. Al apagar Node se pierde la memoria.
const { randomUUID } = require('node:crypto'); // Genera identificadores únicos.

const initialPlatos = [
  { nombre: 'Pizza Margherita', precio: 9.9, disponible: true, categoria: 'pizza' },
  { nombre: 'Pizza Diavola', precio: 10.5, disponible: true, categoria: 'pizza' },
  { nombre: 'Pizza Napolitana', precio: 8.6, disponible: true, categoria: 'pizza' },
  { nombre: 'Pasta Carbonara', precio: 8.9, disponible: true, categoria: 'pasta' },
  { nombre: 'Pasta Bolognese', precio: 9.2, disponible: true, categoria: 'pasta' },
  { nombre: 'Pasta Alfredo', precio: 10, disponible: false, categoria: 'pasta' }
];

// Las copias evitan que un consumidor modifique el almacén accidentalmente.
function createMemoryStore(seed = initialPlatos) {
  // Map relaciona id -> plato. get busca por id; set guarda; delete elimina.
  const platos = new Map(seed.map(plato => {
    const item = { ...plato, id: randomUUID() };
    return [item.id, item];
  }));
  return {
    list: () => [...platos.values()].map(plato => ({ ...plato })),
    get: id => platos.has(id) ? { ...platos.get(id) } : null,
    create(data) {
      const plato = { ...data, id: randomUUID() };
      platos.set(plato.id, plato);
      return { ...plato };
    },
    replace(id, data) {
      if (!platos.has(id)) return null;
      const plato = { ...data, id };
      platos.set(id, plato);
      return { ...plato };
    },
    remove: id => platos.delete(id)
  };
}

module.exports = { createMemoryStore };
