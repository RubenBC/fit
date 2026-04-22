// ── STATE ──
const STORE_KEY = 'rutina-sessions-v1';
let sessions = {}; // { "2026-04-23": { week, day, exercises: [bool], savedAt } }
let currentTab = 'today';
let currentWeek = 1;
let currentDay = 0;
let historyMonth = new Date();
let tempDone = [];

const DAYS_SHORT = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DOW_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

// ── STORAGE ──
function load() {
  try { sessions = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { sessions = {}; }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(sessions));
}

function dateKey(d = new Date()) {
  return d.toISOString().slice(0,10);
}

function todayKey() { return dateKey(new Date()); }

// ── INIT ──
function init() {
  load();
  // Set picker to today's session if it exists
  const tk = todayKey();
  if (sessions[tk]) {
    currentWeek = sessions[tk].week;
    currentDay  = sessions[tk].day;
    tempDone    = [...sessions[tk].exercises];
  } else {
    tempDone = [];
  }
  historyMonth = new Date();
  renderAll();
  bindNav();
}

function bindNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
      currentTab = btn.dataset.tab;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-' + currentTab).classList.add('active');
      if (currentTab === 'stats') renderStats();
      if (currentTab === 'history') renderHistory();
    };
  });
}

function renderAll() {
  renderToday();
  renderHistory();
  renderStats();
}

// ── TODAY TAB ──
function renderToday() {
  const tk = todayKey();
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' });

  document.getElementById('today-date').innerHTML =
    `Hoy · <span>${dateStr}</span>`;

  // Week picker
  const wpWrap = document.getElementById('week-picker');
  wpWrap.innerHTML = '';
  for (let w = 1; w <= 4; w++) {
    const b = document.createElement('button');
    b.className = 'pick-btn' + (w === currentWeek ? ' active' : '');
    b.textContent = `S${w}`;
    b.onclick = () => { currentWeek = w; currentDay = 0; tempDone = []; renderToday(); };
    wpWrap.appendChild(b);
  }

  // Day chips
  const week = ROUTINE[currentWeek];
  const dayWrap = document.getElementById('day-chips');
  dayWrap.innerHTML = '';
  week.dias.forEach((d, i) => {
    const isLibre = week.libres.includes(i);
    const chip = document.createElement('div');
    chip.className = 'day-chip' + (isLibre ? ' libre' : '') + (i === currentDay ? ' active' : '');
    chip.innerHTML = `${DAYS_SHORT[i]}<span class="dot"></span>`;
    chip.onclick = () => { currentDay = i; tempDone = []; renderToday(); };
    dayWrap.appendChild(chip);
  });

  // Load existing session for this week/day combo today
  const existingToday = sessions[tk];
  const matchToday = existingToday && existingToday.week === currentWeek && existingToday.day === currentDay;
  if (matchToday && tempDone.length === 0) {
    tempDone = [...existingToday.exercises];
  }

  const day = week.dias[currentDay];
  const isLibre = week.libres.includes(currentDay);
  const exs = day.ejercicios;

  // Ensure tempDone length matches
  while (tempDone.length < exs.length) tempDone.push(false);

  // Badge
  document.getElementById('day-type-badge').className =
    'day-type-badge ' + (isLibre ? 'libre' : 'trabajo');
  document.getElementById('day-type-badge').textContent =
    isLibre ? '🟢 Día libre' : '🔵 Día de trabajo';

  // Progress
  const doneCount = tempDone.filter(Boolean).length;
  const pct = exs.length ? Math.round(doneCount / exs.length * 100) : 0;
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-text').textContent = `${doneCount}/${exs.length}`;

  // Exercise list
  const list = document.getElementById('today-list');
  list.innerHTML = '';
  exs.forEach((ex, i) => {
    const isDone = tempDone[i];
    const card = document.createElement('div');
    card.className = 'ex-card' + (isDone ? ' done' : '');
    card.innerHTML = `
      <div class="ex-num">${String(i+1).padStart(2,'0')}</div>
      <div class="ex-body">
        <div class="ex-name">${ex.n}</div>
        ${ex.s ? `<div class="ex-sets">${ex.s}</div>` : ''}
      </div>
      <div class="ex-check">
        <svg class="check-svg" width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#0b0d11" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;
    card.onclick = () => {
      tempDone[i] = !tempDone[i];
      autoSave();
      renderToday();
    };
    list.appendChild(card);
  });

  // Saved badge
  const savedBadge = document.getElementById('saved-badge');
  savedBadge.className = 'saved-badge' + (matchToday ? ' visible' : '');
  if (matchToday) {
    const t = new Date(existingToday.savedAt);
    savedBadge.textContent = `✓ Guardado hoy a las ${t.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}`;
  }

  // Save button
  const saveBtn = document.getElementById('save-btn');
  saveBtn.textContent = matchToday ? 'Actualizar sesión de hoy' : 'Guardar sesión de hoy';
  saveBtn.disabled = exs.length === 0 || doneCount === 0;
}

function autoSave() {
  // Auto-save silently whenever an exercise is toggled
  const tk = todayKey();
  sessions[tk] = {
    week: currentWeek,
    day: currentDay,
    exercises: [...tempDone],
    savedAt: new Date().toISOString(),
    dayName: ROUTINE[currentWeek].dias[currentDay].nombre
  };
  save();
}

function saveSession() {
  autoSave();
  showToast('✓ Sesión guardada');
  renderToday();
  renderHistory();
  renderStats();
}

// ── HISTORY TAB ──
function renderHistory() {
  const year  = historyMonth.getFullYear();
  const month = historyMonth.getMonth();

  document.getElementById('hist-month-label').textContent =
    `${MONTHS_ES[month]} ${year}`;

  // Calendar
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  // Week starts Monday: shift Sunday to end
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1; // Mon=0

  const calGrid = document.getElementById('cal-grid');
  calGrid.innerHTML = '';
  const today = todayKey();

  // Blanks before month starts
  for (let b = 0; b < startDow; b++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell other-month';
    calGrid.appendChild(cell);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateObj = new Date(year, month, d);
    const dk = dateKey(dateObj);
    const sess = sessions[dk];
    const cell = document.createElement('div');

    let cls = 'cal-cell';
    if (dk === today) cls += ' today';

    if (sess) {
      const exs = ROUTINE[sess.week].dias[sess.day].ejercicios;
      const done = sess.exercises.filter(Boolean).length;
      const full = done === exs.length;
      cls += ' has-session ' + (full ? 'full' : 'partial');
      cell.innerHTML = `${d}<span class="session-dot"></span>`;
      cell.onclick = () => openSessionModal(dk);
    } else {
      cell.textContent = d;
    }

    cell.className = cls;
    calGrid.appendChild(cell);
  }

  // History list (most recent first)
  const histList = document.getElementById('hist-list');
  const allKeys = Object.keys(sessions).sort((a,b) => b.localeCompare(a));

  if (allKeys.length === 0) {
    histList.innerHTML = `
      <div class="empty-history">
        <div class="big">📋</div>
        <p>Aún no hay sesiones guardadas.<br>Completa tu primer entrenamiento<br>en la pestaña Hoy.</p>
      </div>`;
    return;
  }

  histList.innerHTML = '';
  allKeys.slice(0, 30).forEach(dk => {
    const sess = sessions[dk];
    const exs  = ROUTINE[sess.week].dias[sess.day].ejercicios;
    const done = sess.exercises.filter(Boolean).length;
    const pct  = exs.length ? Math.round(done / exs.length * 100) : 0;
    const isFull = done === exs.length;

    const dateObj = new Date(dk + 'T12:00:00');
    const dateStr = dateObj.toLocaleDateString('es-ES',
      { weekday:'long', day:'numeric', month:'short' });

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-item-header">
        <div class="history-date">${dateStr}</div>
        <div style="display:flex;align-items:center;gap:6px">
          <div class="history-week">${ROUTINE[sess.week].label} · ${sess.dayName || ROUTINE[sess.week].dias[sess.day].nombre}</div>
          <button class="del-btn" data-key="${dk}">✕</button>
        </div>
      </div>
      <div class="history-exercises">${done} de ${exs.length} ejercicios</div>
      <div class="history-progress">
        <div class="history-bar">
          <div class="history-bar-fill ${isFull ? 'full' : ''}" style="width:${pct}%"></div>
        </div>
        <div class="history-pct">${pct}%</div>
      </div>`;
    item.onclick = (e) => {
      if (e.target.classList.contains('del-btn')) {
        deleteSession(e.target.dataset.key);
      } else {
        openSessionModal(dk);
      }
    };
    histList.appendChild(item);
  });
}

function deleteSession(dk) {
  if (!confirm('¿Eliminar esta sesión?')) return;
  delete sessions[dk];
  save();
  renderHistory();
  renderStats();
  showToast('Sesión eliminada');
}

// ── SESSION MODAL ──
function openSessionModal(dk) {
  const sess = sessions[dk];
  if (!sess) return;
  const exs = ROUTINE[sess.week].dias[sess.day].ejercicios;
  const dateObj = new Date(dk + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('es-ES',
    { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  document.getElementById('modal-title').textContent = dateStr;
  document.getElementById('modal-sub').textContent =
    `${ROUTINE[sess.week].label} · ${sess.dayName || ROUTINE[sess.week].dias[sess.day].nombre}`;

  const ml = document.getElementById('modal-ex-list');
  ml.innerHTML = '';
  exs.forEach((ex, i) => {
    const isDone = sess.exercises[i];
    const row = document.createElement('div');
    row.className = 'modal-ex' + (isDone ? ' done-ex' : '');
    row.innerHTML = `
      <span class="modal-check">${isDone ? '✓' : '○'}</span>
      <span class="modal-ex-name">${ex.n}</span>
      ${ex.s ? `<span class="modal-ex-sets">${ex.s}</span>` : ''}`;
    ml.appendChild(row);
  });

  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ── STATS TAB ──
function renderStats() {
  const allKeys = Object.keys(sessions).sort();
  const total = allKeys.length;

  // Streak
  const streak = calcStreak();
  const maxStreak = calcMaxStreak();

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('stat-maxstreak').textContent = `Máx: ${maxStreak}`;

  // Completed (100%)
  const fullSessions = allKeys.filter(dk => {
    const sess = sessions[dk];
    const exs = ROUTINE[sess.week].dias[sess.day].ejercicios;
    return sess.exercises.filter(Boolean).length === exs.length;
  }).length;

  document.getElementById('stat-full').textContent = fullSessions;
  document.getElementById('stat-full-pct').textContent =
    total > 0 ? `${Math.round(fullSessions/total*100)}% del total` : '—';

  // Total exercises done
  let totalEx = 0;
  allKeys.forEach(dk => { totalEx += sessions[dk].exercises.filter(Boolean).length; });
  document.getElementById('stat-exercises').textContent = totalEx;

  // Weekly activity bar chart (last 8 weeks)
  renderWeeklyChart();

  // Day of week distribution
  renderDowChart();

  // Top exercises
  renderTopExercises();
}

function calcStreak() {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (sessions[dateKey(d)]) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function calcMaxStreak() {
  const allKeys = Object.keys(sessions).sort();
  if (!allKeys.length) return 0;
  let max = 1, curr = 1;
  for (let i = 1; i < allKeys.length; i++) {
    const prev = new Date(allKeys[i-1] + 'T12:00:00');
    const curr2 = new Date(allKeys[i] + 'T12:00:00');
    const diff = (curr2 - prev) / 86400000;
    if (diff === 1) { curr++; max = Math.max(max, curr); }
    else curr = 1;
  }
  return max;
}

function renderWeeklyChart() {
  const chart = document.getElementById('weekly-chart');
  chart.innerHTML = '';
  const today = new Date();

  const weeks = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 - w * 7);
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      if (sessions[dateKey(day)]) count++;
    }
    const label = w === 0 ? 'hoy' : `-${w}s`;
    weeks.push({ count, label });
  }

  const maxCount = Math.max(...weeks.map(w => w.count), 1);
  weeks.forEach(w => {
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.innerHTML = `
      <div class="bar-track">
        <div class="bar-fill" style="height:${w.count / maxCount * 100}%"></div>
      </div>
      <div class="bar-label">${w.label}</div>`;
    chart.appendChild(col);
  });
}

function renderDowChart() {
  const chart = document.getElementById('dow-chart');
  chart.innerHTML = '';
  const counts = [0,0,0,0,0,0,0]; // Mon–Sun
  Object.keys(sessions).forEach(dk => {
    const d = new Date(dk + 'T12:00:00');
    let dow = d.getDay(); // 0=Sun
    dow = dow === 0 ? 6 : dow - 1; // Mon=0
    counts[dow]++;
  });
  const labels = ['L','M','X','J','V','S','D'];
  const maxC = Math.max(...counts, 1);
  counts.forEach((c, i) => {
    const col = document.createElement('div');
    col.className = 'dow-col';
    col.innerHTML = `
      <div class="dow-track">
        <div class="dow-fill" style="height:${c/maxC*100}%"></div>
      </div>
      <div class="dow-label">${labels[i]}</div>`;
    chart.appendChild(col);
  });
}

function renderTopExercises() {
  const counts = {};
  Object.values(sessions).forEach(sess => {
    const exs = ROUTINE[sess.week].dias[sess.day].ejercicios;
    sess.exercises.forEach((done, i) => {
      if (done && exs[i]) {
        counts[exs[i].n] = (counts[exs[i].n] || 0) + 1;
      }
    });
  });

  const top = Object.entries(counts)
    .sort((a,b) => b[1]-a[1])
    .slice(0,6);

  const maxC = top.length ? top[0][1] : 1;
  const wrap = document.getElementById('top-exercises');
  wrap.innerHTML = '';

  if (!top.length) {
    wrap.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:10px 0">Sin datos aún</div>';
    return;
  }

  top.forEach(([name, count]) => {
    const row = document.createElement('div');
    row.className = 'top-ex-row';
    row.innerHTML = `
      <div class="top-ex-name">${name}</div>
      <div class="top-ex-bar">
        <div class="top-ex-fill" style="width:${count/maxC*100}%"></div>
      </div>
      <div class="top-ex-count">${count}</div>`;
    wrap.appendChild(row);
  });
}

// ── EXPORT ──
function exportData() {
  const json = JSON.stringify(sessions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rutina-backup-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📦 Backup descargado');
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── HISTORY MONTH NAV ──
function prevMonth() {
  historyMonth = new Date(historyMonth.getFullYear(), historyMonth.getMonth() - 1, 1);
  renderHistory();
}
function nextMonth() {
  historyMonth = new Date(historyMonth.getFullYear(), historyMonth.getMonth() + 1, 1);
  renderHistory();
}

// ── START ──
document.addEventListener('DOMContentLoaded', init);
