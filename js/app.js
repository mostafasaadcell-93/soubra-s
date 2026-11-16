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
    chips.forEach(c => { const on = c.dataset.cat === id; c.classList.toggle('on', on); if (on) { c.setAttribute('aria-current', 'true'); c.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' }); } else c.removeAttribute('aria-current'); });
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

/* ================= HERO: the 3D Soubra's Classic ================= */
const HERO_L = 'bunT cocktail tomato:Grilled_tomato grilledOnion iceberg pickles mustard cheddar beef bunB';
const HERO_SHORT = { bunT: 'Toasted bun', cocktail: 'Cocktail sauce', tomato: 'Grilled tomato', grilledOnion: 'Grilled onion', iceberg: 'Iceberg', pickles: 'Dill pickles', mustard: 'Special mustard', cheddar: 'Cheddar', beef: '140g beef', bunB: 'Bottom bun' };
const hero = (function buildHero() {
  const box = $('#stack3d'), uid = 'hero';
  const ls = parseL(HERO_L).map((l, i) => {
    const h = LAYER[l.type][0];
    const el = document.createElement('div'); el.className = 'hl';
    el.innerHTML = `<svg viewBox="-4 -2 158 ${h + 4}" aria-hidden="true">${i === 0 ? defs(uid) : ''}${layerSVG(l.type, 'hero' + l.key, uid)}</svg>` +
      `<span class="hl-tag ${i % 2 ? 'l' : 'r'}"><b></b><i></i><span>${esc(HERO_SHORT[l.key] || l.label)}</span></span>`;
    box.appendChild(el);
    return { el, h, tag: el.querySelector('.hl-tag') };
  });
  /* gradient defs live in the first svg; the other layers reference them by id */
  return { ls, layout(e, avail) {
    const W = box.clientWidth, H = box.clientHeight;
    const n = ls.length, sumH = ls.reduce((s, l) => s + l.h, 0);
    let s = W * .72 / BW;
    const gapC = -2, gapE = 20;
    const need = (sumH + (n - 1) * mix(gapC, gapE, e)) * s;
    const room = Math.max(H, avail || H) * .78;
    if (need > room) s *= room / need;
    /* keep the side labels on screen: narrow the burger as it opens on small screens */
    if (e > 0) {
      const tagW = Math.max(...ls.map(l => l.tag.offsetWidth || 0)) + 14;
      const r = box.getBoundingClientRect(), vw = document.documentElement.clientWidth;
      const cx = r.left + r.width / 2, half = Math.min(cx, vw - cx) - tagW;
      const fitW = 2 * half / BW;
      if (fitW < s) s = mix(s, Math.max(fitW, .55), e);
    }
    const gap = mix(gapC, gapE, e) * s;
    let y = (H - (sumH * s + (n - 1) * gap)) / 2;
    ls.forEach((l, i) => {
      const w = BW * s, hh = l.h * s;
      const z = (n / 2 - i) * (3 + e * 5);
      l.el.style.width = w + 'px'; l.el.style.height = hh + 'px';
      l.el.style.transform = `translate3d(-50%, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      const op = ss(.25 + i * .045, .45 + i * .045, e);
      l.tag.style.opacity = op.toFixed(3);
      l.tag.style.transform = `translateY(-50%) translateX(${((1 - op) * (i % 2 ? 14 : -14)).toFixed(1)}px)`;
      y += hh + gap;
    });
  } };
})();

(function heroScene() {
  const sec = $('#top'), stick = $('#stick'), copy = $('#hero-copy'), hb = $('#hb'), scene = $('#hb-scene'), score = $('#score'), cue = $('#cue'), note = $('#hb-note'), shadow = $('#hb-shadow');
  const mq = matchMedia('(min-width: 960px) and (min-height: 620px)');
  let staged = false, cur = 0, tx = 0, ty = 0, mx = 0, my = 0, tapE = 0, eNow = 0, visible = true, raf = 0, top0 = 0;
  function setStaged() {
    staged = !reduce && mq.matches;
    document.documentElement.classList.toggle('staged', staged);
    [copy, hb, score, cue, note].forEach(el => { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; });
    note.innerHTML = staged ? 'psst&hellip; scroll and watch it come apart' : 'psst&hellip; tap the burger to hold it open';
    top0 = parseFloat(getComputedStyle(stick).top) || 0;
  }
  setStaged();
  mq.addEventListener ? mq.addEventListener('change', setStaged) : mq.addListener(setStaged);
  addEventListener('resize', () => { top0 = parseFloat(getComputedStyle(stick).top) || 0; frame(performance.now(), true); });
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; } }, { passive: true });
  hb.addEventListener('click', () => { tapE = tapE ? 0 : 1; });
  function frame(now, once) {
    raf = 0;
    const t = now / 1000;
    tx += (mx - tx) * .07; ty += (my - ty) * .07;
    let e;
    if (staged) {
      const range = Math.max(1, sec.offsetHeight - stick.offsetHeight);
      const p = clamp((top0 - sec.getBoundingClientRect().top) / range);
      cur += (p - cur) * (once ? 1 : .12); if (Math.abs(p - cur) < .0004) cur = p;
      const fade = 1 - ss(.02, .22, cur);
      copy.style.opacity = fade.toFixed(3); copy.style.visibility = fade < .02 ? 'hidden' : '';
      copy.style.transform = `translateY(${(-cur * stick.clientHeight * .3).toFixed(1)}px)`;
      cue.style.opacity = (1 - ss(0, .1, cur)).toFixed(3);
      note.style.opacity = (1 - ss(0, .12, cur)).toFixed(3);
      e = ss(.1, .52, cur);
      const so = ss(.4, .62, cur);
      score.style.opacity = so.toFixed(3); score.style.visibility = so < .02 ? 'hidden' : 'visible';
      score.style.transform = `translateY(calc(-50% + ${((1 - so) * 30).toFixed(1)}px))`;
      hb.style.transform = `translateY(${(ss(.1, .5, cur) * 14).toFixed(1)}px)`;
      hero.layout(Math.max(e, tapE * (1 - cur)), stick.clientHeight);
    } else {
      /* phones: the burger comes apart and back together on a loop; tap to hold it open */
      const ph = ((t - 1.5) % 7 + 7) % 7 / 7;
      e = tapE || (ph < .15 ? 0 : ph < .35 ? ss(.15, .35, ph) : ph < .75 ? 1 : 1 - ss(.75, .95, ph));
      eNow += (e - eNow) * (reduce ? 1 : .12);
      hero.layout(eNow, hb.clientHeight * 1.3);
    }
    const sway = fine ? 0 : Math.sin(t * .7) * 9;
    scene.style.transform = `rotateX(${(-ty * 10 + 6).toFixed(2)}deg) rotateY(${(tx * 16 + sway).toFixed(2)}deg) translateY(${(Math.sin(t * 1.2) * 6).toFixed(1)}px)`;
    shadow.style.transform = `scale(${(1 - Math.sin(t * 1.2) * .04).toFixed(3)})`;
    if (!once && visible && !document.hidden && !reduce) raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; start(); }, { rootMargin: '120px' }).observe(sec);
  document.addEventListener('visibilitychange', start);
  frame(performance.now(), true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => frame(performance.now(), true));
  if (reduce) hero.layout(.6, stick.clientHeight);
  start();
})();

/* ================= INTRO: the ring box ================= */
(function intro() {
  const el = $('#intro'), root = document.documentElement;
  if (!el) return;
  if (root.classList.contains('no-intro')) { el.remove(); root.classList.add('ready'); return; }
  try { sessionStorage.setItem('soubras-intro', '1'); } catch (e) {}
  const mini = xray(ITEMS['soubras-classic'], { compact: true, W: 120, H: 92, maxScale: .72 });
  $('#rb-burger').appendChild(mini.svg);
  document.body.classList.add('locked');
  let done = false;
  const T = [];
  const finish = () => {
    if (done) return; done = true; T.forEach(clearTimeout);
    el.classList.add('pop', 'out');
    setTimeout(() => { root.classList.add('ready'); document.body.classList.remove('locked'); }, 450);
    setTimeout(() => el.remove(), 1100);
  };
  T.push(setTimeout(() => el.classList.add('open'), 1150));
  T.push(setTimeout(() => el.classList.add('pop'), 1750));
  T.push(setTimeout(finish, 3700));
  el.addEventListener('click', finish);
  addEventListener('keydown', function k(e) { if (!done) { finish(); removeEventListener('keydown', k); } });
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
