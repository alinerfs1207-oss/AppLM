// ============================================================
// AppLM — Mesada do Luiz Miguel
// Lógica principal (vanilla JS + localStorage)
// ============================================================

const STORE_KEY = 'applm_state_v1';

// ---------- Estado ----------
function defaultState() {
  return {
    v: 1,
    pin: '1234',
    cycle: { start: '2025-09-08', end: '2025-10-08', payday: '2025-10-09' },
    settings: {
      limit: 100,
      quizReward: 5.0,        // recompensa por quiz perfeito (5/5)
      quizMissDebit: 0.5,
      checkinMissDebit: 0.5,
      bookReward: 10.0,
      prizeText: '🎁 Prêmio surpresa dos 30 dias!',
      taskValues: {},         // overrides por id
      debitValues: {},        // overrides por id
    },
    entries: [],              // extrato: {id, date, desc, amount, cat, auto}
    days: {},                 // por data: {checkin, tasks:{}, quiz:{}, ei:{}}
    processed: [],            // dias já fechados
    weekly: {},               // status por chave taskId@dueDate
    weeklyProcessed: [],
    grammar: {},              // por qid: {seen, wrong, streak, learned}
    reading: { sessions: [], gameMinutes: 0, booksDone: 0 },
    gems: 0, gemsTotal: 0,
    avatar: '🦁', theme: 'azul',
    eiAnswers: [],            // {date, qid, opt, quality, tags}
    entrySeq: 1,
  };
}

let S = load();
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* estado novo */ }
  return defaultState();
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} }

// ---------- Datas ----------
function todayStr() { return dateToStr(new Date()); }
function dateToStr(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function strToDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = strToDate(s); d.setDate(d.getDate() + n); return dateToStr(d); }
function fmtBR(s) { const [y, m, d] = s.split('-'); return `${d}/${m}`; }
function fmtBRFull(s) { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; }
function dayIndex(dstr) {
  const diff = Math.round((strToDate(dstr) - strToDate(S.cycle.start)) / 86400000);
  return diff + 1; // dia 1 = início do ciclo
}
function cycleLen() { return dayIndex(S.cycle.end); }
function inCycle(dstr) { return dstr >= S.cycle.start && dstr <= S.cycle.end; }

// ---------- Dinheiro / gemas ----------
function money(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }
function balance() { return S.entries.reduce((a, e) => a + e.amount, 0); }
function addEntry(desc, amount, cat, auto) {
  S.entries.push({ id: S.entrySeq++, date: todayStr(), desc, amount: Math.round(amount * 100) / 100, cat, auto: !!auto });
  save();
}
function addGems(n) { S.gems += n; S.gemsTotal += n; save(); }

function taskValue(t) { return S.settings.taskValues[t.id] ?? t.value; }
function debitValue(t) { return S.settings.debitValues[t.id] ?? t.value; }

function dayRec(dstr) {
  if (!S.days[dstr]) S.days[dstr] = { checkin: false, tasks: {}, quiz: null, ei: null };
  return S.days[dstr];
}

// ---------- Fechamento de dias passados (rollover) ----------
function nextDue(taskId, due) {
  // próxima data de vencimento (dia da semana `due`) a partir de hoje, dentro do ciclo
  let d = todayStr();
  if (d < S.cycle.start) d = S.cycle.start;
  for (let i = 0; i < 8; i++) {
    const cand = addDays(d, i);
    if (strToDate(cand).getDay() === due) return cand;
  }
  return null;
}

function processPastDays() {
  const today = todayStr();
  if (today <= S.cycle.start) return;
  // dias diários
  let d = S.cycle.start;
  while (d < today && d <= S.cycle.end) {
    if (!S.processed.includes(d)) {
      const rec = dayRec(d);
      DAILY_TASKS.forEach(t => {
        const st = rec.tasks[t.id];
        if (st === 'approved' || st === 'pending') return; // pendente fica p/ pais decidirem
        if (st === 'rejected') { rec.tasks[t.id] = 'rejected_debited'; addEntry(`❌ ${t.name} (não feita ${fmtBR(d)})`, -taskValue(t), 'tarefa', true); return; }
        if (!st) { rec.tasks[t.id] = 'missed'; addEntry(`❌ ${t.name} (não feita ${fmtBR(d)})`, -taskValue(t), 'tarefa', true); }
      });
      if (!rec.checkin) addEntry(`❌ Check-in não feito (${fmtBR(d)})`, -S.settings.checkinMissDebit, 'checkin', true);
      if (!rec.quiz || !rec.quiz.done) addEntry(`❌ Quiz de gramática não feito (${fmtBR(d)})`, -S.settings.quizMissDebit, 'quiz', true);
      S.processed.push(d);
    }
    d = addDays(d, 1);
  }
  // semanais: vencimentos já passados
  WEEKLY_TASKS.forEach(t => {
    let dd = S.cycle.start;
    while (dd < today && dd <= S.cycle.end) {
      if (strToDate(dd).getDay() === t.due) {
        const key = `${t.id}@${dd}`;
        if (!S.weeklyProcessed.includes(key)) {
          const st = S.weekly[key];
          if (st === 'approved' || st === 'pending') { /* ok ou aguardando pais */ }
          else {
            addEntry(`❌ ${t.name} (semana de ${fmtBR(dd)})`, -taskValue(t), 'tarefa', true);
            S.weekly[key] = 'missed';
          }
          if (st !== 'pending') S.weeklyProcessed.push(key);
        }
      }
      dd = addDays(dd, 1);
    }
  });
  save();
}

// ---------- Streak ----------
function fullDay(dstr) {
  const r = S.days[dstr];
  return !!(r && r.checkin && r.quiz && r.quiz.done && r.ei);
}
function streak() {
  let n = 0, d = todayStr();
  if (d > S.cycle.end) d = S.cycle.end;
  if (!fullDay(d)) d = addDays(d, -1); // hoje ainda em andamento não quebra
  while (d >= S.cycle.start && fullDay(d)) { n++; d = addDays(d, -1); }
  return n;
}

// ---------- Quiz de gramática (adaptativo) ----------
function gStat(qid) {
  if (!S.grammar[qid]) S.grammar[qid] = { seen: 0, wrong: 0, streak: 0, learned: false };
  return S.grammar[qid];
}
function pickQuizQuestions() {
  const reinforce = GRAMMAR_BANK.filter(q => { const s = S.grammar[q.id]; return s && s.wrong > 0 && !s.learned; });
  const fresh = GRAMMAR_BANK.filter(q => !S.grammar[q.id]);
  const review = GRAMMAR_BANK.filter(q => { const s = S.grammar[q.id]; return s && s.learned; });
  shuffle(reinforce); shuffle(fresh); shuffle(review);
  const picked = [];
  reinforce.slice(0, 3).forEach(q => picked.push(q));
  for (const q of fresh) { if (picked.length >= 5) break; picked.push(q); }
  for (const q of review) { if (picked.length >= 5) break; picked.push(q); }
  for (const q of reinforce.slice(3)) { if (picked.length >= 5) break; picked.push(q); }
  shuffle(picked);
  return picked.slice(0, 5);
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } }

// ---------- Inteligência emocional ----------
function eiToday() {
  const idx = Math.max(1, Math.min(dayIndex(todayStr()), EI_BANK.length));
  return EI_BANK[(idx - 1) % EI_BANK.length];
}
function eiMap() {
  const agg = {};
  Object.keys(EI_LABELS).forEach(k => agg[k] = { sum: 0, n: 0 });
  S.eiAnswers.forEach(a => a.tags.forEach(t => { agg[t].sum += a.quality; agg[t].n++; }));
  return agg;
}

// ---------- UI helpers ----------
const $ = sel => document.querySelector(sel);
function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
let currentTab = 'home';
let parentMode = false;

function applyTheme() {
  const th = THEMES.find(t => t.id === S.theme) || THEMES[0];
  document.documentElement.style.setProperty('--accent', th.color);
}

function toast(msg, cls) {
  const t = el(`<div class="toast ${cls || ''}">${msg}</div>`);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 30);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2600);
}

function confetti() {
  for (let i = 0; i < 24; i++) {
    const c = el(`<div class="confetti" style="left:${Math.random() * 100}vw;background:hsl(${Math.random() * 360},90%,60%);animation-delay:${Math.random() * 0.6}s"></div>`);
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2600);
  }
}

function modal(html, onMount) {
  const m = el(`<div class="modal-bg"><div class="modal">${html}</div></div>`);
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.body.appendChild(m);
  if (onMount) onMount(m);
  return m;
}

// ---------- Render principal ----------
function render() {
  applyTheme();
  renderHeader();
  const v = $('#view');
  v.innerHTML = '';
  if (parentMode) { v.appendChild(renderParent()); }
  else {
    switch (currentTab) {
      case 'home': v.appendChild(renderHome()); break;
      case 'tasks': v.appendChild(renderTasks()); break;
      case 'quiz': v.appendChild(renderQuiz()); break;
      case 'read': v.appendChild(renderReading()); break;
      case 'heart': v.appendChild(renderEI()); break;
    }
  }
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === currentTab && !parentMode));
  $('#nav').style.display = parentMode ? 'none' : 'flex';
}

function renderHeader() {
  const day = dayIndex(todayStr());
  const len = cycleLen();
  let dayLabel;
  if (day < 1) dayLabel = '🚀 Começa amanhã!';
  else if (day > len) dayLabel = '🏁 Ciclo encerrado!';
  else dayLabel = `Dia ${day} de ${len}`;
  $('#header').innerHTML = `
    <div class="hdr-left">
      <span class="hdr-avatar">${S.avatar}</span>
      <div>
        <div class="hdr-name">Luiz Miguel</div>
        <div class="hdr-day">${dayLabel}</div>
      </div>
    </div>
    <div class="hdr-right">
      <div class="hdr-stats">
        <span class="stat">💰 ${money(balance())}</span>
        <span class="stat">💎 ${S.gems}</span>
        <span class="stat">🔥 ${streak()}</span>
      </div>
      <button class="lock-btn" id="lockBtn">${parentMode ? '↩️' : '🔒'}</button>
    </div>`;
  $('#lockBtn').onclick = () => { if (parentMode) { parentMode = false; render(); } else askPin(); };
}

// ---------- TELA: Início ----------
function renderHome() {
  const d = todayStr();
  const day = dayIndex(d);
  const len = cycleLen();
  const rec = dayRec(d);
  const wrap = el('<div class="screen"></div>');

  if (day < 1) {
    wrap.appendChild(el(`<div class="card big-card center">
      <div class="big-emoji">🚀</div>
      <h2>Prepare-se, Luiz!</h2>
      <p>Sua jornada de <b>${len} dias</b> começa <b>amanhã (${fmtBR(S.cycle.start)})</b>!</p>
      <p>Complete tarefas, ganhe dinheiro 💰, gemas 💎 e desbloqueie o <b>baú do prêmio final</b> 🎁</p>
      <p class="muted">Pagamento da mesada: ${fmtBRFull(S.cycle.payday)}</p>
    </div>`));
    wrap.appendChild(factCard(1));
    return wrap;
  }

  // Check-in
  if (day >= 1 && day <= len) {
    if (!rec.checkin) {
      const c = el(`<div class="card checkin-card">
        <h3>👋 Bom dia, Luiz!</h3>
        <p>Faça seu check-in para começar o dia e proteger sua sequência 🔥</p>
        <button class="btn btn-big" id="checkinBtn">✅ Fazer check-in do dia</button>
      </div>`);
      c.querySelector('#checkinBtn').onclick = () => {
        rec.checkin = true; addGems(2); save(); confetti();
        toast('Check-in feito! +2 💎', 'ok'); render();
      };
      wrap.appendChild(c);
    } else {
      wrap.appendChild(el(`<div class="card slim ok-strip">✅ Check-in de hoje feito! +2 💎</div>`));
    }
  }

  // Lembretes
  const rem = reminders();
  if (rem.length) {
    const c = el(`<div class="card"><h3>🔔 Lembretes</h3><div id="remList"></div></div>`);
    rem.forEach(r => c.querySelector('#remList').appendChild(el(`<div class="reminder">${r}</div>`)));
    wrap.appendChild(c);
  }

  // Progresso do baú
  const doneDays = countFullDays();
  const pct = Math.min(100, Math.round(doneDays / len * 100));
  const chest = el(`<div class="card">
    <h3>🎁 Baú do Grande Prêmio</h3>
    <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
    <p class="muted">${doneDays} de ${len} dias completos (check-in + quiz + coração)</p>
    ${day > len ? `<button class="btn btn-big" id="chestBtn">🔓 Abrir o baú!</button>` : `<p class="muted">O baú abre no fim dos ${len} dias... continue firme! 💪</p>`}
  </div>`);
  const cb = chest.querySelector('#chestBtn');
  if (cb) cb.onclick = () => { confetti(); modal(`<div class="center"><div class="big-emoji">🎁</div><h2>Parabéns, Luiz!</h2><p>Você completou ${doneDays} dias!</p><p><b>${S.settings.prizeText}</b></p><p>Peça para o papai ou a mamãe revelar seu prêmio! 🎉</p><button class="btn" onclick="this.closest('.modal-bg').remove()">Fechar</button></div>`); };
  wrap.appendChild(chest);

  // Minutos de videogame
  wrap.appendChild(el(`<div class="card slim">🎮 Banco de videogame: <b>${S.reading.gameMinutes} min</b> para jogar no fim de semana</div>`));

  // Avatares / skins
  wrap.appendChild(renderSkins());

  // Curiosidade do dia
  wrap.appendChild(factCard(day));
  return wrap;
}

function countFullDays() {
  let n = 0, d = S.cycle.start;
  const stop = todayStr() < S.cycle.end ? todayStr() : S.cycle.end;
  while (d <= stop) { if (fullDay(d)) n++; d = addDays(d, 1); }
  return n;
}

function reminders() {
  const d = todayStr();
  if (!inCycle(d)) return [];
  const rec = dayRec(d);
  const out = [];
  DAILY_TASKS.forEach(t => { if (!rec.tasks[t.id]) out.push(`${t.icon} Luiz, você já cuidou disto hoje: <b>${t.name.toLowerCase()}</b>?`); });
  if (!rec.quiz || !rec.quiz.done) out.push(`🧠 O quiz de gramática de hoje te espera — 5 perguntas e ${money(S.settings.quizReward)} se acertar todas!`);
  if (!rec.ei) out.push(`💛 A pergunta do coração de hoje ainda não foi respondida!`);
  const wd = strToDate(d).getDay();
  WEEKLY_TASKS.forEach(t => {
    if (t.due === wd) {
      const key = `${t.id}@${d}`;
      if (!S.weekly[key]) out.push(`${t.icon} Hoje é ${t.dueLabel}! Dia de: <b>${t.name.toLowerCase()}</b> (vale ${money(taskValue(t))})`);
    }
  });
  return out.slice(0, 4);
}

function factCard(day) {
  const f = FACTS[(Math.max(1, day) - 1) % FACTS.length];
  return el(`<div class="card fact-card"><h3>💡 Curiosidade do dia</h3><p>${f}</p></div>`);
}

function renderSkins() {
  const c = el(`<div class="card"><h3>🎭 Seus avatares</h3><div class="skin-row" id="skins"></div>
    <h3 style="margin-top:12px">🎨 Temas</h3><div class="skin-row" id="themes"></div></div>`);
  const sk = c.querySelector('#skins');
  AVATARS.forEach(a => {
    const unlocked = S.gemsTotal >= a.gems;
    const b = el(`<button class="skin ${unlocked ? '' : 'locked'} ${S.avatar === a.emoji ? 'sel' : ''}">
      <span class="skin-emoji">${unlocked ? a.emoji : '🔒'}</span>
      <span class="skin-name">${unlocked ? a.name : a.gems + ' 💎'}</span></button>`);
    b.onclick = () => { if (unlocked) { S.avatar = a.emoji; save(); render(); } else toast(`Junte ${a.gems} 💎 no total para desbloquear!`); };
    sk.appendChild(b);
  });
  const th = c.querySelector('#themes');
  THEMES.forEach(t => {
    const unlocked = S.gemsTotal >= t.gems;
    const b = el(`<button class="skin ${unlocked ? '' : 'locked'} ${S.theme === t.id ? 'sel' : ''}">
      <span class="skin-emoji" style="color:${t.color}">${unlocked ? '⬤' : '🔒'}</span>
      <span class="skin-name">${unlocked ? t.name : t.gems + ' 💎'}</span></button>`);
    b.onclick = () => { if (unlocked) { S.theme = t.id; save(); render(); } else toast(`Junte ${t.gems} 💎 no total para desbloquear!`); };
    th.appendChild(b);
  });
  return c;
}

// ---------- TELA: Tarefas ----------
function renderTasks() {
  const d = todayStr();
  const wrap = el('<div class="screen"></div>');
  if (!inCycle(d)) { wrap.appendChild(el(`<div class="card center"><p>As tarefas ficam disponíveis durante o ciclo (${fmtBR(S.cycle.start)} a ${fmtBR(S.cycle.end)}) 😉</p></div>`)); return wrap; }
  const rec = dayRec(d);

  const daily = el(`<div class="card"><h3>📅 Tarefas de hoje</h3><div id="dl"></div></div>`);
  DAILY_TASKS.forEach(t => {
    const st = rec.tasks[t.id];
    const row = el(`<div class="task ${st ? 'done-' + st : ''}">
      <span class="task-icon">${t.icon}</span>
      <div class="task-info"><div class="task-name">${t.name}</div>
      <div class="task-val">+ ${money(taskValue(t))} • ${statusLabel(st)}</div></div>
      ${!st ? '<button class="btn btn-sm">Feito! ✅</button>' : ''}
    </div>`);
    const btn = row.querySelector('button');
    if (btn) btn.onclick = () => { rec.tasks[t.id] = 'pending'; save(); toast('Enviado para o papai/mamãe aprovar! 👍'); render(); };
    daily.querySelector('#dl').appendChild(row);
  });
  wrap.appendChild(daily);

  const weekly = el(`<div class="card"><h3>🗓️ Tarefas da semana</h3><div id="wl"></div></div>`);
  WEEKLY_TASKS.forEach(t => {
    const due = nextDue(t.id, t.due);
    const key = due ? `${t.id}@${due}` : null;
    const st = key ? S.weekly[key] : null;
    const row = el(`<div class="task ${st ? 'done-' + st : ''}">
      <span class="task-icon">${t.icon}</span>
      <div class="task-info"><div class="task-name">${t.name}</div>
      <div class="task-val">+ ${money(taskValue(t))} • até ${t.dueLabel}${due ? ' (' + fmtBR(due) + ')' : ''} • ${statusLabel(st)}</div></div>
      ${!st && due ? '<button class="btn btn-sm">Feito! ✅</button>' : ''}
    </div>`);
    const btn = row.querySelector('button');
    if (btn) btn.onclick = () => { S.weekly[key] = 'pending'; save(); toast('Enviado para aprovação! 👍'); render(); };
    weekly.querySelector('#wl').appendChild(row);
  });
  wrap.appendChild(weekly);

  wrap.appendChild(el(`<div class="card slim muted">💡 Quando você marca "Feito!", o papai ou a mamãe confere e aprova. Aí o valor entra no seu saldo! Tarefa não feita no dia desconta o mesmo valor.</div>`));

  // Extrato simplificado
  const hist = el(`<div class="card"><h3>🧾 Últimas movimentações</h3><div id="hl"></div></div>`);
  const list = S.entries.slice(-8).reverse();
  if (!list.length) hist.querySelector('#hl').appendChild(el('<p class="muted">Nada por aqui ainda. Bora começar! 💪</p>'));
  list.forEach(e => hist.querySelector('#hl').appendChild(el(
    `<div class="hist-row"><span>${fmtBR(e.date)} — ${e.desc}</span><b class="${e.amount >= 0 ? 'pos' : 'neg'}">${e.amount >= 0 ? '+' : ''}${money(Math.abs(e.amount)).replace('R$ ', 'R$ ')}</b></div>`)));
  wrap.appendChild(hist);
  return wrap;
}

function statusLabel(st) {
  return { pending: '⏳ aguardando aprovação', approved: '✅ aprovada!', rejected: '❌ não aprovada', rejected_debited: '❌ não aprovada', missed: '❌ não feita' }[st] || '👉 toque em Feito! quando terminar';
}

// ---------- TELA: Quiz ----------
let quizSession = null; // {qs, i, correct}

function renderQuiz() {
  const d = todayStr();
  const wrap = el('<div class="screen"></div>');
  if (!inCycle(d)) { wrap.appendChild(el(`<div class="card center"><p>O quiz abre junto com o ciclo, em ${fmtBR(S.cycle.start)}! 🧠</p></div>`)); return wrap; }
  const rec = dayRec(d);

  if (rec.quiz && rec.quiz.done && !quizSession) {
    wrap.appendChild(el(`<div class="card center big-card">
      <div class="big-emoji">${rec.quiz.correct === 5 ? '🏆' : '🧠'}</div>
      <h2>Quiz de hoje concluído!</h2>
      <p>Você acertou <b>${rec.quiz.correct} de 5</b>.</p>
      ${rec.quiz.correct === 5 ? `<p>PERFEITO! ${money(S.settings.quizReward)} entraram no seu saldo! 💰</p>` : '<p>As que você errou vão voltar nos próximos dias até você dominar! 💪</p>'}
      <p class="muted">Volte amanhã para mais 5 perguntas!</p></div>`));
    wrap.appendChild(quizProgressCard());
    return wrap;
  }

  if (!quizSession) {
    const c = el(`<div class="card center big-card">
      <div class="big-emoji">🧠</div>
      <h2>Quiz de Gramática</h2>
      <p>5 perguntas por dia, estilo Duolingo!</p>
      <p>💎 1 gema por acerto • <b>5/5 = ${money(S.settings.quizReward)} + 5 💎 bônus</b></p>
      <p class="muted">Se errar, a pergunta volta outro dia até você aprender de vez 😉</p>
      <button class="btn btn-big" id="startQuiz">🚀 Começar!</button></div>`);
    c.querySelector('#startQuiz').onclick = () => { quizSession = { qs: pickQuizQuestions(), i: 0, correct: 0 }; render(); };
    wrap.appendChild(c);
    wrap.appendChild(quizProgressCard());
    return wrap;
  }

  const { qs, i } = quizSession;
  const q = qs[i];
  const c = el(`<div class="card">
    <div class="quiz-top"><span>Pergunta ${i + 1} de ${qs.length}</span><span class="chip">${q.cat}</span></div>
    <div class="bar"><div class="bar-fill" style="width:${(i) / qs.length * 100}%"></div></div>
    <h3 class="quiz-q">${q.q}</h3>
    <div id="opts"></div>
    <div id="fb"></div></div>`);
  const optsEl = c.querySelector('#opts');
  const order = q.opts.map((_, idx) => idx); shuffle(order);
  order.forEach(idx => {
    const b = el(`<button class="btn opt-btn">${q.opts[idx]}</button>`);
    b.onclick = () => answerQuiz(c, q, idx, b);
    optsEl.appendChild(b);
  });
  wrap.appendChild(c);
  return wrap;
}

function answerQuiz(card, q, idx, btn) {
  card.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
  const st = gStat(q.id); st.seen++;
  const right = idx === q.ans;
  if (right) {
    st.streak++;
    st.learned = st.wrong === 0 || st.streak >= 2; // nunca errou, ou acertou 2x seguidas após errar

    quizSession.correct++;
    addGems(1);
    btn.classList.add('right');
    card.querySelector('#fb').innerHTML = `<div class="fb ok">✅ Acertou! +1 💎<br><small>${q.exp}</small></div>`;
  } else {
    st.streak = 0; st.wrong++; st.learned = false;
    btn.classList.add('wrong');
    card.querySelectorAll('.opt-btn').forEach((b, k) => { if (b.textContent === q.opts[q.ans]) b.classList.add('right'); });
    card.querySelector('#fb').innerHTML = `<div class="fb bad">❌ Quase! A resposta certa é: <b>${q.opts[q.ans]}</b><br><small>${q.exp}</small><br><small>Essa pergunta vai voltar outro dia pra você dominar! 💪</small></div>`;
  }
  save();
  const next = el(`<button class="btn btn-big" style="margin-top:10px">${quizSession.i + 1 < quizSession.qs.length ? 'Próxima ➡️' : 'Ver resultado 🏁'}</button>`);
  card.querySelector('#fb').appendChild(next);
  next.onclick = () => {
    quizSession.i++;
    if (quizSession.i >= quizSession.qs.length) finishQuiz();
    else render();
  };
}

function finishQuiz() {
  const rec = dayRec(todayStr());
  const correct = quizSession.correct;
  rec.quiz = { done: true, correct };
  if (correct === 5) { addEntry(`🏆 Quiz perfeito (5/5) — ${fmtBR(todayStr())}`, S.settings.quizReward, 'quiz'); addGems(5); confetti(); }
  quizSession = null;
  save(); render();
  toast(correct === 5 ? `PERFEITO! +${money(S.settings.quizReward)} e +5 💎!` : `Você acertou ${correct}/5! 💎`, 'ok');
}

function quizProgressCard() {
  const cats = {};
  GRAMMAR_BANK.forEach(q => {
    if (!cats[q.cat]) cats[q.cat] = { total: 0, learned: 0, reinforce: 0 };
    cats[q.cat].total++;
    const s = S.grammar[q.id];
    if (s && s.learned) cats[q.cat].learned++;
    else if (s && s.wrong > 0) cats[q.cat].reinforce++;
  });
  const c = el(`<div class="card"><h3>📊 Seu progresso</h3><div id="cp"></div></div>`);
  Object.entries(cats).forEach(([cat, v]) => {
    const pct = Math.round(v.learned / v.total * 100);
    c.querySelector('#cp').appendChild(el(`<div class="cat-row">
      <div class="cat-name">${cat} ${v.reinforce ? '🔁' : ''}</div>
      <div class="bar sm"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="cat-pct">${v.learned}/${v.total}</span></div>`));
  });
  c.appendChild(el('<p class="muted" style="padding:0 4px">🔁 = tem perguntas em reforço (vão voltar até você dominar)</p>'));
  return c;
}

// ---------- TELA: Leitura ----------
let readTimer = null; // {startMs, secs, interval}

function renderReading() {
  const wrap = el('<div class="screen"></div>');
  const d = todayStr();

  wrap.appendChild(el(`<div class="card slim">🎮 Banco de videogame: <b>${S.reading.gameMinutes} min</b> acumulados</div>`));

  if (!inCycle(d)) { wrap.appendChild(el(`<div class="card center"><p>A leitura conta a partir de ${fmtBR(S.cycle.start)}! 📚</p></div>`)); return wrap; }

  if (readTimer) {
    const c = el(`<div class="card center big-card">
      <div class="big-emoji">📖</div>
      <h2 id="clock">00:00</h2>
      <p>Leitura em andamento... concentre-se na história! 🤫</p>
      <button class="btn btn-big" id="stopRead">✋ Terminei de ler</button></div>`);
    wrap.appendChild(c);
    const update = () => {
      const secs = Math.floor((Date.now() - readTimer.startMs) / 1000);
      const m = String(Math.floor(secs / 60)).padStart(2, '0'), s = String(secs % 60).padStart(2, '0');
      const clock = document.getElementById('clock');
      if (clock) clock.textContent = `${m}:${s}`;
    };
    clearInterval(readTimer.interval);
    readTimer.interval = setInterval(update, 1000); update();
    c.querySelector('#stopRead').onclick = () => {
      const mins = Math.floor((Date.now() - readTimer.startMs) / 60000);
      clearInterval(readTimer.interval);
      openSummaryModal(mins);
    };
    return wrap;
  }

  const c = el(`<div class="card center big-card">
    <div class="big-emoji">📚</div>
    <h2>Missão Leitura</h2>
    <p>Leia <b>1 capítulo ou 30 minutos</b> e escreva um resumo.</p>
    <p>🎮 Cada leitura aprovada = <b>+30 min de videogame</b> (acumula pro fim de semana!)</p>
    <p>📕 Livro inteiro no mês = <b>+${money(S.settings.bookReward)}</b> na mesada!</p>
    <button class="btn btn-big" id="startRead">▶️ Começar a ler agora</button></div>`);
  c.querySelector('#startRead').onclick = () => { readTimer = { startMs: Date.now() }; render(); };
  wrap.appendChild(c);

  const sess = el(`<div class="card"><h3>📖 Suas leituras</h3><div id="sl"></div></div>`);
  const list = S.reading.sessions.slice(-6).reverse();
  if (!list.length) sess.querySelector('#sl').appendChild(el('<p class="muted">Nenhuma leitura ainda. Que tal começar hoje? 🚀</p>'));
  list.forEach(s => sess.querySelector('#sl').appendChild(el(`<div class="hist-row"><span>${fmtBR(s.date)} — ${s.minutes} min</span><span>${s.status === 'approved' ? '✅ +30 min 🎮' : s.status === 'pending' ? '⏳ aguardando' : '❌'}</span></div>`)));
  wrap.appendChild(sess);
  wrap.appendChild(el(`<div class="card slim muted">📚 Livros completos este mês: <b>${S.reading.booksDone}</b>. Terminou um livro? Avise o papai ou a mamãe para registrar!</div>`));
  return wrap;
}

function openSummaryModal(mins) {
  const enough = mins >= 30;
  modal(`
    <h3>📖 Você leu ${mins} minuto${mins === 1 ? '' : 's'}!</h3>
    ${enough ? '<p>Agora escreva um resumo do que leu (o que aconteceu na história?):</p><textarea id="sumTxt" rows="5" placeholder="Escreva aqui seu resumo com suas palavras..."></textarea><button class="btn btn-big" id="sendSum">📨 Enviar para aprovação</button>'
      : `<p>Para valer os 30 min de videogame, a leitura precisa ter pelo menos <b>30 minutos</b>. Continue lendo mais um pouco! 💪</p><button class="btn" id="keepRead">📖 Voltar a ler</button><button class="btn btn-ghost" id="cancelRead">Deixar pra depois</button>`}
  `, m => {
    const send = m.querySelector('#sendSum');
    if (send) send.onclick = () => {
      const txt = m.querySelector('#sumTxt').value.trim();
      if (txt.length < 80) { toast('Capricha mais no resumo! Escreva pelo menos umas 3 linhas 😉'); return; }
      S.reading.sessions.push({ id: Date.now(), date: todayStr(), minutes: mins, summary: txt, status: 'pending' });
      readTimer = null; save(); m.remove(); confetti();
      toast('Resumo enviado! Aguardando aprovação 👍', 'ok'); render();
    };
    const keep = m.querySelector('#keepRead');
    if (keep) keep.onclick = () => { m.remove(); render(); };
    const cancel = m.querySelector('#cancelRead');
    if (cancel) cancel.onclick = () => { readTimer = null; m.remove(); render(); };
  });
}

// ---------- TELA: Coração (IE) ----------
function renderEI() {
  const d = todayStr();
  const wrap = el('<div class="screen"></div>');
  if (!inCycle(d)) { wrap.appendChild(el(`<div class="card center"><p>As perguntas do coração começam em ${fmtBR(S.cycle.start)}! 💛</p></div>`)); return wrap; }
  const rec = dayRec(d);
  const day = dayIndex(d);

  if (rec.ei) {
    wrap.appendChild(el(`<div class="card center big-card"><div class="big-emoji">💛</div>
      <h2>Pergunta de hoje respondida!</h2><p>Volte amanhã para uma nova situação.</p></div>`));
  } else {
    const q = eiToday();
    const c = el(`<div class="card">
      <div class="chip">${q.ctx}</div>
      <h3 class="quiz-q">${q.sit}</h3>
      <p class="muted">O que você faria?</p>
      <div id="eiOpts"></div><div id="eiFb"></div></div>`);
    const order = q.opts.map((_, i) => i); shuffle(order);
    order.forEach(i => {
      const o = q.opts[i];
      const b = el(`<button class="btn opt-btn ei-opt">${o.t}</button>`);
      b.onclick = () => {
        c.querySelectorAll('.opt-btn').forEach(x => x.disabled = true);
        b.classList.add(o.q === 2 ? 'right' : o.q === 1 ? 'mid' : 'wrong');
        rec.ei = { qid: q.id, opt: i, quality: o.q };
        S.eiAnswers.push({ date: d, qid: q.id, opt: i, quality: o.q, tags: q.tags });
        addGems(3); save();
        const fb = c.querySelector('#eiFb');
        if (o.q === 2) fb.innerHTML = `<div class="fb ok">🌟 Escolha incrível! Isso mostra ${q.tags.map(t => EI_LABELS[t].toLowerCase()).join(' e ')} de verdade. +3 💎</div>`;
        else fb.innerHTML = `<div class="fb ${o.q === 1 ? 'mid' : 'bad'}">${o.q === 1 ? '🤔 Boa tentativa!' : '💭 Vamos pensar juntos...'}<br><small>${o.tip}</small><br>+3 💎 por refletir!</div>`;
        fb.appendChild(el('<button class="btn" style="margin-top:8px" onclick="render()">Continuar</button>'));
        renderHeader();
      };
      c.querySelector('#eiOpts').appendChild(b);
    });
    wrap.appendChild(c);
  }

  // Mapa do coração (versão amigável)
  const agg = eiMap();
  const answered = S.eiAnswers.length;
  if (answered) {
    const c = el(`<div class="card"><h3>🗺️ Mapa do seu coração</h3><div id="map"></div></div>`);
    Object.entries(agg).forEach(([k, v]) => {
      if (!v.n) return;
      const pct = Math.round(v.sum / (v.n * 2) * 100);
      c.querySelector('#map').appendChild(el(`<div class="cat-row">
        <div class="cat-name">${eiIcon(k)} ${EI_LABELS[k]}</div>
        <div class="bar sm"><div class="bar-fill" style="width:${pct}%"></div></div>
        <span class="cat-pct">${pct}%</span></div>`));
    });
    wrap.appendChild(c);
  }

  // Balanço do mês (fim do ciclo)
  if (day >= cycleLen() && answered >= 5) wrap.appendChild(eiMonthlyCard(false));
  return wrap;
}

function eiIcon(k) {
  return { autocontrole: '🧘', empatia: '💗', comunicacao: '🗣️', resiliencia: '🌱', responsabilidade: '🎯', autoconfianca: '⭐' }[k];
}

function eiMonthlyCard(parentView) {
  const agg = eiMap();
  const rows = Object.entries(agg).filter(([, v]) => v.n > 0).map(([k, v]) => ({ k, pct: Math.round(v.sum / (v.n * 2) * 100), n: v.n }));
  rows.sort((a, b) => b.pct - a.pct);
  const best = rows.slice(0, 2), worst = rows.slice(-2).filter(r => r.pct < 75);
  const tips = {
    autocontrole: 'Treinar a pausa: respirar fundo 3 vezes antes de reagir quando algo irritar.',
    empatia: 'Exercício do espelho: antes de agir, perguntar "como EU me sentiria no lugar dele?".',
    comunicacao: 'Usar frases que começam com "eu me sinto..." em vez de acusar ou ficar em silêncio.',
    resiliencia: 'Quando algo der errado, listar 1 coisa aprendida com o erro antes de desanimar.',
    responsabilidade: 'Assumir primeiro, explicar depois: contar a verdade logo, mesmo com medo da bronca.',
    autoconfianca: 'Trocar "eu sou ruim nisso" por "eu ainda estou aprendendo isso".',
  };
  const c = el(`<div class="card"><h3>${parentView ? '💛 Balanço emocional do mês' : '🏅 Seu balanço do mês'}</h3><div id="bal"></div></div>`);
  const bal = c.querySelector('#bal');
  if (best.length) bal.appendChild(el(`<p>🌟 <b>Pontos fortes:</b> ${best.map(r => EI_LABELS[r.k] + ` (${r.pct}%)`).join(', ')}. ${parentView ? 'Vale elogiar isso nele!' : 'Você mandou muito bem nisso, continue assim!'}</p>`));
  worst.forEach(r => bal.appendChild(el(`<p>🌱 <b>Para crescer — ${EI_LABELS[r.k]} (${r.pct}%):</b> ${tips[r.k]}</p>`)));
  if (!worst.length) bal.appendChild(el('<p>💪 Nenhum ponto fraco forte este mês — resultado excelente!</p>'));
  return c;
}

// ---------- MODO PAIS ----------
function askPin() {
  modal(`<h3>🔒 Área dos pais</h3><p class="muted">Digite o PIN:</p>
    <input type="password" inputmode="numeric" id="pinInput" maxlength="8" autocomplete="off">
    <button class="btn btn-big" id="pinOk">Entrar</button>`, m => {
    const inp = m.querySelector('#pinInput'); inp.focus();
    const go = () => {
      if (inp.value === S.pin) { parentMode = true; m.remove(); render(); }
      else { toast('PIN incorreto!', 'bad'); inp.value = ''; }
    };
    m.querySelector('#pinOk').onclick = go;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}

function renderParent() {
  const wrap = el('<div class="screen"></div>');
  const bal = balance();
  const payout = Math.max(0, Math.min(S.settings.limit, bal));

  wrap.appendChild(el(`<div class="card"><h3>👨‍👩‍👦 Painel dos pais</h3>
    <div class="pstat-row">
      <div class="pstat"><div class="pstat-v">${money(bal)}</div><div class="pstat-l">Saldo atual</div></div>
      <div class="pstat"><div class="pstat-v">${money(payout)}</div><div class="pstat-l">Pagamento em ${fmtBR(S.cycle.payday)} (teto ${money(S.settings.limit)})</div></div>
      <div class="pstat"><div class="pstat-v">${S.reading.gameMinutes} min</div><div class="pstat-l">Videogame acumulado</div></div>
    </div></div>`));

  // Pendências
  const pend = el(`<div class="card"><h3>⏳ Aguardando aprovação</h3><div id="pl"></div></div>`);
  const pl = pend.querySelector('#pl');
  let hasPend = false;
  // diárias
  Object.entries(S.days).forEach(([dstr, rec]) => {
    DAILY_TASKS.forEach(t => {
      if (rec.tasks[t.id] === 'pending') {
        hasPend = true;
        const row = el(`<div class="task"><span class="task-icon">${t.icon}</span>
          <div class="task-info"><div class="task-name">${t.name}</div><div class="task-val">${fmtBR(dstr)} • ${money(taskValue(t))}</div></div>
          <button class="btn btn-sm ok-btn">✅</button><button class="btn btn-sm no-btn">❌</button></div>`);
        row.querySelector('.ok-btn').onclick = () => { rec.tasks[t.id] = 'approved'; addEntry(`✅ ${t.name} (${fmtBR(dstr)})`, taskValue(t), 'tarefa'); addGems(2); render(); };
        row.querySelector('.no-btn').onclick = () => {
          if (S.processed.includes(dstr) || dstr < todayStr()) { rec.tasks[t.id] = 'rejected_debited'; addEntry(`❌ ${t.name} (não aprovada ${fmtBR(dstr)})`, -taskValue(t), 'tarefa'); }
          else rec.tasks[t.id] = 'rejected';
          save(); render();
        };
        pl.appendChild(row);
      }
    });
  });
  // semanais
  Object.entries(S.weekly).forEach(([key, st]) => {
    if (st !== 'pending') return;
    hasPend = true;
    const [tid, due] = key.split('@');
    const t = WEEKLY_TASKS.find(x => x.id === tid);
    const row = el(`<div class="task"><span class="task-icon">${t.icon}</span>
      <div class="task-info"><div class="task-name">${t.name}</div><div class="task-val">semana até ${fmtBR(due)} • ${money(taskValue(t))}</div></div>
      <button class="btn btn-sm ok-btn">✅</button><button class="btn btn-sm no-btn">❌</button></div>`);
    row.querySelector('.ok-btn').onclick = () => { S.weekly[key] = 'approved'; if (!S.weeklyProcessed.includes(key)) S.weeklyProcessed.push(key); addEntry(`✅ ${t.name} (semana até ${fmtBR(due)})`, taskValue(t), 'tarefa'); addGems(2); render(); };
    row.querySelector('.no-btn').onclick = () => {
      S.weekly[key] = 'missed'; if (!S.weeklyProcessed.includes(key)) S.weeklyProcessed.push(key);
      addEntry(`❌ ${t.name} (não aprovada, semana até ${fmtBR(due)})`, -taskValue(t), 'tarefa'); render();
    };
    pl.appendChild(row);
  });
  // leituras
  S.reading.sessions.forEach(s => {
    if (s.status !== 'pending') return;
    hasPend = true;
    const row = el(`<div class="task"><span class="task-icon">📖</span>
      <div class="task-info"><div class="task-name">Leitura de ${s.minutes} min (${fmtBR(s.date)})</div>
      <div class="task-val summary-txt">"${s.summary}"</div></div>
      <button class="btn btn-sm ok-btn">✅</button><button class="btn btn-sm no-btn">❌</button></div>`);
    row.querySelector('.ok-btn').onclick = () => { s.status = 'approved'; S.reading.gameMinutes += 30; addGems(5); save(); render(); toast('+30 min de videogame para o Luiz! 🎮'); };
    row.querySelector('.no-btn').onclick = () => { s.status = 'rejected'; save(); render(); };
    pl.appendChild(row);
  });
  if (!hasPend) pl.appendChild(el('<p class="muted">Nenhuma pendência no momento 🎉</p>'));
  wrap.appendChild(pend);

  // Descontos rápidos
  const deb = el(`<div class="card"><h3>➖ Descontos rápidos</h3><div id="qd"></div></div>`);
  QUICK_DEBITS.forEach(t => {
    const row = el(`<div class="task"><span class="task-icon">${t.icon}</span>
      <div class="task-info"><div class="task-name">${t.name}</div><div class="task-val">- ${money(debitValue(t))}</div></div>
      <button class="btn btn-sm no-btn">Descontar</button></div>`);
    row.querySelector('.no-btn').onclick = () => { addEntry(`${t.icon} ${t.name}`, -debitValue(t), 'desconto'); render(); toast('Desconto aplicado.'); };
    deb.querySelector('#qd').appendChild(row);
  });
  wrap.appendChild(deb);

  // Ajuste manual + videogame + livro
  const man = el(`<div class="card"><h3>✏️ Ajustes manuais</h3>
    <div class="man-row"><input type="text" id="manDesc" placeholder="Descrição (ex: ajudou na louça)">
    <input type="number" id="manVal" step="0.5" placeholder="Valor"></div>
    <div class="man-btns"><button class="btn btn-sm ok-btn" id="manAdd">+ Creditar</button>
    <button class="btn btn-sm no-btn" id="manSub">− Debitar</button></div>
    <hr>
    <div class="man-btns">
      <button class="btn btn-sm" id="bookDone">📕 Livro completo (+${money(S.settings.bookReward)})</button>
      <button class="btn btn-sm" id="useGame">🎮 Usar minutos de jogo</button>
    </div></div>`);
  const manApply = sign => {
    const desc = man.querySelector('#manDesc').value.trim() || 'Ajuste manual';
    const val = parseFloat(man.querySelector('#manVal').value);
    if (!val || val <= 0) { toast('Digite um valor válido.'); return; }
    addEntry(`${sign > 0 ? '➕' : '➖'} ${desc}`, sign * val, 'manual'); render();
  };
  man.querySelector('#manAdd').onclick = () => manApply(1);
  man.querySelector('#manSub').onclick = () => manApply(-1);
  man.querySelector('#bookDone').onclick = () => { S.reading.booksDone++; addEntry(`📕 Livro completo lido no mês!`, S.settings.bookReward, 'leitura'); addGems(10); render(); toast('Parabéns ao Luiz! 🎉'); };
  man.querySelector('#useGame').onclick = () => {
    modal(`<h3>🎮 Usar minutos</h3><p class="muted">Saldo: ${S.reading.gameMinutes} min</p>
      <input type="number" id="gmMin" placeholder="Minutos jogados"><button class="btn btn-big" id="gmOk">Descontar</button>`, m => {
      m.querySelector('#gmOk').onclick = () => {
        const v = parseInt(m.querySelector('#gmMin').value);
        if (!v || v <= 0) return;
        S.reading.gameMinutes = Math.max(0, S.reading.gameMinutes - v); save(); m.remove(); render();
      };
    });
  };
  wrap.appendChild(man);

  // Relatórios
  wrap.appendChild(eiMonthlyCard(true));
  wrap.appendChild(quizProgressCard());

  // Histórico completo com reversão
  const hist = el(`<div class="card"><h3>🧾 Histórico completo</h3><div id="fh"></div></div>`);
  const fh = hist.querySelector('#fh');
  if (!S.entries.length) fh.appendChild(el('<p class="muted">Sem movimentações ainda.</p>'));
  S.entries.slice().reverse().slice(0, 40).forEach(e => {
    const row = el(`<div class="hist-row"><span>${fmtBR(e.date)} — ${e.desc}${e.auto ? ' <small>(auto)</small>' : ''}</span>
      <span><b class="${e.amount >= 0 ? 'pos' : 'neg'}">${e.amount >= 0 ? '+' : '−'}${money(Math.abs(e.amount))}</b>
      <button class="undo-btn" title="Estornar">↩️</button></span></div>`);
    row.querySelector('.undo-btn').onclick = () => {
      if (confirm(`Estornar "${e.desc}" (${money(Math.abs(e.amount))})?`)) { addEntry(`↩️ Estorno: ${e.desc}`, -e.amount, 'estorno'); render(); }
    };
    fh.appendChild(row);
  });
  wrap.appendChild(hist);

  // Configurações
  const cfg = el(`<div class="card"><h3>⚙️ Configurações</h3>
    <label>Teto da mesada (só os pais veem): <input type="number" id="cfgLimit" value="${S.settings.limit}"></label>
    <label>Recompensa quiz perfeito 5/5 (R$): <input type="number" step="0.5" id="cfgQuiz" value="${S.settings.quizReward}"></label>
    <label>Desconto quiz não feito (R$): <input type="number" step="0.5" id="cfgQuizMiss" value="${S.settings.quizMissDebit}"></label>
    <label>Desconto check-in não feito (R$): <input type="number" step="0.5" id="cfgCheckMiss" value="${S.settings.checkinMissDebit}"></label>
    <label>Prêmio por livro completo (R$): <input type="number" step="0.5" id="cfgBook" value="${S.settings.bookReward}"></label>
    <label>Texto do prêmio final: <input type="text" id="cfgPrize" value="${S.settings.prizeText.replace(/"/g, '&quot;')}"></label>
    <label>Novo PIN: <input type="text" id="cfgPin" placeholder="deixe vazio p/ manter"></label>
    <button class="btn btn-big" id="cfgSave">💾 Salvar configurações</button>
    <hr>
    <div class="man-btns">
      <button class="btn btn-sm" id="expBtn">⬇️ Exportar backup</button>
      <button class="btn btn-sm" id="impBtn">⬆️ Importar backup</button>
    </div>
    <p class="muted">⚠️ Os dados ficam salvos neste celular/navegador. Exporte um backup de vez em quando!</p></div>`);
  cfg.querySelector('#cfgSave').onclick = () => {
    S.settings.limit = parseFloat(cfg.querySelector('#cfgLimit').value) || 100;
    S.settings.quizReward = parseFloat(cfg.querySelector('#cfgQuiz').value) || 0;
    S.settings.quizMissDebit = parseFloat(cfg.querySelector('#cfgQuizMiss').value) || 0;
    S.settings.checkinMissDebit = parseFloat(cfg.querySelector('#cfgCheckMiss').value) || 0;
    S.settings.bookReward = parseFloat(cfg.querySelector('#cfgBook').value) || 10;
    S.settings.prizeText = cfg.querySelector('#cfgPrize').value || S.settings.prizeText;
    const np = cfg.querySelector('#cfgPin').value.trim();
    if (np) S.pin = np;
    save(); toast('Configurações salvas!', 'ok'); render();
  };
  cfg.querySelector('#expBtn').onclick = () => {
    const data = JSON.stringify(S);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `applm-backup-${todayStr()}.json`;
    a.click();
  };
  cfg.querySelector('#impBtn').onclick = () => {
    modal(`<h3>⬆️ Importar backup</h3><textarea id="impTxt" rows="5" placeholder="Cole aqui o conteúdo do arquivo de backup"></textarea>
      <button class="btn btn-big" id="impOk">Importar</button>`, m => {
      m.querySelector('#impOk').onclick = () => {
        try { S = Object.assign(defaultState(), JSON.parse(m.querySelector('#impTxt').value)); save(); m.remove(); render(); toast('Backup importado!', 'ok'); }
        catch (e) { toast('Arquivo inválido.', 'bad'); }
      };
    });
  };
  wrap.appendChild(cfg);
  return wrap;
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  processPastDays();
  document.querySelectorAll('.nav-btn').forEach(b => b.onclick = () => { currentTab = b.dataset.tab; parentMode = false; render(); });
  render();
});
