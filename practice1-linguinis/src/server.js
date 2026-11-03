// ARRANQUE: "npm start" ejecuta este archivo.
// Coge la app ya montada en app.js y la pone a escuchar en un puerto.
const app = require('./app');

// Si alguien define la variable PORT se usa esa; si no, el 3000.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Linguinis Pizzeria: http://localhost:${PORT}`);
});
