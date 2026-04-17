require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Root dir = news-portal/
const ROOT = path.join(__dirname, '..');

// Middleware
app.use(cors());
app.use(express.json());

// Routes API — harus sebelum static
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));

// Static assets
app.use('/uploads', express.static(path.join(ROOT, 'uploads')));
app.use('/admin', express.static(path.join(ROOT, 'admin')));
app.use(express.static(ROOT));

// Explicit HTML routes
app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get('/article', (req, res) => res.sendFile(path.join(ROOT, 'article.html')));
app.get('/category', (req, res) => res.sendFile(path.join(ROOT, 'category.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(ROOT, 'admin', 'login.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(ROOT, 'admin', 'dashboard.html')));

// Koneksi MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB terhubung');
    const port = process.env.PORT || 5000;
    app.listen(port, () =>
      console.log(`🚀 Server berjalan di http://localhost:${port}`)
    );
  })
  .catch(err => console.error('❌ MongoDB gagal terhubung:', err.message));

module.exports = app;
