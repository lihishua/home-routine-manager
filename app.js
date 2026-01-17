/** 1. CONFIGURATION & STATE **/
const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const PASTEL_COLORS = ["#FEF3E2", "#E0F7FA", "#F3E5F5", "#FCE4EC", "#E8F5E9"];
const ICON_MAP = {
    "שיניים": "brush", "בגדים": "apparel", "מיטה": "bed", "תיק": "backpack",
    "נעליים": "ice_skating", "אוכל": "restaurant", "מקלחת": "shower",
    "שיעורים": "edit_note", "סדר": "delete", "חוג": "exercise", "כלב": "pets", "פיג'מה": "checkroom"
};

let currentFamily = JSON.parse(localStorage.getItem('myFamilyConfig')) || FAMILY_DATA;

// Ensure basic structure exists
if (!currentFamily.children) currentFamily.children = [];
if (!currentFamily.events) currentFamily.events = [];
if (!currentFamily.market) currentFamily.market = FAMILY_DATA.market || [];

function saveData() { localStorage.setItem('myFamilyConfig', JSON.stringify(currentFamily)); }

function getIcon(text) {
    for (let key in ICON_MAP) { if (text.includes(key)) return ICON_MAP[key]; }
    return "task_alt";
}

/** 2. NAVIGATION **/
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    
    if (viewId === 'market') renderMarket();
    else if (viewId === 'morning' || viewId === 'evening') {
        document.getElementById('view-routine').classList.remove('hidden');
        renderRoutine(viewId);
    } else if (target) target.classList.remove('hidden');

    if (viewId === 'week') renderWeek();
    if (viewId === 'settings') renderSettings();
    updateHeaderNav();
}

function updateHeaderNav() {
    const container = document.getElementById('header-kids-nav');
    container.innerHTML = currentFamily.children.map(child => `
        <div class="child-nav-pill" style="border-bottom: 3px solid ${child.color}" onclick="scrollToChild('${child.id}')">
            ${child.name}
        </div>`).join('');
}

/** 3. SOUND & ACTIONS **/
function playSuccessSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.1);
}

function handleChoreClick(element, childId, taskId) {
    const isNowDone = !element.classList.contains('done');
    element.classList.toggle('done');
    if (isNowDone) { 
        localStorage.setItem(`${childId}-${taskId}`, 'true'); 
        addStars(childId, 1);
        playSuccessSound();
        if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else { 
        localStorage.removeItem(`${childId}-${taskId}`); 
        addStars(childId, -1); 
    }
}

function addStars(childId, amount) {
    let current = parseInt(localStorage.getItem(`${childId}-stars`) || 0);
    localStorage.setItem(`${childId}-stars`, Math.max(0, current + amount));
}

/** 4. SETTINGS & MANAGEMENT **/
function renderSettings() {
    // A. MARKET SECTION
    const bankSection = document.getElementById('settings-market-section');
    bankSection.innerHTML = `
        <h3 class="compact-h3">🛒 ניהול שוק המטלות</h3>
        <div class="form-group-compact" style="margin-bottom:15px;">
            <input type="text" id="new-market-name" placeholder="מטלה חדשה לשוק..." style="flex:1;">
            <button onclick="addMarketItem()" class="action-btn-green">הוספה</button>
        </div>
        <div class="compact-chore-list">
            ${currentFamily.market.map((item, i) => `
                <div class="chore-edit-row">
                    <button class="del-chore-btn" onclick="currentFamily.market.splice(${i},1); renderSettings();">🗑️</button>
                    <span style="flex:1;">${item.task}</span>
                    <div class="star-adjuster">
                        <button onclick="updateMarketStars(${i}, -1)">-</button>
                        <span>⭐${item.stars}</span>
                        <button onclick="updateMarketStars(${i}, 1)">+</button>
                    </div>
                </div>`).join('')}
        </div>`;

    // B. NAMES FOR EVENTS DROPDOWN
    document.getElementById('event-target').innerHTML = `<option value="family">כולם</option>` + 
        currentFamily.children.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    // C. CHILDREN LIST
    const childList = document.getElementById('settings-child-list');
    childList.innerHTML = currentFamily.children.map((c, ci) => `
        <div class="settings-child-card" style="border-right: 8px solid ${c.color}; position:relative; padding-top:40px;">
            <button class="del-chore-btn" style="position:absolute; left:15px; top:15px;" onclick="if(confirm('למחוק את ${c.name}?')){currentFamily.children.splice(${ci},1); renderSettings();}">🗑️ מחיקה</button>
            
            <div class="child-card-info">
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="text" value="${c.name}" onchange="currentFamily.children[${ci}].name=this.value;" style="font-weight:800; border:none; font-size:1.4rem; background:transparent; width:120px;">
                    <input type="color" value="${c.color}" onchange="currentFamily.children[${ci}].color=this.value; renderSettings();">
                </div>
                <div style="display:flex; align-items:center; gap:15px; margin-top:5px; color:#64748b;">
                    <span>⭐ <b>${localStorage.getItem(c.id+'-stars')||0}</b></span>
                    <button onclick="localStorage.setItem('${c.id}-stars', 0); renderSettings();" class="reset-btn-small">איפוס כוכבים</button>
                </div>
            </div>

            <div class="form-group-compact" style="margin-top:20px;">
                <input type="text" id="chore-in-${ci}" placeholder="מטלה חדשה..." style="flex:1;">
                <select id="chore-time-${ci}"><option value="morning">☀️</option><option value="evening">🌙</option></select>
                <button onclick="addChore(${ci})" class="action-btn-blue">הוספה</button>
                <button onclick="addChore(${ci}, true)" class="action-btn-purple">לכולם</button>
            </div>

            <div class="compact-chore-list" style="margin-top:10px;">
                ${['morning','evening'].map(time => (c[time]||[]).map((t, ti) => `
                    <div class="chore-edit-row">
                        <button class="del-chore-btn" onclick="currentFamily.children[${ci}]['${time}'].splice(${ti},1); renderSettings();">🗑️</button>
                        <span>${time==='morning'?'☀️':'🌙'} ${t.task}</span>
                    </div>`).join('')).join('')}
            </div>
        </div>`).join('');
}

function addMarketItem() {
    const name = document.getElementById('new-market-name').value;
    if(!name) return;
    currentFamily.market.push({ id: "m"+Date.now(), task: name, stars: 1 });
    document.getElementById('new-market-name').value = '';
    renderSettings();
}

function updateMarketStars(idx, amount) {
    currentFamily.market[idx].stars = Math.max(1, currentFamily.market[idx].stars + amount);
    renderSettings();
}

function addChore(ci, toAll = false) {
    const inp = document.getElementById(`chore-in-${ci}`);
    const time = document.getElementById(`chore-time-${ci}`).value;
    if(!inp.value) return;
    
    if (toAll) {
        currentFamily.children.forEach(child => {
            child[time].push({ id: "t"+Date.now()+Math.random(), task: inp.value });
        });
    } else {
        currentFamily.children[ci][time].push({ id: "t"+Date.now(), task: inp.value });
    }
    inp.value = ''; renderSettings();
}

/** 5. RENDER ROUTINE & MARKET VIEW **/
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

function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = '<div class="chore-list" id="market-grid"></div>';
    const grid = document.getElementById('market-grid');
    
    currentFamily.market.forEach(item => {
        const tile = document.createElement('div');
        tile.className = 'chore-item';
        tile.style.backgroundColor = '#EBFBEE';
        tile.onclick = () => openKidPicker(item.task, item.stars);
        tile.innerHTML = `
            <span class="material-symbols-rounded chore-icon">stars</span>
            <span class="chore-name">${item.task}</span>
            <span style="color:#2b8a3e; font-weight:800; font-size:1.2rem;">⭐${item.stars}</span>
        `;
        grid.appendChild(tile);
    });
}

function openKidPicker(taskName, starCount) {
    const modal = document.getElementById('modal-kid-picker');
    const container = document.getElementById('kid-picker-buttons');
    document.getElementById('modal-title').innerText = `מי ביצע: ${taskName}?`;
    container.innerHTML = ''; 
    modal.classList.remove('hidden');

    currentFamily.children.forEach(child => {
        const btn = document.createElement('button');
        btn.className = 'kid-pick-btn';
        btn.style.backgroundColor = child.color;
        btn.innerHTML = `${child.name}<br><small>+${starCount} ⭐</small>`;
        btn.onclick = () => { 
            addStars(child.id, starCount); 
            playSuccessSound(); 
            closeModal(); 
            if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 100 });
        };
        container.appendChild(btn);
    });
}

function closeModal() { document.getElementById('modal-kid-picker').classList.add('hidden'); }

/** 6. INIT & UTILS **/
function saveAndRestart() { saveData(); location.reload(); }

function initTimeSelectors() {
    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ["00", "15", "30", "45"];
    [document.getElementById('start-h'), document.getElementById('end-h')].forEach(s => {
        if(s) s.innerHTML = hours.map(h => `<option value="${h}">${h}</option>`).join('');
    });
    [document.getElementById('start-m'), document.getElementById('end-m')].forEach(s => {
        if(s) s.innerHTML = minutes.map(m => `<option value="${m}">${m}</option>`).join('');
    });
}

function renderWeek() {
    const grid = document.getElementById('week-grid');
    grid.innerHTML = DAYS.map((day, i) => `<div class="day-column"><div class="day-header">${day}</div><div id="day-events-${i}"></div></div>`).join('');
    currentFamily.events.forEach(ev => {
        const dayDiv = document.getElementById(`day-events-${ev.day}`);
        if (dayDiv) dayDiv.innerHTML += `<div class="event-tag" style="background:#f1f5f9"><b>${ev.name}</b><br>${ev.start}</div>`;
    });
}

function scrollToChild(id) {
    const el = document.getElementById(`slide-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'start' });
}

setInterval(() => { 
    const clock = document.getElementById('clock');
    if (clock) clock.innerText = new Date().toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}); 
}, 1000);

initTimeSelectors(); 
showView('home');