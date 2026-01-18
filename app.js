const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
let currentFamily = JSON.parse(localStorage.getItem('myFamilyConfig')) || FAMILY_DATA;

function saveData() { localStorage.setItem('myFamilyConfig', JSON.stringify(currentFamily)); }

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const tid = (viewId === 'morning' || viewId === 'evening') ? 'view-routine' : `view-${viewId}`;
    document.getElementById(tid).classList.remove('hidden');
    if (viewId === 'week') renderWeek();
    if (viewId === 'settings') renderSettings();
    renderHeaderNav();
}

function renderHeaderNav() {
    const nav = document.getElementById('header-kids-nav');
    nav.innerHTML = currentFamily.children.map(c => `<div class="child-nav-pill" style="border-bottom-color: ${c.color}">${c.name}</div>`).join('');
}

function renderSettings() {
    // Dropdown
    document.getElementById('event-target').innerHTML = `<option value="family">כולם</option>` + currentFamily.children.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    // Kids
    const list = document.getElementById('settings-child-list');
    list.innerHTML = currentFamily.children.map((c, ci) => `
        <div class="settings-section" style="border-right: 8px solid ${c.color}">
            <div style="display:flex; justify-content:space-between;"><h3>${c.name}</h3><button onclick="currentFamily.children.splice(${ci},1); renderSettings(); saveData();" class="delete-bin-btn-small">🗑️</button></div>
            <div style="display:flex; gap:5px; margin: 15px 0;">
                <input type="text" id="ci-${ci}" placeholder="מטלה..." style="flex:1; padding:8px; border-radius:10px; border:1px solid #ddd;">
                <select id="ct-${ci}"><option value="morning">☀️</option><option value="evening">🌙</option></select>
                <button onclick="addChore(${ci})" class="action-btn-blue">הוסף</button>
                <button onclick="addChoreToAll(${ci})" class="action-btn-purple">לכולם ✨</button>
            </div>
            ${c.morning.map((m, mi) => `<div class="chore-edit-row"><span>☀️ ${m.task}</span><button class="delete-bin-btn-small" onclick="currentFamily.children[${ci}].morning.splice(${mi},1); renderSettings(); saveData();">🗑️</button></div>`).join('')}
            ${c.evening.map((e, ei) => `<div class="chore-edit-row"><span>🌙 ${e.task}</span><button class="delete-bin-btn-small" onclick="currentFamily.children[${ci}].evening.splice(${ei},1); renderSettings(); saveData();">🗑️</button></div>`).join('')}
        </div>`).join('');
    
    renderEventsList();
    renderSettingsMarket();
}

function renderSettingsMarket() {
    const container = document.getElementById('settings-market-manager');
    container.innerHTML = `
        <div class="settings-section">
            <h3>🛒 ניהול שוק המטלות</h3>
            <div style="display:flex; gap:5px; margin: 15px 0;">
                <input type="text" id="nm-t" placeholder="מטלה..." style="flex:1; padding:10px; border-radius:10px; border:1px solid #ddd;">
                <input type="number" id="nm-s" placeholder="⭐" style="width:60px; border-radius:10px; border:1px solid #ddd;">
                <button onclick="addMarketTask()" class="action-btn-blue">הוסף</button>
            </div>
            ${currentFamily.market.map((item, i) => `<div class="chore-edit-row"><span>${item.task} (⭐${item.stars})</span><button class="delete-bin-btn-small" onclick="currentFamily.market.splice(${i},1); renderSettings(); saveData();">🗑️</button></div>`).join('')}
        </div>`;
}

function addMarketTask() {
    const t = document.getElementById('nm-t').value;
    const s = document.getElementById('nm-s').value;
    if(t && s) { currentFamily.market.push({task:t, stars:parseInt(s), id:Date.now()}); renderSettings(); saveData(); }
}

function addChore(ci) {
    const v = document.getElementById(`ci-${ci}`).value;
    const t = document.getElementById(`ct-${ci}`).value;
    if(v) { currentFamily.children[ci][t].push({id: Date.now(), task: v}); renderSettings(); saveData(); }
}

function addChoreToAll(ci) {
    const v = document.getElementById(`ci-${ci}`).value;
    const t = document.getElementById(`ct-${ci}`).value;
    if(v) { currentFamily.children.forEach(c => c[t].push({id: Date.now()+Math.random(), task:v})); renderSettings(); saveData(); }
}

function toggleEventForm() { document.getElementById('event-form-container').classList.toggle('hidden'); }

function renderEventsList() {
    document.getElementById('actual-events-list').innerHTML = currentFamily.events.map((ev, i) => `
        <div class="chore-edit-row">
            <span>${DAYS[ev.day]}' - ${ev.name} (<span style="direction:ltr; display:inline-block;">${ev.start}-${ev.end}</span>)</span>
            <button class="delete-bin-btn-small" onclick="currentFamily.events.splice(${i},1); renderSettings(); saveData();">🗑️</button>
        </div>`).join('');
}

function addEvent() {
    const n = document.getElementById('event-name').value;
    const d = document.getElementById('event-day').value;
    const s = `${document.getElementById('start-h').value}:${document.getElementById('start-m').value}`;
    const e = `${document.getElementById('end-h').value}:${document.getElementById('end-m').value}`;
    const t = document.getElementById('event-target').value;
    if(n) { currentFamily.events.push({name:n, day:d, start:s, end:e, target:t}); toggleEventForm(); renderSettings(); saveData(); }
}

function renderWeek() {
    const grid = document.getElementById('week-grid');
    const today = new Date().getDay();
    grid.innerHTML = DAYS.map((day, i) => `<div class="day-column ${i === today ? 'today-highlight' : ''}"><div style="font-weight:800; font-size:1.2rem; border-bottom:1px solid #eee; padding-bottom:5px;">${day} ${i === today ? '(היום)' : ''}</div><div id="day-events-${i}"></div></div>`).join('');
    currentFamily.events.forEach(ev => {
        const c = currentFamily.children.find(child => child.id === ev.target);
        const color = c ? c.color : '#cbd5e1';
        document.getElementById(`day-events-${ev.day}`).innerHTML += `<div class="event-tag" style="background:${color}25; border-right:4px solid ${color}"><span>${ev.name}</span><span style="direction:ltr;">${ev.start}-${ev.end}</span></div>`;
    });
}

function initTimeSelectors() {
    const h = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(x => `<option value="${x}">${x}</option>`).join('');
    const m = ["00", "15", "30", "45"].map(x => `<option value="${x}">${x}</option>`).join('');
    ['start-h', 'end-h'].forEach(id => document.getElementById(id).innerHTML = h);
    ['start-m', 'end-m'].forEach(id => document.getElementById(id).innerHTML = m);
}

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}); }, 1000);
initTimeSelectors();
showView('home');