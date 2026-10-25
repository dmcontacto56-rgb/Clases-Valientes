import { setClickSound, click, cheer, fanfare, giggle, sparkle, oops, setMuted, isMuted } from './audio.js?v=6';
import { confetti, confettiFrom, shake } from './effects.js?v=6';
import { initCursor } from './cursor.js?v=6';

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const shuffle = a => [...a].sort(() => Math.random() - .5);
const inits = {};
const CLAY_SVG = `<svg viewBox="0 0 200 220" aria-hidden="true">
<ellipse class="l0" cx="100" cy="140" rx="62" ry="46" fill="#d9a066" stroke="#8a4f1d" stroke-width="4"/>
<g class="l1" fill="#d9a066" stroke="#8a4f1d" stroke-width="4"><rect x="25" y="105" width="150" height="70" rx="35"/><circle cx="70" cy="135" r="3" fill="#8a4f1d"/><circle cx="110" cy="150" r="3" fill="#8a4f1d"/><circle cx="140" cy="130" r="3" fill="#8a4f1d"/></g>
<g class="g" fill="#d9a066" stroke="#8a4f1d" stroke-width="4"><rect x="28" y="85" width="144" height="26" rx="13"/><rect x="68" y="78" width="64" height="76" rx="22"/><rect x="70" y="140" width="28" height="62" rx="14"/><rect x="102" y="140" width="28" height="62" rx="14"/><circle cx="100" cy="50" r="32"/></g>
<g class="deco" fill="none" stroke-linecap="round"><circle cx="89" cy="44" r="4.5" fill="#1c2347"/><circle cx="111" cy="44" r="4.5" fill="#1c2347"/><path d="M86 60 Q100 74 114 60" stroke="#1c2347" stroke-width="4"/><circle cx="100" cy="104" r="5" fill="#0887F5"/><circle cx="100" cy="124" r="5" fill="#C97BF0"/><path d="M36 98 q8 -8 16 0 t16 0 M132 98 q8 -8 16 0 t16 0 M74 190 h20 M106 190 h20" stroke="#fff" stroke-width="5"/><path d="M90 76 l10 8 l10 -8 z" fill="#24B5EF"/></g></svg>`;
const CEPO_SVG = `<svg class="mini" viewBox="0 0 120 90" role="img" aria-label="Jeremías con los pies en el cepo">
<path d="M4 82 H116" stroke="#8a4f1d" stroke-width="3" stroke-linecap="round"/>
<rect x="40" y="56" width="62" height="10" rx="5" fill="#7CB8F0" stroke="#1c2347" stroke-width="2"/>
<rect x="14" y="30" width="30" height="40" rx="11" fill="#7CB8F0" stroke="#1c2347" stroke-width="2"/>
<rect x="11" y="36" width="8" height="26" rx="4" fill="#5aa2e8" stroke="#1c2347" stroke-width="2"/>
<circle cx="29" cy="21" r="11" fill="#f2c9a0" stroke="#1c2347" stroke-width="2"/>
<path d="M17 20 a12 12 0 0 1 24 0 z" fill="#C97BF0" stroke="#1c2347" stroke-width="2"/>
<path d="M21 27 q8 14 16 0 z" fill="#6b4a2b"/>
<circle cx="25" cy="21" r="1.6" fill="#1c2347"/><circle cx="33" cy="21" r="1.6" fill="#1c2347"/>
<g fill="#b5702f" stroke="#6b3d12" stroke-width="2"><rect x="60" y="44" width="9" height="40" rx="2"/><rect x="93" y="44" width="9" height="40" rx="2"/><rect x="58" y="46" width="46" height="9" rx="3"/><rect x="58" y="67" width="46" height="9" rx="3"/></g>
<circle cx="108" cy="61" r="6" fill="#f2c9a0" stroke="#1c2347" stroke-width="2"/></svg>`;
const sections = [...document.querySelectorAll('main section')];
let cur = 0;

async function boot() {
  let D;
  try { D = await (await fetch('content.json')).json(); }
  catch (e) { $('#stage').innerHTML = '<p class="card">No se pudo cargar content.json. Abre la página desde GitHub Pages o un servidor local (no con doble clic).</p>'; return; }
  const M = D.meta;
  window.__app = 6;
  setClickSound(M.clickSound);
  document.addEventListener('click', click);
  initCursor();
  ['#logoTop', '#logoEnd'].forEach(s => { $(s).src = M.logo; });
  const vid = $('#vid');
  vid.src = M.videoFile;
  vid.addEventListener('error', () => { vid.hidden = true; const y = $('#yt'); y.src = `https://www.youtube.com/embed/${M.video}`; y.hidden = false; }, { once: true });
  $('#ytLink').href = `https://youtu.be/${M.video}`;
  $('#hymn').href = M.hymn;
  initNav(); initTimer(); initControls();

  // Portada
  const photo = $('#photo'), PK = 'valientes-photo';
  const setPhoto = src => { photo.innerHTML = ''; const i = h('img'); i.src = src; i.alt = 'Coro de la Primaria'; photo.append(i); };
  let saved = null; try { saved = localStorage.getItem(PK); } catch (e) { /* sin almacenamiento */ }
  if (M.coverPhoto) setPhoto(M.coverPhoto); else if (saved) setPhoto(saved);
  if (!M.coverPhoto) {
    photo.onclick = () => $('#photoInput').click();
    $('#photoInput').onchange = e => {
      const f = e.target.files[0]; if (!f) return; const img = new Image();
      img.onload = () => { const k = Math.min(1, 1400 / img.width), c = h('canvas'); c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); const url = c.toDataURL('image/jpeg', .85); setPhoto(url); try { localStorage.setItem(PK, url); } catch (er) { /* sin espacio */ } cheer(); };
      img.src = URL.createObjectURL(f);
    };
  }
  $('#applause').onclick = e => { confettiFrom(e.currentTarget, 120); fanfare(); };
  const reveal = () => { const n = $('#nameBtn'); n.classList.add('unblur'); n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop'); confettiFrom(n, 90); giggle(); };
  $('#nameBtn').onclick = reveal;

  // Video y elegidos
  const v = D.video;
  $('#videoCard').innerHTML = `<b>Idea principal:</b> ${v.main}<ol>${v.lessons.map(l => `<li>${l}</li>`).join('')}</ol><b>Aplicación:</b> ${v.apply}<p class="note">⚠ ${v.warn}</p>`;
  const c = D.chosen;
  $('#chosenCard').innerHTML = `<b>${c.verse}</b><p>${c.guide}</p><div class="card tone2 rv" id="keyBox" tabindex="0" role="button" aria-label="Revelar la clave"><div class="blurtxt"><b>${c.key}</b><p class="note">${c.note}</p></div></div><p class="note hint">👆 Toca el recuadro para revelar la clave</p><p class="note">${c.questions}</p>`;
  const kb = $('#keyBox'), openKey = () => { kb.classList.add('unblur'); confettiFrom(kb, 40); sparkle(); };
  kb.onclick = openKey; kb.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') openKey(); };

  inits['s-cards'] = () => {
    const box = $('#cards'), det = $('#cardDetail'); box.innerHTML = ''; det.className = 'card rev';
    D.cards.forEach((k, i) => {
      const b = h('button', 'opt tone' + (i % 5), `<h3 class="c${i % 4 + 1}">${k.ref}</h3>${k.title}`);
      b.onclick = () => {
        box.querySelectorAll('.opt').forEach(x => x.classList.remove('sel')); b.classList.add('sel', 'seen'); sparkle();
        det.className = 'card rev on tone' + (i % 5);
        det.innerHTML = `<h3>${k.ref} · ${k.title}</h3><p>${k.desc}</p>${k.art ? CEPO_SVG.replace('class="mini"', 'class="mini big"') : ''}${k.exp ? `<p><b>¿Qué es el cepo?</b> ${k.exp}</p>` : ''}<p><b>Pregunta:</b> ${k.q}</p><button class="ghost">Ver conexión y aplicación</button><p class="rev note">${k.link}</p>`;
        $('button', det).onclick = e => { $('.note', det).classList.toggle('on'); confettiFrom(e.currentTarget, 20); };
      };
      box.append(b);
    });
  };

  inits['s-clay'] = () => {
    const S = D.clay.stages, btn = $('#clay'), t = $('#clayText'), again = $('#clayAgain'); let n = 0;
    btn.innerHTML = CLAY_SVG; const svg = $('svg', btn);
    const draw = () => { svg.dataset.s = n; t.textContent = S[n].text; again.classList.toggle('on', n === S.length - 1); btn.classList.remove('squash'); void btn.offsetWidth; btn.classList.add('squash'); };
    btn.onclick = () => { if (n < S.length - 1) { n++; draw(); if (n === S.length - 1) { confettiFrom(btn, 110); fanfare(); } else { confettiFrom(btn, 25); giggle(); } } };
    again.textContent = '🔁 ' + D.clay.again; again.onclick = () => { n = 0; draw(); sparkle(); };
    draw();
  };

  inits['s-tf'] = () => {
    const box = $('#tf'); box.innerHTML = '';
    D.tf.forEach((q, i) => {
      const row = h('div', 'card tf tone' + (i % 5), `<div><b>${q.s}</b><p class="rev"></p></div><div><button data-v="1">Verdadero</button> <button data-v="0" class="ghost">Falso</button></div>`);
      const p = $('p', row);
      row.querySelectorAll('button').forEach(b => b.onclick = () => {
        const ok = (b.dataset.v === '1') === q.a;
        row.classList.remove('ok', 'no'); row.classList.add(ok ? 'ok' : 'no'); p.classList.add('on');
        if (ok) { p.textContent = '✅ ' + q.e; confettiFrom(b, 60); cheer(); }
        else { p.textContent = '❌ ¡Casi! Inténtalo otra vez.'; shake(row); oops(); }
      });
      box.append(row);
    });
  };

  inits['s-match'] = () => {
    const L = $('#mL'), R = $('#mR'); L.innerHTML = R.innerHTML = ''; L.className = R.className = 'pair';
    let sel = null, done = 0; const total = D.match.length; $('#matchCount').textContent = `0/${total}`;
    D.match.forEach((m, i) => { const b = h('button', ''); b.innerHTML = m[0].replace('🪵', CEPO_SVG); b.dataset.k = i; b.onclick = () => { L.querySelectorAll('button').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; }; L.append(b); });
    shuffle(D.match.map((m, i) => [m[1], i])).forEach(([t, i]) => {
      const b = h('button', '', t); b.dataset.k = i;
      b.onclick = () => {
        if (!sel) return;
        if (sel.dataset.k === b.dataset.k) { sel.classList.remove('sel'); sel.classList.add('done'); b.classList.add('done'); const m0 = D.match[sel.dataset.k][0]; b.innerHTML = '<span class="ic">' + (m0.includes('🪵') ? CEPO_SVG : m0.split(' ')[0]) + '</span> ' + b.textContent; confettiFrom(b, 50); cheer(); sel = null; done++; $('#matchCount').textContent = `${done}/${total}` + (done === total ? ' 🎉' : ''); if (done === total) fanfare(); }
        else { b.classList.add('bad'); shake(b); oops(); setTimeout(() => b.classList.remove('bad'), 600); }
      };
      R.append(b);
    });
  };

  inits['s-apply'] = () => {
    const box = $('#apply'); box.innerHTML = '';
    D.apply.forEach((a, k) => {
      const d = h('div', 'card tone' + [0, 4, 1][k % 3], `<b>${a.s}</b><div class="grid"></div><div class="reflect card rev"></div>`);
      const g = $('.grid', d), r = $('.reflect', d);
      a.o.forEach((o, i) => {
        const b = h('button', 'opt o' + i, o.t);
        b.onclick = () => { g.querySelectorAll('.opt').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); r.className = 'reflect card rev on tone' + i; r.innerHTML = `<span class="note">💭 ${o.r}</span>`; sparkle(); };
        g.append(b);
      });
      box.append(d);
    });
  };

  inits['s-week'] = () => {
    const box = $('#week'); box.innerHTML = ''; let saved = [];
    try { saved = JSON.parse(localStorage.getItem('valientes-week') || '[]'); } catch (e) { /* sin almacenamiento */ }
    const upd = () => { const n = box.querySelectorAll('.lit').length; $('#weekCount').textContent = `Misiones iluminadas: ${n}/${D.week.length}` + (n === D.week.length ? ' 🏆' : ''); try { localStorage.setItem('valientes-week', JSON.stringify([...box.children].map(x => x.classList.contains('lit')))); } catch (e) { /* ok */ } };
    D.week.forEach((w, i) => {
      const [day, ...rest] = w.split(': ');
      const b = h('button', 'card week tone' + (i % 5), `<span class="spark">✨</span><span><b>${day}</b><br>${rest.join(': ')}</span>`);
      b.classList.toggle('lit', !!saved[i]); b.setAttribute('aria-pressed', !!saved[i]);
      b.onclick = () => { const on = b.classList.toggle('lit'); b.setAttribute('aria-pressed', on); if (on) { confettiFrom(b, 50); cheer(); } upd(); if (box.querySelectorAll('.lit').length === D.week.length) fanfare(); };
      box.append(b);
    });
    upd();
  };

  Object.values(inits).forEach(f => f());
  document.querySelectorAll('.rs').forEach(b => b.onclick = () => {
    const s = b.closest('section'); s.querySelectorAll('.rev.on').forEach(x => x.classList.remove('on')); s.querySelectorAll('.sel,.seen').forEach(x => x.classList.remove('sel', 'seen')); s.querySelectorAll('.unblur').forEach(x => x.classList.remove('unblur'));
    if (s.id === 's-week') { try { localStorage.removeItem('valientes-week'); } catch (e) { /* ok */ } }
    inits[s.id]?.(); sparkle();
  });
  show(0);
}

function show(n) {
  cur = Math.max(0, Math.min(sections.length - 1, n));
  sections.forEach((s, i) => s.classList.toggle('on', i === cur));
  document.querySelectorAll('#dots i').forEach((d, i) => d.classList.toggle('on', i === cur));
  $('#bar').style.width = ((cur + 1) / sections.length * 100) + '%';
  const s = sections[cur]; $('#label').textContent = `${cur + 1}/${sections.length} · ${s.dataset.title} · ${s.dataset.time}`;
  $('#stage').scrollTop = 0;
}
function initNav() {
  sections.forEach((s, i) => { const d = h('i'); d.title = s.dataset.title; d.onclick = () => show(i); $('#dots').append(d); });
  $('#prev').onclick = () => show(cur - 1);
  $('#next').onclick = e => { show(cur + 1); confettiFrom(e.currentTarget, 14); };
  addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
}
function initTimer() {
  let sec = 0, run = false; const t = $('#timer'), go = $('#tStart');
  const fmt = () => { t.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); t.classList.toggle('late', sec > 1800); };
  setInterval(() => { if (run) { sec++; fmt(); } }, 1000);
  go.onclick = () => { run = !run; go.textContent = run ? '⏸' : '▶'; };
  $('#tReset').onclick = () => { if (confirm('¿Reiniciar el cronómetro?')) { sec = 0; run = false; go.textContent = '▶'; fmt(); } };
}
function initControls() {
  $('#btnSound').onclick = e => { setMuted(!isMuted()); e.currentTarget.textContent = isMuted() ? '🔇' : '🔊'; };
  $('#btnMotion').onclick = () => document.body.classList.toggle('calm');
}
boot();
