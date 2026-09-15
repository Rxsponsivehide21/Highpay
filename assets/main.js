// ---------- Config ----------
const WHATSAPP_NUMBER = '256700000000';
const WHATSAPP_MESSAGE = "Hi HighPay, I'd like to sell USDT for cash. Can you help?";
const UGX_PER_USD = 3700;
const FEE_RATE = 0.02;

// Supabase — replace with your project values from https://supabase.com/dashboard
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// ---------- Theme (day / night) ----------
(function initTheme() {
  const stored = localStorage.getItem('highpay_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('highpay_theme', next);
  updateThemeIcons();
}

function updateThemeIcons() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  document.querySelectorAll('[data-theme-icon]').forEach(el => {
    el.innerHTML = isDark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  });
}

document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
  btn.addEventListener('click', toggleTheme);
});
updateThemeIcons();

// ---------- WhatsApp ----------
const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
document.querySelectorAll('[data-wa]').forEach(el => { el.href = waLink; });

// ---------- Mobile nav ----------
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('nav.links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ---------- Year ----------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Active nav ----------
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav.links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
});

// ---------- Floating coins (USDT + cash symbols) ----------
function spawnCoins() {
  const layer = document.getElementById('coinsLayer');
  if (!layer) return;
  const sym = ['₮', '💵', '🪙', '💰', '₮', '💵'];
  const cls = ['gold', 'amber', 'bright', 'deep'];
  for (let i = 0; i < 18; i++) {
    const c = document.createElement('div');
    c.className = 'coin ' + cls[i % cls.length];
    c.textContent = sym[i % sym.length];
    c.style.left = Math.random() * 100 + 'vw';
    c.style.fontSize = (16 + Math.random() * 18) + 'px';
    c.style.animationDuration = (12 + Math.random() * 14) + 's';
    c.style.animationDelay = (Math.random() * 10) + 's';
    layer.appendChild(c);
  }
}
spawnCoins();

// ---------- News marquee (hardcoded from blog snippets) ----------
const NEWS_SNIPPETS = [
  { text: 'Is crypto legal in Uganda? What BoU has said and what remains grey.', href: 'blog/is-crypto-legal-uganda.html' },
  { text: 'Common crypto scams in Uganda — fake WhatsApp agents and recovery fraud.', href: 'blog/crypto-scams-uganda.html' },
  { text: 'How to cash out USDT in Uganda: P2P, OTC desks, and same-day payouts.', href: 'blog/cash-out-crypto-uganda.html' },
  { text: 'HighPay community is coming soon — cash-out is open today.', href: 'community.html' },
  { text: 'Stablecoins for remittances: why USDT is the workhorse in East Africa.', href: 'learn.html' },
  { text: 'Smart regulation, not bans — HighPay advocacy for workable crypto rules.', href: 'advocacy.html' },
];

function renderNewsMarquee() {
  const track = document.getElementById('newsTrack');
  if (!track) return;
  const base = location.pathname.includes('/blog/') ? '../' : '';
  const items = NEWS_SNIPPETS.map(n =>
    `<span class="news-item"><span class="news-dot"></span><a href="${base}${n.href}">${n.text}</a></span>`
  ).join('');
  track.innerHTML = items + items;
}
renderNewsMarquee();

// ---------- USDT calculator only ----------
let usdtPrice = 1.0;
let usdtChange = 0;

function fmtUGX(n) {
  return 'UGX ' + Math.round(n).toLocaleString('en-UG');
}
function fmtUSD(n) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function updateCalculator() {
  const amountEl = document.getElementById('amount');
  if (!amountEl) return;
  const amount = parseFloat(amountEl.value) || 0;
  const gross = amount * usdtPrice * UGX_PER_USD;
  const net = gross * (1 - FEE_RATE);
  const payoutEl = document.getElementById('payoutValue');
  if (payoutEl) payoutEl.textContent = fmtUGX(net);
  const rateNote = document.getElementById('rateNote');
  if (rateNote) rateNote.textContent = `1 USDT ≈ ${fmtUGX(usdtPrice * UGX_PER_USD)}`;
  const msg = `Hi HighPay, I'd like to sell ${amount} USDT for cash. Can you confirm the rate?`;
  const cta = document.getElementById('calcWhatsapp');
  if (cta) cta.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function renderRateCard() {
  const usdEl = document.getElementById('rateUsd');
  const ugxEl = document.getElementById('rateUgx');
  const changeEl = document.getElementById('rateChange');
  if (usdEl) usdEl.textContent = fmtUSD(usdtPrice);
  if (ugxEl) ugxEl.textContent = fmtUGX(usdtPrice * UGX_PER_USD * (1 - FEE_RATE));
  if (changeEl) {
    changeEl.textContent = (usdtChange >= 0 ? '+' : '') + usdtChange.toFixed(2) + '%';
    changeEl.className = 'rate-change ' + (usdtChange >= 0 ? 'up' : 'down');
  }
}

function renderTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const item = `<span><b>USDT</b> ${fmtUSD(usdtPrice)} <span style="color:${usdtChange >= 0 ? '#26a17b' : '#c45c5c'}">${usdtChange >= 0 ? '+' : ''}${usdtChange.toFixed(2)}%</span></span>
    <span><b>Net after 2%</b> ${fmtUGX(usdtPrice * UGX_PER_USD * (1 - FEE_RATE))}</span>
    <span><b>Fee</b> Flat 2%</span>
    <span><b>Payout</b> Bank · MoMo · Cash</span>`;
  track.innerHTML = item + item + item + item;
}

function renderAll() {
  updateCalculator();
  renderRateCard();
  renderTicker();
}

async function fetchLivePrice() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd&include_24hr_change=true'
    );
    if (!res.ok) throw new Error('bad');
    const data = await res.json();
    if (data.tether) {
      usdtPrice = data.tether.usd || 1;
      usdtChange = data.tether.usd_24h_change || 0;
    }
    const src = document.getElementById('calcSource');
    if (src) src.textContent = 'Live USDT price · refreshed every 60s';
    const tag = document.getElementById('liveTag');
    if (tag) tag.innerHTML = '<span class="pulse-dot"></span>Live';
  } catch {
    const src = document.getElementById('calcSource');
    if (src) src.textContent = 'Indicative price — confirm exact rate on WhatsApp';
    const tag = document.getElementById('liveTag');
    if (tag) tag.innerHTML = 'Indicative';
  }
  renderAll();
}

if (document.getElementById('amount')) {
  document.getElementById('amount').addEventListener('input', updateCalculator);
  renderAll();
  fetchLivePrice();
  setInterval(fetchLivePrice, 60000);
}

// ---------- Supabase client (optional) ----------
let supabaseClient = null;

async function initSupabase() {
  if (!SUPABASE_URL.includes('YOUR_PROJECT') && typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) updateAuthUI(session.user);
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      updateAuthUI(session?.user || null);
    });
  }
}

function updateAuthUI(user) {
  const status = document.getElementById('authStatus');
  if (!status) return;
  if (user) {
    status.textContent = 'Signed in as ' + (user.email || user.phone || 'user');
    status.style.display = 'block';
  } else {
    status.style.display = 'none';
  }
}

async function signInWithOAuth(provider) {
  if (!supabaseClient) {
    alert('Supabase is not configured yet. Add your project URL and anon key in assets/main.js, then load the Supabase JS SDK.');
    return;
  }
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + '/login.html' },
  });
  if (error) alert(error.message);
}

async function signInWithPhone(e) {
  e.preventDefault();
  const form = e.target;
  const phone = form.phone.value.trim().replace(/\s/g, '');
  if (!/^(256|0)\d{9}$/.test(phone)) {
    alert('Enter a valid Ugandan phone number (0… or 256…)');
    return;
  }
  const normalized = phone.startsWith('0') ? '+256' + phone.slice(1) : '+' + phone;

  if (supabaseClient) {
    const { error } = await supabaseClient.auth.signInWithOtp({ phone: normalized });
    if (error) {
      alert(error.message);
      return;
    }
    alert('Check your phone for an OTP (when SMS is configured in Supabase).');
  } else {
    localStorage.setItem('highpay_phone', phone);
    window.location.href = 'learn.html?welcome=1';
  }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) loginForm.addEventListener('submit', signInWithPhone);

document.querySelectorAll('[data-oauth]').forEach(btn => {
  btn.addEventListener('click', () => signInWithOAuth(btn.getAttribute('data-oauth')));
});

// Load Supabase CDN only on login page if configured
if (document.getElementById('loginForm') && !SUPABASE_URL.includes('YOUR_PROJECT')) {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload = initSupabase;
  document.head.appendChild(s);
}
