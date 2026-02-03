const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
let currentFamily = JSON.parse(localStorage.getItem('myFamilyConfig')) || FAMILY_DATA;

// Splash screen removed

// Ensure required arrays exist
if (!currentFamily.children) currentFamily.children = [];
if (!currentFamily.market) currentFamily.market = [];
if (!currentFamily.events) currentFamily.events = [];

// Remove duplicate children based on name (case-insensitive, trimmed)
function removeDuplicateChildren() {
    const seen = new Set();
    const unique = [];
    
    currentFamily.children.forEach(child => {
        if (!child.name) {
            // Keep children without names (they'll need to be fixed manually)
            unique.push(child);
            return;
        }
        
        const nameKey = child.name.toLowerCase().trim();
        if (!seen.has(nameKey)) {
            seen.add(nameKey);
            unique.push(child);
        }
        // If duplicate found, skip it (keeping the first occurrence)
    });
    
    if (unique.length !== currentFamily.children.length) {
        currentFamily.children = unique;
        saveData();
        return true; // Indicates duplicates were removed
    }
    return false;
}

// Clean up duplicates on load
removeDuplicateChildren();

// Persist the active family configuration to storage.
function saveData() { localStorage.setItem('myFamilyConfig', JSON.stringify(currentFamily)); }

// Beez icon and helpers (now using orange icon)
const BEE_IMG = "orange-icon.svg"; // Using SVG for better quality and scalability

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
    document.querySelectorAll('.view').forEach(v => {
        v.classList.add('hidden');
        v.style.opacity = '0';
        v.style.pointerEvents = 'none';
    });
    
    // Determine if we are going into routine mode
    const isRoutine = (viewId === 'morning' || viewId === 'evening');
    const tid = isRoutine ? 'view-routine' : `view-${viewId}`;
    
    const target = document.getElementById(tid);
    if (target) {
        target.classList.remove('hidden');
        target.style.opacity = '1';
        target.style.pointerEvents = 'auto';
    }
    
    if (viewId === 'week') renderWeek();
    if (viewId === 'settings') renderSettings();
    if (viewId === 'market') renderMarket();
    if (isRoutine) {
        // Update the routine page title based on type
        const routineTitle = document.querySelector('#view-routine h2');
        if (routineTitle) {
            routineTitle.textContent = viewId === 'morning' ? 'שגרת בוקר' : 'שגרת ערב';
        }
        renderRoutine(viewId);
    }
    
    renderHeaderNav();
}

// Rebuild the header pills that show each child.
function renderHeaderNav() {
    const nav = document.getElementById('header-kids-nav');
    if (!nav) return;
    
    // Filter out duplicates when rendering (safety measure)
    const seen = new Set();
    const uniqueChildren = currentFamily.children.filter(child => {
        if (!child.name) return true; // Keep children without names
        const nameKey = child.name.toLowerCase().trim();
        if (seen.has(nameKey)) {
            return false; // Skip duplicate
        }
        seen.add(nameKey);
        return true;
    });
    
    nav.innerHTML = uniqueChildren.map((child, index) => {
        const colorClass = getChildColorByName(child.name);
        return `<div class="child-nav-pill child-pill-assigned ${colorClass}">
            ${child.name}
        </div>`;
    }).join('');
}

// Clear every child's earned beez.
function resetAllBeez() {
    currentFamily.children.forEach(c => c.beez = 0);
        saveData();
        renderSettings();
        renderHeaderNav();
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
            <div class="chore-edit-row" style="padding:4px 0; font-size:0.75rem; border-bottom:1px solid #e2e8f0;">
                <span style="flex:1;">
                    <strong>${item.task || ''}</strong>
                </span>
                <div style="display:flex;align-items:center;gap:5px;">
                    <div class="bee-counter">
                        <button onclick="updateMarketBeez(${i}, 1)">+</button>
                        <img src="${BEE_IMG}" alt="beez" style="width:15px;height:15px;">
                        <button onclick="updateMarketBeez(${i}, -1)">-</button>
                    </div>
                    <button class="del-chore-btn" onclick="currentFamily.market.splice(${i},1); saveData(); renderSettings();"><img src="https://thumbs.dreamstime.com/b/computer-generated-illustration-recycle-bin-icon-isolated-white-background-suitable-logo-delete-icon-button-175612353.jpg" alt="מחיקה"></button>
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
        
        // Build chores list - combine tasks that appear in both morning and evening
        let choresHtml = '';
        const morningTasks = c.morning || [];
        const eveningTasks = c.evening || [];
        
        // Create a map of task text to its occurrences
        const taskMap = new Map();
        
        // Add morning tasks
        morningTasks.forEach((t, ti) => {
            const taskText = t.task || '';
            if (!taskMap.has(taskText)) {
                taskMap.set(taskText, { morning: null, evening: null });
            }
            taskMap.get(taskText).morning = { index: ti, task: t };
        });
        
        // Add evening tasks
        eveningTasks.forEach((t, ti) => {
            const taskText = t.task || '';
            if (!taskMap.has(taskText)) {
                taskMap.set(taskText, { morning: null, evening: null });
            }
            taskMap.get(taskText).evening = { index: ti, task: t };
        });
        
        // Render each unique task
        taskMap.forEach((occurrences, taskText) => {
            const hasMorning = occurrences.morning !== null;
            const hasEvening = occurrences.evening !== null;
            
            let icon = '';
            if (hasMorning && hasEvening) {
                icon = '☀️🌙'; // Both icons
            } else if (hasMorning) {
                icon = '☀️';
            } else if (hasEvening) {
                icon = '🌙';
            }
            
            // Create delete function that removes from both if needed
            // Use task text to find and remove, since indices might change
            const taskTextEscaped = taskText.replace(/'/g, "\\'");
            let deleteFunc = '';
            if (hasMorning && hasEvening) {
                deleteFunc = `(function(){const ci=${ci};const taskText='${taskTextEscaped}';const child=currentFamily.children[ci];const mIdx=child.morning.findIndex(t=>t.task===taskText);const eIdx=child.evening.findIndex(t=>t.task===taskText);if(mIdx>=0)child.morning.splice(mIdx,1);if(eIdx>=0)child.evening.splice(eIdx,1);saveData();renderSettings();})()`;
            } else if (hasMorning) {
                deleteFunc = `(function(){const ci=${ci};const taskText='${taskTextEscaped}';const child=currentFamily.children[ci];const mIdx=child.morning.findIndex(t=>t.task===taskText);if(mIdx>=0)child.morning.splice(mIdx,1);saveData();renderSettings();})()`;
            } else if (hasEvening) {
                deleteFunc = `(function(){const ci=${ci};const taskText='${taskTextEscaped}';const child=currentFamily.children[ci];const eIdx=child.evening.findIndex(t=>t.task===taskText);if(eIdx>=0)child.evening.splice(eIdx,1);saveData();renderSettings();})()`;
            }
            
            choresHtml += '<div class="chore-edit-row" style="display:flex;align-items:center;gap:5px;padding:4px 0;border-bottom:1px solid #f1f5f9">';
            choresHtml += '<button class="del-chore-btn" onclick="' + deleteFunc + '"><img src="https://thumbs.dreamstime.com/b/computer-generated-illustration-recycle-bin-icon-isolated-white-background-suitable-logo-delete-icon-button-175612353.jpg" alt="מחיקה"></button>';
            choresHtml += '<span>' + icon + ' ' + taskText + '</span>';
            choresHtml += '</div>';
        });

        html += '<div class="settings-child-card">';
        
        // Header with name, beez count beneath name, delete button
        html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
        html += '<div style="display:flex;flex-direction:column;gap:4px">';
        html += '<span style="font-weight:800;font-size:1.1rem">' + name + '</span>';
        html += '<div class="beez-display-row">';
        html += '<span class="beez-number">' + beez + ' ' + getBeezIconHtml() + '</span>';
        html += '<span class="reset-beez-text" onclick="currentFamily.children[' + ci + '].beez=0;saveData();renderSettings()">איפוס</span>';
        html += '</div>';
        html += '</div>';
        html += '<button onclick="currentFamily.children.splice(' + ci + ',1);saveData();renderSettings()" class="delete-child-pill">מחיקה</button>';
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
        html += '<button onclick="addChoreToAll(' + ci + ')" class="add-to-all-btn" style="flex:1;font-size:0.8rem">הוסף לכולם</button>';
        html += '</div>';
        
        // Chores list
        html += '<div style="max-height:150px;overflow-y:auto;font-size:0.8rem">';
        html += choresHtml || '<div style="color:#999;text-align:center;padding:10px">אין מטלות</div>';
        html += '</div>';
        
        html += '</div>';
    });
    
    // Add the "Add Child" card at the end
    html += '<div class="settings-child-card" style="display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch;">';
    html += '<h3>' +
        '<i class="material-symbols-rounded" style="font-size:1.2rem;">family_restroom</i> ' +
        'הוסף ילד</h3>';
    html += '<input type="text" id="new-child-name" placeholder="שם..." style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0;font-size:0.9rem;margin-bottom:10px;box-sizing:border-box;">';
    html += '<select id="copy-from-child" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0;font-size:0.9rem;margin-bottom:10px;box-sizing:border-box;background:#F8FAFC;">';
    html += '<option value="">העתק מ...</option>';
    children.forEach((c, ci) => {
        html += '<option value="' + ci + '">' + (c.name || 'ללא שם') + '</option>';
    });
    html += '</select>';
    html += '<button onclick="addChild()" class="settings-card-btn" style="width:100%;padding:10px;font-size:0.9rem;">הוספה</button>';
    html += '</div>';
    
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
    
    // Check for duplicate names (case-insensitive, trimmed)
    const nameLower = name.toLowerCase();
    const duplicateExists = currentFamily.children.some(child => 
        child.name && child.name.toLowerCase().trim() === nameLower
    );
    
    if (duplicateExists) {
        // Show error message
        alert('שם זה כבר קיים! אנא בחר שם אחר.');
        nameInput.focus();
        nameInput.style.borderColor = '#FA6868'; // Coral red border
        nameInput.style.borderWidth = '2px';
        // Reset border after 2 seconds
        setTimeout(() => {
            nameInput.style.borderColor = '';
            nameInput.style.borderWidth = '';
        }, 2000);
        return;
    }
    
    const copyFromSelect = document.getElementById('copy-from-child');
    const copyFromIndex = copyFromSelect ? copyFromSelect.value : '';
    
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c'];
    const color = colors[currentFamily.children.length % colors.length];
    
    // Initialize new child
    const newChild = {
        id: 'child-' + Date.now(),
        name: name,
        color: color,
        morning: [],
        evening: [],
        beez: 0
    };
    
    // Copy chores from selected child if specified
    if (copyFromIndex !== '' && copyFromIndex !== null) {
        const sourceChild = currentFamily.children[parseInt(copyFromIndex)];
        if (sourceChild) {
            // Deep copy morning tasks
            newChild.morning = sourceChild.morning.map(t => ({
                id: Date.now() + Math.random(),
                task: t.task
            }));
            // Deep copy evening tasks
            newChild.evening = sourceChild.evening.map(t => ({
                id: Date.now() + Math.random() + 1000,
                task: t.task
            }));
        }
    }
    
    currentFamily.children.push(newChild);
    
    nameInput.value = '';
    if (copyFromSelect) copyFromSelect.value = '';
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
                <button class="del-chore-btn" onclick="currentFamily.events.splice(${i},1); saveData(); renderSettings();"><img src="https://thumbs.dreamstime.com/b/computer-generated-illustration-recycle-bin-icon-isolated-white-background-suitable-logo-delete-icon-button-175612353.jpg" alt="מחק ילד"></button>
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
// Helper function to get child color based on index (fallback)
function getChildColor(index) {
    const colorIndex = (index % 10) + 1;
    return `kid-color-${colorIndex}`;
}

// Helper function to get color value based on child name
function getChildColorValueByName(childName) {
    if (!childName) return '#5A9CB5';
    const name = childName.toLowerCase().trim();
    // Try Hebrew names first
    if (name === 'עידו' || name === 'ido') return '#5A9CB5'; // כחול עמוק
    if (name === 'לני' || name === 'lani') return '#9C27B0'; // סגול של לני
    if (name === 'לורי' || name === 'lori') return '#8BC34A'; // ירוק של לורי
    if (name === 'אמא' || name === 'mom' || name === 'amom') return '#E91E63'; // ורוד/מג'נטה של אמא
    // Fallback
    return '#5A9CB5';
}

// Helper function to get color class based on child name
function getChildColorByName(childName) {
    if (!childName) return 'kid-color-1';
    const name = childName.toLowerCase().trim();
    // Try Hebrew names first
    if (name === 'עידו' || name === 'ido') return 'pill-עידו';
    if (name === 'לני' || name === 'lani') return 'pill-לני';
    if (name === 'לורי' || name === 'lori') return 'pill-לורי';
    if (name === 'אמא' || name === 'mom' || name === 'amom') return 'pill-אמא';
    // Fallback to index-based if name doesn't match
    return 'kid-color-1';
}

// Helper function to get event color class based on child name
function getEventColorByName(childName) {
    if (!childName) return 'event-ido';
    const name = childName.toLowerCase().trim();
    // Try Hebrew names first
    if (name === 'עידו' || name === 'ido') return 'event-עידו';
    if (name === 'לני' || name === 'lani') return 'event-לני';
    if (name === 'לורי' || name === 'lori') return 'event-לורי';
    if (name === 'אמא' || name === 'mom' || name === 'amom') return 'event-אמא';
    // Fallback
    return 'event-ido';
}

// Helper function to get button color class based on child name
function getButtonColorByName(childName) {
    if (!childName) return 'btn-ido';
    const name = childName.toLowerCase().trim();
    // Try Hebrew names first
    if (name === 'עידו' || name === 'ido') return 'btn-עידו';
    if (name === 'לני' || name === 'lani') return 'btn-לני';
    if (name === 'לורי' || name === 'lori') return 'btn-לורי';
    if (name === 'אמא' || name === 'mom' || name === 'amom') return 'btn-אמא';
    // Fallback
    return 'btn-ido';
}

function getChildColorValue(index) {
    const colors = {
        1: '#5A9CB5', // Bee Blue
        2: '#FA6868', // Bee Coral
        3: '#FACE68', // Bee Yellow
        4: '#8BC34A', // Leafy Green
        5: '#9C27B0', // Deep Grape
        6: '#FF9800', // Honey Orange
        7: '#00BCD4', // Bright Teal
        8: '#795548', // Earthy Brown
        9: '#E91E63', // Strawberry Red
        10: '#3F51B5' // Royal Blue
    };
    const colorIndex = (index % 10) + 1;
    return colors[colorIndex] || colors[1];
}

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
            const childName = child ? child.name : '';
            const colorClass = childName ? getEventColorByName(childName) : 'event-ido';
            return `
                <div class="event-chip calendar-event ${colorClass}">
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
        <div class="task-bank-item" style="cursor: pointer; justify-content: space-between;" onclick="openMarketSelection(${i})">
            <i class="material-symbols-rounded" style="font-size: 2rem;">emoji_events</i>
            <div style="flex: 1; text-align: right; margin-right: 15px;">
                <div style="font-weight:800; font-size:1.2rem; margin-bottom: 5px; color: #134686;">${item.task}</div>
                <div style="font-weight:bold; font-size:0.9rem; color: #134686; display: flex; align-items: center; justify-content: flex-end; gap: 4px;">${item.beez} ${getBeezIconHtml()} ${getBeezText(item.beez)}</div>
            </div>
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
                ${currentFamily.children.map((child, ci) => {
                    const buttonClass = getButtonColorByName(child.name);
                    return `
                    <button onclick="processMarketWin(${index}, ${ci})" class="modal-child-btn ${buttonClass}">
                        ${child.name}
                    </button>
                    `;
                }).join('')}
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
        // Cute bell/chime sound
        new Audio('https://assets.mixkit.co/active_storage/sfx/1041/1041-preview.mp3').play();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FAAC68', '#FACE68', '#E77F1A'] }); // Orange confetti
    } catch(e) {}

    setTimeout(() => {
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

    container.innerHTML = currentFamily.children.map((child, ci) => {
        const colorClass = getChildColorByName(child.name);
        const colorValue = getChildColorValueByName(child.name);
        return `
        <div class="routine-child-card">
            <div class="routine-child-header">
                <h2 class="${colorClass}" style="color: #134686">${child.name}</h2>
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
        `;
    }).join('');
}

// Mark a routine task as completed and show effects.
function toggleTask(childIdx, type, taskIdx, element) {
    element.classList.toggle('completed');
    
    // Add the sound and confetti if checked
    if (element.classList.contains('completed')) {
        try {
            // Cute, gentle chime sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1041/1041-preview.mp3');
            audio.volume = 0.6; // Make it softer
            // Handle promise for play() which may be blocked
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Autoplay was prevented
                    console.log('Audio play failed:', error);
                });
            }
            confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#FAAC68', '#FACE68', '#E77F1A'] // Orange confetti colors
            });
        } catch(e) {
            console.log('Sound error:', e);
        }
    }
}

initTimeSelectors();

// Show main content immediately (no splash screen)
const header = document.querySelector('header');
const main = document.querySelector('main');
if (header) {
    header.style.opacity = '1';
    header.style.pointerEvents = 'auto';
}
if (main) {
    main.style.opacity = '1';
    main.style.pointerEvents = 'auto';
}

showView('home');