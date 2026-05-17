const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));

// ── Health Check ────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'TaskFlow API ✅ Running' }));

// ── 404 Handler ─────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Connect DB then Start ───────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
  })
  .catch((err) => {
    console.error('DB connection failed ❌', err.message);
    process.exit(1);
  });
