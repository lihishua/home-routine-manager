const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
let currentFamily = JSON.parse(localStorage.getItem('myFamilyConfig')) || FAMILY_DATA;

// Set splash screen greeting based on time of day
(function setSplashGreeting() {
    const hour = new Date().getHours();
    const greeting = document.getElementById('splash-greeting');
    if (greeting) {
        if (hour >= 5 && hour < 12) {
            greeting.textContent = "בוקר טוב! ☀️";
        } else if (hour >= 12 && hour < 17) {
            greeting.textContent = "צהריים טובים! 🌤️";
        } else if (hour >= 17 && hour < 21) {
            greeting.textContent = "ערב טוב! 🌙";
        } else {
            greeting.textContent = "לילה טוב! 🌟";
        }
    }
})();

// Ensure required arrays exist
if (!currentFamily.children) currentFamily.children = [];
if (!currentFamily.market) currentFamily.market = [];
if (!currentFamily.events) currentFamily.events = [];

// Persist the active family configuration to storage.
function saveData() { localStorage.setItem('myFamilyConfig', JSON.stringify(currentFamily)); }

// Beez icon and helpers
const BEE_IMG = "https://freesvg.org/img/Cartoon-Bee.png";

function getBeezIconHtml() {
    return `<span class="beez-icons-stack">
        <img src="${BEE_IMG}" class="beez-icon bee-back" alt="beez">
        <img src="${BEE_IMG}" class="beez-icon bee-front" alt="beez">
    </span>`;
}

function getBeezText(count) {
    return count === 1 ? "ביז" : "ביזים";
}

function renderChildScore(child) {
    return `
        <span class="beez-display">
            ${getBeezIconHtml()}
            <span class="beez-number">${child.beez}</span>
        </span>
    `;
}

// Show one of the main app views and re-render related data.
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    
    // Determine if we are going into routine mode
    const isRoutine = (viewId === 'morning' || viewId === 'evening');
    const tid = isRoutine ? 'view-routine' : `view-${viewId}`;
    
    const target = document.getElementById(tid);
    if (target) target.classList.remove('hidden');
    
    if (viewId === 'week') renderWeek();
    if (viewId === 'settings') renderSettings();
    if (viewId === 'market') renderMarket();
    if (isRoutine) renderRoutine(viewId); // <--- Add this line!
    
    renderHeaderNav();
}

// Rebuild the header pills that show each child.
function renderHeaderNav() {
    const nav = document.getElementById('header-kids-nav');
    nav.innerHTML = currentFamily.children.map(child => {
        return `<div class="child-nav-pill" style="border-bottom-color: ${child.color}">
            ${child.icon || ''} ${child.name}
        </div>`;
    }).join('');
}

// Clear every child's earned beez after confirmation.
function resetAllBeez() {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל הביזים של הילדים?')) {
        currentFamily.children.forEach(c => c.beez = 0);
        saveData();
        renderSettings();
        renderHeaderNav();
    }
}

// Fill the settings view with child and event controls.
function renderSettings() {
    const targetSelect = document.getElementById('event-target');
    if (targetSelect) {
        targetSelect.innerHTML = `<option value="family">כולם</option>` + 
            currentFamily.children.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        targetSelect.value = 'family';
        if (typeof resetEventForm === 'function') resetEventForm();
    }

    renderEventsList();
    renderMarketSection();
    renderChildList();
}

function renderMarketSection() {
    const listContainer = document.getElementById('market-items-list');
    if (!listContainer) return;
    
    const marketItems = currentFamily.market || [];

    if (marketItems.length === 0) {
        listContainer.innerHTML = '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:10px;">אין משימות</div>';
        return;
    }

    let html = '';
    marketItems.forEach((item, i) => {
        html += `
            <div class="market-edit-row">
                <button class="del-chore-btn" onclick="currentFamily.market.splice(${i},1); saveData(); renderSettings();"><img src="https://thumbs.dreamstime.com/b/computer-generated-illustration-recycle-bin-icon-isolated-white-background-suitable-logo-delete-icon-button-175612353.jpg" alt="מחיקה"></button>
                <span class="market-task-name">${item.task || ''}</span>
                <div class="beez-stepper">
                    <button onclick="updateMarketBeez(${i}, -1)">-</button>
                    <span class="beez-count">${item.beez || 1}</span>
                    ${getBeezIconHtml()}
                    <button onclick="updateMarketBeez(${i}, 1)">+</button>
                </div>
            </div>`;
    });

    listContainer.innerHTML = html;
}

function renderChildList() {
    const childList = document.getElementById('settings-child-list');
    if (!childList) return;
    
    const children = currentFamily.children || [];
    
    if (children.length === 0) {
        childList.innerHTML = '<div style="color:#64748b; text-align:center; padding:20px; background:white; border-radius:15px; min-width:200px;">אין חברים - הוסף חבר חדש</div>';
        return;
    }

    let html = '';
    children.forEach((c, ci) => {
        const color = c.color || '#ccc';
        const name = c.name || 'ללא שם';
        const beez = c.beez || 0;
        
        // Build chores list
        let choresHtml = '';
        ['morning', 'evening'].forEach(time => {
            const tasks = c[time] || [];
            tasks.forEach((t, ti) => {
                const icon = time === 'morning' ? '☀️' : '🌙';
                choresHtml += '<div style="display:flex;align-items:center;gap:5px;padding:4px 0;border-bottom:1px solid #f1f5f9">';
                choresHtml += '<button class="del-chore-btn" onclick="currentFamily.children[' + ci + '][\'' + time + '\'].splice(' + ti + ',1);saveData();renderSettings()"><img src="https://thumbs.dreamstime.com/b/computer-generated-illustration-recycle-bin-icon-isolated-white-background-suitable-logo-delete-icon-button-175612353.jpg" alt="מחיקה"></button>';
                choresHtml += '<span>' + icon + ' ' + (t.task || '') + '</span>';
                choresHtml += '</div>';
            });
        });

        html += '<div class="settings-child-card" style="border-top-color:' + color + '">';
        
        // Header with name, loom icon, color picker, delete button
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
        html += '<div style="display:flex;align-items:center;gap:8px">';
        html += '<span style="font-weight:800;font-size:1.1rem">' + name + '</span>';
        html += renderChildScore({beez: beez});
        html += '<input type="color" value="' + color + '" onchange="currentFamily.children[' + ci + '].color=this.value;saveData();renderSettings()" style="width:24px;height:24px;border:none;cursor:pointer">';
        html += '</div>';
        html += '<button class="del-chore-btn" onclick="if(confirm(\'למחוק?\')){currentFamily.children.splice(' + ci + ',1);saveData();renderSettings()}">מחיקה</button>';
        html += '</div>';
        
        // Reset beez button
        html += '<div style="margin-bottom:10px">';
        html += '<button onclick="currentFamily.children[' + ci + '].beez=0;saveData();renderSettings()" class="reset-btn-small">איפוס ביזים</button>';
        html += '</div>';
        
        // Add chore input
        html += '<div style="display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap">';
        html += '<input type="text" id="chore-in-' + ci + '" placeholder="מטלה חדשה..." style="flex:1;min-width:100px;padding:6px;border-radius:8px;border:1px solid #e2e8f0;font-size:0.8rem">';
        html += '<select id="chore-time-' + ci + '" style="padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0;font-size:0.8rem">';
        html += '<option value="morning">☀️ בוקר</option>';
        html += '<option value="evening">🌙 ערב</option>';
        html += '<option value="both">🌤️ שניהם</option>';
        html += '</select>';
        html += '</div>';
        html += '<div style="display:flex;gap:5px;margin-bottom:8px">';
        html += '<button onclick="addChore(' + ci + ')" class="settings-card-btn" style="flex:1;font-size:0.8rem;padding:6px">הוספה</button>';
        html += '<button onclick="addChoreToAll(' + ci + ')" class="action-btn-blue" style="flex:1;font-size:0.8rem;padding:6px">הוסף לכולם</button>';
        html += '</div>';
        
        // Chores list
        html += '<div style="max-height:150px;overflow-y:auto;font-size:0.8rem">';
        html += choresHtml || '<div style="color:#999;text-align:center;padding:10px">אין מטלות</div>';
        html += '</div>';
        
        html += '</div>';
    });
    
    childList.innerHTML = html;
}

// Adjust the beez cost for a market item and refresh settings.
function updateMarketBeez(index, change) {
    currentFamily.market[index].beez = Math.max(1, currentFamily.market[index].beez + change);
    saveData();
    renderSettings();
}

// Create a new market task and refresh the UI.
function addMarketItem() {
    const taskInput = document.getElementById('new-market-name');
    const taskValue = taskInput ? taskInput.value.trim() : '';
    
    if (taskValue) {
        currentFamily.market.push({ id: Date.now(), task: taskValue, beez: 1 });
        taskInput.value = '';
        saveData();
        renderMarketSection(); // Directly render the market section
    }
}

// Add a single chore to one child’s routine.
function addChore(ci) {
    const input = document.getElementById(`chore-in-${ci}`);
    const v = input ? input.value.trim() : '';
    const t = document.getElementById(`chore-time-${ci}`).value;
    
    if (v) {
        if (t === 'both') {
            currentFamily.children[ci].morning.push({id: Date.now(), task: v});
            currentFamily.children[ci].evening.push({id: Date.now() + 1, task: v});
        } else {
            currentFamily.children[ci][t].push({id: Date.now(), task: v});
        }
        input.value = '';
        saveData();
        renderChildList();
    }
}

// Copy a chore to every child's routine list.
function addChoreToAll(ci) {
    const input = document.getElementById(`chore-in-${ci}`);
    const v = input ? input.value.trim() : '';
    const t = document.getElementById(`chore-time-${ci}`).value;
    
    if (v) {
        currentFamily.children.forEach(c => {
            if (t === 'both') {
                c.morning.push({id: Date.now() + Math.random(), task: v});
                c.evening.push({id: Date.now() + Math.random() + 1, task: v});
            } else {
                c[t].push({id: Date.now() + Math.random(), task: v});
            }
        });
        input.value = '';
        saveData();
        renderChildList();
    }
}

// Add a new child to the family.
function addChild() {
    const nameInput = document.getElementById('new-child-name');
    const name = nameInput.value.trim();
    if (!name) return;
    
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c'];
    const color = colors[currentFamily.children.length % colors.length];
    
    currentFamily.children.push({
        id: 'child-' + Date.now(),
        name: name,
        color: color,
        morning: [],
        evening: [],
        beez: 0
    });
    
    nameInput.value = '';
    saveData();
    renderSettings();
    renderHeaderNav();
}

// Rebuild the list of scheduled events in settings.
function renderEventsList() {
    const list = document.getElementById('settings-event-list');
    if (!list) return;
    
    const events = currentFamily.events || [];

    if (events.length === 0) {
        list.innerHTML = `<div style="color:#64748b; font-size:0.75rem; text-align:center;">אין אירועים</div>`;
        return;
    }

    list.innerHTML = events.map((ev, i) => {
        const child = currentFamily.children.find(c => c.id === ev.target);
        return `
            <div class="chore-edit-row" style="padding:4px 0; font-size:0.75rem; border-bottom:1px solid #e2e8f0;">
                <span style="flex:1;">
                    ${DAYS[ev.day]}' - <strong>${ev.name}</strong> (<span style="direction:ltr;">${ev.start}-${ev.end}</span>) 
                    ${child ? `- ${child.name}` : ''}
                </span>
                <button class="del-chore-btn" onclick="currentFamily.events.splice(${i},1); saveData(); renderSettings();"><img src="https://thumbs.dreamstime.com/b/computer-generated-illustration-recycle-bin-icon-isolated-white-background-suitable-logo-delete-icon-button-175612353.jpg" alt="מחיקה"></button>
            </div>`;
    }).join('');
}

// Save a new event from the settings form.
function addEvent() {
    const n = document.getElementById('event-name').value;
    const d = document.getElementById('event-day').value;
    const sh = document.getElementById('start-h').value;
    const sm = document.getElementById('start-m').value;
    const eh = document.getElementById('end-h').value;
    const em = document.getElementById('end-m').value;
    const t = document.getElementById('event-target').value;
    
    if(n) { 
        const repeat = document.getElementById('event-repeat')?.checked;
        currentFamily.events.push({ name: n, day: parseInt(d), start: `${sh}:${sm}`, end: `${eh}:${em}`, target: t, repeat });
        saveData();
        resetEventForm();
        renderSettings(); 
    }
}

function editEvent(index) {
    const ev = currentFamily.events[index];
    if (!ev) return;
    
    const nameEl = document.getElementById('event-name');
    const dayEl = document.getElementById('event-day');
    const startH = document.getElementById('start-h');
    const startM = document.getElementById('start-m');
    const endH = document.getElementById('end-h');
    const endM = document.getElementById('end-m');
    const targetEl = document.getElementById('event-target');
    const repeatEl = document.getElementById('event-repeat');
    const editIdx = document.getElementById('edit-event-idx');
    const btnAdd = document.getElementById('btn-add-event');
    const btnUpdate = document.getElementById('btn-update-event');
    
    if (nameEl) nameEl.value = ev.name;
    if (dayEl) dayEl.value = ev.day;
    if (startH) startH.value = ev.start.split(':')[0];
    if (startM) startM.value = ev.start.split(':')[1];
    if (endH) endH.value = ev.end.split(':')[0];
    if (endM) endM.value = ev.end.split(':')[1];
    if (targetEl) targetEl.value = ev.target;
    if (repeatEl) repeatEl.checked = ev.repeat ?? true;
    if (editIdx) editIdx.value = index;
    if (btnAdd) btnAdd.classList.add('hidden');
    if (btnUpdate) btnUpdate.classList.remove('hidden');
}

function updateEvent() {
    const idx = parseInt(document.getElementById('edit-event-idx').value, 10);
    if (isNaN(idx) || idx < 0) return;

    const n = document.getElementById('event-name').value;
    const d = document.getElementById('event-day').value;
    const sh = document.getElementById('start-h').value;
    const sm = document.getElementById('start-m').value;
    const eh = document.getElementById('end-h').value;
    const em = document.getElementById('end-m').value;
    const t = document.getElementById('event-target').value;
    const repeat = document.getElementById('event-repeat')?.checked;

    if (n) {
        currentFamily.events[idx] = { ...currentFamily.events[idx], name: n, day: parseInt(d), start: `${sh}:${sm}`, end: `${eh}:${em}`, target: t, repeat };
        saveData();
        resetEventForm();
        renderSettings();
    }
}

function resetEventForm() {
    document.getElementById('event-name').value = '';
    document.getElementById('event-day').value = '0';
    const startH = document.getElementById('start-h');
    const startM = document.getElementById('start-m');
    const endH = document.getElementById('end-h');
    const endM = document.getElementById('end-m');
    const target = document.getElementById('event-target');
    const editIdx = document.getElementById('edit-event-idx');
    const repeatEl = document.getElementById('event-repeat');
    const btnAdd = document.getElementById('btn-add-event');
    const btnUpdate = document.getElementById('btn-update-event');
    
    if (startH) startH.value = '08';
    if (startM) startM.value = '00';
    if (endH) endH.value = '08';
    if (endM) endM.value = '00';
    if (target) target.value = 'family';
    if (editIdx) editIdx.value = '-1';
    if (repeatEl) repeatEl.checked = true;
    if (btnAdd) btnAdd.classList.remove('hidden');
    if (btnUpdate) btnUpdate.classList.add('hidden');
}

// Draw the weekly grid with events per day.
// Draw the weekly grid with events per day using a table layout.
function hexToRgba(hex, alpha) {
    if (!hex) return `rgba(15,23,42,${alpha})`;
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Draw the weekly grid with events per day using a table layout.
function renderWeek() {
    const grid = document.getElementById('week-grid');
    if (!grid) return;
    const today = new Date().getDay();

    const headerRow = DAYS.map((day, i) => `<th class="${i === today ? 'today-col' : ''}">${day}</th>`).join('');
    const bodyRow = DAYS.map((day, i) => {
        const eventsForDay = currentFamily.events.filter(ev => ev.day === i);
        if (!eventsForDay.length) return `<td class="week-day-cell empty" data-day="${day}"></td>`;

        const eventsMarkup = eventsForDay.map(ev => {
            const child = currentFamily.children.find(c => c.id === ev.target);
            const color = child ? child.color : '#cbd5e1';
            const chipBg = hexToRgba(color, 0.15);
            return `
                <div class="event-chip" style="background:${chipBg}; border-left-color:${color};">
                    <span>${ev.name}</span>
                    <span class="event-time">${ev.start}-${ev.end}</span>
                </div>
            `;
        }).join('');

        return `<td class="week-day-cell" data-day="${day}">${eventsMarkup}</td>`;
    }).join('');

    grid.innerHTML = `
        <div class="week-table-wrapper">
            <table class="week-table">
                <thead><tr>${headerRow}</tr></thead>
                <tbody><tr>${bodyRow}</tr></tbody>
            </table>
        </div>
    `;
}

// Show all market items for purchase selection.
function renderMarket() {
    const container = document.getElementById('market-list');
    if (!container) return;
    if (currentFamily.market.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#64748b;">השוק ריק כרגע... 🛒</div>`;
        return;
    }
    container.innerHTML = currentFamily.market.map((item, i) => `
        <div class="menu-card market-card" style="aspect-ratio: auto; padding: 25px; margin-bottom: 15px; flex-direction: row; justify-content: space-between; width: 100%; cursor: pointer;" onclick="openMarketSelection(${i})">
            <div style="text-align: right;">
                <div style="font-weight:800; font-size:1.5rem;">${item.task}</div>
                <div style="color:#059669; font-weight:bold;">${item.beez} ${getBeezIconHtml()} ${getBeezText(item.beez)}</div>
            </div>
            <span class="material-symbols-rounded" style="font-size: 3rem; color: #10b981;">emoji_events</span>
        </div>
    `).join('');
}

// Overlay the market purchase flow for one item.
function openMarketSelection(index) {
    const item = currentFamily.market[index];
    const overlay = document.createElement('div');
    overlay.id = "market-overlay";
    overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px;";
    overlay.innerHTML = `
        <div style="background:white; padding:30px; border-radius:30px; width:100%; max-width:400px; text-align:center;">
            <h2 style="margin-bottom:10px;">מי ביצע את המטלה?</h2>
            <p style="margin-bottom:20px; font-weight:bold;">${item.task}</p>
            <div style="display:grid; gap:10px;">
                ${currentFamily.children.map((child, ci) => `
                    <button onclick="processMarketWin(${index}, ${ci})" class="action-btn-blue" style="background:${child.color}20; border:2px solid ${child.color}; color:#333; padding:15px; font-size:1.2rem;">
                        ${child.name}
                    </button>
                `).join('')}
            </div>
            <button onclick="document.getElementById('market-overlay').remove()" class="back-btn" style="margin-top:20px; padding:10px 30px;">ביטול</button>
        </div>`;
    document.body.appendChild(overlay);
}

// Grant beez to a child and celebrate the win.
function processMarketWin(itemIndex, childIndex) {
    const item = currentFamily.market[itemIndex];
    const child = currentFamily.children[childIndex];
    
    let multiplier = 1;
    if (child.age <= 5) multiplier = 2;
    if (child.age >= 18) multiplier = 0;
    
    const finalBeez = item.beez * multiplier;
    if (!child.beez) child.beez = 0;
    child.beez += finalBeez;

    document.getElementById('market-overlay').remove();
    
    try {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: [child.color, '#FFD700'] });
    } catch(e) {}

    setTimeout(() => {
        alert(`כל הכבוד ${child.name}! צברת ${finalBeez} ${getBeezText(finalBeez)}!`);
        saveData();
        renderHeaderNav();
    }, 500);
}

// Populate hour/minute selectors used in event forms.
function initTimeSelectors() {
    const h = Array.from({length: 13}, (_, i) => (8 + i).toString().padStart(2, '0')).map(x => `<option value="${x}">${x}</option>`).join('');
    const m = ["00", "15", "30", "45"].map(x => `<option value="${x}">${x}</option>`).join('');
    ['start-h', 'end-h'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerHTML = h; });
    ['start-m', 'end-m'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerHTML = m; });
}

// Update the main clock display every second.
setInterval(() => { 
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = new Date().toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}); 
}, 1000);

// Build the routine cards for each child for the selected time.
// Build the routine cards for each child for the selected time.
function renderRoutine(type) {
    const container = document.getElementById('child-slider');
    if (!container) return;

    container.innerHTML = currentFamily.children.map((child, ci) => `
        <div class="routine-child-card">
            <div class="routine-child-header">
                <h2 style="color: ${child.color}">${child.name}</h2>
            </div>
            
            <div class="routine-tasks-list">
                ${child[type].map((task, ti) => `
                    <div class="routine-item" onclick="toggleTask(${ci}, '${type}', ${ti}, this)">
                        <span class="task-icon">${task.icon || '✨'}</span>
                        <span class="task-text">${task.task}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Mark a routine task as completed and show effects.
function toggleTask(childIdx, type, taskIdx, element) {
    element.classList.toggle('completed');
    
    // Add the sound and confetti if checked
    if (element.classList.contains('completed')) {
        try {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play();
            confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.8 },
                colors: [currentFamily.children[childIdx].color]
            });
        } catch(e) {}
    }
}

initTimeSelectors();
showView('home');