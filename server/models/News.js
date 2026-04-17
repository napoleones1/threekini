const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  slug:      { type: String, unique: true },
  excerpt:   { type: String, required: true },
  content:   { type: String, required: true },
  category:  { type: String, required: true, enum: ['politik','ekonomi','teknologi','olahraga','hiburan','internasional','gaya-hidup'] },
  image:     { type: String, default: '' },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName:{ type: String },
  status:    { type: String, enum: ['draft', 'published'], default: 'draft' },
  views:     { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { bufferCommands: false });

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80) + '-' + Date.now();
}

newsSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }
  next();
});

newsSchema.pre('save', function (next) {
  if (this.isModified('title') && this.slug) {
    this.slug = generateSlug(this.title);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('News', newsSchema);
