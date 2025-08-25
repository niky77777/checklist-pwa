// ====== Конфигурация по подразбиране ======
const defaultPositive = [
  "Ядох здравословна закуска",
  "Тренирах",
  "Работих по изграждане на бизнеса си",
  "Научих нещо ново",
  "Пробвах нещо ново на практика",
  "Подобрих английския си",
  "Ядох здравословен обяд",
  "Работих за постигане на мечтите си",
  "Ядох здравословна вечеря",
  "Релаксирах (сън, отпускане, медитация, визуализация)",
  "Проведох смислен разговор с някого",
  "Полезни дейности за мен и домакинството (битови, ремонтни)",
  "Полезни дейности за обществото (помогнах на някого с нещо)",
  "Запознах се с някого/Разговарях с непознати",
  "Забавлявах се и се наградих за труда си",
  "Играх нещо с други хора",
  "Увеличих богатството си (спечелих повече, отколкото съм изхарчил)"
];

const defaultNegative = [
  "Скролвах във FB",
  "Клюкарствах и злослових",
  "Имах негативни мисли",
  "Гневих се",
  "Държах се зле с друг човек",
  "Ядох вредни храни и захар",
  "Пих алкохол",
  "Стоях дълго на стол",
  "Страхувах се да предприема действие",
  "Отлагах и се разсейвах",
  "Преуморих се физически",
  "Преуморих се психически",
  "Натоварих се от негативни разговори",
  "Споделих неща, които не исках",
  "Излъгах",
  "Не живях според вярванията и ценностите си",
  "Правих неща, за да се харесам/да бъда приет (напр. пих алкохол, говорих неща, които не мисля)",
  "Чувствах вина",
  "Купих неща, от които нямам нужда",
  "Взех прибързано решение с дългосрочни последици",
  "Казах/написах неща, за които съжалих",
  "Обидих някого",
  "Приех/обещах да направя нещо, без да съм убеден (прибързано)",
  "Направих нещо, воден от чувство за вина",
  "Намалих богатството си (изхарчих повече, отколкото съм спечелил)"
];

// ====== Утилити ======
const $ = (sel)=>document.querySelector(sel);
const $$ = (sel)=>Array.from(document.querySelectorAll(sel));

// Локален ключ за дата: YYYY-MM-DD (без UTC изместване)
function dateKey(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

// Днешна дата (локално)
const todayStr = () => dateKey(new Date());

// Формат за показване DD.MM.YYYY (работи с YYYY-MM-DD ключ)
const fmtBG = (d)=>{ const [y,m,day]=d.split("-"); return `${day}.${m}.${y}`; };

// Обхват от дати (локално, без UTC)
function getDatesInRange(start, end){
  const out = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e   = new Date(end.getFullYear(),   end.getMonth(),   end.getDate());
  while(cur <= e){
    out.push(dateKey(cur));
    cur.setDate(cur.getDate()+1);
  }
  return out;
}

function getSettings(){
  const st = JSON.parse(localStorage.getItem("settings") || "{}");
  return {
    positive: st.positive || defaultPositive,
    negative: st.negative || defaultNegative
  };
}

function saveSettings(positive, negative){
  localStorage.setItem("settings", JSON.stringify({positive, negative}));
}

function getData(){ 
  return JSON.parse(localStorage.getItem("data") || "{}"); 
}

function saveData(data){ 
  localStorage.setItem("data", JSON.stringify(data)); 
}

// structure: data[date] = { pos: {habit:true/false}, neg: {habit:true/false} }
function ensureDay(date){
  const data = getData();
  if(!data[date]){
    const {positive, negative} = getSettings();
    data[date] = {pos:{}, neg:{}};
    positive.forEach(h=> data[date].pos[h] = false);
    negative.forEach(h=> data[date].neg[h] = false);
    saveData(data);
  }
}

function renderDay(date){
  ensureDay(date);
  const data = getData()[date];
  const {positive, negative} = getSettings();
  const posList = $("#positiveList");
  const negList = $("#negativeList");
  posList.innerHTML = "";
  negList.innerHTML = "";

  positive.forEach(habit=>{
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `<input type="checkbox" ${data.pos[habit] ? "checked":""} />
                    <label>${habit}</label>`;
    const cb = li.querySelector("input");
    cb.addEventListener("change", ()=>{
      const all = getData();
      all[date].pos[habit] = cb.checked;
      saveData(all);
      updateSummary(date);
      updateStatsPanels();
    });
    posList.appendChild(li);
  });

  negative.forEach(habit=>{
    const li = document.createElement("li");
    li.className = "item negative";
    li.innerHTML = `<input type="checkbox" ${data.neg[habit] ? "checked":""} />
                    <label>${habit}</label>`;
    const cb = li.querySelector("input");
    cb.addEventListener("change", ()=>{
      const all = getData();
      all[date].neg[habit] = cb.checked;
      saveData(all);
      updateSummary(date);
      updateStatsPanels();
    });
    negList.appendChild(li);
  });

  updateSummary(date);
}

function updateSummary(date){
  const day = getData()[date];
  const posVals = Object.values(day.pos);
  const negVals = Object.values(day.neg);
  const posTotal = posVals.length;
  const posDone = posVals.filter(Boolean).length;
  $("#posSummary").textContent = `Позитивни: ${posDone}/${posTotal} (${Math.round(posDone/Math.max(1,posTotal)*100)}%)`;
  $("#negSummary").textContent = `Нежелани: ${negVals.filter(Boolean).length}`;
}

// ====== Статистика ======
function getDatesInRange(start, end){
  const out = [];
  let cur = new Date(start);
  while(cur <= end){
    out.push(cur.toISOString().slice(0,10));
    cur.setDate(cur.getDate()+1);
  }
  return out;
}

function calcStats(rangeDates){
  const data = getData();
  let posDone = 0, posTotal = 0, negCount = 0, daysWithData = 0;

  rangeDates.forEach(d => {
    const day = data[d];
    if (!day) return; // няма запис за този ден => не го броим

    const posKeys = Object.keys(day.pos || {});
    const negKeys = Object.keys(day.neg || {});
    if (posKeys.length || negKeys.length) daysWithData += 1;

    posKeys.forEach(h => { posTotal += 1; if (day.pos[h]) posDone += 1; });
    negKeys.forEach(h => { if (day.neg[h]) negCount += 1; });
  });

  const posPct = posTotal ? Math.round((posDone / posTotal) * 100) : 0;
  return { posPct, negCount, days: daysWithData };
}

function renderPanelStats(){
  const now = new Date();

  // Week (Mon–Sun)
  const day = now.getDay(); // 0 Sun..6 Sat
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate()+diffToMon);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate()+6);

  // Month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth()+1, 0);

  const weekDates = getDatesInRange(weekStart, weekEnd);
  const monthDates = getDatesInRange(monthStart, monthEnd);

  const w = calcStats(weekDates);
  const m = calcStats(monthDates);

  $("#weekStats").innerHTML = `
    <p>Позитивни изпълнение: <b>${w.posPct}%</b></p>
    <p>Нежелани събития: <b>${w.negCount}</b> / ${w.days} дни</p>
  `;
  $("#monthStats").innerHTML = `
    <p>Позитивни изпълнение: <b>${m.posPct}%</b></p>
    <p>Нежелани събития: <b>${m.negCount}</b> / ${m.days} дни</p>
  `;

  // Детайл по навик (последни 14 дни)
  const sel = $("#habitSelect");
  const {positive} = getSettings();
  sel.innerHTML = positive.map(h=>`<option>${h}</option>`).join("");
  renderHabitTrend(sel.value);
  sel.onchange = ()=> renderHabitTrend(sel.value);
}

function renderHabitTrend(habit){
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate()-13);
  const dates = getDatesInRange(start, end);
  let rows = "<table class='trend'><tr><th>Дата</th><th>✔</th></tr>";
  const data = getData();
  dates.forEach(d=>{
    const v = data[d]?.pos?.[habit] ? "✔" : "—"; // не създаваме нови записи
    rows += `<tr><td>${fmtBG(d)}</td><td>${v}</td></tr>`;
  });
  rows += "</table>";
  $("#habitTrend").innerHTML = rows;
}

// ====== Настройки ======
function loadSettingsUI(){
  const {positive, negative} = getSettings();
  $("#settingsPositive").value = positive.join("\n");
  $("#settingsNegative").value = negative.join("\n");
}
function saveSettingsUI(){
  const pos = $("#settingsPositive").value.split("\n").map(s=>s.trim()).filter(Boolean);
  const neg = $("#settingsNegative").value.split("\n").map(s=>s.trim()).filter(Boolean);
  saveSettings(pos, neg);
  renderDay($("#date").value);
  renderPanelStats();
  alert("Запазено.");
}

// ====== Импорт / Експорт ======
function exportData(){
  const blob = new Blob([localStorage.getItem("data") || "{}"], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "checklist-data.json";
  a.click();
}
function importData(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    try {
      const obj = JSON.parse(reader.result);
      localStorage.setItem("data", JSON.stringify(obj));
      renderDay($("#date").value);
      renderPanelStats();
      alert("Импорт успешно.");
    } catch(e){
      alert("Невалиден JSON.");
    }
  };
  reader.readAsText(file);
}

// ====== PWA инсталация ======
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  const btn = $("#installBtn");
  btn.hidden = false;
  btn.onclick = async ()=>{
    btn.hidden = true;
    if(deferredPrompt){
      deferredPrompt.prompt();
      deferredPrompt = null;
    }
  };
});

// ====== Инициализация ======
document.addEventListener("DOMContentLoaded", ()=>{
  // Tabs
  $$(".tab").forEach(b=> b.onclick = ()=>{
    $$(".tab").forEach(x=>x.classList.remove("active"));
    $$(".tab-panel").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    $("#"+b.dataset.tab).classList.add("active");
    if(b.dataset.tab === "stats") renderPanelStats();
  });

  // Date
  const d = $("#date");
  d.value = todayStr();
  d.onchange = ()=> renderDay(d.value);

  $("#clearDay").onclick = ()=>{
    const data = getData();
    delete data[d.value];
    saveData(data);
    renderDay(d.value);
  };

  // Settings
  loadSettingsUI();
  $("#saveSettings").onclick = saveSettingsUI;
  $("#exportData").onclick = exportData;
  $("#importData").onclick = ()=> $("#importFile").click();
  $("#importFile").onchange = (e)=> e.target.files[0] && importData(e.target.files[0]);

  // Service worker
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js');
  }

  // Render initial
  renderDay(d.value);
});
