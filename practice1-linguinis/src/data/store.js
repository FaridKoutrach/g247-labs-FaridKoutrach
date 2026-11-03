// ALMACÉN: la única pieza que guarda los platos.
// Es un array en memoria: si apagas el servidor, los cambios se pierden.
// Solo el servicio usa estas funciones. Si mañana usamos una base de datos,
// bastaría con cambiar este archivo manteniendo los mismos nombres de funciones.
const { randomUUID } = require('node:crypto'); // Crea ids únicos, p. ej. "3f2a9c1e-..."

let platos = [
  { id: randomUUID(), nombre: 'Pizza Margherita', precio: 9.9, disponible: true, categoria: 'pizza' },
  { id: randomUUID(), nombre: 'Pizza Diavola', precio: 10.5, disponible: true, categoria: 'pizza' },
  { id: randomUUID(), nombre: 'Pizza Napolitana', precio: 8.6, disponible: true, categoria: 'pizza' },
  { id: randomUUID(), nombre: 'Pasta Carbonara', precio: 8.9, disponible: true, categoria: 'pasta' },
  { id: randomUUID(), nombre: 'Pasta Bolognese', precio: 9.2, disponible: true, categoria: 'pasta' },
  { id: randomUUID(), nombre: 'Pasta Alfredo', precio: 10, disponible: false, categoria: 'pasta' }
];

// Devuelve una COPIA de la lista ([...platos]) para que quien la ordene no desordene la original.
function getAll() {
  return [...platos];
}

// find devuelve el primer plato cuyo id coincide, o undefined si no hay ninguno.
function getById(id) {
  return platos.find(plato => plato.id === id);
}

// Crea el plato con un id nuevo y lo añade al final.
function create(datos) {
  const nuevo = { id: randomUUID(), ...datos };
  platos.push(nuevo);
  return nuevo;
}

// Sustituye el plato que tiene ese id por los datos nuevos (el id no cambia).
function update(id, datos) {
  const posicion = platos.findIndex(plato => plato.id === id);
  if (posicion === -1) return undefined; // No existe.
  platos[posicion] = { ...datos, id };
  return platos[posicion];
}

// Se queda con todos los platos MENOS el del id indicado.
function remove(id) {
  platos = platos.filter(plato => plato.id !== id);
}

module.exports = { getAll, getById, create, update, remove };
