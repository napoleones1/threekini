const API = '/api/news';

// ===== HAMBURGER MENU =====
function toggleMenu() {
  const menu = document.getElementById('nav-menu');
  const hamburger = document.getElementById('hamburger');
  if (menu) menu.classList.toggle('open');
  if (hamburger) hamburger.classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const menu = document.getElementById('nav-menu');
  const hamburger = document.getElementById('hamburger');
  if (menu && hamburger && !hamburger.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('open');
    hamburger.classList.remove('open');
  }
});

// Search handler (desktop + mobile)
function initSearch() {
  function doSearch(q) {
    if (q) window.location.href = (window.location.pathname.includes('category') ? '' : '') + `category.html?search=${encodeURIComponent(q)}`;
  }
  // Desktop
  document.getElementById('search-btn')?.addEventListener('click', () => doSearch(document.getElementById('search-input')?.value.trim()));
  document.getElementById('search-input')?.addEventListener('keydown', e => e.key === 'Enter' && doSearch(e.target.value.trim()));
  // Mobile
  document.getElementById('search-btn-mobile')?.addEventListener('click', () => doSearch(document.getElementById('search-input-mobile')?.value.trim()));
  document.getElementById('search-input-mobile')?.addEventListener('keydown', e => e.key === 'Enter' && doSearch(e.target.value.trim()));
}
initSearch();

// ===== BREAKING NEWS TICKER =====
async function initTicker() {
  const ticker = document.querySelector('.ticker span');
  if (!ticker) return;
  try {
    const res = await fetch('/api/news?limit=8');
    const data = await res.json();
    const news = data.news || [];
    if (!news.length) return;
    ticker.textContent = news.map(n => n.title).join(' \u00a0â€¢\u00a0 ') + ' \u00a0â€¢\u00a0 ';
  } catch { /* pakai teks default */ }
}
function updateDateTime() {
  const el = document.getElementById('datetime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
updateDateTime();
setInterval(updateDateTime, 60000);

// ===== CATEGORY COLOR MAP =====
const catClass = {
  politik: 'politik', ekonomi: 'ekonomi', teknologi: 'teknologi',
  olahraga: 'olahraga', hiburan: 'hiburan', internasional: 'internasional', 'gaya-hidup': 'hiburan'
};

function catLabel(cat) {
  const map = { politik:'Politik', ekonomi:'Ekonomi', teknologi:'Teknologi', olahraga:'Olahraga', hiburan:'Hiburan', internasional:'Internasional', 'gaya-hidup':'Gaya Hidup' };
  return map[cat] || cat;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return Math.floor(diff/60) + ' menit lalu';
  if (diff < 86400) return Math.floor(diff/3600) + ' jam lalu';
  return Math.floor(diff/86400) + ' hari lalu';
}

function imgSrc(img, seed) {
  return img && img.trim() !== '' ? img : `https://picsum.photos/seed/${seed}/600/400`;
}

// ===== FETCH NEWS =====
async function fetchNews(params = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`/api/news?${qs}`);
    const data = await res.json();
    return data.news || [];
  } catch {
    return [];
  }
}

// ===== RENDER HERO =====
async function renderHero(news) {
  if (!news.length) return;

  const main = document.querySelector('.hero-main');
  const side = document.querySelector('.hero-side');
  if (!main || !side) return;

  const top = news[0];
  main.innerHTML = `
    <a href="article.html?slug=${top.slug}" class="hero-card">
      <img src="${imgSrc(top.image, top.slug)}" alt="${top.title}" />
      <div class="hero-overlay">
        <span class="category-tag ${catClass[top.category] || 'politik'}">${catLabel(top.category)}</span>
        <h1>${top.title}</h1>
        <p>${top.excerpt}</p>
        <div class="meta"><i class="fa fa-clock"></i> ${timeAgo(top.createdAt)} &nbsp;|&nbsp; <i class="fa fa-user"></i> ${top.authorName || 'Redaksi'}</div>
      </div>
    </a>`;

  side.innerHTML = news.slice(1, 4).map((n, i) => `
    <a href="article.html?slug=${n.slug}" class="side-card">
      <img src="${imgSrc(n.image, n.slug + i)}" alt="${n.title}" />
      <div class="side-info">
        <span class="category-tag ${catClass[n.category] || 'politik'}">${catLabel(n.category)}</span>
        <h3>${n.title}</h3>
        <div class="meta"><i class="fa fa-clock"></i> ${timeAgo(n.createdAt)}</div>
      </div>
    </a>`).join('');
}

// ===== RENDER NEWS GRID =====
async function renderNewsGrid(news) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  if (!news.length) {
    grid.innerHTML = '<p style="color:#aaa;grid-column:1/-1;text-align:center;padding:32px">Belum ada berita.</p>';
    return;
  }

  grid.innerHTML = news.map(n => `
    <a href="article.html?slug=${n.slug}" class="news-card">
      <img src="${imgSrc(n.image, n.slug)}" alt="${n.title}" loading="lazy" />
      <div class="card-body">
        <span class="category-tag ${catClass[n.category] || 'politik'}">${catLabel(n.category)}</span>
        <h3>${n.title}</h3>
        <p>${n.excerpt}</p>
        <div class="meta"><i class="fa fa-clock"></i> ${timeAgo(n.createdAt)} &nbsp;|&nbsp; <i class="fa fa-user"></i> ${n.authorName || 'Redaksi'}</div>
      </div>
    </a>`).join('');
}

// ===== RENDER CATEGORY GRID =====
async function renderCatGrid(id, category) {
  const grid = document.getElementById(id);
  if (!grid) return;
  const news = await fetchNews({ category, limit: 4 });
  if (!news.length) { grid.innerHTML = '<p style="color:#aaa;grid-column:1/-1;text-align:center;padding:24px">Belum ada berita.</p>'; return; }
  grid.innerHTML = news.map(n => `
    <a href="article.html?slug=${n.slug}" class="cat-card">
      <img src="${imgSrc(n.image, n.slug)}" alt="${n.title}" loading="lazy" />
      <div class="card-body">
        <span class="category-tag ${catClass[n.category] || 'politik'}">${catLabel(n.category)}</span>
        <h3>${n.title}</h3>
        <div class="meta"><i class="fa fa-clock"></i> ${timeAgo(n.createdAt)}</div>
      </div>
    </a>`).join('');
}

// ===== RENDER TRENDING =====
function renderTrending(news) {
  const list = document.getElementById('trending-list');
  if (!list) return;
  if (!news.length) { list.innerHTML = '<li style="color:#aaa">Belum ada berita</li>'; return; }
  list.innerHTML = news.slice(0, 7).map(n => `
    <li><a href="article.html?slug=${n.slug}">${n.title}</a></li>`).join('');
}

// ===== MARKET DATA =====
const marketFallback = [
  { name: 'IHSG', value: '8.542,31', change: '+1.24%', up: true },
  { name: 'USD/IDR', value: 'Rp 16.200', change: '-0.32%', up: false },
  { name: 'Emas (gr)', value: 'Rp 1.245.000', change: '+0.87%', up: true },
  { name: 'Minyak (bbl)', value: '$78.45', change: '-0.54%', up: false },
  { name: 'Bitcoin', value: '$75.000', change: '+2.15%', up: true },
];

function renderMarketItems(items) {
  const el = document.getElementById('market-data');
  if (!el) return;
  el.innerHTML = items.map(function(m) {
    return '<div class="market-item">' +
      '<span class="market-name">' + m.name + (m.live ? ' <span style="font-size:9px;background:#e8f5e9;color:#2e7d32;padding:1px 5px;border-radius:10px;font-weight:700">LIVE</span>' : '') + '</span>' +
      '<div style="text-align:right">' +
      '<div class="market-val ' + (m.up ? 'up' : 'down') + '">' + m.value + '</div>' +
      '<div class="market-change ' + (m.up ? 'up' : 'down') + '">' + (m.up ? '▲' : '▼') + ' ' + m.change + '</div>' +
      '</div></div>';
  }).join('');
}

function renderMarket() {
  renderMarketItems(marketFallback);
}

async function fetchMarketData() {
  const el = document.getElementById('market-data');
  if (!el) return;

  try {
    const [cryptoRes, forexRes] = await Promise.allSettled([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'),
      fetch('https://open.er-api.com/v6/latest/USD')
    ]);

    var btcPrice = null, btcChange = null, usdIdr = null;

    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      var d = await cryptoRes.value.json();
      btcPrice = d.bitcoin ? d.bitcoin.usd : null;
      btcChange = d.bitcoin ? d.bitcoin.usd_24h_change : null;
    }
    if (forexRes.status === 'fulfilled' && forexRes.value.ok) {
      var d2 = await forexRes.value.json();
      usdIdr = d2.rates ? d2.rates.IDR : null;
    }

    var items = [
      {
        name: 'Bitcoin',
        value: btcPrice ? ('$' + Math.round(btcPrice).toLocaleString('en-US')) : '$75.000',
        change: btcChange ? ((btcChange >= 0 ? '+' : '') + btcChange.toFixed(2) + '%') : '+2.15%',
        up: btcChange !== null ? btcChange >= 0 : true,
        live: !!btcPrice
      },
      {
        name: 'USD/IDR',
        value: usdIdr ? ('Rp ' + Math.round(usdIdr).toLocaleString('id-ID')) : 'Rp 16.200',
        change: '—',
        up: false,
        live: !!usdIdr
      },
      { name: 'Emas (gr)', value: 'Rp 1.245.000', change: '+0.87%', up: true, live: false },
      { name: 'Minyak (bbl)', value: '$78.45', change: '-0.54%', up: false, live: false },
      { name: 'IHSG', value: '8.542,31', change: '+1.24%', up: true, live: false },
    ];

    renderMarketItems(items);
  } catch(e) {
    renderMarket();
  }
}
// ===== INIT INDEX PAGE =====
async function initIndex() {
  if (!document.getElementById('news-grid')) return;
  const news = await fetchNews({ limit: 20 });
  renderHero(news);
  renderNewsGrid(news.slice(0, 6));
  renderTrending(news);
  fetchMarketData();
  setInterval(fetchMarketData, 60000);
  renderCatGrid('tech-grid', 'teknologi');
  renderCatGrid('economy-grid', 'ekonomi');
}

// ===== INIT CATEGORY / SEARCH PAGE =====
async function initCategory() {
  const resultGrid = document.getElementById('result-grid');
  if (!resultGrid) return;

  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  const search = params.get('search');

  const catLabels = { politik:'Politik', ekonomi:'Ekonomi', teknologi:'Teknologi', olahraga:'Olahraga', hiburan:'Hiburan', internasional:'Internasional', 'gaya-hidup':'Gaya Hidup' };
  const titleEl = document.getElementById('page-title');

  // Set active nav
  document.querySelectorAll('.navbar ul li a').forEach(a => {
    a.classList.remove('active');
    if (cat && a.href.includes(`cat=${cat}`)) a.classList.add('active');
    if (!cat && !search && a.href.includes('index.html')) a.classList.add('active');
  });

  // Search handler
  const searchInput = document.getElementById('search-input');
  if (search && searchInput) searchInput.value = search;
  const searchInputMobile = document.getElementById('search-input-mobile');
  if (search && searchInputMobile) searchInputMobile.value = search;

  let page = 1;
  const limit = 10;
  let hasMore = true;

  if (search) {
    titleEl.textContent = `Hasil pencarian: "${search}"`;
  } else if (cat) {
    titleEl.textContent = catLabels[cat] || cat;
  }

  async function loadNews() {
    const query = { limit, page };
    if (cat) query.category = cat;
    if (search) query.search = search;

    const res = await fetch(`/api/news?${new URLSearchParams(query)}`);
    const data = await res.json();
    const news = data.news || [];

    if (page === 1 && !news.length) {
      resultGrid.innerHTML = '<p style="color:#aaa;grid-column:1/-1;text-align:center;padding:48px">Tidak ada berita ditemukan.</p>';
      return;
    }

    resultGrid.innerHTML += news.map(n => `
      <a href="article.html?slug=${n.slug}" class="news-card">
        <img src="${imgSrc(n.image, n.slug)}" alt="${n.title}" loading="lazy" />
        <div class="card-body">
          <span class="category-tag ${catClass[n.category] || 'politik'}">${catLabel(n.category)}</span>
          <h3>${n.title}</h3>
          <p>${n.excerpt}</p>
          <div class="meta"><i class="fa fa-clock"></i> ${timeAgo(n.createdAt)} &nbsp;|&nbsp; <i class="fa fa-user"></i> ${n.authorName || 'Redaksi'}</div>
        </div>
      </a>`).join('');

    hasMore = (page * limit) < data.total;
    const wrap = document.getElementById('load-more-wrap');
    if (wrap) wrap.style.display = hasMore ? 'block' : 'none';
  }

  await loadNews();

  document.getElementById('btn-load-more')?.addEventListener('click', async () => {
    page++;
    await loadNews();
  });

  // Sidebar
  const allNews = await fetchNews({ limit: 10 });
  renderTrending(allNews);
  renderMarket();
}

// ===== ARTICLE PAGE =====
async function initArticle() {
  const body = document.querySelector('.article-body');
  if (!body) return;

  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) return;

  try {
    const res = await fetch(`/api/news/${slug}`);
    if (!res.ok) throw new Error('Berita tidak ditemukan');
    const n = await res.json();

    document.title = `${n.title} - Threekini`;
    body.querySelector('h1').textContent = n.title;
    body.querySelector('.article-meta').innerHTML = `
      <span><i class="fa fa-user"></i> ${n.authorName || 'Redaksi'}</span>
      <span><i class="fa fa-clock"></i> ${new Date(n.createdAt).toLocaleDateString('id-ID', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
      <span><i class="fa fa-eye"></i> ${n.views.toLocaleString('id-ID')} pembaca</span>`;
    body.querySelector('img').src = imgSrc(n.image, n.slug);
    body.querySelector('img').alt = n.title;

    // Render paragraf konten
    const contentEl = body.querySelector('#article-content');
    if (contentEl) {
      contentEl.innerHTML = n.content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
    }

    // Trending & market sidebar
    const allNews = await fetchNews({ limit: 10 });
    renderTrending(allNews);
    renderMarket();
  } catch (err) {
    body.innerHTML = `<p style="color:#c62828;padding:32px;text-align:center">${err.message}</p>`;
  }
}

initTicker();
initIndex();
initCategory();
initArticle();

