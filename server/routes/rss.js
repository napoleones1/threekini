const router = require('express').Router();
const News = require('../models/News');

router.get('/', async (req, res) => {
  try {
    const news = await News.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title slug excerpt authorName createdAt category image');

    const baseUrl = process.env.BASE_URL || 'https://threekini.vercel.app';

    const items = news.map(n => `
    <item>
      <title><![CDATA[${n.title}]]></title>
      <link>${baseUrl}/article.html?slug=${n.slug}</link>
      <guid>${baseUrl}/article.html?slug=${n.slug}</guid>
      <description><![CDATA[${n.excerpt}]]></description>
      <category>${n.category}</category>
      <author>${n.authorName || 'Redaksi Threekini'}</author>
      <pubDate>${new Date(n.createdAt).toUTCString()}</pubDate>
      ${n.image ? `<enclosure url="${n.image}" type="image/jpeg"/>` : ''}
    </item>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Threekini - Berita Terkini</title>
    <link>${baseUrl}</link>
    <description>Temukan berita terkini dengan perspektif yang lebih luas, jelas, dan mudah dipahami.</description>
    <language>id-ID</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    res.status(500).send('RSS generation failed');
  }
});

module.exports = router;
