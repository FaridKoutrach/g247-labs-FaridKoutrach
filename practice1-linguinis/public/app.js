// CLIENTE: lee el formulario, hace peticiones fetch y cambia el HTML sin recargar.
// $ es solo un atajo propio para buscar un elemento; no es jQuery.
const $ = selector => document.querySelector(selector);
const form = $('#dish-form');
const filters = $('#filters');
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const fields = ['nombre', 'precio', 'categoria', 'disponible'];
const pageSize = 6;
let offset = 0;
let currentCount = 0;
let pending = 0;
let editing = null; // null = crear; un plato = editar ese plato.
let saving = false;
// Las fotos son archivos estáticos, no un segundo recurso ni una carga de archivos.
const photographs = {
  'pizza margherita': '/images/margherita.jpg', 'pizza diavola': '/images/diavola.webp',
  'pizza napolitana': '/images/napolitana.webp', 'pasta carbonara': '/images/carbonara.png',
  'pasta bolognese': '/images/bolognese.jpg', 'pasta alfredo': '/images/alfredo.jpg'
};

// pending cuenta peticiones activas: muestra Cargando y evita envíos duplicados.
function updateBusy() {
  $('#loading').hidden = pending === 0;
  $('#list-region').setAttribute('aria-busy', String(pending > 0));
  document.querySelectorAll('button').forEach(button => { button.disabled = pending > 0 || saving; });
  $('#previous').disabled = pending > 0 || saving || offset === 0;
  $('#next').disabled = pending > 0 || saving || currentCount <= pageSize;
}

// Función común para todas las peticiones. await espera el resultado de fetch.
async function api(path, options = {}) {
  pending++;
  updateBusy();
  try {
    const response = await fetch(path, {
      ...options,
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined
    });
    // DELETE devuelve 204 sin cuerpo; intentar leer JSON en ese caso fallaría.
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      const error = new Error(data.error || 'Revisa los campos indicados.');
      error.errors = data.errors;
      throw error;
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) throw new Error('No se pudo conectar. Comprueba que el servidor está encendido y vuelve a intentarlo.');
    throw error;
  } finally { // Se ejecuta tanto si la petición funciona como si falla.
    pending--;
    updateBusy();
  }
}

// Mensaje general para el usuario.
function message(text, isError = false) {
  $('#message').textContent = text;
  $('#message').hidden = !text;
  $('#message').classList.toggle('error', isError);
}

// Borra los errores del intento anterior.
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(element => { element.textContent = ''; });
  fields.forEach(field => $(`#${field}`).removeAttribute('aria-invalid'));
}

// Tanto la validación local como el 400 del servidor usan { field, message }.
function showErrors(errors) {
  for (const { field, message: description } of errors) {
    const target = fields.includes(field) ? $(`#${field}-error`) : $('#body-error');
    target.textContent += `${description} `;
    if (fields.includes(field)) $(`#${field}`).setAttribute('aria-invalid', 'true');
  }
  form.querySelector('[aria-invalid=true]')?.focus();
}

// Copia la plantilla por cada plato. textContent muestra texto, nunca ejecuta HTML.
function render(platos) {
  $('#dish-list').replaceChildren();
  currentCount = platos.length;
  const visiblePlatos = platos.slice(0, pageSize);
  $('#empty').hidden = platos.length !== 0;
  $('#result-count').textContent = `${visiblePlatos.length} en esta página`;
  $('#pagination').hidden = offset === 0 && currentCount <= pageSize;
  $('#page-label').textContent = `Página ${offset / pageSize + 1}`;
  for (const plato of visiblePlatos) {
    const row = $('#dish-template').content.firstElementChild.cloneNode(true);
    const photo = row.querySelector('.dish-image');
    photo.src = photographs[plato.nombre.toLowerCase()] || '/images/linguini.png';
    // Si falta una foto, mostramos la marca en lugar de un icono de imagen rota.
    photo.addEventListener('error', () => { photo.src = '/images/linguini.png'; }, { once: true });
    row.querySelector('h3').textContent = plato.nombre;
    row.querySelector('.dish-category').textContent = plato.categoria;
    row.querySelector('.dish-price').textContent = money.format(plato.precio);
    row.querySelector('.badge').textContent = plato.disponible ? 'Disponible' : 'Agotado';
    row.querySelector('.badge').classList.toggle('unavailable', !plato.disponible);
    row.querySelector('.edit').setAttribute('aria-label', `Editar ${plato.nombre}`);
    row.querySelector('.delete').setAttribute('aria-label', `Eliminar ${plato.nombre}`);
    row.querySelector('.edit').addEventListener('click', () => editDish(plato.id));
    row.querySelector('.delete').addEventListener('click', () => deleteDish(plato));
    $('#dish-list').append(row);
  }
  updateBusy();
}

// La API filtra y ordena. El cliente solo le envía los parámetros de consulta.
async function refresh() {
  if (pending > 0) return; // No superponer dos búsquedas.
  const query = new URLSearchParams();
  for (const field of ['search', 'categoria']) {
    const value = filters.elements[field].value.trim();
    if (value !== '') query.set(field, value);
  }
  // Un elemento adicional permite saber si existe una página siguiente.
  query.set('limit', pageSize + 1);
  query.set('offset', offset);
  try {
    const [platos, stats] = await Promise.all([api(`/platos?${query}`), api('/platos/stats')]);
    render(platos);
    $('#stat-total').textContent = stats.total;
    $('#stat-available').textContent = stats.disponibles;
  } catch (error) {
    render([]);
    $('#empty').textContent = 'No se ha podido cargar la carta. Pulsa Buscar para volver a intentarlo.';
    ['#stat-total', '#stat-available'].forEach(id => { $(id).textContent = '—'; });
    message(error.message, true);
    return false;
  }
  $('#empty').textContent = 'No hay platos que coincidan. Prueba otros filtros o añade una nueva especialidad.';
  return true;
}

// Después de guardar o cancelar, vuelve al modo de creación.
function resetEditor() {
  editing = null;
  form.reset();
  clearErrors();
  $('#form-title').textContent = 'Añadir plato';
  $('#save').textContent = 'Añadir plato';
  $('#cancel').hidden = true;
}

// GET individual: carga los datos actuales en el mismo formulario.
async function editDish(id) {
  clearErrors();
  message('');
  try {
    editing = await api(`/platos/${id}`);
    for (const field of fields) {
      if (field === 'disponible') $('#disponible').checked = editing.disponible;
      else $(`#${field}`).value = editing[field];
    }
    $('#form-title').textContent = 'Editar plato';
    $('#save').textContent = 'Guardar cambios';
    $('#cancel').hidden = false;
    $('#editor').scrollIntoView({ block: 'start' });
    $('#nombre').focus({ preventScroll: true });
  } catch (error) { message(error.message, true); }
}

// La promesa termina cuando el usuario cierra el diálogo (true = confirmó).
function confirmDelete(nombre) {
  const dialog = $('#delete-dialog');
  $('#delete-description').textContent = `¿Eliminar «${nombre}» de la carta? Esta acción no se puede deshacer.`;
  dialog.returnValue = 'cancel';
  return new Promise(resolve => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'delete'), { once: true });
    dialog.showModal();
  });
}

// DELETE elimina y refresh vuelve a pedir la lista y el resumen al servidor.
async function deleteDish(plato) {
  if (!(await confirmDelete(plato.nombre))) return;
  try {
    await api(`/platos/${plato.id}`, { method: 'DELETE' });
    if (editing?.id === plato.id) resetEditor();
    offset = 0;
    message('Plato eliminado de la carta.');
    await refresh();
  } catch (error) { message(error.message, true); }
}

// Submit sirve para crear y editar. preventDefault evita recargar la página.
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (saving || pending > 0) return;
  clearErrors();
  message('');
  // Los inputs dan texto; Number convierte el precio y checked da un booleano.
  const data = {
    nombre: $('#nombre').value.trim(), precio: Number($('#precio').value),
    categoria: $('#categoria').value, disponible: $('#disponible').checked
  };
  // Primera validación en navegador; el servidor siempre vuelve a validar.
  const errors = [];
  if (!data.nombre || data.nombre.length > 80) errors.push({ field: 'nombre', message: 'Escribe un nombre de entre 1 y 80 caracteres.' });
  if (!Number.isFinite(data.precio) || data.precio < 0.01 || data.precio > 100 || Math.abs(data.precio * 100 - Math.round(data.precio * 100)) > 1e-8) errors.push({ field: 'precio', message: 'Introduce entre 0,01 y 100 €, con hasta dos decimales.' });
  if (!['pizza', 'pasta'].includes(data.categoria)) errors.push({ field: 'categoria', message: 'Selecciona pizza o pasta.' });
  if (errors.length) { showErrors(errors); return; }
  saving = true;
  $('#dish-fields').disabled = true;
  try {
    // PUT envía los cuatro campos completos; POST crea un plato nuevo.
    const path = editing ? `/platos/${editing.id}` : '/platos';
    await api(path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(data) });
    const wasEditing = Boolean(editing);
    resetEditor();
    offset = 0;
    message(wasEditing ? 'Cambios guardados.' : 'Plato añadido. Puedes localizarlo con el buscador.');
    await refresh();
  } catch (error) {
    // Se habilita antes de enfocar el primer campo con error.
    $('#dish-fields').disabled = false;
    if (error.errors) showErrors(error.errors);
    else message(error.message, true);
  } finally {
    saving = false;
    $('#dish-fields').disabled = false;
    updateBusy();
  }
});

// Al corregir un campo se retira su aviso anterior; al guardar se valida de nuevo.
form.addEventListener('input', event => {
  const field = event.target.id;
  if (!fields.includes(field)) return;
  $(`#${field}-error`).textContent = '';
  event.target.removeAttribute('aria-invalid');
  $('#body-error').textContent = '';
});

// Eventos de búsqueda, paginación y cancelar. La primera carga ocurre al final.
filters.addEventListener('submit', event => { event.preventDefault(); offset = 0; message(''); refresh(); });
filters.addEventListener('reset', () => { setTimeout(() => { offset = 0; message(''); refresh(); }, 0); });
$('#previous').addEventListener('click', () => { offset = Math.max(0, offset - pageSize); message(''); refresh(); });
$('#next').addEventListener('click', () => { offset += pageSize; message(''); refresh(); });
$('#cancel').addEventListener('click', resetEditor);
$('a[href="#editor"]').addEventListener('click', resetEditor);
refresh();
