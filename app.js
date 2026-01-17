const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const PASTEL_COLORS = ["#FEF3E2", "#E0F7FA", "#F3E5F5", "#FCE4EC", "#E8F5E9"];
const ICON_MAP = {
    "שיניים": "brush", "בגדים": "apparel", "מיטה": "bed", "תיק": "backpack",
    "נעליים": "ice_skating", "אוכל": "restaurant", "מקלחת": "shower",
    "שיעורים": "edit_note", "סדר": "delete", "חוג": "exercise", "כלב": "pets", "פיג'מה": "checkroom"
};

// --- SAFE LOAD DATA ---
let currentFamily = JSON.parse(localStorage.getItem('myFamilyConfig')) || { children: [], events: [] };
if (!currentFamily.children) currentFamily.children = [];
if (!currentFamily.events) currentFamily.events = [];

function getIcon(text) {
    for (let key in ICON_MAP) { if (text.includes(key)) return ICON_MAP[key]; }
    return "task_alt";
}

/** SYSTEM MAINTENANCE **/
function checkSystemResets() {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-GB');
    if (localStorage.getItem('lastResetDate') !== todayStr) {
        manualResetTasks();
        localStorage.setItem('lastResetDate', todayStr);
    }
}
function manualResetTasks() {
    Object.keys(localStorage).forEach(key => {
        if (key.includes('-') && !key.includes('Config') && !key.includes('stars')) localStorage.removeItem(key);
    });
}
function weeklyCleanup() {
    currentFamily.events = currentFamily.events.filter(ev => ev.repeat === true);
    localStorage.setItem('myFamilyConfig', JSON.stringify(currentFamily));
    renderSettings(); renderWeek();
}

/** NAVIGATION **/
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    if (viewId === 'morning' || viewId === 'evening') {
        document.getElementById('view-routine').classList.remove('hidden');
        renderRoutine(viewId);
    } else if (target) target.classList.remove('hidden');
    if (viewId === 'week') renderWeek();
    if (viewId === 'settings') renderSettings();
    updateHeaderNav();
}
function updateHeaderNav() {
    const container = document.getElementById('header-kids-nav');
    container.innerHTML = currentFamily.children.map(child => 
        `<div class="child-nav-pill" style="border-bottom: 3px solid ${child.color}" onclick="scrollToChild('${child.id}')">
            ${child.name}
        </div>`).join('');
}

/** ROUTINE VIEW **/
function renderRoutine(timeOfDay) {
    const container = document.getElementById('child-slider');
    container.innerHTML = currentFamily.children.map(child => `
        <div class="child-card" id="slide-${child.id}" style="background-color: ${child.color}08">
            <h2 style="color:${child.color}">${child.name}</h2>
            <div class="chore-list">
                ${(child[timeOfDay] || []).map(t => {
                    const isDone = localStorage.getItem(`${child.id}-${t.id}`) === 'true';
                    return `
                    <div class="chore-item ${isDone?'done':''}" onclick="handleChoreClick(this,'${child.id}','${t.id}')">
                        <span class="material-symbols-rounded chore-icon">${getIcon(t.task)}</span>
                        <span class="chore-name">${t.task}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`).join('');
}
function handleChoreClick(element, childId, taskId) {
    const isNowDone = !element.classList.contains('done');
    element.classList.toggle('done');
    if (isNowDone) { localStorage.setItem(`${childId}-${taskId}`, 'true'); addStars(childId, 1); }
    else { localStorage.removeItem(`${childId}-${taskId}`); addStars(childId, -1); }
}
function addStars(childId, amount) {
    let current = parseInt(localStorage.getItem(`${childId}-stars`) || 0);
    localStorage.setItem(`${childId}-stars`, Math.max(0, current + amount));
    updateHeaderNav();
}
function scrollToChild(id) {
    const el = document.getElementById(`slide-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'start' });
}

/** WEEK VIEW **/
function renderWeek() {
    const grid = document.getElementById('week-grid');
    grid.innerHTML = DAYS.map((day, i) => `<div class="day-column"><div class="day-header">${day}</div><div id="day-events-${i}"></div></div>`).join('');
    
    currentFamily.events.sort((a, b) => (a.start || "").localeCompare(b.start || "")).forEach(ev => {
        const dayDiv = document.getElementById(`day-events-${ev.day}`);
        if (!dayDiv) return;
        const isFamily = ev.target === 'family';
        const child = !isFamily ? currentFamily.children.find(c => c.id === ev.target) : null;
        const color = isFamily ? '#f1f5f9' : (child ? child.color : '#fff');
        const displayName = isFamily ? ev.name : `${ev.name} (${child ? child.name : '?'})`;
        
        dayDiv.innerHTML += `
            <div class="event-tag" style="background:${color}">
                <span style="font-weight:800;">${displayName} ${ev.repeat ? '🔄' : ''}</span>
                <span class="event-time">${ev.start}-${ev.end}</span>
            </div>`;
    });
}

/** SETTINGS **/
function initTimeSelectors() {
    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ["00", "15", "30", "45"];
    [document.getElementById('start-h'), document.getElementById('end-h')].forEach(s => s.innerHTML = hours.map(h => `<option value="${h}">${h}</option>`).join(''));
    [document.getElementById('start-m'), document.getElementById('end-m')].forEach(s => s.innerHTML = minutes.map(m => `<option value="${m}">${m}</option>`).join(''));
}
function addEvent() {
    const name = document.getElementById('event-name').value; if (!name) return;
    currentFamily.events.push({
        name, day: parseInt(document.getElementById('event-day').value),
        start: `${document.getElementById('start-h').value}:${document.getElementById('start-m').value}`,
        end: `${document.getElementById('end-h').value}:${document.getElementById('end-m').value}`,
        target: document.getElementById('event-target').value, repeat: document.getElementById('event-repeat').checked
    });
    document.getElementById('event-name').value = ''; renderSettings();
}
function editEvent(idx) {
    const ev = currentFamily.events[idx];
    document.getElementById('event-name').value = ev.name;
    document.getElementById('event-day').value = ev.day;
    document.getElementById('event-target').value = ev.target;
    document.getElementById('event-repeat').checked = ev.repeat || false;
    const [sh, sm] = ev.start.split(':'); const [eh, em] = ev.end.split(':');
    document.getElementById('start-h').value = sh; document.getElementById('start-m').value = sm;
    document.getElementById('end-h').value = eh; document.getElementById('end-m').value = em;
    document.getElementById('edit-event-idx').value = idx;
    document.getElementById('btn-add-event').classList.add('hidden');
    document.getElementById('btn-update-event').classList.remove('hidden');
}
function updateEvent() {
    const idx = document.getElementById('edit-event-idx').value;
    currentFamily.events[idx] = {
        name: document.getElementById('event-name').value, day: parseInt(document.getElementById('event-day').value),
        start: `${document.getElementById('start-h').value}:${document.getElementById('start-m').value}`,
        end: `${document.getElementById('end-h').value}:${document.getElementById('end-m').value}`,
        target: document.getElementById('event-target').value, repeat: document.getElementById('event-repeat').checked
    };
    document.getElementById('edit-event-idx').value = "-1";
    document.getElementById('btn-add-event').classList.remove('hidden');
    document.getElementById('btn-update-event').classList.add('hidden');
    renderSettings();
}
function renderSettings() {
    const evList = document.getElementById('settings-event-list');
    evList.innerHTML = currentFamily.events.map((ev, i) => {
        const c = currentFamily.children.find(k => k.id === ev.target);
        return `<div class="chore-edit-row">
            <button class="del-chore-btn" onclick="currentFamily.events.splice(${i},1); renderSettings();">🗑️</button>
            <button class="edit-btn" onclick="editEvent(${i})">עריכה</button>
            <span style="flex:1; text-align:right;"><b>${DAYS[ev.day]}</b> | <span style="direction:ltr; display:inline-block;">${ev.start}-${ev.end}</span> | ${ev.name} (${c?c.name:'כולם'})</span>
        </div>`;
    }).join('');

    document.getElementById('event-target').innerHTML = `<option value="family">כולם</option>` + currentFamily.children.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    document.getElementById('settings-child-list').innerHTML = currentFamily.children.map((c, ci) => `
        <div class="settings-child-card" style="border-right: 8px solid ${c.color}">
            <button class="del-chore-btn" style="position:absolute; left:10px; top:10px;" onclick="currentFamily.children.splice(${ci},1); renderSettings();">מחיקה</button>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <input type="text" value="${c.name}" onchange="currentFamily.children[${ci}].name=this.value;" style="font-weight:800; border:none; font-size:1.1rem; width:80px;">
                <input type="color" value="${c.color}" onchange="currentFamily.children[${ci}].color=this.value; renderSettings();">
                <span style="margin-right:auto;">⭐ ${localStorage.getItem(c.id+'-stars')||0}</span>
            </div>
            <div class="form-group-compact">
                <input type="text" id="chore-in-${ci}" placeholder="מטלה..." style="flex:1;">
                <select id="chore-time-${ci}"><option value="morning">☀️</option><option value="evening">🌙</option></select>
                <button onclick="addChore(${ci})" class="mini-add-btn">+</button>
            </div>
            <div class="compact-chore-list">${['morning','evening'].map(time => (c[time]||[]).map((t, ti) => `
                <div class="chore-edit-row">
                    <button class="del-chore-btn" onclick="currentFamily.children[${ci}]['${time}'].splice(${ti},1); renderSettings();">🗑️</button>
                    <span>${time==='morning'?'☀️':'🌙'} ${t.task}</span>
                </div>`).join('')).join('')}</div>
        </div>`).join('');
}
function addChore(ci) {
    const inp = document.getElementById(`chore-in-${ci}`); if(!inp.value) return;
    const time = document.getElementById(`chore-time-${ci}`).value;
    currentFamily.children[ci][time].push({id:"t"+Date.now(), task:inp.value});
    inp.value=''; renderSettings();
}
function addChild() {
    const n = document.getElementById('new-child-name').value; if(!n) return;
    currentFamily.children.push({id:"c"+Date.now(), name:n, color:PASTEL_COLORS[currentFamily.children.length%5], morning:[], evening:[]});
    document.getElementById('new-child-name').value=''; renderSettings();
}
function saveAndRestart() { localStorage.setItem('myFamilyConfig', JSON.stringify(currentFamily)); location.reload(); }

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}); }, 1000);
initTimeSelectors(); checkSystemResets(); showView('home');