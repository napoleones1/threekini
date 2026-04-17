const router = require('express').Router();
const multer = require('multer');
const News = require('../models/News');
const authMiddleware = require('../middleware/auth');

// Pakai memory storage — kompatibel dengan Vercel (no disk write)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    /image\/(jpeg|png|webp|gif)/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Hanya file gambar yang diizinkan.'));
  }
});

// Helper: konversi buffer ke base64 data URL
function toDataURL(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

// GET /api/news — publik
router.get('/', async (req, res) => {
  try {
    const { category, limit = 10, page = 1, search } = req.query;
    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } }
    ];
    const news = await News.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-content');
    const total = await News.countDocuments(filter);
    res.json({ news, total, page: Number(page) });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/news/admin/all — semua berita untuk admin (pakai prefix /admin/ agar tidak bentrok dengan :slug)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }).populate('author', 'username');
    res.json(news);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/news/:slug — detail artikel publik
router.get('/:slug', async (req, res) => {
  try {
    const article = await News.findOne({ slug: req.params.slug, status: 'published' });
    if (!article) return res.status(404).json({ message: 'Berita tidak ditemukan.' });
    article.views += 1;
    await article.save();
    res.json(article);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/news — buat berita baru
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, category, status } = req.body;
    const image = req.file ? toDataURL(req.file) : '';
    const article = await News.create({
      title, excerpt, content, category, image,
      status: status || 'draft',
      author: req.user.id,
      authorName: req.user.username
    });
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/news/:id — update berita
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.image = toDataURL(req.file);
    const article = await News.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!article) return res.status(404).json({ message: 'Berita tidak ditemukan.' });
    res.json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/news/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'Berita berhasil dihapus.' });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
