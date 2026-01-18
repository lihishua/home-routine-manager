const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
let currentFamily = JSON.parse(localStorage.getItem('myFamilyConfig')) || FAMILY_DATA;

// Persist the active family configuration to storage.
function saveData() { localStorage.setItem('myFamilyConfig', JSON.stringify(currentFamily)); }

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
    nav.innerHTML = currentFamily.children.map(c => `<div class="child-nav-pill" style="border-bottom-color: ${c.color}">${c.name}</div>`).join('');
}

// Clear every child’s earned stars after confirmation.
function resetAllStars() {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל הכוכבים של הילדים?')) {
        currentFamily.children.forEach(c => c.stars = 0);
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
    }
    
    const childList = document.getElementById('settings-child-list');
    if (childList) {
        childList.innerHTML = currentFamily.children.map((c, ci) => `
            <div class="settings-section" style="border-right: 8px solid ${c.color}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h3 style="display:inline-block; margin-left:10px;">${c.name}</h3>
                        <span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:10px; font-weight:bold;">
                            ⭐ ${c.stars || 0}
                        </span>
                    </div>
                    <button onclick="currentFamily.children.splice(${ci},1); renderSettings(); saveData();" class="delete-bin-btn-small">🗑️</button>
                </div>
                
                <div style="display:flex; gap:5px; margin: 15px 0; flex-wrap:wrap;">
                    <input type="text" id="ci-${ci}" placeholder="מטלה..." style="flex:1; padding:8px; border-radius:10px; border:1px solid #ddd;">
                    <select id="ct-${ci}"><option value="morning">☀️</option><option value="evening">🌙</option></select>
                    <button onclick="addChore(${ci})" class="action-btn-blue">הוספה</button>
                    <button onclick="addChoreToAll(${ci})" class="action-btn-purple">לכולם ✨</button>
                </div>

                <div style="background:#f8fafc; border-radius:10px;">
                    ${c.morning.map((m, mi) => `<div class="chore-edit-row"><span>☀️ ${m.task}</span><button class="delete-bin-btn-small" onclick="currentFamily.children[${ci}].morning.splice(${mi},1); renderSettings(); saveData();">🗑️</button></div>`).join('')}
                    ${c.evening.map((e, ei) => `<div class="chore-edit-row"><span>🌙 ${e.task}</span><button class="delete-bin-btn-small" onclick="currentFamily.children[${ci}].evening.splice(${ei},1); renderSettings(); saveData();">🗑️</button></div>`).join('')}
                </div>
            </div>`).join('');
            
        // Append the global reset button under the child list
        childList.innerHTML += `
            <button onclick="resetAllStars()" class="back-btn" style="background:#f1f5f9; color:#64748b; margin-top:10px; width:100%; padding:15px;">
                איפוס כוכבים לכולם 🔄
            </button>`;
    }

    renderEventsList();
    renderSettingsMarket(); 
}

// Render the market manager card inside settings.
function renderSettingsMarket() {
    const container = document.getElementById('settings-market-manager');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-section market-manager-card">
            <h3 style="display:flex; align-items:center; justify-content:flex-end; gap:10px;">
                ניהול שוק המטלות 🛒
            </h3>
            <div style="display:flex; gap:10px; margin: 15px 0; flex-direction: row-reverse;">
                <input type="text" id="new-market-task" placeholder="מטלה חדשה לשוק..." 
                       style="flex:1; padding:12px; border-radius:12px; border:1px solid #e2e8f0; text-align:right;">
                <button onclick="addMarketTask()" class="add-market-btn">הוספה</button>
            </div>
            <div id="settings-market-list">
                ${currentFamily.market.map((item, i) => `
                    <div class="market-edit-row">
                        <div class="star-stepper">
                            <button onclick="updateMarketStar(${i}, 1)">+</button>
                            <span class="star-count">${item.stars || 1} ⭐</span>
                            <button onclick="updateMarketStar(${i}, -1)">-</button>
                        </div>
                        <div style="display:flex; align-items:center; gap:15px; flex:1; justify-content:flex-end;">
                            <span class="market-task-name">${item.task}</span>
                            <button class="delete-bin-btn-small" onclick="currentFamily.market.splice(${i},1); renderSettings(); saveData();">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Adjust the star cost for a market item and refresh settings.
function updateMarketStar(index, change) {
    let currentStars = currentFamily.market[index].stars || 1;
    currentStars = Math.max(1, currentStars + change); 
    currentFamily.market[index].stars = currentStars;
    saveData();
    renderSettings();
}

// Create a new market task and refresh the UI.
function addMarketTask() {
    const taskInput = document.getElementById('new-market-task');
    if(taskInput.value) {
        currentFamily.market.push({ task: taskInput.value, stars: 1, id: Date.now() });
        taskInput.value = '';
        saveData();
        renderSettings();
    }
}

// Add a single chore to one child’s routine.
function addChore(ci) {
    const v = document.getElementById(`ci-${ci}`).value;
    const t = document.getElementById(`ct-${ci}`).value;
    if(v) { currentFamily.children[ci][t].push({id: Date.now(), task: v}); renderSettings(); saveData(); }
}

// Copy a chore to every child’s routine list.
function addChoreToAll(ci) {
    const v = document.getElementById(`ci-${ci}`).value;
    const t = document.getElementById(`ct-${ci}`).value;
    if(v) { currentFamily.children.forEach(c => c[t].push({id: Date.now()+Math.random(), task:v})); renderSettings(); saveData(); }
}

// Show or hide the event creation form.
function toggleEventForm() { document.getElementById('event-form-container').classList.toggle('hidden'); }

// Rebuild the list of scheduled events in settings.
function renderEventsList() {
    document.getElementById('actual-events-list').innerHTML = currentFamily.events.map((ev, i) => `
        <div class="chore-edit-row">
            <span>${DAYS[ev.day]}' - ${ev.name} (<span style="direction:ltr; display:inline-block;">${ev.start}-${ev.end}</span>)</span>
            <button class="delete-bin-btn-small" onclick="currentFamily.events.splice(${i},1); renderSettings(); saveData();">🗑️</button>
        </div>`).join('');
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
        currentFamily.events.push({ name: n, day: parseInt(d), start: `${sh}:${sm}`, end: `${eh}:${em}`, target: t }); 
        toggleEventForm(); 
        saveData();
        renderSettings(); 
    }
}

// Draw the weekly grid with events per day.
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
                <div style="color:#059669; font-weight:bold;">⭐ ${item.stars} כוכבים</div>
            </div>
            <span class="material-symbols-rounded" style="font-size: 3rem; color: #10b981;">stars</span>
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

// Grant stars to a child and celebrate the win.
function processMarketWin(itemIndex, childIndex) {
    const item = currentFamily.market[itemIndex];
    const child = currentFamily.children[childIndex];
    
    let multiplier = 1;
    if (child.age <= 5) multiplier = 2;
    if (child.age >= 18) multiplier = 0;
    
    const finalStars = item.stars * multiplier;
    if (!child.stars) child.stars = 0;
    child.stars += finalStars;

    document.getElementById('market-overlay').remove();
    
    try {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: [child.color, '#FFD700'] });
    } catch(e) {}

    setTimeout(() => {
        alert(`כל הכבוד ${child.name}! צברת ${finalStars} כוכבים!`);
        saveData();
        renderHeaderNav();
    }, 500);
}

// Populate hour/minute selectors used in event forms.
function initTimeSelectors() {
    const h = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(x => `<option value="${x}">${x}</option>`).join('');
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
function renderRoutine(type) {
    const container = document.getElementById('child-slider');
    if (!container) return;

    // Build a card for every child
    container.innerHTML = currentFamily.children.map((child, ci) => `
        <div class="routine-child-card" style="border-top: 10px solid ${child.color}">
            <div class="routine-child-header">
                <span style="font-size:2rem;">${child.icon || '👤'}</span>
                <h2>${child.name}</h2>
                <div class="routine-type-tag">${type === 'morning' ? '☀️ בוקר' : '🌙 ערב'}</div>
            </div>
            
            <div class="routine-tasks-list">
                ${child[type].map((task, ti) => `
                    <div class="routine-item" onclick="toggleTask(${ci}, '${type}', ${ti}, this)">
                        <div class="task-check-circle"></div>
                        <span class="task-text">${task.task}</span>
                        <span style="margin-right:auto;">${task.icon || '✨'}</span>
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