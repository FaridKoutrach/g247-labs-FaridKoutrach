// VALIDADOR DE PLATOS: comprueba el cuerpo (req.body) que manda el cliente.
// Devuelve { data, errors }:
//   data   → solo los campos correctos y limpios (el nombre sin espacios sobrantes).
//   errors → TODOS los problemas encontrados, p. ej. [{ field: 'precio', message: '...' }].
// No guarda nada: solo comprueba.
const CAMPOS = ['nombre', 'precio', 'disponible', 'categoria'];

// ¿Tiene como mucho 2 decimales? 9.95 * 100 = 995 (entero) → sí. 9.999 * 100 = 999.9 → no.
// (Se deja un margen mínimo porque el ordenador guarda algunos decimales con error: 8.6 * 100 = 859.9999999.)
function tieneDosDecimales(numero) {
  const centimos = numero * 100;
  return Math.abs(centimos - Math.round(centimos)) < 0.00000001;
}

// partial = false → POST y PUT: los 4 campos son obligatorios.
// partial = true  → PATCH: solo se comprueban los campos que lleguen.
function validatePlato(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  // El cuerpo tiene que ser un objeto { ... }: ni un número, ni null, ni una lista [ ... ].
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { data, errors: [{ field: 'body', message: 'El cuerpo debe ser un objeto JSON.' }] };
  }

  // Solo miramos estos 4 campos: si mandan "id" u otra cosa, se ignora.
  for (const campo of CAMPOS) {
    const valor = body[campo];

    if (valor === undefined) { // El campo no viene en el JSON.
      if (!partial) errors.push({ field: campo, message: 'Este campo es obligatorio.' });
      continue; // Pasamos al siguiente campo.
    }

    if (campo === 'nombre') {
      if (typeof valor !== 'string' || valor.trim().length < 1 || valor.trim().length > 80) {
        errors.push({ field: campo, message: 'Escribe un nombre de entre 1 y 80 caracteres.' });
      } else {
        data.nombre = valor.trim();
      }
    }

    if (campo === 'precio') {
      if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0.01 || valor > 100 || !tieneDosDecimales(valor)) {
        errors.push({ field: campo, message: 'El precio debe ser un número entre 0,01 y 100, con hasta dos decimales.' });
      } else {
        data.precio = valor;
      }
    }

    if (campo === 'disponible') {
      if (typeof valor !== 'boolean') {
        errors.push({ field: campo, message: 'La disponibilidad debe ser true o false.' });
      } else {
        data.disponible = valor;
      }
    }

    if (campo === 'categoria') {
      if (valor !== 'pizza' && valor !== 'pasta') {
        errors.push({ field: campo, message: 'Selecciona pizza o pasta.' });
      } else {
        data.categoria = valor;
      }
    }
  }

  // Un PATCH sin ningún campo que cambiar no tiene sentido.
  const noLlegaNingunCampo = CAMPOS.every(campo => body[campo] === undefined);
  if (partial && noLlegaNingunCampo) {
    errors.push({ field: 'body', message: 'Envía al menos un campo editable.' });
  }

  return { data, errors };
}

module.exports = { validatePlato };
