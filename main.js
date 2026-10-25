import { setClickSound, click, cheer, fanfare, giggle, sparkle, oops, setMuted, isMuted } from './audio.js';
import { confetti, confettiFrom, shake } from './effects.js';
import { initCursor } from './cursor.js';

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const shuffle = a => [...a].sort(() => Math.random() - .5);
const inits = {};
const sections = [...document.querySelectorAll('main section')];
let cur = 0;

async function boot() {
  let D;
  try { D = await (await fetch('data/content.json')).json(); }
  catch (e) { $('#stage').innerHTML = '<p class="card">No se pudo cargar data/content.json. Abre la página desde GitHub Pages o un servidor local (no con doble clic).</p>'; return; }
  const M = D.meta;
  setClickSound(M.clickSound);
  document.addEventListener('click', click);
  initCursor();
  ['#logoTop', '#logoEnd'].forEach(s => { $(s).src = M.logo; });
  $('#yt').src = `https://www.youtube.com/embed/${M.video}`;
  $('#ytLink').href = `https://youtu.be/${M.video}`;
  $('#hymn').href = M.hymn;
  initNav(); initTimer(); initControls();

  // Portada
  const photo = $('#photo');
  const setPhoto = src => { photo.innerHTML = ''; const i = h('img'); i.src = src; i.alt = 'Coro de la Primaria'; photo.append(i); };
  if (M.coverPhoto) setPhoto(M.coverPhoto);
  else { photo.onclick = () => $('#photoInput').click(); $('#photoInput').onchange = e => { const f = e.target.files[0]; if (f) { setPhoto(URL.createObjectURL(f)); cheer(); } }; }
  $('#applause').onclick = e => { confettiFrom(e.currentTarget, 120); fanfare(); };
  $('#nameBtn').onclick = e => { const b = e.currentTarget; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); confettiFrom(b, 90); giggle(); };

  // Video y elegidos
  const v = D.video;
  $('#videoCard').innerHTML = `<b>Idea principal:</b> ${v.main}<ol>${v.lessons.map(l => `<li>${l}</li>`).join('')}</ol><b>Aplicación:</b> ${v.apply}<p class="note">⚠ ${v.warn}</p>`;
  const c = D.chosen;
  $('#chosenCard').innerHTML = `<b>${c.verse}</b><p>${c.guide}</p><button id="keyBtn">✨ Revelar la clave</button><div class="rev card" id="keyBox"><b>${c.key}</b><p class="note">${c.note}</p></div><p class="note">${c.questions}</p>`;
  $('#keyBtn').onclick = e => { $('#keyBox').classList.add('on'); confettiFrom(e.currentTarget, 40); sparkle(); };

  inits['s-cards'] = () => {
    const box = $('#cards'), det = $('#cardDetail'); box.innerHTML = ''; det.className = 'card rev';
    D.cards.forEach((k, i) => {
      const b = h('button', 'opt', `<h3 class="c${i % 4 + 1}">${k.ref}</h3>${k.title}`);
      b.onclick = () => {
        box.querySelectorAll('.opt').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sparkle();
        det.className = 'card rev on';
        det.innerHTML = `<h3>${k.ref} · ${k.title}</h3><p>${k.desc}</p><p><b>Pregunta:</b> ${k.q}</p><button class="ghost">Ver conexión y aplicación</button><p class="rev note">${k.link}</p>`;
        $('button', det).onclick = e => { $('.note', det).classList.toggle('on'); confettiFrom(e.currentTarget, 20); };
      };
      box.append(b);
    });
  };

  inits['s-clay'] = () => {
    const S = D.clay.stages; let n = 0; const btn = $('#clay'), t = $('#clayText'), again = $('#clayAgain');
    const draw = () => { btn.textContent = S[n].icon; t.textContent = S[n].text; again.classList.toggle('on', n === S.length - 1); };
    btn.onclick = () => { if (n < S.length - 1) { n++; draw(); confettiFrom(btn, n === S.length - 1 ? 110 : 25); n === S.length - 1 ? fanfare() : giggle(); } };
    again.textContent = '🔁 ' + D.clay.again; again.onclick = () => { n = 0; draw(); sparkle(); };
    draw();
  };

  inits['s-tf'] = () => {
    const box = $('#tf'); box.innerHTML = '';
    D.tf.forEach(q => {
      const row = h('div', 'card tf', `<div><b>${q.s}</b><p class="rev"></p></div><div><button data-v="1">Verdadero</button> <button data-v="0" class="ghost">Falso</button></div>`);
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
    D.match.forEach((m, i) => { const b = h('button', '', m[0]); b.dataset.k = i; b.onclick = () => { L.querySelectorAll('button').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; }; L.append(b); });
    shuffle(D.match.map((m, i) => [m[1], i])).forEach(([t, i]) => {
      const b = h('button', '', t); b.dataset.k = i;
      b.onclick = () => {
        if (!sel) return;
        if (sel.dataset.k === b.dataset.k) { sel.classList.remove('sel'); sel.classList.add('done'); b.classList.add('done'); confettiFrom(b, 50); cheer(); sel = null; done++; $('#matchCount').textContent = `${done}/${total}` + (done === total ? ' 🎉' : ''); if (done === total) fanfare(); }
        else { b.classList.add('bad'); shake(b); oops(); setTimeout(() => b.classList.remove('bad'), 600); }
      };
      R.append(b);
    });
  };

  inits['s-apply'] = () => {
    const box = $('#apply'); box.innerHTML = '';
    D.apply.forEach(a => {
      const d = h('div', 'card', `<b>${a.s}</b><div class="grid"></div><p class="rev note">${a.n}</p>`);
      a.o.forEach(o => { const b = h('button', 'ghost', o); b.onclick = () => { $('.rev', d).classList.add('on'); confettiFrom(b, 20); giggle(); }; $('.grid', d).append(b); });
      box.append(d);
    });
  };

  inits['s-week'] = () => {
    const box = $('#week'); box.innerHTML = ''; let saved = [];
    try { saved = JSON.parse(localStorage.getItem('valientes-week') || '[]'); } catch (e) { /* sin almacenamiento */ }
    const upd = () => { const n = box.querySelectorAll('input:checked').length; $('#weekCount').textContent = `Misiones cumplidas: ${n}/${D.week.length}` + (n === D.week.length ? ' 🏆' : ''); try { localStorage.setItem('valientes-week', JSON.stringify([...box.querySelectorAll('input')].map(x => x.checked))); } catch (e) { /* ok */ } };
    D.week.forEach((w, i) => {
      const row = h('label', 'card week', `<input type="checkbox"><span>${w}</span>`); const cb = $('input', row);
      cb.checked = !!saved[i]; row.classList.toggle('ok', cb.checked);
      cb.onchange = () => { row.classList.toggle('ok', cb.checked); if (cb.checked) { confettiFrom(cb, 50); cheer(); } upd(); if (box.querySelectorAll('input:checked').length === D.week.length) fanfare(); };
      box.append(row);
    });
    upd();
  };

  Object.values(inits).forEach(f => f());
  document.querySelectorAll('.rs').forEach(b => b.onclick = () => {
    const s = b.closest('section'); s.querySelectorAll('.rev.on').forEach(x => x.classList.remove('on')); s.querySelectorAll('.sel').forEach(x => x.classList.remove('sel'));
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
