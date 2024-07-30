const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Ruta para obtener pedidos de un usuario
router.get('/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM pedidos WHERE usuario_id = ${usuario_id}`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo pedidos' });
  }
});

// Ruta para crear un nuevo pedido
router.post('/', async (req, res) => {
  const { usuario_id, productos } = req.body; // productos es un array de {producto_id, cantidad, precio}
  const transaction = new sql.Transaction();
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);
    const result = await request.query`INSERT INTO pedidos (usuario_id, fecha, total) OUTPUT inserted.id VALUES (${usuario_id}, GETDATE(), ${productos.reduce((total, p) => total + p.precio * p.cantidad, 0)})`;
    const pedido_id = result.recordset[0].id;
    
    for (const producto of productos) {
      await request.query`INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio) VALUES (${pedido_id}, ${producto.producto_id}, ${producto.cantidad}, ${producto.precio})`;
    }
    
    await transaction.commit();
    res.status(201).json({ message: 'Pedido creado' });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error creando pedido' });
  }
});

module.exports = router;
