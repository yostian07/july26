const express = require('express');
const router = express.Router();
const sql = require('mssql');
const multer = require('multer');
const path = require('path');

// Configuración de multer para el manejo de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

// Ruta para obtener productos
router.get('/', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM productos');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});

// Ruta para obtener un producto específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM productos WHERE id = ${id}`;
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo producto' });
  }
});

// Ruta para agregar productos (administrador)
router.post('/', upload.single('imagen'), async (req, res) => {
  const { nombre, precio, descripcion, stock } = req.body;
  const imagen = req.file.filename; // Guardar solo el nombre del archivo
  try {
    await sql.query`INSERT INTO productos (nombre, precio, descripcion, imagen, stock) VALUES (${nombre}, ${precio}, ${descripcion}, ${imagen}, ${stock})`;
    res.status(201).json({ success: true, message: 'Producto agregado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error agregando producto' });
  }
});

// Ruta para verificar stock bajo
router.get('/stock-bajo', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM productos WHERE stock < 10');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error verificando stock' });
  }
});

// Ruta para actualizar stock
router.put('/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  try {
    await sql.query`UPDATE productos SET stock = ${stock} WHERE id = ${id}`;
    res.json({ message: 'Stock actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando stock' });
  }
});

module.exports = router;
