const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost', // Cambia esto si tu base de datos no está en tu localhost
  user: 'tu_usuario',
  password: 'tu_contraseña',
  database: 'nombre_basededatos'
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para obtener productos
app.get('/productos', (req, res) => {
  pool.query('SELECT * FROM productos', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error obteniendo productos' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para agregar productos (administrador)
app.post('/productos', (req, res) => {
  const { nombre, precio, descripcion, imagen } = req.body;
  pool.query('INSERT INTO productos (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)', 
    [nombre, precio, descripcion, imagen], 
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Error agregando producto' });
      } else {
        res.status(201).json({ message: 'Producto agregado' });
      }
    }
  );
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
