// ============================================================
// AppLM — Mesada do Luiz Miguel
// Lógica principal (vanilla JS + localStorage)
// ============================================================

const STORE_KEY = 'applm_state_v1';
// Banco de dados gratuito (Firebase) para sincronizar entre os celulares da família.
// O caminho extra depois da URL funciona como um "segredo" — quem não souber o
// endereço completo não acha o banco de dados.
const DEFAULT_SYNC_URL = 'https://missao-luiz-default-rtdb.firebaseio.com/familia-luizmiguel-2026';

// ---------- Estado ----------
function defaultState() {
  return {
    v: 2,
    pin: '201214',
    cycle: { start: todayStr(), end: addDays(todayStr(), 30), payday: addDays(todayStr(), 31) },
    settings: {
      limit: 100,
      quizReward: 0.5,        // recompensa por quiz perfeito (5/5) — mês perfeito fecha em R$ 96 (teto 100)
      quizMissDebit: 0.5,
      checkinMissDebit: 0.5,
      bookReward: 10.0,
      gemsBonusMax: 4.0,      // bônus máximo em R$ que as gemas do mês podem valer
      challengeValue: 1.0,    // valor do desafio surpresa da semana
      syncUrl: DEFAULT_SYNC_URL, // URL do Firebase Realtime Database (sincronização entre celulares)
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
    reading: { sessions: [], gameMinutes: 0, booksDone: 0, book: { title: '', page: 0 }, history: [] },
    gems: 0, gemsTotal: 0,    // gems = do mês (viram bônus); gemsTotal = de sempre (desbloqueia skins)
    avatar: 'lion', theme: 'azul',
    eiAnswers: [],            // {date, qid, opt, quality, tags}
    eiFocus: [],              // competências a reforçar no mês (definidas no fechamento)
    months: [],               // meses pagos (arquivo)
    challenges: {},           // desafios surpresa por semana: c@N → pending/approved
    contracts: {},            // contrato do mês aceito, por data de início do ciclo
    streakBonusDays: [],      // dias em que o bônus de sequência já foi pago
    entrySeq: 1,
    updatedAt: 0,
  };
}

// Preenche recursivamente qualquer campo ausente com o valor padrão correspondente.
// Necessário porque o Firebase apaga silenciosamente objetos/listas vazios ({} ou [])
// ao salvar — sem isso, um campo como settings.taskValues ou reading.sessions pode
// "sumir" depois de passar pela nuvem e quebrar a tela na próxima leitura.
function deepDefaults(obj, def) {
  if (Array.isArray(def)) return Array.isArray(obj) ? obj : def;
  if (def !== null && typeof def === 'object') {
    const out = (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) ? { ...obj } : {};
    for (const k of Object.keys(def)) out[k] = deepDefaults(obj ? obj[k] : undefined, def[k]);
    return out;
  }
  return obj === undefined ? def : obj;
}

function normalizeState(st) {
  st = deepDefaults(st, defaultState());
  // migração: avatares antigos salvos como emoji → ids de ícone
  const emap = { '🦁': 'lion', '🐺': 'wolf', '🦅': 'eagle', '🐯': 'tiger', '🐉': 'dragon', '👑': 'crown' };
  if (emap[st.avatar]) st.avatar = emap[st.avatar];
  // migração: ciclo salvo com ano errado (2025) → ciclo correto de 2026
  if (st.cycle && st.cycle.start === '2025-09-08') {
    st.cycle = { start: '2026-09-08', end: '2026-10-08', payday: '2026-10-09' };
  }
  // migração: ciclo ainda não começou e nada foi feito → adianta para começar hoje
  // (ignora registros de dia vazios, criados só por ter aberto o app antes do ciclo começar)
  const noRealActivity = st.entries.length === 0 && Object.values(st.days).every(
    r => !r.checkin && Object.keys(r.tasks || {}).length === 0 && !r.quiz && !r.ei
  );
  if (st.cycle && noRealActivity && todayStr() < st.cycle.start) {
    const lenDays = Math.round((strToDate(st.cycle.end) - strToDate(st.cycle.start)) / 86400000);
    const t = todayStr();
    st.cycle = { start: t, end: addDays(t, lenDays), payday: addDays(t, lenDays + 1) };
    st.days = {};
  }
  // migração única (v2): ativa a sincronização em nuvem e reinicia o ciclo a partir de
  // hoje — corrige os primeiros dias perdidos pelo bug de armazenamento no celular
  if (!st.v || st.v < 2) {
    if (!st.settings.syncUrl) st.settings.syncUrl = DEFAULT_SYNC_URL;
    const t = todayStr();
    st.cycle = { start: t, end: addDays(t, 30), payday: addDays(t, 31) };
    st.days = {};
    st.v = 2;
  }
  if (!st.settings.syncUrl) st.settings.syncUrl = DEFAULT_SYNC_URL;
  return st;
}

// ---------- Diagnóstico de gravação (visível na tela, para investigar problemas de salvamento) ----------
const diag = { storageOk: null, storageError: null, loadOk: null, loadError: null, loadedUpdatedAt: 0, lastSaveOk: null, lastSaveAt: null, saveError: null };
function storageProbe() {
  try {
    const k = '__applm_probe__';
    localStorage.setItem(k, '1');
    const ok = localStorage.getItem(k) === '1';
    localStorage.removeItem(k);
    return ok;
  } catch (e) { diag.storageError = (e && e.message) || String(e); return false; }
}

let S = load();
function load() {
  diag.storageOk = storageProbe();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = normalizeState(JSON.parse(raw));
      diag.loadOk = true;
      diag.loadedUpdatedAt = parsed.updatedAt || 0;
      return parsed;
    }
    diag.loadOk = true; // sem dado salvo ainda (primeira vez neste celular)
  } catch (e) {
    diag.loadOk = false;
    diag.loadError = (e && e.message) || String(e);
  }
  return defaultState();
}
function save() {
  S.updatedAt = Date.now();
  try {
    const json = JSON.stringify(S);
    localStorage.setItem(STORE_KEY, json);
    if (localStorage.getItem(STORE_KEY) !== json) throw new Error('Leitura após gravação não confere — o navegador pode estar bloqueando ou limitando o armazenamento.');
    diag.lastSaveOk = true; diag.lastSaveAt = Date.now(); diag.saveError = null;
  } catch (e) {
    diag.lastSaveOk = false;
    diag.saveError = (e && e.message) || String(e);
  }
  scheduleCloudPush();
}

// ---------- Sincronização opcional entre celulares (Firebase Realtime DB) ----------
// Os pais criam um projeto gratuito no Firebase, ativam o Realtime Database e
// colam a URL nas configurações. Todos os celulares com a mesma URL compartilham
// os dados (última gravação vence).
let cloudPushTimer = null;
let cloudStatus = ''; // '', 'ok', 'err'
function cloudUrl() {
  const u = (S.settings.syncUrl || '').trim().replace(/\/+$/, '');
  return u.startsWith('http') ? u + '/applm.json' : null;
}
function scheduleCloudPush() {
  if (!cloudUrl()) return;
  clearTimeout(cloudPushTimer);
  cloudPushTimer = setTimeout(cloudPush, 1500);
}
async function cloudPush() {
  const u = cloudUrl();
  if (!u) return;
  try {
    const r = await fetch(u, { method: 'PUT', body: JSON.stringify(S) });
    cloudStatus = r.ok ? 'ok' : 'err';
  } catch (e) { cloudStatus = 'err'; }
}
async function cloudPull() {
  const u = cloudUrl();
  if (!u) return;
  try {
    const r = await fetch(u);
    if (!r.ok) { cloudStatus = 'err'; return; }
    const remote = await r.json();
    cloudStatus = 'ok';
    if (remote && remote.updatedAt && remote.updatedAt > (S.updatedAt || 0)) {
      const keepUrl = S.settings.syncUrl;
      S = normalizeState(remote);
      S.settings.syncUrl = keepUrl;
      try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {}
      processPastDays();
      render();
    }
  } catch (e) { cloudStatus = 'err'; }
}

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
function addEntry(desc, amount, cat, auto, dateStr) {
  S.entries.push({ id: S.entrySeq++, date: dateStr || todayStr(), desc, amount: Math.round(amount * 100) / 100, cat, auto: !!auto });
  save();
}
function addGems(n) { S.gems += n; S.gemsTotal += n; save(); }

function taskValue(t) { return S.settings.taskValues[t.id] ?? t.value; }
function debitValue(t) { return S.settings.debitValues[t.id] ?? t.value; }

// ---------- Gemas que viram dinheiro ----------
// O bônus máximo (padrão R$ 4) é dividido pelo total de gemas possíveis no mês:
// cada gema ganha vale uma fração, paga no fechamento junto com a mesada.
function weeklyOccurrences() {
  let n = 0;
  WEEKLY_TASKS.forEach(t => {
    let d = S.cycle.start;
    while (d <= S.cycle.end) { if (strToDate(d).getDay() === t.due) n++; d = addDays(d, 1); }
  });
  return n;
}
function maxGemsEstimate() {
  const len = cycleLen();
  // check-in(2) + tarefas aprovadas(2) + quiz(5 acertos + 5 bônus) + emocional(3) + leitura diária(5) + livro(10)
  return len * 2 + (3 * len + weeklyOccurrences()) * 2 + len * 10 + len * 3 + len * 5 + 10;
}
function gemsBonus() {
  const max = maxGemsEstimate();
  if (!max) return 0;
  return Math.min(S.settings.gemsBonusMax, Math.round(S.settings.gemsBonusMax * S.gems / max * 100) / 100);
}
function monthName(dstr) {
  return ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][strToDate(dstr).getMonth()];
}

function dayRec(dstr) {
  if (!S.days[dstr]) S.days[dstr] = { checkin: false, tasks: {}, quiz: null, ei: null };
  // autocura: a sincronização em nuvem pode remover campos vazios (objetos {} somem),
  // então garante que a forma do registro sempre existe antes de qualquer leitura
  const r = S.days[dstr];
  if (!r.tasks) r.tasks = {};
  if (r.checkin === undefined) r.checkin = false;
  return r;
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
        if (st === 'rejected') { rec.tasks[t.id] = 'rejected_debited'; addEntry(`❌ ${t.name} (não feita ${fmtBR(d)})`, -taskValue(t), 'tarefa', true, d); return; }
        if (!st) { rec.tasks[t.id] = 'missed'; addEntry(`❌ ${t.name} (não feita ${fmtBR(d)})`, -taskValue(t), 'tarefa', true, d); }
      });
      if (!rec.checkin) addEntry(`❌ Check-in não feito (${fmtBR(d)})`, -S.settings.checkinMissDebit, 'checkin', true, d);
      if (!rec.quiz || !rec.quiz.done) addEntry(`❌ Quiz de gramática não feito (${fmtBR(d)})`, -S.settings.quizMissDebit, 'quiz', true, d);
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
            addEntry(`❌ ${t.name} (semana de ${fmtBR(dd)})`, -taskValue(t), 'tarefa', true, dd);
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

// Bônus de sequência: a cada 7 dias completos seguidos, +10 gemas
function maybeStreakBonus() {
  const d = todayStr();
  if (!inCycle(d) || !fullDay(d) || S.streakBonusDays.includes(d)) return;
  const s = streak();
  if (s > 0 && s % 7 === 0) {
    S.streakBonusDays.push(d);
    addGems(10);
    save(); confetti();
    toast(`🔥 ${s} dias seguidos! Bônus de sequência: +10 💎`, 'ok');
  }
}

// ---------- Desafio surpresa da semana ----------
// Uma tarefa bônus por semana do ciclo, escolhida de forma "aleatória mas fixa"
// (mesma semana = mesmo desafio em qualquer celular). Só soma, nunca desconta.
function challengeOfWeek(wk) {
  const seed = Math.abs((strToDate(S.cycle.start).getTime() / 86400000 | 0) + wk * 7919);
  return {
    key: 'c@' + wk,
    text: CHALLENGES[(seed * 31 + 17) % CHALLENGES.length],
    appearDay: wk * 7 + 1 + ((seed * 13 + 5) % 7), // dia do ciclo em que aparece
    weekEnd: wk * 7 + 7,
  };
}
function activeChallenge() {
  const day = dayIndex(todayStr());
  if (day < 1 || day > cycleLen()) return null;
  const wk = Math.floor((day - 1) / 7);
  const ch = challengeOfWeek(wk);
  if (day < ch.appearDay || day > ch.weekEnd) return null;
  if (S.challenges[ch.key] === 'approved') return null;
  return ch;
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
  // se o mês anterior apontou competências fracas, as situações delas vêm primeiro
  if (S.eiFocus && S.eiFocus.length) {
    const focus = EI_BANK.filter(q => q.tags.some(t => S.eiFocus.includes(t)));
    const rest = EI_BANK.filter(q => !q.tags.some(t => S.eiFocus.includes(t)));
    const ordered = [...focus, ...rest];
    return ordered[S.eiAnswers.length % ordered.length];
  }
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
      <span class="hdr-avatar">${icon(S.avatar)}</span>
      <div>
        <div class="hdr-name">Luiz Miguel</div>
        <div class="hdr-day">${dayLabel}</div>
      </div>
    </div>
    <div class="hdr-right">
      <div class="hdr-stats">
        <span class="stat">${icon('coin', 'ico-xs')} ${money(balance())}</span>
        <span class="stat">${icon('gem', 'ico-xs')} ${S.gems}</span>
        <span class="stat">${icon('flame', 'ico-xs')} ${streak()}</span>
      </div>
      <button class="lock-btn" id="lockBtn">${parentMode ? icon('back') : icon('lock')}</button>
    </div>`;
  $('#lockBtn').onclick = () => { if (parentMode) { parentMode = false; render(); } else askPin(); };
}

// ---------- TELA: Início ----------
function renderHome() {
  const d = todayStr();
  const day = dayIndex(d);
  const len = cycleLen();
  const wrap = el('<div class="screen"></div>');

  if (day < 1) {
    wrap.appendChild(el(`<div class="card big-card center">
      <div class="big-ico">${icon('rocket', 'ico-xl')}</div>
      <h2>Prepare-se, Luiz!</h2>
      <p>Sua jornada de <b>${len} dias</b> começa <b>amanhã (${fmtBR(S.cycle.start)})</b>!</p>
      <p>Complete tarefas, ganhe dinheiro 💰, gemas 💎 e desbloqueie o <b>baú do prêmio final</b> 🎁</p>
      <p class="muted">Pagamento da mesada: ${fmtBRFull(S.cycle.payday)}</p>
    </div>`));
    wrap.appendChild(factCard(1));
    return wrap;
  }

  const rec = dayRec(d);

  // Contrato do mês
  if (day >= 1 && day <= len && !S.contracts[S.cycle.start]) {
    const ct = el(`<div class="card contract-card">
      <h3>🤝 Contrato do mês de ${monthName(S.cycle.start)}</h3>
      <p>Eu, <b>Luiz Miguel</b>, aceito o desafio dos ${len} dias:</p>
      <ul class="contract-list">
        <li>✅ Fazer minhas tarefas diárias e semanais</li>
        <li>🧠 Responder o quiz de gramática todo dia</li>
        <li>💛 Fazer a missão emocional todo dia</li>
        <li>📖 Ler 30 minutos e escrever o resumo</li>
        <li>🙏 Respeitar e obedecer meus pais</li>
      </ul>
      <p class="muted">Cumprindo tudo, ganho minha mesada, gemas, tempo de videogame e o baú do grande prêmio!</p>
      <button class="btn btn-big" id="acceptContract">🤝 Eu aceito o desafio!</button></div>`);
    ct.querySelector('#acceptContract').onclick = () => {
      S.contracts[S.cycle.start] = true; addGems(2); save(); confetti();
      toast('Contrato assinado! +2 💎 Boa sorte, campeão! 🚀', 'ok'); render();
    };
    wrap.appendChild(ct);
  }

  // Check-in
  if (day >= 1 && day <= len) {
    if (!rec.checkin) {
      const c = el(`<div class="card checkin-card">
        <h3>👋 Bom dia, Luiz!</h3>
        <p>Faça seu check-in para começar o dia e proteger sua sequência ${icon('flame', 'ico-xs')}</p>
        <button class="btn btn-big" id="checkinBtn">${icon('check', 'ico-xs')} Fazer check-in do dia</button>
      </div>`);
      c.querySelector('#checkinBtn').onclick = () => {
        rec.checkin = true; addGems(2); save(); confetti();
        toast('Check-in feito! +2 💎', 'ok'); maybeStreakBonus(); render();
      };
      wrap.appendChild(c);
    } else {
      wrap.appendChild(el(`<div class="card slim ok-strip">${icon('check', 'ico-xs')} Check-in de hoje feito! +2 ${icon('gem', 'ico-xs')}</div>`));
    }
  }

  // Desafio surpresa da semana
  const ch = activeChallenge();
  if (ch) {
    const st = S.challenges[ch.key];
    const cc = el(`<div class="card challenge-card">
      <h3>🎲 Desafio surpresa!</h3>
      <p><b>${ch.text}</b></p>
      <p class="muted">Vale <b>+${money(S.settings.challengeValue)}</b> e +3 💎 — só até domingo desta semana. Bônus: se não fizer, não desconta nada!</p>
      ${st === 'pending' ? '<p><b>⏳ Aguardando aprovação dos pais...</b></p>' : '<button class="btn btn-big" id="chBtn">💪 Missão cumprida!</button>'}</div>`);
    const cb2 = cc.querySelector('#chBtn');
    if (cb2) cb2.onclick = () => { S.challenges[ch.key] = 'pending'; save(); toast('Enviado para aprovação! 👍'); render(); };
    wrap.appendChild(cc);
  }

  // Sequência e bônus dos 7 dias
  if (day >= 1 && day <= len) {
    const s = streak();
    const rem7 = s % 7 === 0 && s > 0 ? 0 : 7 - (s % 7);
    wrap.appendChild(el(`<div class="card slim">${icon('flame', 'ico-sm')} Sequência: <b>${s} dia${s === 1 ? '' : 's'}</b> ${rem7 === 0 ? '— bônus dos 7 dias garantido! 🔥 +10 💎' : `— faltam <b>${rem7}</b> dia${rem7 === 1 ? '' : 's'} completos para o bônus de +10 💎`}</div>`));
  }

  // Lembretes
  const rem = reminders();
  if (rem.length) {
    const c = el(`<div class="card"><h3>${icon('bell', 'ico-sm')} Lembretes</h3><div id="remList"></div></div>`);
    rem.forEach(r => c.querySelector('#remList').appendChild(el(`<div class="reminder">${r}</div>`)));
    wrap.appendChild(c);
  }

  // Progresso do baú
  const doneDays = countFullDays();
  const pct = Math.min(100, Math.round(doneDays / len * 100));
  const chest = el(`<div class="card">
    <h3>${icon('chest', 'ico-sm')} Baú do Grande Prêmio</h3>
    <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
    <p class="muted">${doneDays} de ${len} dias completos (check-in + quiz + emocional)</p>
    ${day > len ? `<button class="btn btn-big" id="chestBtn">🔓 Abrir o baú!</button>` : `<p class="muted">O baú abre no fim dos ${len} dias... continue firme! 💪</p>`}
  </div>`);
  const cb = chest.querySelector('#chestBtn');
  if (cb) cb.onclick = () => { confetti(); modal(`<div class="center"><div class="big-ico">${icon('gift', 'ico-xl')}</div><h2>Parabéns, Luiz!</h2><p>Você completou ${doneDays} dias!</p><p><b>${S.settings.prizeText}</b></p><p>Peça para o papai ou a mamãe revelar seu prêmio! 🎉</p><button class="btn" onclick="this.closest('.modal-bg').remove()">Fechar</button></div>`); };
  wrap.appendChild(chest);

  // Minutos de videogame + gemas valendo dinheiro
  wrap.appendChild(el(`<div class="card slim">${icon('gamepad', 'ico-sm')} Banco de videogame: <b>${S.reading.gameMinutes} min</b> para jogar no fim de semana</div>`));
  if (day >= 1 && day <= len && S.gems > 0) {
    wrap.appendChild(el(`<div class="card slim">${icon('gem', 'ico-sm')} Suas <b>${S.gems} gemas</b> do mês já valem <b>+${money(gemsBonus())}</b> no dia do pagamento — quanto mais gemas, mais dinheiro!</div>`));
  }

  // Gráfico de evolução do saldo
  const chart = balanceChartCard();
  if (chart) wrap.appendChild(chart);

  // Avatares / skins
  wrap.appendChild(renderSkins());

  // Curiosidade do dia
  wrap.appendChild(factCard(day));
  return wrap;
}

// ---------- Gráfico: evolução do saldo dia a dia ----------
function balanceSeries() {
  const perDay = {};
  S.entries.forEach(e => { perDay[e.date] = (perDay[e.date] || 0) + e.amount; });
  const pts = [];
  let acc = 0, d = S.cycle.start;
  const stop = todayStr() < S.cycle.end ? todayStr() : S.cycle.end;
  while (d <= stop) {
    acc += perDay[d] || 0;
    pts.push({ d, v: Math.round(acc * 100) / 100 });
    d = addDays(d, 1);
  }
  return pts;
}

function balanceChartCard() {
  const pts = balanceSeries();
  if (pts.length < 2) return null;
  const W = 320, H = 120, PL = 8, PR = 40, PT = 12, PB = 20;
  const vals = pts.map(p => p.v);
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  if (hi === lo) hi = lo + 1;
  const x = i => PL + i * (W - PL - PR) / (pts.length - 1);
  const y = v => PT + (hi - v) * (H - PT - PB) / (hi - lo);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
  const area = `${line}L${x(pts.length - 1).toFixed(1)},${y(Math.max(lo, 0)).toFixed(1)}L${x(0).toFixed(1)},${y(Math.max(lo, 0)).toFixed(1)}Z`;
  const last = pts[pts.length - 1];
  const zeroY = y(0);
  const c = el(`<div class="card"><h3>📈 Sua evolução</h3>
    <svg viewBox="0 0 ${W} ${H}" class="evo-chart" role="img" aria-label="Evolução do saldo no mês">
      <line x1="${PL}" y1="${zeroY.toFixed(1)}" x2="${W - PR}" y2="${zeroY.toFixed(1)}" stroke="#cbd5e1" stroke-width="1"/>
      <path d="${area}" fill="var(--accent)" opacity="0.12"/>
      <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${x(pts.length - 1).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="4" fill="var(--accent)" stroke="#fff" stroke-width="2"/>
      <text x="${(x(pts.length - 1) + 6).toFixed(1)}" y="${(y(last.v) + 4).toFixed(1)}" font-size="10" font-weight="800" fill="#334155">${money(last.v)}</text>
      <text x="${PL}" y="${H - 6}" font-size="9" fill="#64748b">${fmtBR(pts[0].d)}</text>
      <text x="${(W - PR).toFixed(1)}" y="${H - 6}" font-size="9" fill="#64748b" text-anchor="end">${fmtBR(last.d)}</text>
    </svg>
    <p class="muted evo-caption" id="evoCap">Toque no gráfico para ver cada dia • hoje: ${money(last.v)}</p></div>`);
  const svg = c.querySelector('svg');
  const cap = c.querySelector('#evoCap');
  const showAt = clientX => {
    const rect = svg.getBoundingClientRect();
    const relX = (clientX - rect.left) / rect.width * W;
    let idx = Math.round((relX - PL) / ((W - PL - PR) / (pts.length - 1)));
    idx = Math.max(0, Math.min(pts.length - 1, idx));
    cap.innerHTML = `📅 ${fmtBR(pts[idx].d)} — saldo: <b>${money(pts[idx].v)}</b>`;
  };
  svg.addEventListener('pointerdown', e => showAt(e.clientX));
  svg.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') showAt(e.clientX); });
  return c;
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
  DAILY_TASKS.forEach(t => { if (!rec.tasks[t.id]) out.push(`${icon(t.icon, 'ico-xs')} Luiz, você já cuidou disto hoje: <b>${t.name.toLowerCase()}</b>?`); });
  if (!rec.quiz || !rec.quiz.done) out.push(`${icon('brain', 'ico-xs')} O quiz de gramática de hoje te espera — 5 perguntas e ${money(S.settings.quizReward)} se acertar todas!`);
  if (!rec.ei) out.push(`${icon('heart', 'ico-xs')} Sua missão emocional de hoje ainda não foi feita!`);
  const wd = strToDate(d).getDay();
  WEEKLY_TASKS.forEach(t => {
    if (t.due === wd) {
      const key = `${t.id}@${d}`;
      if (!S.weekly[key]) out.push(`${icon(t.icon, 'ico-xs')} Hoje é ${t.dueLabel}! Dia de: <b>${t.name.toLowerCase()}</b> (vale ${money(taskValue(t))})`);
    }
  });
  return out.slice(0, 4);
}

function factCard(day) {
  const f = FACTS[(Math.max(1, day) - 1) % FACTS.length];
  return el(`<div class="card fact-card"><h3>${icon('bulb', 'ico-sm')} Curiosidade do dia</h3><p>${f}</p></div>`);
}

function renderSkins() {
  const c = el(`<div class="card"><h3>${icon('star', 'ico-sm')} Seus avatares</h3><div class="skin-row" id="skins"></div>
    <h3 style="margin-top:12px">🎨 Temas</h3><div class="skin-row" id="themes"></div></div>`);
  const sk = c.querySelector('#skins');
  AVATARS.forEach(a => {
    const unlocked = S.gemsTotal >= a.gems;
    const b = el(`<button class="skin ${unlocked ? '' : 'locked'} ${S.avatar === a.id ? 'sel' : ''}">
      <span class="skin-ico">${unlocked ? icon(a.id, 'ico-lg') : icon('lock', 'ico-lg')}</span>
      <span class="skin-name">${unlocked ? a.name : a.gems + ' 💎'}</span></button>`);
    b.onclick = () => { if (unlocked) { S.avatar = a.id; save(); render(); } else toast(`Junte ${a.gems} 💎 no total para desbloquear!`); };
    sk.appendChild(b);
  });
  const th = c.querySelector('#themes');
  THEMES.forEach(t => {
    const unlocked = S.gemsTotal >= t.gems;
    const b = el(`<button class="skin ${unlocked ? '' : 'locked'} ${S.theme === t.id ? 'sel' : ''}">
      <span class="skin-ico">${unlocked ? `<span class="theme-dot" style="background:${t.color}"></span>` : icon('lock', 'ico-lg')}</span>
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

  const daily = el(`<div class="card"><h3>${icon('calendar', 'ico-sm')} Tarefas de hoje</h3><div id="dl"></div></div>`);
  DAILY_TASKS.forEach(t => {
    const st = rec.tasks[t.id];
    const row = el(`<div class="task ${st ? 'done-' + st : ''}">
      <span class="task-icon">${icon(t.icon, 'ico-lg')}</span>
      <div class="task-info"><div class="task-name">${t.name}</div>
      <div class="task-val">+ ${money(taskValue(t))} • ${statusLabel(st)}</div></div>
      ${!st ? '<button class="btn btn-sm">Feito! ✅</button>' : ''}
    </div>`);
    const btn = row.querySelector('button');
    if (btn) btn.onclick = () => { rec.tasks[t.id] = 'pending'; save(); toast('Enviado para o papai/mamãe aprovar! 👍'); render(); };
    daily.querySelector('#dl').appendChild(row);
  });
  wrap.appendChild(daily);

  const weekly = el(`<div class="card"><h3>${icon('calendar', 'ico-sm')} Tarefas da semana</h3><div id="wl"></div></div>`);
  WEEKLY_TASKS.forEach(t => {
    const due = nextDue(t.id, t.due);
    const key = due ? `${t.id}@${due}` : null;
    const st = key ? S.weekly[key] : null;
    const row = el(`<div class="task ${st ? 'done-' + st : ''}">
      <span class="task-icon">${icon(t.icon, 'ico-lg')}</span>
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

  // Regras de desconto (visível para o Luiz ficar ciente)
  const deb = el(`<div class="card debit-rules"><h3>${icon('warn', 'ico-sm')} Isso também desconta da mesada</h3><div id="dr"></div></div>`);
  const dr = deb.querySelector('#dr');
  QUICK_DEBITS.forEach(t => dr.appendChild(el(`<div class="task">
    <span class="task-icon">${icon(t.icon, 'ico-lg')}</span>
    <div class="task-info"><div class="task-name">${t.name}</div><div class="task-val neg-val">− ${money(debitValue(t))}</div></div>
  </div>`)));
  dr.appendChild(el(`<div class="task">
    <span class="task-icon">${icon('bell', 'ico-lg')}</span>
    <div class="task-info"><div class="task-name">Não fazer o check-in do dia</div><div class="task-val neg-val">− ${money(S.settings.checkinMissDebit)}</div></div>
  </div>`));
  dr.appendChild(el(`<div class="task">
    <span class="task-icon">${icon('brain', 'ico-lg')}</span>
    <div class="task-info"><div class="task-name">Não fazer o quiz de gramática do dia</div><div class="task-val neg-val">− ${money(S.settings.quizMissDebit)}</div></div>
  </div>`));
  wrap.appendChild(deb);

  // Extrato simplificado
  const hist = el(`<div class="card"><h3>${icon('coin', 'ico-sm')} Últimas movimentações</h3><div id="hl"></div></div>`);
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
      <div class="big-ico">${icon(rec.quiz.correct === 5 ? 'trophy' : 'brain', 'ico-xl')}</div>
      <h2>Quiz de hoje concluído!</h2>
      <p>Você acertou <b>${rec.quiz.correct} de 5</b>.</p>
      ${rec.quiz.correct === 5 ? `<p>PERFEITO! ${money(S.settings.quizReward)} entraram no seu saldo! 💰</p>` : '<p>As que você errou vão voltar nos próximos dias até você dominar! 💪</p>'}
      <p class="muted">Volte amanhã para mais 5 perguntas!</p></div>`));
    wrap.appendChild(quizProgressCard());
    return wrap;
  }

  if (!quizSession) {
    const c = el(`<div class="card center big-card">
      <div class="big-ico">${icon('brain', 'ico-xl')}</div>
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
  save(); maybeStreakBonus(); render();
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
  const c = el(`<div class="card"><h3>${icon('map', 'ico-sm')} Seu progresso</h3><div id="cp"></div></div>`);
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

  wrap.appendChild(el(`<div class="card slim">${icon('gamepad', 'ico-sm')} Banco de videogame: <b>${S.reading.gameMinutes} min</b> acumulados</div>`));

  if (!inCycle(d)) { wrap.appendChild(el(`<div class="card center"><p>A leitura conta a partir de ${fmtBR(S.cycle.start)}! 📚</p></div>`)); return wrap; }

  if (readTimer) {
    const c = el(`<div class="card center big-card">
      <div class="big-ico">${icon('clock', 'ico-xl')}</div>
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

  // Livro do mês
  const bk = S.reading.book;
  const bkCard = el(`<div class="card"><h3>${icon('book', 'ico-sm')} Livro de ${monthName(S.cycle.start)}</h3><div id="bkBody"></div></div>`);
  const bkBody = bkCard.querySelector('#bkBody');
  if (!bk.title) {
    bkBody.appendChild(el(`<p class="muted">Qual livro você vai ler este mês?</p>`));
    const row = el(`<div class="man-row"><input type="text" id="bkTitle" placeholder="Título do livro (ex: O Pequeno Príncipe)"><button class="btn btn-sm" id="bkSave">Salvar</button></div>`);
    row.querySelector('#bkSave').onclick = () => {
      const t = row.querySelector('#bkTitle').value.trim();
      if (!t) { toast('Escreva o título do livro 😉'); return; }
      bk.title = t; save(); render(); toast('Boa leitura! 📖', 'ok');
    };
    bkBody.appendChild(row);
  } else {
    bkBody.appendChild(el(`<p>📖 <b>${bk.title}</b></p>`));
    bkBody.appendChild(el(`<p class="muted" id="bkPageLabel">🔖 Você parou na página <b>${bk.page || '—'}</b>${S.reading.booksDone > 0 ? ' • ✅ Livro concluído!' : ''}</p>`));
    const pageRow = el(`<div class="man-row"><input type="number" id="bkPageInput" min="1" placeholder="Nova página (ex: 42)"><button class="btn btn-sm" id="bkPageSave">🔖 Marcar</button></div>`);
    pageRow.querySelector('#bkPageSave').onclick = () => {
      const pg = parseInt(pageRow.querySelector('#bkPageInput').value);
      if (!pg || pg <= 0) { toast('Digite o número da página 😉'); return; }
      bk.page = pg; save(); toast('Página marcada! 🔖', 'ok'); render();
    };
    bkBody.appendChild(pageRow);
    const edit = el(`<button class="btn btn-sm btn-ghost">✏️ Trocar título</button>`);
    edit.onclick = () => { bk.title = ''; bk.page = 0; save(); render(); };
    bkBody.appendChild(edit);
  }
  wrap.appendChild(bkCard);

  const c = el(`<div class="card center big-card">
    <div class="big-ico">${icon('book', 'ico-xl')}</div>
    <h2>Missão Leitura</h2>
    <p>Leia pelo menos <b>30 minutos SEM parar</b> e escreva um resumo.</p>
    <p>🎮 Todo o tempo lido vira tempo de videogame: <b>35 min lidos = 35 min de jogo!</b></p>
    <p class="muted">⚠️ Parou antes dos 30 minutos? O tempo não conta e não acumula.</p>
    <p>📕 Livro inteiro no mês = <b>+${money(S.settings.bookReward)}</b> na mesada!</p>
    <button class="btn btn-big" id="startRead">▶️ Começar a ler agora</button></div>`);
  c.querySelector('#startRead').onclick = () => {
    if (!S.reading.book.title) { toast('Primeiro salve o título do livro do mês! 📖'); return; }
    readTimer = { startMs: Date.now() }; render();
  };
  wrap.appendChild(c);

  const sess = el(`<div class="card"><h3>${icon('clock', 'ico-sm')} Suas leituras</h3><div id="sl"></div></div>`);
  const list = S.reading.sessions.slice(-6).reverse();
  if (!list.length) sess.querySelector('#sl').appendChild(el('<p class="muted">Nenhuma leitura ainda. Que tal começar hoje? 🚀</p>'));
  list.forEach(s => sess.querySelector('#sl').appendChild(el(`<div class="hist-row"><span>${fmtBR(s.date)} — ${s.minutes} min</span><span>${s.status === 'approved' ? `✅ +${s.minutes} min 🎮` : s.status === 'pending' ? '⏳ aguardando' : '❌'}</span></div>`)));
  wrap.appendChild(sess);

  // Histórico de livros
  if (S.reading.history.length) {
    const h = el(`<div class="card"><h3>📚 Seus livros</h3><div id="bh"></div></div>`);
    S.reading.history.slice().reverse().forEach(b => h.querySelector('#bh').appendChild(el(
      `<div class="hist-row"><span>Livro de ${b.label}: <b>${b.title}</b></span><span>${b.finished ? '✅' : '📖'}</span></div>`)));
    wrap.appendChild(h);
  }
  wrap.appendChild(el(`<div class="card slim muted">📕 Terminou o livro? Avise o papai ou a mamãe para registrar e ganhar ${money(S.settings.bookReward)}!</div>`));
  return wrap;
}

function openSummaryModal(mins) {
  const enough = mins >= 30;
  modal(`
    <h3>📖 Você leu ${mins} minuto${mins === 1 ? '' : 's'}!</h3>
    ${enough ? `<p>🎉 Muito bem! <b>Agora faça seu resumo para os ${mins} minutos entrarem no seu tempo de jogo:</b></p>
      <textarea id="sumTxt" rows="5" placeholder="O que aconteceu na história? Conte com suas palavras..."></textarea>
      <label>🔖 Em que página você parou? <input type="number" id="sumPage" min="1" placeholder="ex: 42"></label>
      <button class="btn btn-big" id="sendSum">📨 Enviar para aprovação</button>`
      : `<p>⏱️ A leitura precisa ter pelo menos <b>30 minutos sem parar</b> para valer tempo de jogo. Se parar agora, esses ${mins} minuto${mins === 1 ? '' : 's'} não contam e não acumulam!</p>
      <button class="btn" id="keepRead">📖 Voltar a ler</button><button class="btn btn-ghost" id="cancelRead">Desistir (perde o tempo)</button>`}
  `, m => {
    const send = m.querySelector('#sendSum');
    if (send) send.onclick = () => {
      const txt = m.querySelector('#sumTxt').value.trim();
      if (txt.length < 80) { toast('Capricha mais no resumo! Escreva pelo menos umas 3 linhas 😉'); return; }
      const pg = parseInt(m.querySelector('#sumPage').value);
      if (pg > 0) { S.reading.book.page = pg; }
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
  if (!inCycle(d)) { wrap.appendChild(el(`<div class="card center"><p>As missões emocionais começam em ${fmtBR(S.cycle.start)}! 💛</p></div>`)); return wrap; }
  const rec = dayRec(d);
  const day = dayIndex(d);

  if (rec.ei) {
    wrap.appendChild(el(`<div class="card center big-card"><div class="big-ico">${icon('heart', 'ico-xl')}</div>
      <h2>Missão emocional de hoje concluída!</h2><p>Volte amanhã para uma nova situação.</p></div>`));
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
        const g = o.q === 2 ? 3 : o.q === 1 ? 2 : 1;
        addGems(g); save(); maybeStreakBonus();
        const fb = c.querySelector('#eiFb');
        if (o.q === 2) fb.innerHTML = `<div class="fb ok">🌟 Escolha incrível! Isso mostra ${q.tags.map(t => EI_LABELS[t].toLowerCase()).join(' e ')} de verdade. +${g} 💎</div>`;
        else fb.innerHTML = `<div class="fb ${o.q === 1 ? 'mid' : 'bad'}">${o.q === 1 ? `🤔 Boa tentativa! +${g} 💎` : `💭 Vamos pensar juntos... +${g} 💎`}<br><small>${o.tip}</small></div>`;
        fb.appendChild(el('<button class="btn" style="margin-top:8px" onclick="render()">Continuar</button>'));
        renderHeader();
      };
      c.querySelector('#eiOpts').appendChild(b);
    });
    wrap.appendChild(c);
  }

  // Mapa emocional (versão amigável)
  if (S.eiAnswers.length) wrap.appendChild(eiMapCard('Seu mapa emocional'));

  // Balanço do mês (fim do ciclo)
  if (day >= cycleLen() && S.eiAnswers.length >= 5) wrap.appendChild(eiMonthlyCard(false));
  return wrap;
}

function eiMapCard(title) {
  const agg = eiMap();
  const c = el(`<div class="card"><h3>${icon('map', 'ico-sm')} ${title}</h3><div class="mapb"></div></div>`);
  let any = false;
  Object.entries(agg).forEach(([k, v]) => {
    if (!v.n) return;
    any = true;
    const pct = Math.round(v.sum / (v.n * 2) * 100);
    c.querySelector('.mapb').appendChild(el(`<div class="cat-row">
      <div class="cat-name">${icon(eiIcon(k), 'ico-xs')} ${EI_LABELS[k]}</div>
      <div class="bar sm"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="cat-pct">${pct}%</span></div>`));
  });
  if (!any) c.querySelector('.mapb').appendChild(el('<p class="muted">Ainda sem respostas neste mês.</p>'));
  return c;
}

function eiIcon(k) {
  return { autocontrole: 'shield', empatia: 'heart', comunicacao: 'bubble', resiliencia: 'sprout', responsabilidade: 'target', autoconfianca: 'star' }[k];
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
  const c = el(`<div class="card"><h3>${parentView ? '💛 Perfil emocional do mês' : '🏅 Seu balanço do mês'}</h3><div id="bal"></div></div>`);
  const bal = c.querySelector('#bal');
  if (parentView && best.length) bal.appendChild(el(`<p><b>Perfil identificado:</b> o Luiz demonstra mais facilidade em <b>${best.map(r => EI_LABELS[r.k].toLowerCase()).join(' e ')}</b>${worst.length ? ` e precisa de apoio em <b>${worst.map(r => EI_LABELS[r.k].toLowerCase()).join(' e ')}</b>` : ''}.</p>`));
  if (best.length) bal.appendChild(el(`<p>🌟 <b>Pontos fortes:</b> ${best.map(r => EI_LABELS[r.k] + ` (${r.pct}%)`).join(', ')}. ${parentView ? 'Vale elogiar isso nele!' : 'Você mandou muito bem nisso, continue assim!'}</p>`));
  worst.forEach(r => bal.appendChild(el(`<p>🌱 <b>Para trabalhar — ${EI_LABELS[r.k]} (${r.pct}%):</b> ${tips[r.k]}</p>`)));
  if (!worst.length) bal.appendChild(el('<p>💪 Nenhum ponto fraco forte este mês — resultado excelente!</p>'));
  if (parentView) bal.appendChild(el(`<p class="muted">Ao fechar o mês (botão "Pago"), as perguntas do mês seguinte passam a priorizar automaticamente as competências mais fracas.${S.eiFocus && S.eiFocus.length ? ` Foco atual: ${S.eiFocus.map(k => EI_LABELS[k]).join(' e ')}.` : ''}</p>`));
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

function grammarFocusCard() {
  const per = {};
  GRAMMAR_BANK.forEach(q => {
    const s = S.grammar[q.id];
    if (s && s.wrong > 0) per[q.cat] = (per[q.cat] || 0) + s.wrong;
  });
  const top = Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const c = el(`<div class="card"><h3>🔁 Reforço de gramática</h3><div id="gf"></div></div>`);
  const gf = c.querySelector('#gf');
  if (!top.length) gf.appendChild(el('<p class="muted">Nenhum erro registrado ainda — quando o Luiz errar, as categorias com mais dificuldade aparecem aqui.</p>'));
  else {
    gf.appendChild(el(`<p>Onde ele mais erra: ${top.map(([cat, n]) => `<b>${cat}</b> (${n} erro${n > 1 ? 's' : ''})`).join(', ')}.</p>`));
    gf.appendChild(el('<p class="muted">O app já repete automaticamente essas questões nos próximos dias, priorizando-as até ele acertar 2 vezes seguidas. O progresso de aprendizado NÃO zera na virada do mês.</p>'));
  }
  return c;
}

// Relatório do mês (tela cheia, pronto para imprimir/guardar)
function openMonthReport(m) {
  const ov = el(`<div class="report-overlay"><div class="report-inner">
    <h1>🦁 Missão Luiz — Relatório de ${monthName(m.start)}</h1>
    <p class="muted">Período ${fmtBRFull(m.start)} a ${fmtBRFull(m.end)} • pago em ${fmtBRFull(m.paidOn)}</p>
    <div class="hist-row"><span>Saldo das tarefas</span><b>${money(m.saldo)}</b></div>
    <div class="hist-row"><span>Gemas do mês</span><b>${m.gems} 💎 (+${money(m.gemsBonus)})</b></div>
    <div class="hist-row"><span>Livros completos</span><b>${m.books}</b></div>
    <div class="hist-row"><span><b>Mesada paga</b></span><b class="pos">${money(m.payout)}</b></div>
    <h3 style="margin-top:16px">💛 Mapa emocional</h3>
    <div id="repEi"></div>
    <p class="muted" style="margin-top:16px">Guarde este relatório como registro do crescimento do Luiz! 🌱</p>
    <div class="no-print" style="display:flex;gap:8px;margin-top:16px">
      <button class="btn" id="repPrint">🖨️ Imprimir / salvar PDF</button>
      <button class="btn btn-ghost" id="repClose">Fechar</button>
    </div></div></div>`);
  const rep = ov.querySelector('#repEi');
  const entries = Object.entries(m.ei || {});
  if (!entries.length) rep.appendChild(el('<p class="muted">Sem respostas emocionais neste mês.</p>'));
  entries.forEach(([k, pct]) => rep.appendChild(el(`<div class="cat-row">
    <div class="cat-name">${icon(eiIcon(k), 'ico-xs')} ${EI_LABELS[k]}</div>
    <div class="bar sm"><div class="bar-fill" style="width:${pct}%"></div></div>
    <span class="cat-pct">${pct}%</span></div>`)));
  ov.querySelector('#repPrint').onclick = () => window.print();
  ov.querySelector('#repClose').onclick = () => ov.remove();
  document.body.appendChild(ov);
}

function openPaymentModal(payout, bal, gb) {
  modal(`<h3>💰 Fechar o mês</h3>
    <p>Confirmando, o app registra o pagamento e começa o novo ciclo <b>hoje</b>, com as datas atualizadas automaticamente.</p>
    <div class="hist-row"><span>Saldo das tarefas</span><b>${money(bal)}</b></div>
    <div class="hist-row"><span>Bônus de gemas (${S.gems} 💎)</span><b>+${money(gb)}</b></div>
    <div class="hist-row"><span><b>Pagar ao Luiz</b> (teto ${money(S.settings.limit)})</span><b class="pos">${money(payout)}</b></div>
    <p class="muted">O que zera: saldo, gemas do mês, tarefas, respostas emocionais e leituras do mês.<br>
    O que continua: minutos de videogame, avatares/temas desbloqueados e o aprendizado de gramática.</p>
    <button class="btn btn-big ok-btn" id="payOk">✅ Confirmar pagamento de ${money(payout)}</button>
    <button class="btn btn-big btn-ghost" id="payNo">Cancelar</button>`, m => {
    m.querySelector('#payNo').onclick = () => m.remove();
    m.querySelector('#payOk').onclick = () => { m.remove(); doPayment(payout); };
  });
}

function doPayment(payout) {
  // arquivo do mês
  const agg = eiMap();
  const eiSnap = {};
  Object.entries(agg).forEach(([k, v]) => { if (v.n) eiSnap[k] = Math.round(v.sum / (v.n * 2) * 100); });
  if (S.reading.book.title) {
    S.reading.history.push({ label: monthName(S.cycle.start), year: strToDate(S.cycle.start).getFullYear(), title: S.reading.book.title, finished: S.reading.booksDone > 0 });
  }
  // foco emocional do próximo mês = 2 competências mais fracas (abaixo de 75%)
  const rows = Object.entries(agg).filter(([, v]) => v.n > 0)
    .map(([k, v]) => ({ k, pct: v.sum / (v.n * 2) })).sort((a, b) => a.pct - b.pct);
  S.eiFocus = rows.filter(r => r.pct < 0.75).slice(0, 2).map(r => r.k);
  S.months.push({
    start: S.cycle.start, end: S.cycle.end, paidOn: todayStr(),
    saldo: Math.round(balance() * 100) / 100, gems: S.gems, gemsBonus: gemsBonus(),
    payout, books: S.reading.booksDone, ei: eiSnap,
  });
  // zera o mês (mantém: aprendizado de gramática, minutos de jogo, desbloqueios)
  S.entries = []; S.gems = 0; S.days = {}; S.weekly = {};
  S.processed = []; S.weeklyProcessed = [];
  S.reading.sessions = []; S.reading.booksDone = 0; S.reading.book = { title: '', page: 0 };
  S.eiAnswers = []; S.challenges = {}; S.streakBonusDays = [];
  // novo ciclo de 30 dias a partir de hoje
  const t = todayStr();
  S.cycle = { start: t, end: addDays(t, 30), payday: addDays(t, 31) };
  save();
  confetti();
  toast(`Mês fechado! Pago ${money(payout)}. Novo ciclo até ${fmtBR(S.cycle.end)} 🚀`, 'ok');
  render();
}

function fmtTime(ms) {
  if (!ms) return 'nunca';
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} de ${fmtBR(dateToStr(d))}`;
}

function diagnosticCard() {
  const problems = [];
  if (diag.storageOk === false) problems.push(`Armazenamento do celular bloqueado: "${diag.storageError || 'motivo desconhecido'}"`);
  if (diag.loadOk === false) problems.push(`Falha ao ler dados salvos: "${diag.loadError || 'motivo desconhecido'}"`);
  if (diag.lastSaveOk === false) problems.push(`Falha ao gravar: "${diag.saveError || 'motivo desconhecido'}"`);
  const cloudLine = S.settings.syncUrl
    ? (cloudStatus === 'ok' ? '☁️ Nuvem: conectado' : cloudStatus === 'err' ? '⚠️ Nuvem: erro de conexão (confira a URL ou a internet do celular)' : '☁️ Nuvem: conectando...')
    : '⚠️ Nuvem: sem sincronização configurada';
  const ok = problems.length === 0;
  const c = el(`<div class="card" style="border:2px solid ${ok ? '#86efac' : '#fca5a5'};background:${ok ? '#f0fdf4' : '#fef2f2'}">
    <h3>🔍 Diagnóstico de gravação</h3>
    <p>${ok ? '✅ Armazenamento do celular: funcionando' : '❌ ' + problems.join('<br>❌ ')}</p>
    <p>🕐 Progresso salvo carregado ao abrir: <b>${fmtTime(diag.loadedUpdatedAt)}</b></p>
    <p>💾 Último salvamento confirmado nesta sessão: <b>${fmtTime(diag.lastSaveAt)}</b></p>
    <p>${cloudLine}</p>
    <p class="muted">Se "salvo carregado ao abrir" não bater com a última vez que ele usou o app, os dados não estão sobrevivendo no celular. Tire um print desta tela.</p>
  </div>`);
  return c;
}

function renderParent() {
  const wrap = el('<div class="screen"></div>');
  wrap.appendChild(diagnosticCard());
  const bal = balance();
  const gb = gemsBonus();
  const payout = Math.max(0, Math.min(S.settings.limit, bal + gb));

  const top = el(`<div class="card"><h3>👨‍👩‍👦 Painel dos pais</h3>
    <div class="pstat-row">
      <div class="pstat"><div class="pstat-v">${money(bal)}</div><div class="pstat-l">Saldo atual</div></div>
      <div class="pstat"><div class="pstat-v">+${money(gb)}</div><div class="pstat-l">Bônus de gemas (${S.gems} 💎 no mês)</div></div>
      <div class="pstat"><div class="pstat-v">${money(payout)}</div><div class="pstat-l">Pagamento em ${fmtBR(S.cycle.payday)} (teto ${money(S.settings.limit)})</div></div>
    </div>
    <p class="muted" style="margin-top:8px">🎮 Videogame acumulado: <b>${S.reading.gameMinutes} min</b> • 📕 Livros no mês: <b>${S.reading.booksDone}</b></p>
    <button class="btn btn-big ok-btn" id="payBtn">💰 Pago! Fechar o mês e começar o próximo</button></div>`);
  top.querySelector('#payBtn').onclick = () => openPaymentModal(payout, bal, gb);
  wrap.appendChild(top);

  // Pendências
  const pend = el(`<div class="card"><h3>⏳ Aguardando aprovação</h3><div id="pl"></div></div>`);
  const pl = pend.querySelector('#pl');
  let hasPend = false;
  // diárias
  Object.entries(S.days).forEach(([dstr, rec]) => {
    if (!rec.tasks) rec.tasks = {};
    DAILY_TASKS.forEach(t => {
      if (rec.tasks[t.id] === 'pending') {
        hasPend = true;
        const row = el(`<div class="task"><span class="task-icon">${icon(t.icon, 'ico-lg')}</span>
          <div class="task-info"><div class="task-name">${t.name}</div><div class="task-val">${fmtBR(dstr)} • ${money(taskValue(t))}</div></div>
          <button class="btn btn-sm ok-btn">✅</button><button class="btn btn-sm no-btn">❌</button></div>`);
        row.querySelector('.ok-btn').onclick = () => { rec.tasks[t.id] = 'approved'; addEntry(`✅ ${t.name} (${fmtBR(dstr)})`, taskValue(t), 'tarefa', false, dstr); addGems(2); render(); };
        row.querySelector('.no-btn').onclick = () => {
          if (S.processed.includes(dstr) || dstr < todayStr()) { rec.tasks[t.id] = 'rejected_debited'; addEntry(`❌ ${t.name} (não aprovada ${fmtBR(dstr)})`, -taskValue(t), 'tarefa', false, dstr); }
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
    const row = el(`<div class="task"><span class="task-icon">${icon(t.icon, 'ico-lg')}</span>
      <div class="task-info"><div class="task-name">${t.name}</div><div class="task-val">semana até ${fmtBR(due)} • ${money(taskValue(t))}</div></div>
      <button class="btn btn-sm ok-btn">✅</button><button class="btn btn-sm no-btn">❌</button></div>`);
    row.querySelector('.ok-btn').onclick = () => { S.weekly[key] = 'approved'; if (!S.weeklyProcessed.includes(key)) S.weeklyProcessed.push(key); addEntry(`✅ ${t.name} (semana até ${fmtBR(due)})`, taskValue(t), 'tarefa', false, due); addGems(2); render(); };
    row.querySelector('.no-btn').onclick = () => {
      S.weekly[key] = 'missed'; if (!S.weeklyProcessed.includes(key)) S.weeklyProcessed.push(key);
      addEntry(`❌ ${t.name} (não aprovada, semana até ${fmtBR(due)})`, -taskValue(t), 'tarefa', false, due); render();
    };
    pl.appendChild(row);
  });
  // leituras
  S.reading.sessions.forEach(s => {
    if (s.status !== 'pending') return;
    hasPend = true;
    const row = el(`<div class="task"><span class="task-icon">${icon('book', 'ico-lg')}</span>
      <div class="task-info"><div class="task-name">Leitura de ${s.minutes} min (${fmtBR(s.date)})</div>
      <div class="task-val summary-txt">"${s.summary}"</div></div>
      <button class="btn btn-sm ok-btn">✅</button><button class="btn btn-sm no-btn">❌</button></div>`);
    row.querySelector('.ok-btn').onclick = () => { s.status = 'approved'; S.reading.gameMinutes += s.minutes; addGems(5); save(); render(); toast(`+${s.minutes} min de videogame para o Luiz! 🎮`); };
    row.querySelector('.no-btn').onclick = () => { s.status = 'rejected'; save(); render(); };
    pl.appendChild(row);
  });
  // desafios surpresa
  Object.entries(S.challenges).forEach(([key, st]) => {
    if (st !== 'pending') return;
    hasPend = true;
    const wk = parseInt(key.split('@')[1]);
    const ch = challengeOfWeek(wk);
    const row = el(`<div class="task"><span class="task-icon">🎲</span>
      <div class="task-info"><div class="task-name">Desafio surpresa: ${ch.text}</div>
      <div class="task-val">semana ${wk + 1} • +${money(S.settings.challengeValue)} e +3 💎</div></div>
      <button class="btn btn-sm ok-btn">✅</button><button class="btn btn-sm no-btn">❌</button></div>`);
    row.querySelector('.ok-btn').onclick = () => { S.challenges[key] = 'approved'; addEntry(`🎲 Desafio surpresa: ${ch.text}`, S.settings.challengeValue, 'desafio'); addGems(3); render(); };
    row.querySelector('.no-btn').onclick = () => { delete S.challenges[key]; save(); render(); };
    pl.appendChild(row);
  });
  if (!hasPend) pl.appendChild(el('<p class="muted">Nenhuma pendência no momento 🎉</p>'));
  wrap.appendChild(pend);

  // Descontos rápidos
  const deb = el(`<div class="card"><h3>➖ Descontos rápidos</h3><div id="qd"></div></div>`);
  QUICK_DEBITS.forEach(t => {
    const row = el(`<div class="task"><span class="task-icon">${icon(t.icon, 'ico-lg')}</span>
      <div class="task-info"><div class="task-name">${t.name}</div><div class="task-val">- ${money(debitValue(t))}</div></div>
      <button class="btn btn-sm no-btn">Descontar</button></div>`);
    row.querySelector('.no-btn').onclick = () => { addEntry(`➖ ${t.name}`, -debitValue(t), 'desconto'); render(); toast('Desconto aplicado.'); };
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
  wrap.appendChild(eiMapCard('Mapa emocional do Luiz'));
  wrap.appendChild(eiMonthlyCard(true));
  wrap.appendChild(grammarFocusCard());
  wrap.appendChild(quizProgressCard());

  // Meses pagos (com relatório imprimível)
  if (S.months.length) {
    const mh = el(`<div class="card"><h3>📆 Meses fechados</h3><div id="mh"></div></div>`);
    S.months.slice().reverse().forEach(m => {
      const row = el(`<div class="hist-row"><span>${monthName(m.start)} (${fmtBR(m.start)}–${fmtBR(m.end)})</span>
        <span><b class="pos">pago ${money(m.payout)}</b> <button class="btn btn-sm btn-ghost">📄 Relatório</button></span></div>`);
      row.querySelector('button').onclick = () => openMonthReport(m);
      mh.querySelector('#mh').appendChild(row);
    });
    wrap.appendChild(mh);
  }

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
    <label>Bônus máximo das gemas no mês (R$): <input type="number" step="0.5" id="cfgGems" value="${S.settings.gemsBonusMax}"></label>
    <label>Valor do desafio surpresa (R$): <input type="number" step="0.5" id="cfgChallenge" value="${S.settings.challengeValue}"></label>
    <label>Sincronização entre celulares — URL do Firebase: <input type="text" id="cfgSync" value="${(S.settings.syncUrl || '').replace(/"/g, '&quot;')}" placeholder="https://seu-projeto.firebaseio.com/familia-XYZ">
    <small class="muted">Já vem configurada de fábrica — todos os celulares com a mesma URL compartilham os dados automaticamente, mesmo que o navegador de algum deles limpe os dados sozinho. ${S.settings.syncUrl ? (cloudStatus === 'ok' ? '☁️ Conectado' : cloudStatus === 'err' ? '⚠️ Erro de conexão — confira a URL' : '☁️ Conectando...') : '⚠️ Sem sincronização configurada'}</small></label>
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
    S.settings.gemsBonusMax = parseFloat(cfg.querySelector('#cfgGems').value) || 0;
    S.settings.challengeValue = parseFloat(cfg.querySelector('#cfgChallenge').value) || 1;
    S.settings.syncUrl = cfg.querySelector('#cfgSync').value.trim();
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
  save(); // garante que qualquer migração feita ao carregar já fica gravada, mesmo sem nenhuma ação do usuário
  document.querySelectorAll('[data-icon]').forEach(s => { s.innerHTML = ICONS[s.dataset.icon] || ''; });
  document.querySelectorAll('.nav-btn').forEach(b => b.onclick = () => { currentTab = b.dataset.tab; parentMode = false; render(); });
  render();
  // sincronização em nuvem (se configurada): puxa agora e a cada 60s
  cloudPull();
  setInterval(cloudPull, 60000);
  // vira o dia sozinho: se o relógio do celular passar da meia-noite com o
  // app aberto, recalcula tarefas/streak/lembretes sem precisar recarregar
  let lastKnownDate = todayStr();
  setInterval(() => {
    const t = todayStr();
    if (t !== lastKnownDate) {
      lastKnownDate = t;
      processPastDays();
      render();
    }
  }, 60000);
});
