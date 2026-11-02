// ARRANQUE: npm start ejecuta este archivo y deja el servidor escuchando.
const app = require('./app');
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT debe ser un entero entre 1 y 65535.');
  process.exit(1);
}
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Linguinis Pizzeria: http://localhost:${port}`);
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `El puerto ${port} está ocupado. Elige otro con PORT.` : error.message);
  process.exit(1);
});
