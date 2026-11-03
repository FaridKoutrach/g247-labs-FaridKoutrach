// CLIENTE: el JavaScript que se ejecuta en el NAVEGADOR.
// Pide los datos a la API con fetch y cambia el HTML sin recargar la página.

// Fotos de los platos iniciales: nombre en minúsculas → archivo de public/images.
const fotos = {
  'pizza margherita': '/images/margherita.jpg',
  'pizza diavola': '/images/diavola.webp',
  'pizza napolitana': '/images/napolitana.webp',
  'pasta carbonara': '/images/carbonara.png',
  'pasta bolognese': '/images/bolognese.jpg',
  'pasta alfredo': '/images/alfredo.jpg'
};

const formulario = document.querySelector('#dish-form');
const filtros = document.querySelector('#filters');
let platoEditando = null; // null = estamos creando un plato; si no, es el plato que se edita.

// ---------- 1. HABLAR CON LA API ----------
// Todas las peticiones pasan por aquí: enseña "Cargando…", hace el fetch y mira si ha ido bien.
async function pedir(url, opciones) {
  document.querySelector('#loading').hidden = false;
  try {
    const respuesta = await fetch(url, opciones);

    // DELETE responde 204 sin cuerpo: en ese caso no hay JSON que leer.
    let datos = null;
    if (respuesta.status !== 204) datos = await respuesta.json();

    // OJO: fetch NO da error con un 400 o un 404. Hay que mirar respuesta.ok nosotros.
    if (!respuesta.ok) {
      const error = new Error(datos.error || 'Revisa los campos marcados.');
      error.errores = datos.errors; // La lista [{ field, message }] que manda el 400.
      throw error;
    }
    return datos;
  } catch (error) {
    // Si el servidor está apagado, fetch falla con un TypeError.
    if (error instanceof TypeError) throw new Error('No se pudo conectar con el servidor. ¿Está encendido?');
    throw error;
  } finally {
    document.querySelector('#loading').hidden = true; // finally se ejecuta siempre, vaya bien o mal.
  }
}

// ---------- 2. MENSAJES Y ERRORES ----------
function mostrarMensaje(texto, esError) {
  const caja = document.querySelector('#message');
  caja.textContent = texto;
  caja.hidden = texto === '';
  caja.classList.toggle('error', esError === true);
}

function borrarErroresCampos() {
  for (const hueco of document.querySelectorAll('.field-error')) hueco.textContent = '';
}

// Pone cada error debajo de su campo (#nombre-error, #precio-error...).
// Sirve para los errores del navegador y para los del 400 del servidor: los dos usan { field, message }.
function mostrarErroresCampos(errores) {
  for (const error of errores) {
    const hueco = document.querySelector(`#${error.field}-error`) || document.querySelector('#body-error');
    hueco.textContent = error.message;
  }
}

// ---------- 3. PINTAR LA CARTA ----------
function pintarPlatos(platos) {
  const lista = document.querySelector('#dish-list');
  lista.innerHTML = ''; // Vaciamos lo que hubiera antes.
  document.querySelector('#empty').hidden = platos.length > 0; // "No hay platos..." si la lista viene vacía.
  document.querySelector('#result-count').textContent = `${platos.length} platos`;

  for (const plato of platos) {
    const tarjeta = document.createElement('li');
    tarjeta.className = 'dish-row';
    tarjeta.innerHTML = `
      <img class="dish-image" alt="">
      <div class="dish-info"><h3></h3><small class="dish-category"></small> <span class="badge"></span></div>
      <strong class="dish-price"></strong>
      <div class="dish-actions"><button class="text-button edit">Editar</button><button class="text-button delete">Eliminar</button></div>`;

    // Los datos del plato se ponen con textContent: se muestran como texto y nunca como HTML.
    tarjeta.querySelector('h3').textContent = plato.nombre;
    tarjeta.querySelector('.dish-category').textContent = plato.categoria;
    tarjeta.querySelector('.dish-price').textContent = plato.precio.toFixed(2).replace('.', ',') + ' €';
    tarjeta.querySelector('.badge').textContent = plato.disponible ? 'Disponible' : 'Agotado';
    if (!plato.disponible) tarjeta.querySelector('.badge').classList.add('unavailable');

    // Foto propia si la tiene; si no, el dibujo de su categoría (pizza-generica.svg o pasta-generica.svg).
    tarjeta.querySelector('img').src = fotos[plato.nombre.toLowerCase()] || `/images/${plato.categoria}-generica.svg`;

    tarjeta.querySelector('.edit').addEventListener('click', () => empezarEdicion(plato));
    tarjeta.querySelector('.delete').addEventListener('click', () => borrarPlato(plato));
    lista.append(tarjeta);
  }
}

// ---------- 4. CARGAR LA CARTA: GET /platos (con filtros) y GET /platos/stats ----------
async function cargarCarta() {
  // Montamos la consulta, p. ej. /platos?search=pizza&categoria=pizza. El FILTRADO lo hace el servidor.
  const parametros = new URLSearchParams();
  const busqueda = document.querySelector('#search').value.trim();
  const categoria = document.querySelector('#category-filter').value;
  if (busqueda !== '') parametros.set('search', busqueda);
  if (categoria !== '') parametros.set('categoria', categoria);

  try {
    const platos = await pedir(`/platos?${parametros}`);
    pintarPlatos(platos);
    const stats = await pedir('/platos/stats');
    document.querySelector('#stat-total').textContent = stats.total;
    document.querySelector('#stat-available').textContent = stats.disponibles;
  } catch (error) {
    pintarPlatos([]);
    mostrarMensaje(error.message, true);
  }
}

// ---------- 5. FORMULARIO: crear (POST) o guardar una edición (PUT) ----------
function leerFormulario() {
  return {
    nombre: document.querySelector('#nombre').value.trim(),
    precio: Number(document.querySelector('#precio').value), // El input da texto: lo pasamos a número.
    categoria: document.querySelector('#categoria').value,
    disponible: document.querySelector('#disponible').checked // checked ya es true o false.
  };
}

// Primera comprobación en el navegador. El servidor lo vuelve a comprobar todo igualmente.
function validarEnNavegador(plato) {
  const errores = [];
  if (plato.nombre === '' || plato.nombre.length > 80) {
    errores.push({ field: 'nombre', message: 'Escribe un nombre de entre 1 y 80 caracteres.' });
  }
  if (!(plato.precio >= 0.01 && plato.precio <= 100)) {
    errores.push({ field: 'precio', message: 'El precio debe estar entre 0,01 y 100 €.' });
  }
  return errores;
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // Sin esto, el navegador recargaría la página.
  borrarErroresCampos();
  mostrarMensaje('');

  const plato = leerFormulario();
  const errores = validarEnNavegador(plato);
  if (errores.length > 0) {
    mostrarErroresCampos(errores);
    return;
  }

  // Editando → PUT /platos/:id (manda los 4 campos). Creando → POST /platos.
  let url = '/platos';
  let metodo = 'POST';
  if (platoEditando) {
    url = `/platos/${platoEditando.id}`;
    metodo = 'PUT';
  }

  try {
    await pedir(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plato) // Objeto → texto JSON.
    });
    mostrarMensaje(metodo === 'PUT' ? 'Cambios guardados.' : 'Plato añadido a la carta.');
    terminarEdicion();
    cargarCarta();
  } catch (error) {
    if (error.errores) mostrarErroresCampos(error.errores); // 400: cada error junto a su campo.
    else mostrarMensaje(error.message, true);
  }
});

// Rellena el formulario con el plato elegido y lo pone en modo "Editar".
function empezarEdicion(plato) {
  platoEditando = plato;
  document.querySelector('#nombre').value = plato.nombre;
  document.querySelector('#precio').value = plato.precio;
  document.querySelector('#categoria').value = plato.categoria;
  document.querySelector('#disponible').checked = plato.disponible;
  document.querySelector('#form-title').textContent = 'Editar plato';
  document.querySelector('#save').textContent = 'Guardar cambios';
  document.querySelector('#cancel').hidden = false;
  document.querySelector('#editor').scrollIntoView();
}

// Vuelve al modo "Añadir plato" con el formulario vacío.
function terminarEdicion() {
  platoEditando = null;
  formulario.reset();
  borrarErroresCampos();
  document.querySelector('#form-title').textContent = 'Añadir plato';
  document.querySelector('#save').textContent = 'Añadir plato';
  document.querySelector('#cancel').hidden = true;
}

// ---------- 6. BORRAR: DELETE /platos/:id ----------
async function borrarPlato(plato) {
  // confirm abre una ventanita del navegador con Aceptar y Cancelar.
  if (!confirm(`¿Eliminar «${plato.nombre}» de la carta?`)) return;
  try {
    await pedir(`/platos/${plato.id}`, { method: 'DELETE' });
    if (platoEditando && platoEditando.id === plato.id) terminarEdicion();
    mostrarMensaje('Plato eliminado de la carta.');
    cargarCarta();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}



// ---------- 7. BOTONES DEL BUSCADOR Y DEL FORMULARIO ----------
filtros.addEventListener('submit', (evento) => {
  evento.preventDefault();
  mostrarMensaje('');
  cargarCarta();
});
// Al cambiar la categoría se busca sin tener que pulsar "Buscar".
filtros.elements.categoria.addEventListener('change', () => filtros.requestSubmit());


// Al escribir en el buscador se busca con cada letra.
filtros.elements.search.addEventListener('input', () => filtros.requestSubmit());

document.querySelector('#clear').addEventListener('click', () => {
  document.querySelector('#search').value = '';
  document.querySelector('#category-filter').value = '';
  cargarCarta();
});

document.querySelector('#cancel').addEventListener('click', terminarEdicion);
document.querySelector('a[href="#editor"]').addEventListener('click', terminarEdicion);

cargarCarta(); // Primera carga al abrir la página.
