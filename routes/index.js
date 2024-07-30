const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Importar el middleware

// Ruta para la página principal
router.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'views' });
});

// Ruta para la página de login
router.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'views' });
});

// Ruta para la página de registro
router.get('/register', (req, res) => {
  res.sendFile('register.html', { root: 'views' });
});

// Ruta para la página de administración (protegida)
router.get('/admin', auth, (req, res) => {
  res.sendFile('admin.html', { root: 'views' });
});

module.exports = router;
