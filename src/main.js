import './style.css';
import services from './services.json';

const MOTION = 'bold'; // 'bold' | 'subtle'
const SHOW_BUBBLES = true;

const gallery = [
  { src: '/assets/mclaren.jpg', alt: 'A matte McLaren 600LT' },
  { src: '/assets/rangerover.jpg', alt: 'Range Rover Sport, still dripping' },
  { src: '/assets/f150.jpg', alt: 'Ford F-150 Platinum' },
  { src: '/assets/camry.jpg', alt: 'Toyota Camry XSE in pearl white' },
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

/* Staff-on-site line (London, ON time) */
{
  const h = +new Intl.DateTimeFormat('en-CA', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Toronto' }).format(new Date());
  $('#staff-now').textContent = h >= 9 && h < 17 ? 'Someone is on the lot right now.' : 'Bays are open now. Staff are back at 9 AM.';
}

/* Hero bubbles */
if (SHOW_BUBBLES) {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const wrap = $('#bubbles');
  for (let i = 0; i < 22; i++) {
    const size = 8 + rnd() * 34;
    const b = document.createElement('span');
    Object.assign(b.style, {
      position: 'absolute', bottom: '-60px', left: rnd() * 100 + '%', width: size + 'px', height: size + 'px',
      borderRadius: '50%', border: '2px solid #5BB8F0',
      animation: `bl-rise ${9 + rnd() * 10}s linear ${-rnd() * 18}s infinite, bl-sway ${3 + rnd() * 3}s ease-in-out infinite`,
    });
    wrap.appendChild(b);
  }
}

/* Scroll reveals */
let io;
const bold = MOTION === 'bold';
const dist = bold ? 40 : 18;
const from = {
  up: `translate3d(0,${dist}px,0)`, right: `translate3d(${dist}px,0,0)`, zoom: `scale(${bold ? 0.92 : 0.97})`,
  clip: `translate3d(0,${dist * 0.6}px,0)`, wipe: 'none', 'wipe-up': 'none', curtain: 'scaleX(1)',
};
const clipFrom = { clip: 'inset(-10% -5% 100% -5%)', wipe: 'inset(0 100% 0 0)', 'wipe-up': 'inset(100% 0 0 0)' };

function revealEl(t) {
  if (t._shown) return;
  t._shown = true;
  const k = t.dataset.reveal;
  const d = +(t.dataset.delay || 0);
  t.style.opacity = '1';
  t.style.transform = k === 'curtain' ? 'scaleX(0)' : 'none';
  if (k === 'clip') t.style.clipPath = 'inset(-10% -5% -20% -5%)';
  if (k === 'wipe' || k === 'wipe-up') {
    t.style.clipPath = 'inset(0 0 0 0)';
    setTimeout(() => { t.style.clipPath = ''; }, 1300 + d);
  }
  setTimeout(() => { t.style.transition = t._origT || ''; t.style.willChange = 'auto'; }, 1200 + d);
  io && io.unobserve(t);
}

function setupReveal() {
  io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && revealEl(e.target)), { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  $$('[data-reveal]').forEach((el) => {
    if (el.dataset.rv) return;
    el.dataset.rv = '1';
    const k = el.dataset.reveal;
    const d = +(el.dataset.delay || 0);
    el._origT = el.style.transition || '';
    el.style.opacity = k === 'curtain' ? '1' : '0';
    el.style.transform = from[k] || from.up;
    if (clipFrom[k]) el.style.clipPath = clipFrom[k];
    const tf = k === 'curtain' ? 'transform 1.1s cubic-bezier(.7,0,.2,1)' : 'transform 1s cubic-bezier(.2,.8,.2,1)';
    el.style.transition = `opacity .9s cubic-bezier(.2,.8,.2,1) ${d}ms, ${tf} ${d}ms, clip-path 1.1s cubic-bezier(.7,0,.2,1) ${d}ms` +
      (el._origT ? ',' + el._origT.replace(/transform[^,]*,?/g, '') : '');
    io.observe(el);
  });
  requestAnimationFrame(() => $$('[data-rv]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) revealEl(el);
  }));
  setTimeout(() => { if (document.visibilityState !== 'visible') $$('[data-rv]').forEach(revealEl); }, 1500);
  window.addEventListener('beforeprint', () => $$('[data-rv]').forEach(revealEl));
}

/* Scroll-driven effects */
const progress = $('#progress');
const heroImg = $('#hero-img');
const heroContent = $('#hero-content');
const logoSpin = $('#logo-spin');
const nav = $('#nav');
const navInner = $('#nav-inner');
const inks = $$('[data-ink]');
const marquees = $$('[data-marquee]');
const parallax = $$('[data-parallax]');
const scrubs = $$('[data-scrub]');
const showcase = $('[data-showcase]');
const shots = showcase ? $$('[data-shot]').map((el) => [el, el.firstElementChild]) : [];
let scrolled = null, full = null, cur = -1, ticking = false;

nav.style.transition += ',transform .5s cubic-bezier(.2,.8,.2,1)';

function onScroll() {
  const y = scrollY, vh = innerHeight, h = document.documentElement.scrollHeight - vh;

  if (io) $$('[data-rv]').forEach((el) => {
    if (el._shown) return;
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.95 && r.bottom > 0) revealEl(el);
  });

  progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;

  if (y < vh * 1.2) {
    heroImg.style.transform = `translate3d(0,${y * 0.28}px,0) scale(${1 + y * 0.00012})`;
    heroContent.style.transform = `translate3d(0,${-y * 0.35}px,0)`;
    heroContent.style.opacity = String(1 - Math.min(y / (vh * 0.7), 1));
  }

  {
    const r = logoSpin.getBoundingClientRect();
    const c = (r.top + r.height / 2 - vh / 2) / vh;
    logoSpin.style.transform = `rotate(${c * -24}deg) scale(${1 - Math.min(Math.abs(c), 1) * 0.12})`;
  }

  marquees.forEach((m) => {
    const r = m.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const off = (vh - r.top) * 0.45;
    m._sw ||= m.scrollWidth;
    m.style.transform = `translate3d(${+m.dataset.marquee < 0 ? -off : off - m._sw * 0.35}px,0,0)`;
  });

  parallax.forEach((el) => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    el.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) / vh) * -60 * (+el.dataset.parallax || 1)}px,0)`;
  });

  scrubs.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) return;
    const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.75)));
    const k = el.dataset.scrub;
    if (k === 'band') { const i = (1 - p) * 12; el.style.clipPath = `inset(0 ${i}% round ${i ? 16 : 0}px)`; }
    if (k === 'grow') el.style.transform = `scale(${0.88 + p * 0.12})`;
    if (k === 'spin') el.style.transform = `rotate(${(p - 1) * 40}deg)`;
  });

  if (showcase) {
    const r = showcase.getBoundingClientRect();
    const f = r.top <= 1 && r.bottom >= vh - 1;
    if (f !== full) {
      full = f;
      nav.style.transform = f ? 'translateY(-110%)' : 'none';
      nav.style.pointerEvents = f ? 'none' : '';
      progress.style.opacity = f ? '0' : '1';
    }
    if (r.bottom > 0 && r.top < vh) {
      const n = shots.length;
      const t = Math.max(0, Math.min(1, -r.top / (r.height - vh))) * (n - 1);
      shots.forEach(([el, img], i) => {
        if (i === 0) { img.style.transform = `scale(${1 + Math.min(t, 1) * 0.08})`; return; }
        const l = Math.max(0, Math.min(1, t - (i - 1)));
        const e = l < 0.5 ? 2 * l * l : 1 - Math.pow(-2 * l + 2, 2) / 2;
        el.style.clipPath = `inset(${(1 - e) * 100}% 0 0 0)`;
        img.style.transform = `scale(${1.18 - e * 0.18})`;
      });
      const c = Math.min(n - 1, Math.round(t));
      if (c !== cur) {
        cur = c;
        showcase.querySelectorAll('[data-cap]').forEach((el) => {
          const i = +el.dataset.cap, on = i === c;
          el.style.opacity = on ? 1 : 0;
          el.style.transform = `translateY(${on ? 0 : i < c ? -20 : 20}px)`;
        });
        showcase.querySelectorAll('[data-dot]').forEach((d) => { d.style.opacity = +d.dataset.dot <= c ? 1 : 0.35; });
        showcase.querySelector('[data-count]').textContent = c + 1;
      }
    }
  }

  const s = y > 40;
  if (s !== scrolled) {
    scrolled = s;
    nav.style.background = s ? '#FFFFFF' : 'transparent';
    nav.style.boxShadow = s ? '0 1px 0 #DCE8F5' : 'none';
    navInner.style.padding = s ? '10px 0' : '20px 0';
    inks.forEach((el) => { el.style.color = s ? '#0A2A5E' : '#FFFFFF'; });
  }
}

window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { ticking = false; onScroll(); });
}, { passive: true });
window.addEventListener('resize', () => { marquees.forEach((m) => { m._sw = 0; }); onScroll(); });
onScroll();

/* Modals */
const lock = (on) => { document.body.style.overflow = on ? 'hidden' : ''; };
function openLayer(layer, inner, inT, outT) {
  layer.style.display = 'flex';
  layer._out = outT;
  lock(true);
  raf2(() => { layer.style.opacity = '1'; inner.style.transform = inT; });
}
function closeLayer(layer, inner) {
  layer.style.opacity = '0';
  inner.style.transform = layer._out;
  setTimeout(() => { layer.style.display = 'none'; lock(false); }, 280);
}
const onActivate = (el, fn) => {
  el.addEventListener('click', fn);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
};

const svcModal = $('#svc-modal');
const svcPanel = $('#svc-panel');
let svcOpen = false;
$$('[data-svc]').forEach((card) => onActivate(card, () => {
  const s = services[+card.dataset.svc];
  $('#svc-title').textContent = s.title;
  $('#svc-details').textContent = s.details;
  $('#svc-icon').innerHTML = s.icon;
  svcOpen = true;
  openLayer(svcModal, svcPanel, 'translateY(0)', 'translateY(16px)');
}));
const closeSvc = () => { svcOpen = false; closeLayer(svcModal, svcPanel); };

const lb = $('#lightbox');
const lbImg = $('#lb-img');
let lbIdx = null;
const showLb = () => {
  const g = gallery[lbIdx];
  lbImg.src = g.src;
  lbImg.alt = g.alt;
  $('#lb-alt').textContent = g.alt;
  $('#lb-count').textContent = `${lbIdx + 1} / ${gallery.length}`;
};
const step = (d) => { lbIdx = (lbIdx + d + gallery.length) % gallery.length; showLb(); };
$$('[data-lb]').forEach((fig) => onActivate(fig, () => {
  lbIdx = +fig.dataset.lb;
  showLb();
  openLayer(lb, lbImg, 'scale(1)', 'scale(.94)');
}));
const closeLb = () => { lbIdx = null; closeLayer(lb, lbImg); };

document.addEventListener('click', (e) => {
  const stepBtn = e.target.closest('[data-step]');
  if (stepBtn) { step(+stepBtn.dataset.step); return; }
  const closeBtn = e.target.closest('button[data-close]');
  if (closeBtn) { closeBtn.dataset.close === 'svc' ? closeSvc() : closeLb(); return; }
  if (e.target === svcModal) closeSvc();
  if (e.target === lb) closeLb();
});
window.addEventListener('keydown', (e) => {
  if (svcOpen && e.key === 'Escape') return closeSvc();
  if (lbIdx == null) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});

/* Loading screen */
{
  const loader = $('#loader');
  const inner = $('#loader-inner');
  const bar = $('#loader-bar');
  lock(true);
  raf2(() => { bar.style.width = '100%'; });
  const t0 = Date.now();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    setTimeout(() => {
      loader.style.clipPath = 'inset(0 0 100% 0)';
      inner.style.opacity = '0';
      inner.style.transform = 'translateY(-30px)';
      setTimeout(setupReveal, 350);
      setTimeout(() => { loader.remove(); if (lbIdx == null && !svcOpen) lock(false); }, 1000);
    }, Math.max(0, 1500 - (Date.now() - t0)));
  };
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
  setTimeout(finish, 3500);
}
