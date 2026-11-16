/* Soubra's · menu + ordering. No libraries, no build step.
   Engine adapted from the Burgero build, with Soubra's own design. */
'use strict';

/* Leave empty for demo mode (orders are shown, not sent).
   With Soubra's permission, put their WhatsApp number here, e.g. '96178700690'. */
const WHATSAPP_NUMBER = '';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = c => '$' + (c % 100 === 0 ? c / 100 : (c / 100).toFixed(2));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const ICON = {
  cup: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 14h20l-2.4 26a3 3 0 0 1-3 2.7h-9.2a3 3 0 0 1-3-2.7z"/><path d="M12 14h24M27 14l3-8 5 1"/></svg>',
  plate: '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="30" rx="18" ry="7"/><path d="M14 28c2-8 6-12 10-12s8 4 10 12"/><path d="M24 16v-6"/></svg>'
};

/* ================= ITEMS ================= */
const ITEMS = {};
MENU.forEach(cat => cat.items.forEach((it, i) => {
  it.cat = cat; it.i = i;
  it.cents = it.p == null ? null : Math.round(it.p * 100);
  ITEMS[it.id] = it;
}));
$('#fact-items').textContent = Object.keys(ITEMS).length;

/* ================= X-RAY BURGER (layered SVG) ================= */
const BW = 150;
function rng(seed) { let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const wave = (y, amp, step, x0 = -6, x1 = 156) => { let d = `M${x0} ${y}`; for (let x = x0; x < x1; x += step) d += ` q${step / 2} ${-amp} ${step} 0`; return d; };
const dots = (n, r, fill, h, seed, pad = 6) => { const R = rng(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${(pad + R() * (BW - pad * 2)).toFixed(1)}" cy="${(3 + R() * (h - 6)).toFixed(1)}" r="${(r * (.6 + R() * .7)).toFixed(1)}" fill="${fill}"/>`; return s; };
const patty = (h, fill, seed) => `<rect x="1" y="0" width="${BW - 2}" height="${h}" rx="${h / 2}" fill="${fill}"/>` + dots(16, 1.8, 'rgba(0,0,0,.35)', h, seed) + dots(8, 1.4, 'rgba(255,170,120,.25)', h, seed + 'b') + `<path d="M12 2.5 H${BW - 12}" stroke="rgba(255,200,160,.22)" stroke-width="2" stroke-linecap="round"/>`;
const cheese = (fill, holes) => `<path d="M-3 0 H${BW + 3} V5 H130 l-7 9 l-7 -9 H80 l-6 7 l-6 -7 H34 l-8 10 l-8 -10 H-3 Z" fill="${fill}"/>` + (holes ? '<circle cx="46" cy="2.6" r="1.6" fill="rgba(0,0,0,.13)"/><circle cx="96" cy="2.4" r="1.3" fill="rgba(0,0,0,.13)"/><circle cx="122" cy="2.8" r="1.1" fill="rgba(0,0,0,.13)"/>' : '');
const squig = (c, seed) => { const R = rng(seed); let s = ''; for (let i = 0; i < 9; i++) { const x = 6 + R() * 130, y = 3 + R() * 4; s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q5 -5 10 0 t10 0" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; } return s; };
const bunTop = h => `<path d="M3 ${h} C3 ${h * .3} 30 2 75 2 C120 2 147 ${h * .3} 147 ${h} Z" fill="url(#xgBun)"/><path d="M24 ${h * .4} C40 ${h * .2} 58 ${h * .15} 76 ${h * .15}" stroke="#FFE4B8" stroke-opacity=".55" stroke-width="5" stroke-linecap="round" fill="none"/><rect x="3" y="${h - 5}" width="144" height="5" rx="2.5" fill="#F7D19A"/>`;
const bunBottom = h => `<path d="M4 0 H146 C147 0 147 2 146.5 4 L143 ${h - 6} C142 ${h - 2} 139 ${h} 135 ${h} H15 C11 ${h} 8 ${h - 2} 7 ${h - 6} L3.5 4 C3 2 3 0 4 0Z" fill="url(#xgBunB)"/><rect x="5" y="0" width="140" height="4" rx="2" fill="#F6CB8A"/>`;
const LAYER = {
  bunT: [54, 'Toasted bun', () => bunTop(54)],
  bunB: [24, 'Bottom bun', () => bunBottom(24)],
  subT: [38, 'Sub bread', () => bunTop(38)],
  subB: [20, 'Sub bread', () => bunBottom(20)],
  beef: [24, '140g premium beef', k => patty(24, '#5A2B16', k)],
  steak: [16, '160g rib-eye steak', k => { const R = rng(k); let s = ''; for (let x = 2; x < BW - 10; x += 16) { const y = R() * 4; s += `<rect x="${x}" y="${y.toFixed(1)}" width="20" height="11" rx="4" fill="#7A3B22" transform="rotate(${(R() * 16 - 8).toFixed(0)} ${x + 10} ${y + 5})"/><path d="M${x + 3} ${(y + 6).toFixed(1)} h13" stroke="#C26A5A" stroke-width="1.6" stroke-linecap="round"/>`; } return s; }],
  chickenG: [22, 'Grilled chicken breast', () => `<rect x="1" y="0" width="${BW - 2}" height="22" rx="10" fill="#D9A562"/>` + [14, 36, 58, 80, 102, 124].map(x => `<path d="M${x} 3 l12 16" stroke="#8C5527" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>`).join('')],
  chickenF: [30, 'Fried chicken breast', k => { const R = rng(k); let s = `<rect x="0" y="4" width="${BW}" height="22" rx="11" fill="#D8892C"/>`; for (let x = 6; x < BW - 4; x += 9) { s += `<circle cx="${x}" cy="${5 + R() * 2}" r="${4 + R() * 2.5}" fill="#D8892C"/><circle cx="${x + 4}" cy="${25 - R() * 2}" r="${4 + R() * 2.5}" fill="#C97A22"/>`; } return s + dots(18, 1.6, '#F3B65C', 30, k + 'c', 8); }],
  chopped: [16, 'Chopped grilled chicken', k => { const R = rng(k); let s = ''; for (let i = 0; i < 16; i++) { const x = 2 + i * 9 + R() * 3, y = R() * 5; s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="13" height="10" rx="4" fill="${R() > .5 ? '#D9A562' : '#C88F4F'}"/>`; } return s; }],
  mozzPatty: [20, 'Fried mozzarella patty', k => `<rect x="2" y="0" width="${BW - 4}" height="20" rx="10" fill="#E8A84A"/>` + dots(14, 1.5, '#F7CF7D', 20, k) + `<rect x="22" y="8" width="106" height="4" rx="2" fill="#FFF3D6" opacity=".75"/>`],
  cheddarPatty: [20, 'Fried cheddar patty', k => `<rect x="2" y="0" width="${BW - 4}" height="20" rx="10" fill="#E2902C"/>` + dots(14, 1.5, '#F7C46A', 20, k) + `<rect x="22" y="8" width="106" height="4" rx="2" fill="#FFC53D" opacity=".8"/>`],
  cheddar: [9, 'Cheddar slice', () => cheese('#FFB627')],
  emmental: [9, 'Emmental', () => cheese('#F4DC8C', true)],
  mozzarella: [8, 'Mozzarella', () => cheese('#FFF4D6')],
  mixCheese: [9, 'Mixed cheese', () => cheese('#F7C35A') + [20, 52, 88, 118].map(x => `<path d="M${x} 2 h12" stroke="#FFF4D6" stroke-width="2" stroke-linecap="round"/>`).join('')],
  cheddarSauce: [9, 'Melted cheddar sauce', () => `<path d="M2 0 H148 V3 q-6 8 -12 0 q-8 10 -16 0 q-10 6 -18 0 q-9 9 -18 0 q-8 7 -16 0 q-10 8 -20 0 q-8 6 -14 0 q-9 9 -18 0 q-6 5 -14 0 Z" fill="#FFB627"/>`],
  lettuce: [13, 'Lettuce', () => `<path d="${wave(7, 9, 14)}" stroke="#74BB3A" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${wave(6, 7, 14)}" stroke="#A8DC5E" stroke-width="2.4" fill="none" stroke-linecap="round"/>`],
  iceberg: [12, 'Iceberg', () => `<path d="${wave(6, 8, 13)}" stroke="#A7D46C" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${wave(5, 6, 13)}" stroke="#D9F0AE" stroke-width="2.4" fill="none" stroke-linecap="round"/>`],
  rocca: [10, 'Rocca', () => { let d = 'M-2 5'; for (let x = -2; x < 152; x += 12) d += ' l6 -5 l6 10'; return `<path d="${d}" stroke="#4A8A2B" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`; }],
  tomato: [9, 'Tomato', () => `<rect x="1" y="0" width="72" height="9" rx="4.5" fill="#E2412F"/><rect x="77" y="0" width="72" height="9" rx="4.5" fill="#E2412F"/>` + [16, 34, 52, 92, 110, 128].map(x => `<ellipse cx="${x}" cy="4.5" rx="3" ry="1.6" fill="#FFB3A0"/>`).join('')],
  onion: [8, 'Diced onions', () => [26, 75, 124].map(x => `<ellipse cx="${x}" cy="4" rx="23" ry="2.6" fill="none" stroke="#E6D6F0" stroke-width="3"/>`).join('')],
  grilledOnion: [10, 'Grilled onion', k => squig('#B5772F', k)],
  onionRings: [12, 'Onion rings', () => [24, 62, 100, 132].map(x => `<ellipse cx="${x}" cy="6" rx="17" ry="4.6" fill="none" stroke="#C98A3A" stroke-width="5"/>`).join('')],
  pickles: [7, 'Dill pickles', () => [20, 57, 94, 131].map(x => `<ellipse cx="${x}" cy="3.5" rx="15" ry="3.2" fill="#8FB34A" stroke="#5F7F2A" stroke-width="1"/>`).join('')],
  mushrooms: [12, 'Mushrooms', () => [16, 44, 72, 100, 128].map(x => `<rect x="${x - 3}" y="7" width="6" height="5" rx="1" fill="#EBD8C0"/><path d="M${x - 12} 9 q12 -14 24 0 z" fill="#8E5D3A"/>`).join('')],
  peppers: [9, 'Buttered pepper & onions', () => [4, 26, 48, 70, 92, 114].map((x, i) => `<rect x="${x}" y="2" width="22" height="5" rx="2.5" fill="${['#E2412F', '#5FA83A', '#F7C21B'][i % 3]}" transform="rotate(${i % 2 ? 5 : -5} ${x + 11} 4.5)"/>`).join('')],
  pineapple: [10, 'Buttered pineapple & onions', () => [26, 75, 124].map(x => `<ellipse cx="${x}" cy="5" rx="22" ry="4.6" fill="#F6C945" stroke="#D99A1E" stroke-width="1.6"/><ellipse cx="${x}" cy="5" rx="5" ry="1.6" fill="#D99A1E"/>`).join('')],
  avocado: [8, 'Avocado', () => [10, 38, 66, 94, 122].map(x => `<ellipse cx="${x + 9}" cy="4" rx="13" ry="3.6" fill="#BFD86E" stroke="#4E7A2A" stroke-width="1.8"/>`).join('')],
  bacon: [10, 'Crispy beef bacon', () => `<path d="${wave(6, 6, 18, 2, 148)}" stroke="#9A3B26" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${wave(5, 5, 18, 2, 148)}" stroke="#E08A6E" stroke-width="1.6" fill="none" stroke-linecap="round"/>`],
  turkey: [9, 'Turkey', () => `<path d="${wave(5, 5, 22, 2, 148)}" stroke="#E7A9A0" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${wave(4, 4, 22, 2, 148)}" stroke="#F8DAD3" stroke-width="1.6" fill="none" stroke-linecap="round"/>`],
  parmesan: [6, 'Parmesan', k => { const R = rng(k); let s = ''; for (let i = 0; i < 18; i++) { const x = 6 + R() * 136, y = 1 + R() * 3; s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="6" height="2.4" rx="1" fill="#F3EBD3" transform="rotate(${(R() * 60 - 30).toFixed(0)} ${x + 3} ${y + 1})"/>`; } return s; }],
  coleslaw: [11, 'Coleslaw', k => { const R = rng(k); let s = ''; for (let i = 0; i < 26; i++) { const x = 4 + R() * 140, y = 2 + R() * 7; s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(6 + R() * 6).toFixed(1)} ${(R() * 3 - 1.5).toFixed(1)}" stroke="${R() > .35 ? '#F4EFE6' : '#8E5BB5'}" stroke-width="2" stroke-linecap="round"/>`; } return s; }],
  fries: [12, 'Fries', k => { const R = rng(k); let s = ''; for (let i = 0; i < 12; i++) { const x = 6 + i * 12 + R() * 4; s += `<rect x="${x.toFixed(1)}" y="1" width="16" height="4.2" rx="1.5" fill="#F2C14E" stroke="#D69B2A" stroke-width=".8" transform="rotate(${(R() * 40 - 20).toFixed(0)} ${x + 8} 5)"/>`; } return s; }],
  jalapenos: [7, 'Jalapeños', () => [14, 36, 58, 80, 102, 124, 140].map(x => `<circle cx="${x}" cy="3.5" r="3.4" fill="#BFE38F" stroke="#3F8F2A" stroke-width="1.8"/>`).join('')],
  nachos: [11, 'Tortilla chips', () => [4, 30, 56, 82, 108].map((x, i) => `<path d="M${x} 10 l${i % 2 ? 14 : 10} -10 l${i % 2 ? 12 : 16} 10z" fill="#E9B44C" stroke="#C98F2A" stroke-width="1"/>`).join('')],
  corn: [7, 'Corn', k => dots(26, 2.4, '#F5CF3A', 7, k)]
};
const SAUCE = { mayo: ['#FFF3D2', 'Mayo'], garlicMayo: ['#FFF8E8', 'Garlic mayo'], honeyMustard: ['#EDB51E', 'Honey mustard'], ketchup: ['#C7261C', 'Ketchup'],
  cocktail: ['#F08A6E', 'Cocktail sauce'], mustard: ['#E9B21E', 'Special mustard'], soubras: ['#E98A3A', "Soubra's sauce"], dijonnaise: ['#E7C55A', 'Dijonnaise'],
  caesar: ['#EFE3C4', 'Caesar sauce'], bbq: ['#6B2E14', 'Smoked BBQ sauce'], cherryJam: ['#9E1B32', 'Homemade cherry jam'], avoSauce: ['#A7C95A', 'Avocado sauce'] };
Object.entries(SAUCE).forEach(([k, [c, lab]]) => { LAYER[k] = [6, lab, () => `<rect x="5" y="0" width="140" height="4.5" rx="2.2" fill="${c}"/>` + [24, 60, 98, 130].map((x, i) => `<path d="M${x - 4} 3.5 q4 ${5 + (i % 2) * 3} 8 0z" fill="${c}"/>`).join('')]; });
const FIXED = new Set(['bunT', 'bunB', 'subT', 'subB', 'beef', 'steak', 'chickenG', 'chickenF', 'chopped']);
const typeOf = k => k.replace(/2$/, '');
const parseL = L => (L || '').split(' ').filter(Boolean).map(tok => {
  const [k, lab] = tok.split(':'); const t = typeOf(k);
  return { key: k, type: t, label: lab ? lab.replace(/_/g, ' ') : (LAYER[t] || LAYER.mayo)[1] };
});
/* removable ingredients of an item: [type, label] */
function removables(it) {
  if (it.L) {
    const seen = new Map();
    parseL(it.L).forEach(l => { if (!FIXED.has(l.type) && !seen.has(l.type)) seen.set(l.type, l.label); });
    return [...seen].map(([type, label]) => ({ type, label }));
  }
  return (it.rm || []).map(label => ({ type: label, label }));
}
const SVGNS = 'http://www.w3.org/2000/svg';
let xrN = 0;
const defs = uid => `<defs><linearGradient id="${uid}Bun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4B866"/><stop offset="1" stop-color="#C8742C"/></linearGradient><linearGradient id="${uid}BunB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9A55A"/><stop offset="1" stop-color="#B5672A"/></linearGradient></defs>`;
const layerSVG = (t, seed, uid) => (LAYER[t] || LAYER.mayo)[2](seed).replace(/xgBun/g, uid + 'Bun');

/** X-ray burger: an SVG of labeled layers. set(removedTypes) slides layers out. */
function xray(it, opts = {}) {
  const W = opts.W || 440, VH = opts.H || 320, labels = !opts.compact;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${VH}`); svg.setAttribute('class', 'xr' + (opts.compact ? ' compact' : ''));
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `Illustration of the layers in ${it.n}`);
  const uid = 'x' + (++xrN);
  svg.innerHTML = defs(uid) + '<g class="content"><ellipse class="shadow" cx="75" rx="92" ry="10" fill="rgba(0,0,0,.4)"/></g>';
  const content = svg.querySelector('.content'), shadow = svg.querySelector('.shadow');
  const layers = parseL(it.L).map((l, i) => {
    const def = LAYER[l.type] || LAYER.mayo, h = def[0];
    const g = document.createElementNS(SVGNS, 'g'); g.setAttribute('class', 'ly');
    const side = i % 2 ? 'l' : 'r', lx = side === 'r' ? BW + 24 : -24;
    g.innerHTML = `<g>${layerSVG(l.type, it.id + l.key, uid)}</g>` + (!labels ? '' :
      `<g class="lab"><line x1="${side === 'r' ? BW + 3 : -3}" y1="${h / 2}" x2="${lx}" y2="${h / 2}"/><circle cx="${side === 'r' ? BW + 3 : -3}" cy="${h / 2}" r="3"/>` +
      `<rect x="${lx}" y="${h / 2 - 12}" height="24" rx="12" width="0"/><text x="${side === 'r' ? lx + 11 : lx - 11}" y="${h / 2 + 4.3}" text-anchor="${side === 'r' ? 'start' : 'end'}">${esc(l.label)}</text></g>`);
    content.appendChild(g);
    return Object.assign(l, { h, g, on: true, side, lw: 0 });
  });
  function sizeLabels() {
    layers.forEach(L => {
      const t = L.g.querySelector('text'), r = L.g.querySelector('.lab rect'); if (!t) return;
      let w = 0; try { w = t.getComputedTextLength(); } catch (e) {}
      if (!w) w = t.textContent.length * 6.6;
      r.setAttribute('width', (w + 22).toFixed(1));
      if (L.side === 'l') r.setAttribute('x', (-24 - w - 22).toFixed(1));
      L.lw = w + 22;
    });
    layout(false);
  }
  function layout(animate) {
    const gap = opts.compact ? -3 : 6;
    let y = 0;
    layers.forEach(l => { if (l.on) { l.y = y; y += l.h + gap; } });
    const H = y - gap;
    const side = d => Math.max(40, ...layers.filter(l => l.on && l.side === d).map(l => l.lw || 0)) + 30;
    const lL = opts.compact ? 0 : side('l'), lR = opts.compact ? 0 : side('r');
    const s = Math.min(opts.compact ? (opts.maxScale || 2) : 1.25, (VH - (opts.compact ? 20 : 40)) / (H + 14), (W - 16) / (BW + lL + lR));
    layers.forEach(l => {
      const x = l.on ? 0 : (l.side === 'r' ? 110 : -110);
      l.g.style.transform = `translate(${x}px, ${(l.y || 0).toFixed(1)}px)`;
      l.g.classList.toggle('gone', !l.on);
    });
    shadow.setAttribute('cy', (H + 8).toFixed(1));
    content.style.transform = `translate(${((W - (BW + lL + lR) * s) / 2 + lL * s).toFixed(1)}px, ${((VH - (H + 14) * s) / 2).toFixed(1)}px) scale(${s.toFixed(3)})`;
    if (!animate) { content.style.transition = 'none'; layers.forEach(l => l.g.style.transition = 'none'); svg.getBoundingClientRect(); requestAnimationFrame(() => { content.style.transition = ''; layers.forEach(l => l.g.style.transition = ''); }); }
  }
  function set(off) { layers.forEach(l => { l.on = !off.has(l.type); }); layout(true); }
  layout(false);
  if (labels) requestAnimationFrame(sizeLabels);
  return { svg, set };
}

/* ================= CART STATE ================= */
const CART_KEY = 'soubras-cart-v1';
let lines = [];
try { lines = (JSON.parse(localStorage.getItem(CART_KEY) || '[]') || []).filter(l => l && ITEMS[l.id] && l.qty > 0); } catch (e) { lines = []; }
const save = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch (e) {} };
const keyOf = (id, m) => id + '|' + JSON.stringify([Object.entries(m.opt || {}).sort(), [...(m.rm || [])].sort(), (m.note || '').trim()]);
const unit = it => it.cents;
const count = () => lines.reduce((s, l) => s + l.qty, 0);
const total = () => lines.reduce((s, l) => s + (unit(ITEMS[l.id]) || 0) * l.qty, 0);
const qtyOf = id => lines.filter(l => l.id === id).reduce((s, l) => s + l.qty, 0);
function describe(it, m) {
  const out = [];
  Object.values(m.opt || {}).forEach(v => out.push(v));
  const rmLab = new Map(removables(it).map(r => [r.type, r.label]));
  (m.rm || []).forEach(t => out.push('No ' + (rmLab.get(t) || t).toLowerCase()));
  if (m.note) out.push('Note: ' + m.note);
  return out.join(' · ');
}
function addToCart(id, m, qty = 1, replaceKey = null) {
  const clean = { opt: m.opt || {}, rm: [...(m.rm || [])], note: (m.note || '').trim() };
  const k = keyOf(id, clean);
  if (replaceKey) lines = lines.filter(l => l.k !== replaceKey);
  const ex = lines.find(l => l.k === k);
  if (ex) ex.qty += qty; else lines.push({ k, id, m: clean, qty });
  save(); refresh();
}
function setQty(k, q) { const l = lines.find(x => x.k === k); if (!l) return; l.qty = q; if (q <= 0) lines = lines.filter(x => x.k !== k); save(); refresh(); }
function announce(t) { const el = $('#live'); el.textContent = ''; setTimeout(() => el.textContent = t, 30); }
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2200); }

/* ================= MENU RENDER ================= */
const priceHTML = it => it.cents == null ? '<small>ask</small>' : (it.from ? '<small>from</small>' : '') + money(it.cents);
const photo = it => it.img ? `<img src="assets/menu/${it.id}.webp" alt="" width="95" height="95" loading="lazy" decoding="async">` : (it.cat.id === 'drinks' ? ICON.cup : ICON.plate);
function cardHTML(it, i) {
  const flags = it.tag ? `<span class="flags"><span class="flag${it.tag === 'Spicy' ? ' spicy' : ''}">${it.tag === 'Spicy' ? '🌶 Spicy' : esc(it.tag)}</span></span>` : '';
  const n = qtyOf(it.id);
  return `<article class="card" data-id="${it.id}" style="--i:${i}">
    <span class="ph${it.img ? '' : ' none'}">${photo(it)}</span>${flags}
    <div class="tx"><h4>${esc(it.n)}</h4>${it.d ? `<p>${esc(it.d)}</p>` : ''}
      <div class="row"><span class="pr">${priceHTML(it)}</span>
      <button class="add" type="button" data-add="${it.id}" aria-label="Add ${esc(it.n)} to your order">+</button></div></div>
    <button class="card-hit" type="button" data-open="${it.id}" aria-label="${esc(it.n)}, ${it.cents == null ? 'price on request' : (it.from ? 'from ' : '') + money(it.cents)}. Open to customize"></button>
    ${n ? `<span class="inq" aria-hidden="true">${n}</span>` : ''}</article>`;
}
(function renderMenu() {
  $('#cats-in').innerHTML = MENU.map(c => `<a class="chip" href="#cat-${c.id}" data-cat="${c.id}">${esc(c.n)} <small>${c.items.length}</small></a>`).join('');
  $('#sections').innerHTML = MENU.map(c => `<section class="msec${c.featured ? ' feat' : ''}" id="cat-${c.id}" aria-labelledby="h-${c.id}">
    <div class="msec-head"><h3 id="h-${c.id}">${esc(c.n)}</h3><p class="hand">${esc(c.note || '')}</p><span class="count">${c.items.length} items</span></div>
    <div class="grid">${c.items.map(cardHTML).join('')}</div></section>`).join('');
})();
function refreshCard(id) {
  $$(`.card[data-id="${CSS.escape(id)}"]`).forEach(card => {
    const n = qtyOf(id); let b = card.querySelector('.inq');
    if (!n) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('span'); b.className = 'inq'; b.setAttribute('aria-hidden', 'true'); card.appendChild(b); }
    b.textContent = n;
  });
}

/* category bar follows the scroll */
(function spy() {
  const chips = $$('.chip', $('#cats-in'));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id.slice(4);
    chips.forEach(c => { const on = c.dataset.cat === id; c.classList.toggle('on', on); if (on) { c.setAttribute('aria-current', 'true'); const bar = c.parentElement; bar.scrollTo({ left: c.offsetLeft - (bar.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); } else c.removeAttribute('aria-current'); });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('.msec').forEach(s => io.observe(s));
})();

/* ================= PRODUCT SHEET ================= */
const sheet = $('#sheet'), scrim = $('#scrim');
let S = null, lastFocus = null;
function openModal(el) {
  lastFocus = document.activeElement;
  scrim.hidden = false; el.hidden = false; document.body.classList.add('modal');
  requestAnimationFrame(() => { scrim.classList.add('on'); el.classList.add('on'); });
}
function closeModal(el, after) {
  el.classList.remove('on'); scrim.classList.remove('on');
  document.body.classList.remove('modal');
  setTimeout(() => { el.hidden = true; if (!$('.sheet.on, .drawer.on')) scrim.hidden = true; if (after) after(); }, reduce ? 0 : 450);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}
function openSheet(id, editKey = null) {
  const it = ITEMS[id]; if (!it) return;
  const line = editKey && lines.find(l => l.k === editKey);
  const m = line ? { opt: { ...line.m.opt }, rm: new Set(line.m.rm), note: line.m.note } : { opt: {}, rm: new Set(), note: '' };
  (it.opt || []).forEach(g => { if (!m.opt[g.n]) m.opt[g.n] = g.c[0]; });
  S = { it, m, qty: line ? line.qty : 1, editKey, x: null };
  const stage = $('#sh-stage');
  $$('.xr, .sh-photo, .sh-thumb, .sh-hint', stage).forEach(e => e.remove());
  if (it.L) {
    S.x = xray(it, { W: 460, H: 380 });
    stage.appendChild(S.x.svg);
    if (it.img) stage.insertAdjacentHTML('beforeend', `<span class="sh-thumb"><img src="assets/menu/${it.id}.webp" alt=""></span>`);
    stage.insertAdjacentHTML('beforeend', '<p class="sh-hint">tap an ingredient to take it out</p>');
    S.x.set(m.rm);
  } else {
    stage.insertAdjacentHTML('beforeend', `<span class="sh-photo${it.img ? '' : ' none'}">${it.img ? `<img src="assets/menu/${it.id}.webp" alt="">` : (it.cat.id === 'drinks' ? ICON.cup : ICON.plate)}</span>`);
  }
  $('#sh-cat').textContent = it.cat.n + (it.tag ? ' · ' + it.tag : '');
  $('#sh-name').textContent = it.n;
  $('#sh-price').innerHTML = it.cents == null ? '<small>Price confirmed by Soubra\'s on WhatsApp</small>' : (it.from ? '<small>from </small>' : '') + money(it.cents) + (it.from ? ' <small>· size and final price confirmed on WhatsApp</small>' : '');
  $('#sh-desc').textContent = it.d || '';
  $('#sh-desc').hidden = !it.d;
  $('#sh-opts').innerHTML = (it.opt || []).map((g, gi) => `<div class="grp" role="radiogroup" aria-labelledby="g${gi}"><div class="grp-h"><b id="g${gi}">${esc(g.n)}</b><small>choose one</small></div><div class="opts">` +
    g.c.map(c => `<button type="button" class="opt" role="radio" data-g="${esc(g.n)}" data-v="${esc(c)}" aria-checked="${m.opt[g.n] === c}">${esc(c)}</button>`).join('') + '</div></div>').join('');
  const rms = removables(it);
  $('#sh-inside').innerHTML = rms.length ? `<div class="grp"><div class="grp-h"><b>What's inside</b><small>tap to remove</small></div><div class="opts">` +
    rms.map(r => `<button type="button" class="opt rm" data-rm="${esc(r.type)}" aria-pressed="${m.rm.has(r.type)}"><span class="ic" aria-hidden="true">${m.rm.has(r.type) ? '↺' : '✓'}</span>${esc(r.label)}</button>`).join('') + '</div></div>' : '';
  const note = $('#sh-note');
  note.value = m.note || '';
  note.placeholder = it.dip ? 'Which dip? Any other change?' : (it.id === 'majesty-steak' || it.id === 'entrecote') ? 'How do you like it cooked?' : 'Extra crispy? Sauce on the side?';
  $('#sh-add-l').textContent = editKey ? 'Update order' : 'Add to order';
  updateSheet();
  openModal(sheet);
  $('.sh-scroll', sheet).scrollTop = 0;
  setTimeout(() => $('#sh-close').focus({ preventScroll: true }), 60);
}
function updateSheet() {
  if (!S) return;
  $('#sh-qty').textContent = S.qty;
  $('#sh-total').textContent = S.it.cents == null ? '' : money(S.it.cents * S.qty);
}
sheet.addEventListener('click', e => {
  const o = e.target.closest('[data-g]');
  if (o) { S.m.opt[o.dataset.g] = o.dataset.v; $$(`[data-g="${CSS.escape(o.dataset.g)}"]`, sheet).forEach(b => b.setAttribute('aria-checked', b === o)); return; }
  const r = e.target.closest('[data-rm]');
  if (r) {
    const t = r.dataset.rm, off = !S.m.rm.has(t);
    off ? S.m.rm.add(t) : S.m.rm.delete(t);
    r.setAttribute('aria-pressed', off); r.querySelector('.ic').textContent = off ? '↺' : '✓';
    if (S.x) S.x.set(S.m.rm);
    announce((off ? 'Removed ' : 'Added back ') + r.textContent.slice(1));
  }
});
$('#sh-minus').addEventListener('click', () => { if (S.qty > 1) { S.qty--; updateSheet(); } });
$('#sh-plus').addEventListener('click', () => { if (S.qty < 30) { S.qty++; updateSheet(); } });
$('#sh-close').addEventListener('click', () => closeSheet());
function closeSheet(after) { if (!sheet.hidden) closeModal(sheet, after); S = null; }
$('#sh-add').addEventListener('click', () => {
  const { it, m, qty, editKey } = S;
  m.note = $('#sh-note').value;
  const btn = $('#sh-add').getBoundingClientRect();
  addToCart(it.id, m, qty, editKey);
  const edited = !!editKey;
  closeSheet(() => { if (edited) openCart(); });
  if (!edited) { fly(btn, qty); toast(`${qty}× ${it.n} added`); }
  announce(`${qty} ${it.n} ${edited ? 'updated' : 'added to your order'}`);
});
/* the photo leans toward the pointer */
$('#sh-stage').addEventListener('pointermove', e => {
  const p = $('.sh-photo', e.currentTarget); if (!p || reduce) return;
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  p.style.transform = `perspective(700px) rotateX(${(-y * 18).toFixed(1)}deg) rotateY(${(x * 22).toFixed(1)}deg)`;
});
$('#sh-stage').addEventListener('pointerleave', e => { const p = $('.sh-photo', e.currentTarget); if (p) p.style.transform = ''; });

/* ================= FLY TO CART ================= */
const fab = $('#fab');
function fly(a, qty = 1) {
  if (reduce || !a || !a.width) return;
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
  burst(x0, y0);
  const dot = document.createElement('div'); dot.className = 'fly'; dot.textContent = '+' + qty;
  dot.style.left = x0 + 'px'; dot.style.top = y0 + 'px';
  document.body.appendChild(dot);
  requestAnimationFrame(() => {
    const target = fab.hidden ? $('#top-cart') : $('.fab-bag', fab);
    const c = target.getBoundingClientRect();
    const dx = c.left + c.width / 2 - x0, dy = c.top + c.height / 2 - y0;
    dot.animate([
      { transform: 'translate(0,0) scale(.6)', opacity: 0 },
      { transform: `translate(${dx * .35}px,${dy * .35 - 140}px) scale(1.25)`, opacity: 1, offset: .4 },
      { transform: `translate(${dx}px,${dy}px) scale(.45)`, opacity: .9 }
    ], { duration: 750, easing: 'cubic-bezier(.45,0,.55,1)' }).onfinish = () => { dot.remove(); fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump'); };
  });
}
function burst(x, y) {
  const cols = ['#e23d2c', '#f3b33d', '#f6efe1', '#1f7a48'];
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('i'); s.className = 'spark';
    s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.background = cols[i % cols.length];
    document.body.appendChild(s);
    const ang = i / 12 * Math.PI * 2 + Math.random() * .5, d = 28 + Math.random() * 26;
    s.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(ang) * d}px), calc(-50% + ${Math.sin(ang) * d}px)) scale(0)`, opacity: 0 }],
      { duration: 520 + Math.random() * 220, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => s.remove();
  }
}

/* ================= CART ================= */
const drawer = $('#cart');
let view = 'cart';
function refresh() {
  const n = count();
  fab.hidden = n === 0;
  $('#fab-n').textContent = n;
  $('#fab-t').textContent = money(total()) + (lines.some(l => ITEMS[l.id].cents == null) ? '+' : '');
  $('#top-n').hidden = n === 0; $('#top-n').textContent = n;
  $('#top-cart').setAttribute('aria-label', `Your order, ${n} item${n === 1 ? '' : 's'}`);
  Object.keys(ITEMS).forEach(refreshCard);
  if (!drawer.hidden && view === 'cart') renderCart();
}
function openCart() { view = 'cart'; renderCart(); openModal(drawer); setTimeout(() => $('#cart-close').focus({ preventScroll: true }), 60); }
function closeCart() { if (!drawer.hidden) closeModal(drawer); }
const steps = n => ['Order', 'Details', 'Done'].map((t, i) => `<span class="${n > i ? 'on' : ''}">${i + 1}. ${t}</span>`).join('');
const thumb = it => `<span class="th${it.img ? '' : ' none'}">${it.img ? `<img src="assets/menu/${it.id}.webp" alt="">` : (it.cat.id === 'drinks' ? ICON.cup : ICON.plate)}</span>`;
function priceNotes() {
  const out = [];
  if (lines.some(l => ITEMS[l.id].from)) out.push('Shawarma sandwiches start at $4. Soubra\'s confirms the size and final price.');
  if (lines.some(l => ITEMS[l.id].cents == null)) out.push('Laban Ayran is priced by Soubra\'s when they confirm.');
  return out;
}
function renderCart() {
  $('#steps').innerHTML = steps(1);
  const body = $('#dr-body'), foot = $('#dr-foot');
  if (!lines.length) {
    body.innerHTML = `<div class="empty"><p class="hand">your order is looking a bit empty</p><p>Pick something from the menu and it lands here.</p><a class="btn btn-green" href="#menu" id="go-menu">See the menu</a></div>`;
    foot.innerHTML = '';
    $('#go-menu').addEventListener('click', () => closeCart());
    return;
  }
  body.innerHTML = lines.map(l => {
    const it = ITEMS[l.id], d = describe(it, l.m);
    return `<div class="line" data-k="${esc(l.k)}">${thumb(it)}<div><h4>${esc(it.n)}</h4>${d ? `<p class="mods">${esc(d)}</p>` : ''}
      <div class="acts"><div class="qty"><button type="button" data-q="-1" aria-label="One less ${esc(it.n)}">&minus;</button><output>${l.qty}</output><button type="button" data-q="1" aria-label="One more ${esc(it.n)}">+</button></div>
      ${(it.L || it.rm || it.opt) ? '<button type="button" class="link" data-edit>Edit</button>' : ''}<button type="button" class="link red" data-del>Remove</button></div></div>
      <span class="lp">${it.cents == null ? 'ask' : money(it.cents * l.qty)}</span></div>`;
  }).join('');
  const notes = priceNotes();
  foot.innerHTML = `<div class="sum"><span>Subtotal</span><b>${money(total())}</b></div>` + notes.map(n => `<p class="fine">${esc(n)}</p>`).join('') +
    `<button class="btn btn-red" type="button" id="to-details">Continue</button>`;
  $('#to-details').addEventListener('click', renderDetails);
}
$('#dr-body').addEventListener('click', e => {
  const line = e.target.closest('.line'); if (!line) return;
  const k = line.dataset.k, l = lines.find(x => x.k === k); if (!l) return;
  const q = e.target.closest('[data-q]');
  if (q) { setQty(k, l.qty + Number(q.dataset.q)); return; }
  if (e.target.closest('[data-del]')) { line.style.transition = 'opacity .25s, transform .25s'; line.style.opacity = '0'; line.style.transform = 'translateX(40px)'; setTimeout(() => { setQty(k, 0); toast(`${ITEMS[l.id].n} removed`); }, reduce ? 0 : 220); return; }
  if (e.target.closest('[data-edit]')) closeModal(drawer, () => openSheet(l.id, k));
});

let form = { name: '', phone: '', mode: 'Pickup', address: '', notes: '' };
try { Object.assign(form, JSON.parse(localStorage.getItem('soubras-details') || '{}')); } catch (e) {}
function renderDetails() {
  view = 'details';
  $('#steps').innerHTML = steps(2);
  $('#dr-body').innerHTML = `<form id="details" novalidate>
    <div class="field"><span class="lg" id="mode-l">How do you want it?</span><div class="seg" role="group" aria-labelledby="mode-l">
      <button type="button" data-mode="Pickup" aria-pressed="${form.mode === 'Pickup'}">Pickup</button><button type="button" data-mode="Delivery" aria-pressed="${form.mode === 'Delivery'}">Delivery</button></div></div>
    <div class="field" id="f-name"><label for="d-name">Your name</label><input class="input" id="d-name" autocomplete="name" value="${esc(form.name)}"><p class="err" id="e-name"></p></div>
    <div class="field" id="f-phone"><label for="d-phone">Phone number</label><input class="input" id="d-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 03 123 456" value="${esc(form.phone)}"><p class="err" id="e-phone"></p></div>
    <div class="field" id="f-addr"${form.mode === 'Delivery' ? '' : ' hidden'}><label for="d-addr">Delivery address</label><textarea class="input" id="d-addr" rows="2" autocomplete="street-address" placeholder="Area, street, building, floor">${esc(form.address)}</textarea><p class="err" id="e-addr"></p></div>
    <div class="field"><label for="d-notes">Notes for the kitchen <small>(optional)</small></label><textarea class="input" id="d-notes" rows="2" placeholder="Ring the bell twice, extra napkins…">${esc(form.notes)}</textarea></div>
    <button type="button" class="link" id="back-cart" style="margin-top:18px">&larr; Back to my order</button></form>`;
  const notes = priceNotes();
  $('#dr-foot').innerHTML = `<div class="sum"><span>Total</span><b>${money(total())}</b></div>` + notes.map(n => `<p class="fine">${esc(n)}</p>`).join('') +
    `<p class="fine" id="fee-note"${form.mode === 'Delivery' ? '' : ' hidden'}>Delivery fee confirmed by Soubra's on WhatsApp.</p>` +
    `<button class="btn btn-red" type="button" id="place">${WHATSAPP_NUMBER ? 'Send order on WhatsApp' : 'Place order'}</button>`;
  $$('[data-mode]').forEach(b => b.addEventListener('click', () => {
    form.mode = b.dataset.mode;
    $$('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#f-addr').hidden = form.mode !== 'Delivery'; $('#fee-note').hidden = form.mode !== 'Delivery';
  }));
  $('#back-cart').addEventListener('click', () => { view = 'cart'; renderCart(); });
  $('#place').addEventListener('click', placeOrder);
  [['d-name', 'f-name', 'e-name'], ['d-phone', 'f-phone', 'e-phone'], ['d-addr', 'f-addr', 'e-addr']].forEach(([i, f, e]) => $('#' + i).addEventListener('input', () => { $('#' + f).classList.remove('bad'); $('#' + e).textContent = ''; }));
  $('#d-name').focus({ preventScroll: true });
}
function normPhone(v) {
  let d = String(v).replace(/\D/g, '');
  if (d.startsWith('00961')) d = d.slice(5); else if (d.startsWith('961')) d = d.slice(3);
  if (d.length === 7 && d[0] === '3') d = '0' + d;
  if (d.length === 7) d = '0' + d;
  return /^(03\d{6}|7[01689]\d{6}|81\d{6}|0[1-9]\d{6})$/.test(d) ? d : null;
}
function bad(id, errId, msg) { const f = $('#' + id); f.classList.remove('bad'); void f.offsetWidth; f.classList.toggle('bad', !!msg); $('#' + errId).textContent = msg || ''; return !!msg; }
function orderMessage(f) {
  const out = ["Hello Soubra's, I'd like to order:", ''];
  lines.forEach(l => {
    const it = ITEMS[l.id], d = describe(it, l.m);
    out.push(`${l.qty}× ${it.n}${it.cents == null ? ' (price?)' : ' — ' + (it.from ? 'from ' : '') + money(it.cents * l.qty)}`);
    if (d) out.push('   ' + d);
  });
  out.push('', `Total: ${money(total())}${priceNotes().length ? ' (some prices to confirm)' : ''}`, '');
  out.push(f.mode === 'Delivery' ? `Delivery to: ${f.address}` : 'Pickup at the restaurant');
  out.push(`Name: ${f.name}`, `Phone: ${f.phone}`);
  if (f.notes) out.push(`Notes: ${f.notes}`);
  return out.join('\n');
}
function placeOrder() {
  form.name = $('#d-name').value.trim(); form.phone = $('#d-phone').value.trim();
  form.address = $('#d-addr').value.trim(); form.notes = $('#d-notes').value.trim();
  const e1 = bad('f-name', 'e-name', form.name.length < 2 ? 'Tell us your name.' : '');
  const e2 = bad('f-phone', 'e-phone', normPhone(form.phone) ? '' : 'Enter a Lebanese number, like 03 123 456 or 78 700 690.');
  const e3 = form.mode === 'Delivery' && bad('f-addr', 'e-addr', form.address.length < 6 ? 'Where should we bring it?' : '');
  if (e1 || e2 || e3) { const f = $('.field.bad .input'); if (f) f.focus(); return; }
  try { localStorage.setItem('soubras-details', JSON.stringify({ name: form.name, phone: form.phone, mode: form.mode, address: form.address })); } catch (e) {}
  const msg = orderMessage(form);
  const url = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}` : '';
  if (url) window.open(url, '_blank', 'noopener');
  view = 'done';
  $('#steps').innerHTML = steps(3);
  $('#dr-body').innerHTML = `<div class="done"><span class="tick" aria-hidden="true">✓</span><h4>${url ? 'Sent to WhatsApp' : 'Order ready'}</h4>
    <p>${url ? "Your order opened in WhatsApp. Send it, and Soubra's confirms the time and total." : "This is a demo, so nothing was sent. In the live site this message opens in Soubra's WhatsApp:"}</p>
    <pre>${esc(msg)}</pre>${url ? `<a class="btn btn-green" href="${esc(url)}" target="_blank" rel="noopener">Open WhatsApp again</a>` : `<p class="demo-note">Demo mode. To take real orders, set <code>WHATSAPP_NUMBER</code> at the top of <code>js/app.js</code> with Soubra's permission.</p>`}</div>`;
  $('#dr-foot').innerHTML = `<button class="btn btn-red" type="button" id="new-order">Start a new order</button>`;
  $('#new-order').addEventListener('click', () => { lines = []; save(); refresh(); closeCart(); toast('Fresh start!'); });
  burst(innerWidth / 2, innerHeight / 2);
}
fab.addEventListener('click', openCart);
$('#top-cart').addEventListener('click', openCart);
$('#cart-close').addEventListener('click', closeCart);
scrim.addEventListener('click', () => { closeSheet(); closeCart(); });

/* ================= SEARCH ================= */
const search = $('#search'), sq = $('#sq'), sres = $('#sres');
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '');
const SYN = { spicy: ['spicy', 'jalapeno', 'buffalo', 'sriracha', 'pablo'], cheese: ['cheese', 'cheddar', 'mozzarella', 'emmental', 'halloumi', 'parmesan', 'cheesy', 'mozz'],
  burger: ['burger', 'patty', 'bun'], burgers: ['burger', 'patty'], chicken: ['chicken', 'tawouk', 'escalope', 'nuggets', 'tenders', 'wings'], steak: ['steak', 'entrecote', 'rib-eye', 'angus'],
  beef: ['beef', 'angus', 'steak'], kids: ['kids'], drink: ['drink', 'juice', 'pepsi', 'water', 'tea', 'ayran'], drinks: ['drink', 'juice', 'pepsi', 'water', 'tea', 'ayran'], fries: ['fries'], sweet: ['honey', 'cherry', 'pineapple'] };
const IDX = Object.values(ITEMS).map(it => ({ it, n: norm(it.n), t: norm([it.n, it.d, it.cat.n, it.tag || '', (it.opt || []).map(g => g.c.join(' ')).join(' ')].join(' ')) }));
const QUICK = [['Burgers', 'burger'], ['Spicy', 'spicy'], ['Honey', 'honey'], ['Cheese lovers', 'cheese'], ['Steak', 'steak'], ['Shawarma', 'shawarma'], ['Under $8', 'under 8'], ['Kids', 'kids']];
const POPULAR = ['soubras-classic', '24k', 'big-soubras-beef', 'honey-bunny', 'soubras-duo', 'majesty-steak', 'chicken-shawarma-meal', 'legendary-cheesy-fries'];
let act = -1, results = [];
$('#s-chips').innerHTML = QUICK.map(([l, q]) => `<button class="chip" type="button" data-q="${esc(q)}">${esc(l)}</button>`).join('');
function hl(text, words) { let h = esc(text); words.forEach(w => { if (w.length > 1) h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return h; }
function runSearch() {
  let q = norm(sq.value.trim());
  let max = null;
  const um = q.match(/(?:under|below|less than|<)\s*\$?\s*(\d+(?:\.\d+)?)/);
  if (um) { max = Number(um[1]) * 100; q = q.replace(um[0], '').trim(); }
  const words = q.split(/\s+/).filter(Boolean);
  if (!words.length && max == null) {
    results = POPULAR.map(id => ITEMS[id]).filter(Boolean);
    sres.innerHTML = '<li class="s-label" role="presentation">Popular picks</li>' + results.map((it, i) => resHTML(it, i, [])).join('');
  } else {
    const scored = IDX.map(x => {
      if (max != null && (x.it.cents == null || x.it.cents > max)) return null;
      let s = 0;
      for (const w of words) {
        const alts = SYN[w] || [w];
        const hit = alts.some(a => x.t.includes(a));
        if (!hit) return null;
        s += x.n.includes(w) ? (x.n.startsWith(w) ? 6 : 4) : 1;
      }
      return [x.it, s + (max != null ? 1 : 0)];
    }).filter(Boolean).sort((a, b) => b[1] - a[1] || (a[0].cents || 0) - (b[0].cents || 0));
    results = scored.map(s => s[0]);
    const hw = words.flatMap(w => SYN[w] || [w]);
    sres.innerHTML = results.length ? `<li class="s-label" role="presentation">${results.length} result${results.length === 1 ? '' : 's'}</li>` + results.map((it, i) => resHTML(it, i, hw)).join('')
      : `<li class="s-empty" role="presentation"><span class="hand" style="font-size:26px;color:var(--g8)">nothing called that… yet</span><br>Try “chicken”, “cheese” or “under 8”.</li>`;
  }
  act = results.length ? 0 : -1; mark();
}
const resHTML = (it, i, w) => `<li role="option" id="r${i}" data-id="${it.id}" aria-selected="false">${thumb(it)}<span><b>${hl(it.n, w)}</b><small>${esc(it.cat.n)}${it.d ? ' · ' + hl(it.d, w) : ''}</small></span><span class="p">${it.cents == null ? 'ask' : (it.from ? 'from ' : '') + money(it.cents)}</span></li>`;
function mark() { $$('li[role="option"]', sres).forEach((li, i) => li.setAttribute('aria-selected', i === act)); const a = $('#r' + act); sq.setAttribute('aria-activedescendant', a ? 'r' + act : ''); if (a) a.scrollIntoView({ block: 'nearest' }); }
let searchFrom = null;
function openSearch() { searchFrom = document.activeElement; search.hidden = false; document.body.classList.add('modal'); sq.value = ''; runSearch(); setTimeout(() => sq.focus(), 30); }
function closeSearch() { search.hidden = true; if (!$('.sheet.on, .drawer.on')) document.body.classList.remove('modal'); if (searchFrom && document.contains(searchFrom)) searchFrom.focus({ preventScroll: true }); }
function pick(id) { closeSearch(); setTimeout(() => openSheet(id), 60); }
sq.addEventListener('input', runSearch);
sq.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(results.length - 1, act + 1); mark(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, act - 1); mark(); }
  else if (e.key === 'Enter' && results[act]) { e.preventDefault(); pick(results[act].id); }
});
sres.addEventListener('click', e => { const li = e.target.closest('li[data-id]'); if (li) pick(li.dataset.id); });
$('#s-chips').addEventListener('click', e => { const c = e.target.closest('[data-q]'); if (c) { sq.value = c.dataset.q; runSearch(); sq.focus(); } });
$('#s-close').addEventListener('click', closeSearch);
search.addEventListener('click', e => { if (e.target === search) closeSearch(); });
$('#bigsearch').addEventListener('click', openSearch);
$('#top-search').addEventListener('click', openSearch);
(function placeholder() {
  const ph = $('#ph'), list = ['Search “honey”…', 'Search “spicy”…', 'Search “steak”…', 'Search “under 8”…', 'Search “shawarma”…'];
  let i = 0; if (reduce) { ph.textContent = 'Search the menu'; return; }
  ph.textContent = list[0];
  setInterval(() => { i = (i + 1) % list.length; ph.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 200 }).onfinish = () => { ph.textContent = list[i]; ph.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 250 }); }; }, 2600);
})();

/* ================= global clicks and keys ================= */
document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]');
  if (o) { e.preventDefault(); openSheet(o.dataset.open); return; }
  const a = e.target.closest('[data-add]');
  if (a) {
    const it = ITEMS[a.dataset.add];
    if (it.opt) { openSheet(it.id); return; }
    addToCart(it.id, {}, 1); fly(a.getBoundingClientRect()); toast(`${it.n} added`); announce(`${it.n} added to your order`);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!search.hidden) closeSearch(); else if (!sheet.hidden) closeSheet(); else if (!drawer.hidden) closeCart();
    return;
  }
  if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && search.hidden) { e.preventDefault(); openSearch(); }
  if (e.key === 'Tab') {
    const box = !search.hidden ? search : !sheet.hidden ? sheet : !drawer.hidden ? drawer : null;
    if (!box) return;
    const f = $$('button:not([disabled]), a[href], input, textarea, [tabindex="0"]', box).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
$('#map-link').href = SOUBRAS.map;
refresh();

/* ================= HERO: a real 3D Soubra's Classic, drawn on canvas =================
   Every layer is a solid with volume (dome bun, draped cheese, ruffled iceberg…),
   projected with a camera that has yaw (spin) and pitch (look-down angle). */
const HERO_LAYERS = [
  ['bunB', 'Bottom bun', .32], ['beef', '140g premium beef', .36], ['cheddar', 'Cheddar slice', .035],
  ['mustard', 'Special mustard', .02], ['pickles', 'Dill pickles', .04], ['iceberg', 'Iceberg', .07],
  ['onion', 'Grilled onion', .05], ['tomato', 'Grilled tomato', .09], ['cocktail', 'Cocktail sauce', .03], ['bunT', 'Toasted bun', .6]
];
function Burger3D(canvas) {
  const ctx = canvas.getContext('2d');
  const R = rng('soubras-1982');
  let W = 0, H = 0, dpr = 1;
  let V = { cx: 0, cy: 0, S: 100, yaw: 0, cp: 1, sp: 0 };
  const ring = (n, f) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [a, f(a)]; });
  const SHAPE = {
    patty: ring(64, a => 1 + .035 * Math.sin(7 * a + 1) + .02 * Math.sin(13 * a + .4) + .012 * Math.sin(29 * a)),
    lettuce: ring(96, a => 1.13 + .055 * Math.sin(11 * a) + .03 * Math.sin(23 * a + 2) + .015 * Math.sin(41 * a)),
    sauce: ring(48, a => .9 + .06 * Math.sin(5 * a + 1) + .04 * Math.sin(9 * a + 3)),
    pickle: ring(28, a => 1 + .07 * Math.sin(12 * a)),
    disc: ring(40, () => 1)
  };
  const pattyDots = Array.from({ length: 90 }, () => { const a = R() * 6.283, r = Math.sqrt(R()) * .9; return [Math.cos(a) * r, Math.sin(a) * r, R()]; });
  const PICKLES = [[.52, .08], [-.12, .5], [-.5, -.18], [.15, -.52], [-.02, .02], [.5, -.45], [-.48, .42]];
  const TOMATO = [[.43, .03], [-.43, -.03]];
  const ONION = Array.from({ length: 9 }, () => [R() * 1.3 - .65, R() * 1.3 - .65, .14 + R() * .2, R() * 6.28, 1.6 + R() * 2.2]);
  const MUSTARD = Array.from({ length: 11 }, (_, i) => [-.78 + i * .156, (i % 2 ? .5 : -.5) * Math.sqrt(Math.max(0, 1 - Math.pow(-.78 + i * .156, 2)))]);
  function resize() {
    dpr = Math.min(1.5, devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  }
  /* world (x, y up, z toward viewer) → screen */
  function P(x, y, z) {
    const c = Math.cos(V.yaw), s = Math.sin(V.yaw);
    const xr = x * c - z * s, zr = x * s + z * c;
    return [V.cx + V.S * xr, V.cy - V.S * (y * V.cp - zr * V.sp)];
  }
  function poly(pts, y, scale = 1, ox = 0, oz = 0) {
    ctx.beginPath();
    pts.forEach(([a, r], i) => { const [x, yy] = P(ox + Math.cos(a) * r * scale, y, oz + Math.sin(a) * r * scale); i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); });
    ctx.closePath();
  }
  function sideGrad(r, dark, base, light) {
    const g = ctx.createLinearGradient(V.cx - r * V.S, 0, V.cx + r * V.S, 0);
    g.addColorStop(0, dark); g.addColorStop(.32, base); g.addColorStop(.55, light); g.addColorStop(.85, base); g.addColorStop(1, dark);
    return g;
  }
  /* an extruded solid: stack the outline from y0 to y0+h, then the top face */
  /* the side of an extruded outline as ONE path: a quad per edge, all wound the same way */
  function sweep(shape, y0, h, r, fill, ox = 0, oz = 0) {
    const B = shape.map(([a, rr]) => P(ox + Math.cos(a) * rr * r, y0, oz + Math.sin(a) * rr * r));
    const T = shape.map(([a, rr]) => P(ox + Math.cos(a) * rr * r, y0 + h, oz + Math.sin(a) * rr * r));
    ctx.beginPath();
    for (let i = 0; i < B.length; i++) {
      const j = (i + 1) % B.length, q = [B[i], B[j], T[j], T[i]];
      const area = (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) - (q[2][0] - q[0][0]) * (q[1][1] - q[0][1]);
      if (area < 0) q.reverse();
      ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[1][0], q[1][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.closePath();
    }
    ctx.fillStyle = fill; ctx.fill('nonzero');
  }
  function solid(shape, y0, h, r, side, top) {
    sweep(shape, y0, h, r, sideGrad(r * 1.15, ...side));
    poly(shape, y0 + h, r); ctx.fillStyle = top; ctx.fill();
  }
  const byDepth = list => list.slice().sort((a, b) => (a[0] * Math.sin(V.yaw) + a[1] * Math.cos(V.yaw)) - (b[0] * Math.sin(V.yaw) + b[1] * Math.cos(V.yaw)));
  function dot(x, y, z, rx, col) { const [sx, sy] = P(x, y, z); ctx.beginPath(); ctx.ellipse(sx, sy, rx * V.S, Math.max(.4, rx * V.S * V.sp), 0, 0, 6.283); ctx.fillStyle = col; ctx.fill(); }

  const DRAW = {
    bunB(y, h, k) {
      sweep(SHAPE.disc, y, h * .35, .93 * k.sx, sideGrad(k.sx, '#8C4A1C', '#C27634', '#DB944E'));
      sweep(SHAPE.disc, y + h * .3, h * .7, k.sx, sideGrad(k.sx, '#9C5420', '#D4843A', '#E9A55E'));
      poly(SHAPE.disc, y + h, k.sx * .995);
      const g = ctx.createRadialGradient(V.cx, P(0, y + h, 0)[1], 0, V.cx, P(0, y + h, 0)[1], V.S);
      g.addColorStop(0, '#FBE3B4'); g.addColorStop(.85, '#F1CB8C'); g.addColorStop(1, '#D9A35E');
      ctx.fillStyle = g; ctx.fill();
    },
    beef(y, h, k) {
      solid(SHAPE.patty, y, h, 1.0 * k.sx, ['#2A1006', '#4A2312', '#6A3519'], '#4B2210');
      [[q => q > .55, 'rgba(20,6,2,.75)'], [q => q <= .55, 'rgba(150,80,45,.6)']].forEach(([f, col]) => {
        ctx.beginPath();
        pattyDots.forEach(([x, z, q]) => { if (!f(q)) return; const [sx, sy] = P(x * k.sx, y + h, z * k.sx), rx = (.018 + q * .02) * V.S; ctx.moveTo(sx + rx, sy); ctx.ellipse(sx, sy, rx, Math.max(.4, rx * V.sp), 0, 0, 6.283); });
        ctx.fillStyle = col; ctx.fill();
      });
      poly(SHAPE.patty, y + h, .55 * k.sx); ctx.fillStyle = 'rgba(255,190,140,.06)'; ctx.fill();
    },
    cheddar(y, h, k) {
      const rot = Math.PI / 4, pts = [];
      for (let e = 0; e < 4; e++) for (let j = 0; j < 14; j++) {
        const a0 = rot + e * Math.PI / 2, a1 = a0 + Math.PI / 2, t = j / 14;
        const cx0 = Math.cos(a0) * 1.4, cz0 = Math.sin(a0) * 1.4, cx1 = Math.cos(a1) * 1.4, cz1 = Math.sin(a1) * 1.4;
        const x = (cx0 + (cx1 - cx0) * t) * k.sx, z = (cz0 + (cz1 - cz0) * t) * k.sx;
        const d = Math.hypot(x, z), droop = .34 * Math.pow(Math.max(0, (d - .98) / .42), 1.5);
        pts.push([x, z, droop]);
      }
      const draw = (dy, col) => { ctx.beginPath(); pts.forEach(([x, z, dr], i) => { const [sx, sy] = P(x, y + dy - dr, z); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
      draw(-.03, '#D9820C'); draw(-.015, '#EE9A16'); draw(0, '#FFB82E');
      for (let e = 0; e < 4; e++) { const a = rot + e * Math.PI / 2; const [sx, sy] = P(Math.cos(a) * 1.38 * k.sx, y - .36, Math.sin(a) * 1.38 * k.sx); ctx.beginPath(); ctx.ellipse(sx, sy + .03 * V.S, .035 * V.S, .07 * V.S, 0, 0, 6.283); ctx.fillStyle = '#F5A51F'; ctx.fill(); }
      poly(SHAPE.disc, y + .002, .6 * k.sx); ctx.fillStyle = 'rgba(255,230,150,.25)'; ctx.fill();
    },
    mustard(y, h, k) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      [['#B88710', .055, -.004], ['#F2C21B', .04, 0]].forEach(([c, w, dy]) => {
        ctx.beginPath(); MUSTARD.forEach(([x, z], i) => { const [sx, sy] = P(x * k.sx, y + dy, z * k.sx); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); });
        ctx.strokeStyle = c; ctx.lineWidth = w * V.S; ctx.stroke();
      });
    },
    pickles(y, h, k) {
      byDepth(PICKLES).forEach(([x, z]) => {
        const ox = x * k.sx, oz = z * k.sx;
        sweep(SHAPE.pickle, y, h, .2, '#56772A', ox, oz);
        poly(SHAPE.pickle, y + h, .2, ox, oz); ctx.fillStyle = '#93B84E'; ctx.fill();
        poly(SHAPE.disc, y + h, .12, ox, oz); ctx.fillStyle = '#C3D98A'; ctx.fill();
        [0, 2.1, 4.2].forEach(a => dot(ox + Math.cos(a) * .06, y + h, oz + Math.sin(a) * .06, .016, '#6E8F34'));
      });
    },
    iceberg(y, h, k) {
      sweep(SHAPE.lettuce, y, h, k.sx, sideGrad(1.2 * k.sx, '#5E922E', '#7CB244', '#95C95A'));
      poly(SHAPE.lettuce, y + h, k.sx);
      const [gx, gy] = P(0, y + h, 0); const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, V.S * 1.1);
      g.addColorStop(0, '#E2F4B8'); g.addColorStop(.6, '#BEE184'); g.addColorStop(1, '#9CCB5E'); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = .012 * V.S;
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + .3; ctx.beginPath(); const [ax, ay] = P(Math.cos(a) * .15, y + h, Math.sin(a) * .15); const [bx, by] = P(Math.cos(a + .25) * .95 * k.sx, y + h, Math.sin(a + .25) * .95 * k.sx); ctx.moveTo(ax, ay); ctx.quadraticCurveTo((ax + bx) / 2 + 6, (ay + by) / 2, bx, by); ctx.stroke(); }
    },
    onion(y, h, k) {
      ctx.lineCap = 'round';
      ONION.forEach(([x, z, r, a0, len]) => {
        [['#7A4A1C', .05], ['#C88A3E', .032]].forEach(([c, w]) => {
          ctx.beginPath();
          for (let i = 0; i <= 18; i++) { const a = a0 + len * i / 18; const [sx, sy] = P((x + Math.cos(a) * r) * k.sx, y + h * .5, (z + Math.sin(a) * r) * k.sx); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }
          ctx.strokeStyle = c; ctx.lineWidth = w * V.S; ctx.stroke();
        });
      });
    },
    tomato(y, h, k) {
      byDepth(TOMATO).forEach(([x, z]) => {
        const ox = x * k.sx, oz = z * k.sx;
        sweep(SHAPE.disc, y, h, .5, '#A8231A', ox, oz);
        poly(SHAPE.disc, y + h, .5, ox, oz); ctx.fillStyle = '#E03E2D'; ctx.fill();
        poly(SHAPE.disc, y + h, .42, ox, oz); ctx.fillStyle = '#F2654C'; ctx.fill();
        for (let j = 0; j < 5; j++) { const a = j / 5 * 6.283 + V.yaw * 0; poly(SHAPE.disc, y + h, .11, ox + Math.cos(a) * .24, oz + Math.sin(a) * .24); ctx.fillStyle = '#FFA98F'; ctx.fill();
          dot(ox + Math.cos(a) * .24, y + h, oz + Math.sin(a) * .24, .03, '#F7E3A1'); }
        poly(SHAPE.disc, y + h, .08, ox, oz); ctx.fillStyle = '#F7C2B0'; ctx.fill();
        dot(ox - .2, y + h, oz - .2, .05, 'rgba(255,255,255,.35)');
      });
    },
    cocktail(y, h, k) {
      poly(SHAPE.sauce, y, k.sx); ctx.fillStyle = '#C9563C'; ctx.fill();
      poly(SHAPE.sauce, y + h, k.sx); ctx.fillStyle = '#F2876A'; ctx.fill();
      poly(SHAPE.sauce, y + h, .55 * k.sx); ctx.fillStyle = 'rgba(255,200,180,.35)'; ctx.fill();
      for (let i = 0; i < 5; i++) {
        const a = Math.PI / 2 - V.yaw + (i - 2) * .38, rr = .9 * k.sx;
        const [sx, sy] = P(Math.cos(a) * rr, y, Math.sin(a) * rr);
        const dl = (.06 + (i % 2) * .05) * V.S;
        ctx.beginPath(); ctx.moveTo(sx - .03 * V.S, sy); ctx.quadraticCurveTo(sx - .03 * V.S, sy + dl, sx, sy + dl * 1.15); ctx.quadraticCurveTo(sx + .03 * V.S, sy + dl, sx + .03 * V.S, sy); ctx.fillStyle = '#E8735A'; ctx.fill();
      }
      dot(-.3, y + h, -.25, .12, 'rgba(255,255,255,.22)');
    },
    bunT(y, h, k) {
      const [bx, by] = P(0, y, 0), rx = 1.04 * k.sx * V.S;
      const ryTop = Math.hypot(h * k.sy * V.cp * V.S, rx * V.sp), ryBase = rx * V.sp;
      ctx.beginPath(); ctx.ellipse(bx, by, rx, ryTop, 0, Math.PI, Math.PI * 2); ctx.ellipse(bx, by, rx, ryBase, 0, 0, Math.PI); ctx.closePath();
      const g = ctx.createRadialGradient(bx - rx * .32, by - ryTop * .62, rx * .05, bx - rx * .1, by - ryTop * .25, rx * 1.25);
      g.addColorStop(0, '#FAD08E'); g.addColorStop(.38, '#E9A458'); g.addColorStop(.72, '#C77934'); g.addColorStop(1, '#8E4A1C');
      ctx.fillStyle = g; ctx.fill();
      const v = ctx.createLinearGradient(0, by - ryBase * .2, 0, by + ryBase);
      v.addColorStop(0, 'rgba(120,55,15,0)'); v.addColorStop(1, 'rgba(120,55,15,.45)');
      ctx.fillStyle = v; ctx.fill();
      const hx = V.cx - .4 * V.S, hy = P(0, y + h * k.sy * .74, 0)[1] + .1 * V.S * V.sp;
      const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, V.S * .55);
      hg.addColorStop(0, 'rgba(255,245,220,.5)'); hg.addColorStop(1, 'rgba(255,245,220,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(hx, hy, V.S * .55, V.S * .3, -.25, 0, 6.283); ctx.fill();
      const [lx, ly] = P(0, y + .02, 0);
      ctx.beginPath(); ctx.ellipse(lx, ly + V.S * .02, V.S * 1.03 * k.sx, V.S * 1.03 * k.sx * V.sp, 0, .15, Math.PI - .15);
      ctx.strokeStyle = 'rgba(250,215,160,.75)'; ctx.lineWidth = .025 * V.S; ctx.stroke();
    }
  };
  /* floating ingredient bits around the burger */
  const BITS = Array.from({ length: 11 }, (_, i) => ({ u: [.44, .58, .9, .97, .52, .86, .75, .62, .95, .4, .82][i], v: R(), d: .35 + R() * .55, type: ['fry', 'pickle', 'tomato', 'leaf'][i % 4], rot: R() * 6.28, spin: (R() - .5) * .6, ph: R() * 6.28 }));
  function bit(b, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(b.rot + t * b.spin); ctx.globalAlpha = Math.min(.95, .25 + b.d * .55);
    if (b.type === 'fry') { ctx.fillStyle = '#F2C14E'; ctx.strokeStyle = '#D69B2A'; ctx.lineWidth = s * .06; ctx.beginPath(); ctx.roundRect(-s * .55, -s * .1, s * 1.1, s * .2, s * .05); ctx.fill(); ctx.stroke(); }
    else if (b.type === 'pickle') { ctx.fillStyle = '#56772A'; ctx.beginPath(); ctx.ellipse(0, s * .05, s * .3, s * .26, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#93B84E'; ctx.beginPath(); ctx.ellipse(0, 0, s * .3, s * .26, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#C3D98A'; ctx.beginPath(); ctx.ellipse(0, 0, s * .17, s * .14, 0, 0, 6.283); ctx.fill(); }
    else if (b.type === 'tomato') { ctx.fillStyle = '#A8231A'; ctx.beginPath(); ctx.ellipse(0, s * .06, s * .42, s * .36, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#E03E2D'; ctx.beginPath(); ctx.ellipse(0, 0, s * .42, s * .36, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#FFA98F'; for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.ellipse(Math.cos(j * 1.57) * s * .17, Math.sin(j * 1.57) * s * .14, s * .07, s * .06, 0, 0, 6.283); ctx.fill(); } }
    else if (b.type === 'leaf') { ctx.fillStyle = '#9CCB5E'; ctx.beginPath(); for (let j = 0; j <= 20; j++) { const a = j / 20 * 6.283, r = s * (.36 + .06 * Math.sin(a * 7)); ctx.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * .7); } ctx.fill(); }
    else { ctx.fillStyle = '#FFB82E'; ctx.beginPath(); ctx.moveTo(-s * .32, -s * .28); ctx.lineTo(s * .34, -s * .22); ctx.lineTo(s * .26, s * .3); ctx.lineTo(-s * .3, s * .24); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  /* state per frame: {cx, cy, S, yaw, pitch, e (explode 0..1), drop[i], squash[i], steam, scroll, mx, my, t, gapU} */
  function frame(st) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const t = st.t;
    const bitsS = st.S * .5;
    const drawBits = front => BITS.forEach(b => {
      if (front || st.bits <= 0) return;
      const x = b.u * W + st.mx * 26 * b.d, y = (b.v * 1.2 - .1) * H - st.scroll * H * .5 * b.d + Math.sin(t * .7 + b.ph) * 10 * b.d;
      ctx.save(); ctx.globalAlpha = st.bits; bit(b, x, ((y % (H * 1.2)) + H * 1.2) % (H * 1.2) - H * .1, bitsS * b.d, t); ctx.restore();
    });
    drawBits(false);
    V = { cx: st.cx, cy: st.cy, S: st.S, yaw: st.yaw, cp: Math.cos(st.pitch), sp: Math.sin(st.pitch) };
    /* shadow */
    const [shx, shy] = P(0, -.02, 0);
    const sg = ctx.createRadialGradient(shx, shy, 0, shx, shy, st.S * 1.35);
    sg.addColorStop(0, `rgba(0,0,0,${(.42 * (1 - st.e * .55)).toFixed(3)})`); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(shx, shy, st.S * 1.35, st.S * 1.35 * V.sp * 1.2 + 8, 0, 0, 6.283); ctx.fill();
    /* layers bottom → top */
    let y = 0; const anchors = [];
    HERO_LAYERS.forEach(([key, , h], i) => {
      const k = st.sq[i] || { sx: 1, sy: 1 };
      const ly = y + i * st.e * st.gapU + (st.drop[i] || 0);
      if (st.drop[i] == null || st.drop[i] < 40) {
        DRAW[key](ly, h * (key === 'bunT' ? 1 : k.sy), k);
        const r = key === 'iceberg' ? 1.12 : key === 'cheddar' ? 1.05 : key === 'pickles' || key === 'onion' || key === 'mustard' ? .78 : key === 'tomato' ? .93 : 1;
        anchors.push(P(0, ly + h / 2, 0).concat([r * st.S]));
      } else anchors.push(null);
      y += h;
    });
    /* steam */
    if (st.steam > .01) {
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const ph = (t * .45 + i / 3) % 1, [bx, by] = P((i - 1) * .35, y + .2 + st.e * 9 * st.gapU, 0);
        ctx.beginPath(); ctx.moveTo(bx, by - ph * st.S * .9);
        for (let j = 1; j <= 10; j++) ctx.lineTo(bx + Math.sin(j * .8 + t * 2 + i) * st.S * .07, by - (ph + j * .045) * st.S * .9);
        ctx.strokeStyle = `rgba(246,239,225,${(st.steam * .2 * Math.sin(ph * Math.PI)).toFixed(3)})`; ctx.lineWidth = st.S * .03; ctx.stroke();
      }
    }
    drawBits(true);
    return anchors;
  }
  function leaders(anchors, colX, alphas) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    anchors.forEach((a, i) => {
      const al = alphas[i]; if (!a || al < .01) return;
      const x0 = a[0] + a[2] * .98;
      ctx.globalAlpha = al; ctx.strokeStyle = 'rgba(246,239,225,.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, a[1]); ctx.lineTo(colX - 2, a[1]); ctx.stroke();
      ctx.fillStyle = '#e23d2c'; ctx.beginPath(); ctx.arc(x0, a[1], 4, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(226,61,44,.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x0, a[1], 7, 0, 6.283); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  return { resize, frame, leaders, get W() { return W; }, get H() { return H; } };
}

const burger = Burger3D($('#burger'));
(function heroScene() {
  const root = document.documentElement, sec = $('#top'), stick = $('#stick'), copy = $('#hero-copy'), score = $('#score'), cue = $('#cue');
  const tagsBox = $('#tags3d'), stamp = $('#stamp'), bnote = $('#bnote'), bgword = $('#bgword'), zone = $('.burger-zone');
  const mq = matchMedia('(min-width: 960px) and (min-height: 620px)');
  const N = HERO_LAYERS.length, SUMH = HERO_LAYERS.reduce((s, l) => s + l[2], 0), GAP = .5;
  const tags = HERO_LAYERS.map(([, label], i) => { const el = document.createElement('div'); el.className = 't3'; el.innerHTML = `<i>${N - i}</i>${esc(label)}`; tagsBox.appendChild(el); return el; });
  let staged = false, top0 = 0, cur = 0, mx = 0, my = 0, tx = 0, ty = 0, visible = true, raf = 0, tapE = 0, eM = 0, idle = 0, lastT = 0;
  const easeIn = x => x * x, easeOut = x => 1 - Math.pow(1 - x, 3);

  /* ---- intro: layers fall from the sky and land with a squash ---- */
  const introOn = !root.classList.contains('no-intro') && !reduce;
  const T0 = performance.now() / 1000;
  const DROP_START = .3, DROP_STEP = .17, DROP_FALL = .42;
  const LAND = HERO_LAYERS.map((_, i) => DROP_START + i * DROP_STEP + DROP_FALL);
  const ASSEMBLED = LAND[N - 1], GLIDE = .9;
  let introDone = !introOn, shakeX = 0, shakeY = 0;
  if (introOn) {
    try { sessionStorage.setItem('soubras-intro', '1'); } catch (e) {}
    document.body.classList.add('locked');
    setTimeout(() => root.classList.add('written'), 650);
    setTimeout(() => root.classList.add('ready'), (ASSEMBLED + .35) * 1000);
    setTimeout(() => { stamp.classList.add('slam'); document.body.classList.remove('locked'); }, (ASSEMBLED + .1) * 1000);
    setTimeout(() => { introDone = true; }, (ASSEMBLED + GLIDE) * 1000);
    const skip = () => { if (introDone) return; introDone = true; skipAt = performance.now() / 1000 - T0; root.classList.add('written', 'ready'); stamp.classList.add('slam'); document.body.classList.remove('locked'); };
    addEventListener('keydown', skip, { once: true });
    sec.addEventListener('pointerdown', skip, { once: true });
  } else stamp.classList.add('slam', 'still');
  let skipAt = null;
  function introState(t) {
    const drop = [], sq = [];
    let shake = 0;
    HERO_LAYERS.forEach((l, i) => {
      const t0 = DROP_START + i * DROP_STEP, local = (t - t0) / DROP_FALL;
      if (local < 0) { drop.push(99); sq.push({ sx: 1, sy: 1 }); return; }
      if (local < 1) { drop.push(7.5 * (1 - easeIn(local))); sq.push({ sx: .94, sy: 1.12 }); return; }
      const lt = t - LAND[i], dec = Math.exp(-lt * 8);
      drop.push(.16 * Math.abs(Math.sin(lt * 13)) * Math.exp(-lt * 9));
      sq.push({ sx: 1 + .14 * dec * Math.cos(lt * 22), sy: 1 - .28 * dec * Math.cos(lt * 22) });
      if (i === 1 || i === N - 1) shake += (i === N - 1 ? 14 : 9) * Math.exp(-lt * 11) * Math.sin(lt * 70);
    });
    return { drop, sq, shake };
  }

  function setStaged() {
    staged = !reduce && mq.matches;
    root.classList.toggle('staged', staged);
    [copy, score, cue].forEach(el => { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; });
    burger.resize();
    top0 = parseFloat(getComputedStyle(stick).top) || 0;
  }
  setStaged();
  mq.addEventListener ? mq.addEventListener('change', () => { setStaged(); kick(); }) : mq.addListener(setStaged);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { burger.resize(); top0 = parseFloat(getComputedStyle(stick).top) || 0; kick(); }, 120); });
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; } }, { passive: true });
  let lastView = null;
  $('#burger').addEventListener('click', e => {
    if (!lastView) return;
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (Math.hypot(x - lastView.cx, (y - lastView.cy) * .8 + lastView.S * .6) < lastView.S * 2.2) { tapE = tapE ? 0 : 1; kick(); }
  });

  function frame(now) {
    raf = 0;
    const t = now / 1000 - T0;
    const dt = Math.min(.05, t - lastT); lastT = t;
    if (!reduce) idle += dt * .32;
    tx += (mx - tx) * .08; ty += (my - ty) * .08;
    const W = burger.W, H = burger.H;
    /* intro progress */
    let it = { drop: [], sq: [], shake: 0 }, glide = 1, assembled = 1;
    if (introOn && skipAt == null) {
      it = introState(t);
      glide = clamp((t - ASSEMBLED) / GLIDE); glide = easeOut(glide);
      assembled = clamp((t - ASSEMBLED + .2) / .4);
    }
    /* rest position */
    let S0, restX, restY, zoneH = 0;
    if (staged) { S0 = Math.min(W * .14, H * .25); restX = W * .7; restY = H * .5; }
    else { zoneH = zone.offsetHeight; S0 = Math.min(W * .25, zoneH * .3); restX = W * .5; restY = zone.offsetTop + zoneH * .5; }
    const introX = W * .5, introY = staged ? H * .5 : restY;
    /* scroll */
    let p = 0, e = 0;
    if (staged) {
      const range = Math.max(1, sec.offsetHeight - stick.offsetHeight);
      const target = clamp((top0 - sec.getBoundingClientRect().top) / range);
      cur += (target - cur) * .2; if (Math.abs(target - cur) < .0005) cur = target;
      p = cur;
      e = Math.max(ss(.12, .45, p) * (1 - ss(.8, .93, p)), tapE * (1 - ss(0, .05, p)));
    } else {
      p = clamp(scrollY / Math.max(1, H));
      const ph = ((t - (introOn ? ASSEMBLED + 1.6 : 1.2)) % 7.5 + 7.5) % 7.5 / 7.5;
      const loop = t < (introOn ? ASSEMBLED + 1.6 : 1.2) || reduce ? 0 : ph < .2 ? 0 : ph < .38 ? ss(.2, .38, ph) : ph < .78 ? 1 : 1 - ss(.78, .94, ph);
      const want = tapE || loop;
      eM += (want - eM) * (reduce ? 1 : .1);
      e = eM;
    }
    const pitch = mix(.38, .52, e) - ty * .07;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const units = SUMH + (N - 1) * GAP * e;
    const roomH = staged ? H * .8 : Math.max(zoneH * .9, 280);
    const Sfit = roomH / (units * cp + 2.4 * sp);
    let S = Math.min(S0 * (staged ? mix(1, 1.08, e) : 1), Sfit);
    if (!staged) S = Math.min(S, mix(S, (W - 175) / 2.85, e));
    let cx, cy;
    const stackPx = units * cp * S;
    if (staged) {
      cx = mix(mix(restX, W * .56, ss(.05, .3, p)), W * .66, ss(.8, .95, p));
      cy = H * .5 + stackPx * .5 - S * .1;
    } else {
      cx = mix(restX, Math.min(restX, S * 1.42 + 16), e);
      cy = restY + stackPx * .5 - S * .1;
    }
    /* intro overrides: big and centered while the layers land, then glide to rest */
    if (introOn && skipAt == null) {
      const bigS = S * 1.12;
      cx = mix(introX, cx, glide); cy = mix(introY + SUMH * cp * bigS * .5, cy, glide); S = mix(bigS, S, glide);
    }
    const yaw = idle + p * Math.PI * 2 + tx * .5;
    const st = { cx: cx + it.shake * .6, cy: cy + it.shake, S, yaw, pitch, e, gapU: GAP, drop: it.drop, sq: it.sq, t, mx: tx, scroll: p,
      steam: (1 - e) * assembled * (staged ? 1 - ss(.02, .1, p) : 1), bits: introOn ? clamp((t - .2) / .8) : 1 };
    const anchors = burger.frame(st);
    lastView = { cx, cy, S };

    /* labels: a tidy column to the right of the burger */
    const colX = cx + 1.42 * S + (staged ? 30 : 10);
    anchors.forEach((a, i) => {
      const el = tags[i];
      const op = a ? ss(.3 + (N - 1 - i) * .04, .62 + (N - 1 - i) * .04, e) : 0;
      el.style.opacity = op.toFixed(3);
      if (op > .001) el.style.transform = `translate(${(colX + (1 - op) * 24).toFixed(1)}px, ${(a[1] - 15).toFixed(1)}px)`;
    });
    burger.leaders(anchors, colX, anchors.map((a, i) => a ? ss(.3 + (N - 1 - i) * .04, .62 + (N - 1 - i) * .04, e) : 0));

    /* stamp and note ride with the burger */
    const topY = cy - (SUMH * cp + 1.1 * sp) * S;
    const sa = (1 - ss(.05, .25, e)) * (staged ? 1 - ss(.02, .12, p) : 1);
    stamp.style.opacity = sa.toFixed(3);
    stamp.style.transform = `translate(${(cx + .95 * S - stamp.offsetWidth * .3).toFixed(1)}px, ${(topY - stamp.offsetHeight * .45).toFixed(1)}px)`;
    const na = (introOn ? clamp((t - ASSEMBLED - .7) / .4) : 1) * (1 - ss(0, .2, e)) * (staged ? 1 - ss(.01, .06, p) : 1);
    bnote.style.opacity = na.toFixed(3);
    bnote.style.transform = `translate(${(cx - bnote.offsetWidth / 2).toFixed(1)}px, ${(cy + S * (staged ? .62 : .5)).toFixed(1)}px) rotate(-3deg)`;
    bgword.style.transform = `translateX(${(-p * W * .45 - (staged ? 0 : t * 12 % (W * .6))).toFixed(1)}px)`;

    if (staged) {
      const fade = 1 - ss(.02, .18, p);
      copy.style.opacity = fade.toFixed(3); copy.style.visibility = fade < .02 ? 'hidden' : '';
      copy.style.transform = `translateX(${(-p * 120).toFixed(1)}px)`;
      cue.style.opacity = (1 - ss(0, .08, p)).toFixed(3);
      const so = ss(.42, .58, p);
      score.style.opacity = so.toFixed(3); score.style.visibility = so < .02 ? 'hidden' : 'visible';
      score.style.transform = `translateY(calc(-50% + ${((1 - so) * 34).toFixed(1)}px))`;
    }
    if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }, { rootMargin: '150px' }).observe(sec);
  document.addEventListener('visibilitychange', kick);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);
  kick();
})();

/* ================= TICKER: speeds up and leans with your scroll ================= */
(function ticker() {
  const box = $('#ticker'), track = $('#track');
  const words = [['Savor the flavor', 'h'], ["Soubra's Classic"], ['Ghost your ex, not your fav restaurant', 'h'], ['Sauron Eye'], ['Since 1982', 'h'], ['24k'], ['Want to have a burger with me?', 'h'], ['Honey Bunny'], ['Zeus'], ['Majesty Steak']];
  const unit = words.map(([w, c]) => `<span${c ? ` class="${c}"` : ''}>${esc(w)}</span><b>✦</b>`).join('');
  track.innerHTML = unit + unit;
  if (reduce) return;
  let x = 0, lastY = scrollY, vel = 0, last = 0, on = false, raf = 0;
  function tick(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const dy = scrollY - lastY; lastY = scrollY;
    vel += (dy - vel) * .15;
    x -= (60 + Math.abs(vel) * 16) * dt * (vel < -.5 ? -1 : 1);
    const half = track.scrollWidth / 2;
    if (x < -half) x += half; if (x > 0) x -= half;
    track.style.transform = `translateX(${x.toFixed(1)}px) skewX(${clamp(-vel * .5, -12, 12).toFixed(2)}deg)`;
    if (on) raf = requestAnimationFrame(tick);
  }
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !on) { on = true; last = performance.now(); lastY = scrollY; raf = requestAnimationFrame(tick); }
    else if (!es[0].isIntersecting) { on = false; cancelAnimationFrame(raf); }
  }).observe(box);
})();

/* ================= headings flip up letter by letter ================= */
(function split() {
  if (reduce) return;
  $$('.h2').forEach(h => {
    const text = h.textContent.trim(); h.setAttribute('aria-label', text);
    let i = 0;
    h.innerHTML = text.split(/(\s+)/).map(w => /^\s+$/.test(w) ? ' ' : `<span class="wd" aria-hidden="true">${[...w].map(ch => `<span class="c" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`).join('');
    h.classList.add('split');
  });
})();

/* ================= reveal on scroll ================= */
(function revealAll() {
  const els = [...$$('.reveal'), ...$$('.h2.split'), ...$$('.msec')];
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
})();

/* ================= 1982: the year counts back in time ================= */
(function year() {
  const el = $('#yr'); if (reduce || !el) return;
  const io = new IntersectionObserver(es => {
    if (!es[0].isIntersecting) return; io.disconnect();
    const from = new Date().getFullYear(), to = 1982, t0 = performance.now();
    (function step(now) { const k = clamp((now - t0) / 1600), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }, { threshold: .4 });
  io.observe(el);
})();

/* ================= reading progress through the menu ================= */
(function prog() {
  const bar = $('#mprog'), menu = $('#menu');
  const upd = () => { const r = menu.getBoundingClientRect(); bar.style.transform = `scaleX(${clamp((innerHeight * .4 - r.top) / r.height).toFixed(4)})`; bar.classList.toggle('on', r.top < innerHeight * .4 && r.bottom > 0); };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
})();

/* ================= 3D tilt cards, cursor and magnetic buttons (mouse only) ================= */
(function tilt() {
  if (!fine || reduce) return;
  let active = null;
  const release = el => { el.classList.remove('tilting'); el.style.transform = ''; if (active === el) active = null; };
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('.card');
    if (active && active !== el) release(active);
    if (!el || !el.closest('.msec.in')) return;
    active = el;
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${((.5 - py) * 9).toFixed(2)}deg) rotateY(${((px - .5) * 11).toFixed(2)}deg) translateY(-4px)`;
    el.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    el.classList.add('tilting');
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { if (active) release(active); });
})();
(function cursor() {
  if (!fine || reduce) return;
  const el = document.createElement('div'); el.className = 'cur hide'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = '<span></span>';
  el.style.transform = 'translate(-100px,-100px)';
  document.body.appendChild(el);
  const label = el.firstChild;
  let x = -100, y = -100, cx = x, cy = y, mag = null, raf = 0;
  function loop() { cx += (x - cx) * .24; cy += (y - cy) * .24; el.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`; raf = (Math.abs(x - cx) > .3 || Math.abs(y - cy) > .3) ? requestAnimationFrame(loop) : 0; }
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    if (x < -50) { cx = e.clientX; cy = e.clientY; }
    x = e.clientX; y = e.clientY;
    const t = e.target;
    const txt = t.closest('.card-hit') ? 'Open' : t.closest('.hero-burger') ? 'Tap' : t.closest('.add') ? 'Add' : '';
    el.classList.toggle('label', !!txt); if (txt) label.textContent = txt;
    el.classList.toggle('hot', !txt && !!t.closest('a, button, .chip'));
    el.classList.toggle('hide', !!t.closest('input, textarea, .sheet, .drawer, .search'));
    const m = t.closest('.btn');
    if (mag && mag !== m) { mag.style.translate = ''; mag = null; }
    if (m && !m.disabled && !m.closest('.sheet, .drawer')) { mag = m; const r = m.getBoundingClientRect(); m.style.translate = `${((x - r.left - r.width / 2) * .2).toFixed(1)}px ${((y - r.top - r.height / 2) * .3).toFixed(1)}px`; }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { el.classList.add('hide'); if (mag) { mag.style.translate = ''; mag = null; } });
})();
