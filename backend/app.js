const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// En producción solo acepta requests del frontend desplegado
const allowedOrigins = [
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));

app.use(express.json());

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/vehicles',  require('./routes/vehicleRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/clients',   require('./routes/clientRoutes'));
app.use('/api/trips',     require('./routes/tripRoutes'));
app.use('/api/expenses',  require('./routes/expenseRoutes'));

const pool = require('./config/db');
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'conectada' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
