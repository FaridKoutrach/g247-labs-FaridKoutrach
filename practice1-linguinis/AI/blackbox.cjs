/* Black-box tests: Node >=18; only HTTP and built-in modules. */
'use strict';
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const prefix = `BB-${randomUUID()}`;
const created = new Set();
const results = [];
let assertions = 0;

async function request(path, { method = 'GET', body, raw, type = 'application/json' } = {}) {
  const options = { method, signal: AbortSignal.timeout(10000) };
  if (body !== undefined || raw !== undefined) {
    options.body = raw === undefined ? JSON.stringify(body) : raw;
    options.headers = { 'Content-Type': type };
  }
  const response = await fetch(base + path, options);
  const text = await response.text();
  let json;
  try { json = text ? JSON.parse(text) : undefined; } catch {}
  // Track ownership immediately, even if a subsequent assertion fails.
  if (method === 'POST' && response.status === 201 && typeof json?.id === 'string') created.add(json.id);
  return { status: response.status, headers: response.headers, text, json };
}
function status(response, expected) {
  assertions++;
  assert.equal(response.status, expected, `HTTP ${response.status}, expected ${expected}: ${response.text}`);
  if (expected !== 204) {
    assert.match(response.headers.get('content-type') || '', /application\/json/i);
    assert.notEqual(response.json, undefined, 'Response must contain valid JSON');
  }
  return response.json;
}
function invalid(response, fields = []) {
  const body = status(response, 400);
  assert.ok(Array.isArray(body.errors) && body.errors.length > 0);
  for (const error of body.errors) {
    assert.equal(typeof error.field, 'string');
    assert.equal(typeof error.message, 'string');
    assert.ok(error.message.length > 0);
  }
  for (const field of fields) assert.ok(body.errors.some(error => error.field === field), `Missing error: ${field}`);
}
function errorStatus(response, expected) {
  const body = status(response, expected);
  assert.equal(typeof body.error, 'string');
  assert.equal(body.stack, undefined);
}
async function group(name, fn) {
  try { await fn(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
}
function dish(suffix, overrides = {}) {
  return { nombre: `${prefix} ${suffix}`, precio: 10.5, disponible: true, categoria: 'pizza', ...overrides };
}
async function create(suffix, overrides = {}) {
  const response = await request('/platos', { method: 'POST', body: dish(suffix, overrides) });
  const value = status(response, 201);
  assert.match(value.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(response.headers.get('location'), `/platos/${value.id}`);
  assert.deepEqual(Object.keys(value).sort(), ['categoria', 'disponible', 'id', 'nombre', 'precio']);
  return value;
}
async function list(query = {}) {
  return status(await request(`/platos?${new URLSearchParams(query)}`), 200);
}
async function allDishes() {
  const all = [];
  for (let offset = 0; offset <= 1000000; offset += 100) {
    const page = await list({ limit: '100', offset: String(offset) });
    assert.ok(Array.isArray(page));
    all.push(...page);
    if (page.length < 100) return all;
  }
  throw new Error('Collection exceeds the documented maximum offset');
}
async function checkStats() {
  const dishes = await allDishes();
  const expected = {
    total: dishes.length,
    disponibles: dishes.filter(item => item.disponible).length,
    precioMedio: dishes.length ? Math.round(dishes.reduce((sum, item) => sum + Math.round(item.precio * 100), 0) / dishes.length) / 100 : 0,
    porCategoria: { pizza: dishes.filter(item => item.categoria === 'pizza').length, pasta: dishes.filter(item => item.categoria === 'pasta').length },
  };
  const actual = status(await request('/platos/stats'), 200);
  assert.deepEqual(actual, expected);
  return actual;
}

async function main() {
  console.log(`Black-box API: ${base}; unique prefix: ${prefix}`);
  try {
    await group('GET collection and global stats against paginated public data', async () => { await checkStats(); });

    await group('POST, Location, UUID, ignored id/extra, trim and GET', async () => {
      const input = dish('crud');
      const value = await create('crud', { nombre: `  ${input.nombre}  `, id: 'client-controlled', extra: { hidden: true } });
      assert.notEqual(value.id, 'client-controlled');
      assert.deepEqual(value, { id: value.id, ...input });
      assert.deepEqual(status(await request(`/platos/${value.id}`), 200), value);
    });

    await group('Multiple body validation errors and invalid JSON values', async () => {
      invalid(await request('/platos', { method: 'POST', body: {} }), ['nombre', 'precio', 'disponible', 'categoria']);
      invalid(await request('/platos', { method: 'POST', body: { nombre: '   ', precio: '12', disponible: 'true', categoria: 'sopa' } }), ['nombre', 'precio', 'disponible', 'categoria']);
      for (const body of [[], null, true, 7, 'text']) invalid(await request('/platos', { method: 'POST', body }));
      for (const precio of [0, -1, 100.01, 1.001, '1.25', null]) invalid(await request('/platos', { method: 'POST', body: dish('invalid', { precio }) }), ['precio']);
      for (const nombre of ['', ' '.repeat(3), 'x'.repeat(81), 42, null]) invalid(await request('/platos', { method: 'POST', body: dish('invalid', { nombre }) }), ['nombre']);
      for (const disponible of ['false', 0, 1, null]) invalid(await request('/platos', { method: 'POST', body: dish('invalid', { disponible }) }), ['disponible']);
      for (const categoria of ['Pizza', '', 'pasta ', null]) invalid(await request('/platos', { method: 'POST', body: dish('invalid', { categoria }) }), ['categoria']);
      invalid(await request('/platos', { method: 'POST', raw: '{"nombre":"bad","precio":1e999,"disponible":true,"categoria":"pizza"}' }), ['precio']);
    });

    await group('Inclusive price boundaries, maximum name length and repeated names', async () => {
      const low = await create('boundary', { precio: 0.01 });
      const high = await create('boundary', { precio: 100 });
      assert.notEqual(low.id, high.id);
      assert.equal(low.nombre, high.nombre);
      const longName = prefix + 'x'.repeat(80 - prefix.length);
      assert.equal((await create('long-name', { nombre: longName })).nombre.length, 80);
    });

    await group('PUT replacement versus PATCH preservation, no-op rejection, atomic validation', async () => {
      const original = await create('update');
      const path = `/platos/${original.id}`;
      invalid(await request(path, { method: 'PUT', body: { nombre: `${prefix} incomplete` } }), ['precio', 'disponible', 'categoria']);
      assert.deepEqual(status(await request(path), 200), original);
      const patched = status(await request(path, { method: 'PATCH', body: { disponible: false, id: 'replacement', extra: 42 } }), 200);
      assert.deepEqual(patched, { ...original, disponible: false });
      invalid(await request(path, { method: 'PATCH', body: {} }));
      invalid(await request(path, { method: 'PATCH', body: { id: 'ignored', extra: true } }));
      invalid(await request(path, { method: 'PATCH', body: { nombre: `${prefix} must-not-persist`, precio: -1, categoria: 'soup' } }), ['precio', 'categoria']);
      assert.deepEqual(status(await request(path), 200), patched);
      const replacement = dish('replacement', { precio: 21.25, disponible: true, categoria: 'pasta' });
      assert.deepEqual(status(await request(path, { method: 'PUT', body: { ...replacement, id: 'ignored', extra: true } }), 200), { id: original.id, ...replacement });
      assert.deepEqual(status(await request(path), 200), { id: original.id, ...replacement });
    });

    await group('Combined filters, case-insensitive trimmed search, sorting, stable ties and window', async () => {
      const marker = `${prefix} filter`;
      const a = await create('filter a', { precio: 20 });
      const b = await create('filter b', { precio: 5 });
      const c = await create('filter c', { precio: 20 });
      const d = await create('filter d', { precio: 9, categoria: 'pasta' });
      const e = await create('filter e', { precio: 3, disponible: false });
      const ids = values => values.map(value => value.id);
      const search = `  ${marker.toUpperCase()}  `;
      assert.deepEqual(ids(await list({ search })), [a, b, c, d, e].map(value => value.id));
      assert.deepEqual(ids(await list({ search, order: 'desc' })), [e, d, c, b, a].map(value => value.id));
      const filters = { search, disponible: 'true', categoria: 'pizza', sort: 'precio', order: 'asc' };
      assert.deepEqual(ids(await list(filters)), [b.id, a.id, c.id]);
      assert.deepEqual(ids(await list({ ...filters, offset: '1', limit: '1' })), [a.id]);
      assert.deepEqual(ids(await list({ ...filters, order: 'desc' })), [a.id, c.id, b.id]);
      assert.deepEqual(ids(await list({ search, disponible: 'false' })), [e.id]);
      assert.deepEqual(ids(await list({ search, categoria: 'pasta' })), [d.id]);
      assert.deepEqual(await list({ search: `${prefix} no-match` }), []);
      assert.deepEqual(await list({ search, offset: '1000000' }), []);
      assert.deepEqual(await list({ search: '   ' }), await list({}));
      const tie1 = await create('same-name', { precio: 7 });
      const tie2 = await create('same-name', { precio: 7 });
      for (const order of ['asc', 'desc']) assert.deepEqual(ids(await list({ search: tie1.nombre, order })), [tie1.id, tie2.id]);
    });

    await group('Strict unknown, repeated, malformed and combined query validation', async () => {
      const cases = [
        ['unknown=x', 'unknown'], ['disponible=yes', 'disponible'], ['disponible=TRUE', 'disponible'],
        ['categoria=Pizza', 'categoria'], ['sort=id', 'sort'], ['order=up', 'order'],
        ['limit=0', 'limit'], ['limit=101', 'limit'], ['limit=1.5', 'limit'], ['limit=1e1', 'limit'], ['limit=-1', 'limit'], ['limit=', 'limit'],
        ['offset=-1', 'offset'], ['offset=1000001', 'offset'], ['offset=1.2', 'offset'],
        [`search=${'x'.repeat(81)}`, 'search'], ['search=a&search=b', 'search'], ['limit=1&limit=2', 'limit'],
        ['disponible=true&disponible=false', 'disponible'], ['sort=precio&sort=nombre', 'sort'],
      ];
      for (const [query, field] of cases) invalid(await request(`/platos?${query}`), [field]);
      invalid(await request('/platos?disponible=si&limit=-1&order=bad&categoria=soup'), ['disponible', 'limit', 'order', 'categoria']);
      invalid(await request('/platos?limit[x]=1'));
      const value = await create('queries');
      for (const method of ['GET', 'PUT', 'PATCH', 'DELETE']) {
        const body = ['PUT', 'PATCH'].includes(method) ? dish('query-rejected') : undefined;
        invalid(await request(`/platos/${value.id}?x=1`, { method, body }));
      }
      invalid(await request('/platos/stats?limit=1'));
      invalid(await request('/platos?x=1', { method: 'POST', body: dish('query-rejected') }));
      assert.deepEqual(status(await request(`/platos/${value.id}`), 200), value);
    });

    await group('Stats update after creation, PATCH, PUT and DELETE; unaffected by filtered reads', async () => {
      const before = await checkStats();
      const value = await create('stats', { precio: 13.75, categoria: 'pasta', disponible: false });
      const after = await checkStats();
      assert.equal(after.total, before.total + 1);
      assert.equal(after.disponibles, before.disponibles);
      assert.equal(after.porCategoria.pasta, before.porCategoria.pasta + 1);
      const path = `/platos/${value.id}`;
      status(await request(path, { method: 'PATCH', body: { disponible: true, precio: 18.25 } }), 200);
      assert.equal((await checkStats()).disponibles, before.disponibles + 1);
      status(await request(path, { method: 'PUT', body: dish('stats replacement', { categoria: 'pizza', precio: 30 }) }), 200);
      const replacedStats = await checkStats();
      assert.equal(replacedStats.porCategoria.pizza, before.porCategoria.pizza + 1);
      assert.equal(replacedStats.porCategoria.pasta, before.porCategoria.pasta);
      await list({ search: value.nombre, limit: '1' });
      assert.deepEqual(await checkStats(), replacedStats);
      const response = await request(path, { method: 'DELETE' });
      status(response, 204);
      assert.equal(response.text, '');
      created.delete(value.id);
      assert.deepEqual(await checkStats(), before);
      errorStatus(await request(path), 404);
      errorStatus(await request(path, { method: 'DELETE' }), 404);
    });

    await group('Malformed JSON, content type and 16 KB body limit', async () => {
      const value = await create('transport');
      for (const [method, path] of [['POST', '/platos'], ['PUT', `/platos/${value.id}`], ['PATCH', `/platos/${value.id}`]]) {
        invalid(await request(path, { method, raw: '{"nombre":' }));
        errorStatus(await request(path, { method, raw: '{}', type: 'text/plain' }), 415);
        errorStatus(await request(path, { method, body: { ...dish('large'), extra: 'x'.repeat(17000) } }), 413);
      }
      assert.deepEqual(status(await request(`/platos/${value.id}`), 200), value);
    });

    await group('JSON 404 for missing id, unknown routes and unsupported methods', async () => {
      for (const id of [`missing-${randomUUID()}`, randomUUID()]) {
        for (const method of ['GET', 'PUT', 'PATCH', 'DELETE']) errorStatus(await request(`/platos/${id}`, { method, body: ['PUT', 'PATCH'].includes(method) ? dish('missing') : undefined }), 404);
      }
      errorStatus(await request(`/unknown-${prefix}`), 404);
      errorStatus(await request('/platos', { method: 'PUT', body: dish('unsupported') }), 404);
      errorStatus(await request('/platos/stats', { method: 'POST', body: {} }), 404);
    });
  } finally {
    await group('Cleanup: delete only records created by this run', async () => {
      const failures = [];
      for (const id of [...created]) {
        try {
          const response = await request(`/platos/${id}`, { method: 'DELETE' });
          status(response, 204);
          assert.equal(response.text, '');
          created.delete(id);
          errorStatus(await request(`/platos/${id}`), 404);
        } catch (error) { failures.push(`${id}: ${error.message}`); }
      }
      assert.deepEqual(failures, []);
    });
  }
  const failed = results.filter(result => !result.passed);
  console.log(JSON.stringify({ groups: results.length, passed: results.length - failed.length, failed: failed.length, responsesChecked: assertions, leftoverOwnedIds: [...created] }, null, 2));
  if (failed.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
