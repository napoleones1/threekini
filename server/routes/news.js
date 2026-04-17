const router = require('express').Router();
const News = require('../models/News');
const authMiddleware = require('../middleware/auth');

// Middleware: hanya superadmin
function superAdminOnly(req, res, next) {
  if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Hanya superadmin yang dapat melakukan aksi ini.' });
  next();
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

// GET /api/news/admin/all — semua berita (admin & superadmin)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'superadmin' ? {} : { author: req.user.id };
    const news = await News.find(filter).sort({ createdAt: -1 }).populate('author', 'username role');
    res.json(news);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/news/admin/pending — berita pending (superadmin only)
router.get('/admin/pending', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const news = await News.find({ status: 'pending' }).sort({ createdAt: -1 }).populate('author', 'username');
    res.json(news);
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/news/:slug — detail publik
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

// POST /api/news — buat berita (image dari URL)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, excerpt, content, category, status, imageUrl } = req.body;

    // Non-superadmin hanya bisa simpan draft atau submit ke pending
    let finalStatus = 'draft';
    if (req.user.role === 'superadmin') {
      finalStatus = status || 'draft';
    } else {
      finalStatus = status === 'pending' ? 'pending' : 'draft';
    }

    const article = await News.create({
      title, excerpt, content, category,
      image: imageUrl || '',
      status: finalStatus,
      author: req.user.id,
      authorName: req.user.username
    });
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/news/:id — update berita
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Berita tidak ditemukan.' });

    // Non-superadmin hanya bisa edit milik sendiri
    if (req.user.role !== 'superadmin' && article.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Tidak diizinkan.' });
    }

    const { title, excerpt, content, category, status, imageUrl } = req.body;
    const update = { title, excerpt, content, category };
    if (imageUrl !== undefined) update.image = imageUrl;

    // Non-superadmin tidak bisa langsung publish
    if (req.user.role === 'superadmin') {
      update.status = status;
    } else {
      update.status = status === 'pending' ? 'pending' : 'draft';
    }

    const updated = await News.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/news/:id/approve — approve (superadmin only)
router.patch('/:id/approve', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const article = await News.findByIdAndUpdate(req.params.id, { status: 'published' }, { new: true });
    if (!article) return res.status(404).json({ message: 'Berita tidak ditemukan.' });
    res.json({ message: 'Berita berhasil dipublish.', article });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PATCH /api/news/:id/reject — reject (superadmin only)
router.patch('/:id/reject', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const article = await News.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectReason: reason || '' }, { new: true });
    if (!article) return res.status(404).json({ message: 'Berita tidak ditemukan.' });
    res.json({ message: 'Berita ditolak.', article });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/news/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Berita tidak ditemukan.' });
    if (req.user.role !== 'superadmin' && article.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Tidak diizinkan.' });
    }
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'Berita berhasil dihapus.' });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
