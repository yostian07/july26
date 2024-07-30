const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('mssql');

// Definir los correos de los usuarios administradores
const adminEmails = [
  'ariana@gmail.com',
  'admin2@example.com'
];

// Ruta para registrar usuarios
router.post('/', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    await sql.query`INSERT INTO usuarios (nombre, correo, contraseña) VALUES (${nombre}, ${correo}, ${hashedPassword})`;
    res.status(201).json({ message: 'Usuario registrado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registrando usuario' });
  }
});

// Ruta para login de usuarios
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const result = await sql.query`SELECT * FROM usuarios WHERE correo = ${correo}`;
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      console.log('Contraseña ingresada:', contraseña);
      console.log('Contraseña almacenada:', user.contraseña);
      const validPassword = await bcrypt.compare(contraseña, user.contraseña);
      if (validPassword) {
        const isAdmin = adminEmails.includes(correo);
        req.session.userId = user.id;
        req.session.isAdmin = isAdmin;
        res.json({ success: true, isAdmin });
      } else {
        res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
      }
    } else {
      res.status(401).json({ success: false, error: 'Correo no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error en el login' });
  }
});

// Ruta para verificar el estado de autenticación
router.get('/estado', (req, res) => {
  if (req.session.userId) {
    res.json({ autenticado: true, isAdmin: req.session.isAdmin });
  } else {
    res.json({ autenticado: false });
  }
});

// Ruta para logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.json({ message: 'Logout exitoso' });
  });
});

module.exports = router;
