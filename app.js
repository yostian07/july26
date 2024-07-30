require('dotenv').config(); // Añade esto al inicio del archivo

const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const auth = require('./middleware/auth'); // Añadir el middleware de autenticación

const app = express();

// Configuración de la conexión a SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true // for Azure SQL
  }
};

sql.connect(config, err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos');
  }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Esto asegura que se sirvan archivos estáticos

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Rutas
app.use('/', require('./routes/index'));
app.use('/productos', require('./routes/productos'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/pedidos', auth, require('./routes/pedidos')); // Añadir autenticación para pedidos

// Ruta para la página de administración
app.get('/admin', auth, (req, res) => {
  if (req.session.isAdmin) {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
  } else {
    res.status(403).send('Acceso denegado');
  }
});


const fileUpload = require('express-fileupload');

app.use(fileUpload());

app.post('/upload-image', async (req, res) => {
  const imagen = req.files?.imagen;
  if (!imagen) {
    return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
  }

  const imagenPath = `/images/${Date.now()}_${imagen.name}`;
  const uploadPath = path.join(__dirname, 'public', imagenPath);

  try {
    await imagen.mv(uploadPath);
    res.status(200).json({ path: imagenPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error subiendo la imagen' });
  }
});







const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
