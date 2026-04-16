require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Base de datos: MySQL (${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME})`);
    console.log(`🌐 Entorno: ${process.env.NODE_ENV}`);
  });
};

start();
