const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
let currentFamily = JSON.parse(localStorage.getItem('myFamilyConfig')) || FAMILY_DATA;
let weekOffset = 0; // 0 = current week, 1 = next week

// Splash screen (only once per session)
function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    
    if (!splash) return;
    
    // Only show splash once per session
    if (sessionStorage.getItem('splashShown')) {
        splash.style.display = 'none';
        return;
    }
    sessionStorage.setItem('splashShown', 'true');
    
    // Fade out after 2 seconds
    setTimeout(() => {
        splash.classList.add('fade-out');
        // Remove from DOM after animation completes
        setTimeout(() => {
            splash.style.display = 'none';
        }, 500);
    }, 2000);
}

// Initialize splash screen on load
document.addEventListener('DOMContentLoaded', initSplashScreen);

// Ensure required arrays exist
if (!currentFamily.children) currentFamily.children = [];
if (!currentFamily.market) currentFamily.market = [];
if (!currentFamily.events) currentFamily.events = [];

// Default collectLoomis to true if not set
if (currentFamily.collectLoomis === undefined) currentFamily.collectLoomis = true;

// Toggle Loomis collection on/off
function toggleCollectLoomis() {
    currentFamily.collectLoomis = !currentFamily.collectLoomis;
    saveData();
    updateLoomisToggleUI();
    renderSettings();
}

// Update the toggle button UI
function updateLoomisToggleUI() {
    const btn = document.getElementById('loomis-toggle-btn');
    if (btn) {
        if (currentFamily.collectLoomis) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

// Helper: check if Loomis collection is enabled
function isLoomisEnabled() {
    return currentFamily.collectLoomis !== false;
}

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

// Loomi icon and helpers
function getLoomiIconHtml() {
    return `<span class="loomi-icon"></span>`;
}

function getLoomiText(count) {
    return count === 1 ? "לומי" : "לומים";
}

// Map task names to Material Symbol icons
function getTaskIcon(taskName) {
    const name = (taskName || '').toLowerCase();
    
    // Hebrew keyword to icon mapping
    const iconMap = [
        // School/Backpack
        { keywords: ['תיק', 'ביה"ס', 'בית ספר', 'ילקוט'], icon: 'backpack' },
        // Food preparation
        { keywords: ['קופסת אוכל', 'אוכל', 'סנדוויץ', 'כריך'], icon: 'lunch_dining' },
        // Water
        { keywords: ['בקבוק', 'מים', 'שתייה'], icon: 'water_drop' },
        // Teeth brushing
        { keywords: ['שיניים', 'צחצוח', 'לצחצח'], icon: 'dentistry' },
        // Washing face
        { keywords: ['פנים', 'לשטוף', 'רחצה'], icon: 'wash' },
        // Breakfast
        { keywords: ['ארוחת בוקר', 'בוקר', 'לאכול'], icon: 'breakfast_dining' },
        // Getting dressed
        { keywords: ['להתלבש', 'בגדים', 'ללבוש'], icon: 'checkroom' },
        // Bedtime
        { keywords: ['לילה טוב', 'שינה', 'לישון'], icon: 'bedtime' },
        // Shower/Bath
        { keywords: ['מקלחת', 'אמבטיה', 'להתרחץ'], icon: 'shower' },
        // Hair
        { keywords: ['שיער', 'להסתרק', 'מברשת'], icon: 'face' },
        // Homework
        { keywords: ['שיעורי בית', 'לימודים', 'ללמוד'], icon: 'menu_book' },
        // Cleaning room
        { keywords: ['חדר', 'לסדר', 'ניקיון'], icon: 'cleaning_services' },
        // Shoes
        { keywords: ['נעליים', 'לנעול'], icon: 'steps' },
        // Hug
        { keywords: ['חיבוק'], icon: 'favorite' },
    ];
    
    // Find matching icon
    for (const mapping of iconMap) {
        for (const keyword of mapping.keywords) {
            if (name.includes(keyword)) {
                return `<i class="material-symbols-rounded chore-icon">${mapping.icon}</i>`;
            }
        }
    }
    
    // Default icon
    return `<i class="material-symbols-rounded chore-icon">task_alt</i>`;
}

function renderChildScore(child) {
    return `
        <span class="loomi-display">
            ${getLoomiIconHtml()}
            <span class="loomi-number">${child.loomis}</span>
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
        const childIndex = currentFamily.children.findIndex(c => c.id === child.id);
        return `<div class="child-nav-pill child-pill-assigned ${colorClass}" onclick="openChildPage(${childIndex})" style="cursor:pointer;">
            ${child.name}
        </div>`;
    }).join('');
}

// Clear every child's earned loomis.
function resetAllLoomis() {
    currentFamily.children.forEach(c => c.loomis = 0);
        saveData();
        renderSettings();
        renderHeaderNav();
    }

// Track currently open child page
let currentChildPageIndex = -1;

// Open a child's personal page
function openChildPage(childIndex) {
    currentChildPageIndex = childIndex;
    showView('child-page');
    renderChildPage(childIndex);
}

// Render the child's personal page
function renderChildPage(childIndex) {
    const child = currentFamily.children[childIndex];
    if (!child) return;
    
    // Ensure child has the new data fields
    if (child.bank === undefined) child.bank = 0;
    if (!child.memos) child.memos = [];
    
    const titleEl = document.getElementById('child-page-title');
    const contentEl = document.getElementById('child-page-content');
    const headerEl = document.getElementById('child-page-header');
    if (!contentEl) return;
    
    const colorClass = getChildColorByName(child.name);
    
    // Update header with title, loomis (if enabled), and back button
    if (headerEl) {
        const loomisHtml = isLoomisEnabled() ? `
            <div class="header-loomis">
                <span class="header-loomis-count">${child.loomis || 0}</span>
                <img src="loomi-icon.png" class="header-loomis-icon" alt="loomis">
            </div>
        ` : '';
        headerEl.innerHTML = `
            <h2 style="margin:0;">העמוד של ${child.name}</h2>
            ${loomisHtml}
            <button onclick="showView('home')" class="back-btn">חזרה</button>
        `;
    }
    
    contentEl.innerHTML = `
        <div class="child-page-grid">
            <!-- Virtual Bank Card -->
            <div class="child-page-card bank-card ${colorClass}">
                <h3><span class="material-symbols-rounded">savings</span> בנק<br><span class="card-subtitle">(כמה כסף יש לי אצל אמא ואבא)</span></h3>
                <div class="bank-display">
                    <span class="bank-currency">₪</span>
                    <input type="number" class="bank-amount-input" value="${child.bank || 0}" 
                           onchange="setChildBank(${childIndex}, this.value)" 
                           onclick="this.select()">
                    </div>
                <div class="bank-controls">
                    <button onclick="updateChildBank(${childIndex}, 100)" class="bank-btn plus">+100</button>
                    <button onclick="updateChildBank(${childIndex}, 10)" class="bank-btn plus">+10</button>
                    <button onclick="updateChildBank(${childIndex}, 1)" class="bank-btn plus">+1</button>
                    <button onclick="updateChildBank(${childIndex}, -1)" class="bank-btn minus">-1</button>
                    <button onclick="updateChildBank(${childIndex}, -10)" class="bank-btn minus">-10</button>
                    <button onclick="updateChildBank(${childIndex}, -100)" class="bank-btn minus">-100</button>
                </div>
                </div>

            <!-- Memos Card -->
            <div class="child-page-card memos-card ${colorClass}">
                <h3><span class="material-symbols-rounded">sticky_note_2</span> תזכורות</h3>
                <div class="memo-input-row">
                    <input type="text" id="new-memo-text" placeholder="מה לזכור?" class="memo-input">
                    <input type="date" id="new-memo-date" class="memo-date-input">
                    <button onclick="addMemo(${childIndex})" class="memo-add-btn">+</button>
                </div>
                <div class="memos-list">
                    ${renderMemosList(child, childIndex)}
                </div>
            </div>
        </div>
    `;
}

// Render the list of memos for a child
function renderMemosList(child, childIndex) {
    if (!child.memos || child.memos.length === 0) {
        return '<div class="no-memos">אין תזכורות עדיין</div>';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Separate active and overdue memos
    const activeMemos = [];
    const overdueMemos = [];
    
    child.memos.forEach((memo, i) => {
        if (memo.date) {
            const memoDate = new Date(memo.date);
            memoDate.setHours(0, 0, 0, 0);
            if (memoDate < today) {
                overdueMemos.push({ memo, index: i });
            } else {
                activeMemos.push({ memo, index: i });
            }
        } else {
            activeMemos.push({ memo, index: i });
        }
    });
    
    // Sort memos by date (dated memos first, then by date ascending; undated at end)
    activeMemos.sort((a, b) => {
        if (!a.memo.date && !b.memo.date) return 0;
        if (!a.memo.date) return 1;
        if (!b.memo.date) return -1;
        return new Date(a.memo.date) - new Date(b.memo.date);
    });
    
    // Sort overdue memos by date (earliest/most overdue first)
    overdueMemos.sort((a, b) => new Date(a.memo.date) - new Date(b.memo.date));
    
    let html = '';
    
    // Render active memos
    if (activeMemos.length > 0) {
        html += activeMemos.map(({ memo, index }) => {
            const dateStr = memo.date ? new Date(memo.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) : '';
            return `
                <div class="memo-item">
                    ${memo.date ? `<span class="memo-date-side">${dateStr}</span>` : ''}
                    <span class="memo-text">${memo.text}</span>
                    <button onclick="deleteMemo(${childIndex}, ${index})" class="del-chore-btn"></button>
            </div>
            `;
        }).join('');
    } else if (overdueMemos.length === 0) {
        html += '<div class="no-memos">אין תזכורות עדיין</div>';
    }
    
    // Render overdue memos section
    if (overdueMemos.length > 0) {
        html += `<div class="overdue-section">
            <div class="overdue-header">עבר התאריך</div>
            ${overdueMemos.map(({ memo, index }) => {
                const dateStr = new Date(memo.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
                return `
                    <div class="memo-item overdue">
                        <span class="memo-date-side overdue-date">${dateStr}</span>
                        <span class="memo-text">${memo.text}</span>
                        <div class="overdue-actions">
                            <div class="date-picker-wrapper">
                                <input type="date" id="update-memo-date-${index}" class="memo-date-update" 
                                       onchange="updateMemoDate(${childIndex}, ${index}, this.value)">
                                <span class="date-placeholder">בחר תאריך חדש</span>
                        </div>
                            <button onclick="deleteMemo(${childIndex}, ${index})" class="del-chore-btn"></button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>`;
    }
    
    return html;
}

// Update child's virtual bank (add/subtract)
function updateChildBank(childIndex, amount) {
    const child = currentFamily.children[childIndex];
    if (!child) return;
    
    if (child.bank === undefined) child.bank = 0;
    child.bank += amount;
    if (child.bank < 0) child.bank = 0; // Don't go negative
    
    saveData();
    renderChildPage(childIndex);
}

// Set child's bank to a specific value (manual edit)
function setChildBank(childIndex, value) {
    const child = currentFamily.children[childIndex];
    if (!child) return;
    
    const newValue = parseInt(value) || 0;
    child.bank = Math.max(0, newValue); // Don't go negative
    
    saveData();
    renderChildPage(childIndex);
}

// Add a new memo to a child
function addMemo(childIndex) {
    const textInput = document.getElementById('new-memo-text');
    const dateInput = document.getElementById('new-memo-date');
    
    const text = textInput ? textInput.value.trim() : '';
    const date = dateInput ? dateInput.value : '';
    
    if (!text) return;
    
    const child = currentFamily.children[childIndex];
    if (!child) return;
    
    if (!child.memos) child.memos = [];
    
    child.memos.unshift({
        id: Date.now(),
        text: text,
        date: date || null
    });
    
    saveData();
    renderChildPage(childIndex);
}

// Delete a memo from a child
function deleteMemo(childIndex, memoIndex) {
    const child = currentFamily.children[childIndex];
    if (!child || !child.memos) return;
    
    child.memos.splice(memoIndex, 1);
    saveData();
    renderChildPage(childIndex);
}

// Update a memo's date
function updateMemoDate(childIndex, memoIndex, newDate) {
    const child = currentFamily.children[childIndex];
    if (!child || !child.memos || !child.memos[memoIndex]) return;
    
    child.memos[memoIndex].date = newDate;
    saveData();
    renderChildPage(childIndex);
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

    updateLoomisToggleUI();
    renderEventsList();
    renderMarketSection();
    renderChildList();
}

function renderMarketSection() {
    const listContainer = document.getElementById('market-items-list');
    if (!listContainer) return;
    
    const marketItems = currentFamily.market || [];

    if (marketItems.length === 0) {
        listContainer.innerHTML = '<div style="color:#999; font-size:0.8rem; text-align:center; padding:10px;">אין משימות</div>';
        return;
    }

    const showLoomis = isLoomisEnabled();
    let html = '';
    marketItems.forEach((item, i) => {
        const loomisCount = item.loomis || 1;
        const loomisControls = showLoomis ? `
            <div class="task-loomi-controls">
                <button class="loomi-btn minus" onclick="updateMarketLoomis(${i}, -1)">-</button>
                <div class="loomi-display-inline">
                    <img src="loomi-icon.png" class="loomi-icon-medium" alt="">
                    <span class="loomi-count">${loomisCount}</span>
            </div>
                <button class="loomi-btn plus" onclick="updateMarketLoomis(${i}, 1)">+</button>
        </div>
        ` : '';
        html += `
            <div class="task-edit-row">
                <button class="del-chore-btn" onclick="currentFamily.market.splice(${i},1); saveData(); renderSettings();">✕</button>
                ${loomisControls}
                <span class="task-name"><strong>${item.task || ''}</strong></span>
            </div>`;
    });

    listContainer.innerHTML = html;
}

function renderChildList() {
    const childList = document.getElementById('settings-child-list');
    if (!childList) return;
    
    const children = currentFamily.children || [];

    let html = '';
    children.forEach((c, ci) => {
        const color = c.color || '#ccc';
        const name = c.name || 'ללא שם';
        const loomis = c.loomis || 0;
        
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
            
            choresHtml += '<div class="chore-edit-row" style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;direction:rtl;">';
            choresHtml += '<span style="display:flex;align-items:center;gap:8px;">' + icon + ' ' + taskText + '</span>';
            choresHtml += '<button class="del-chore-btn" onclick="' + deleteFunc + '" style="color:#FA6868;font-size:1.2rem;background:none;border:none;cursor:pointer;">✕</button>';
            choresHtml += '</div>';
        });

        html += '<div class="settings-child-card">';
        
        // Header with name, loomis count beneath name (if enabled), delete button
        html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
        html += '<div style="display:flex;flex-direction:column;gap:4px">';
        html += '<span style="font-weight:800;font-size:1.1rem">' + name + '</span>';
        if (isLoomisEnabled()) {
            html += '<div class="loomi-display-row">';
            html += '<span class="loomi-number">' + loomis + ' ' + getLoomiIconHtml() + '</span>';
            html += '<span class="reset-loomi-text" onclick="currentFamily.children[' + ci + '].loomis=0;saveData();renderSettings()">איפוס</span>';
            html += '</div>';
        }
        html += '</div>';
        html += '<button onclick="currentFamily.children.splice(' + ci + ',1);saveData();renderSettings();renderHeaderNav()" class="delete-child-pill">מחיקה</button>';
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
        html += '<div style="display:flex;gap:5px;margin-bottom:8px;align-items:stretch;">';
        html += '<button onclick="addChore(' + ci + ')" class="settings-card-btn add-btn-row" style="flex:1;">הוספה</button>';
        html += '<button onclick="addChoreToAll(' + ci + ')" class="settings-card-btn add-btn-row add-btn-orange" style="flex:1;">הוסף לכולם</button>';
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
    if (children.length > 0) {
        html += '<select id="copy-from-child" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0;font-size:0.9rem;margin-bottom:10px;box-sizing:border-box;background:#F8FAFC;">';
        html += '<option value="">העתק מ...</option>';
        children.forEach((c, ci) => {
            html += '<option value="' + ci + '">' + (c.name || 'ללא שם') + '</option>';
        });
        html += '</select>';
    }
    html += '<button onclick="addChild()" class="settings-card-btn" style="width:100%;padding:10px;font-size:0.9rem;">הוספה</button>';
    html += '</div>';
    
    childList.innerHTML = html;
}

// Adjust the loomis cost for a market item and refresh settings.
function updateMarketLoomis(index, change) {
    const currentLoomis = currentFamily.market[index].loomis || 1;
    currentFamily.market[index].loomis = Math.max(1, currentLoomis + change);
    saveData();
    renderSettings();
}

// Create a new market task and refresh the UI.
function addMarketItem() {
    const taskInput = document.getElementById('new-market-name');
    const taskValue = taskInput ? taskInput.value.trim() : '';
    
    if (taskValue) {
        // Add to beginning of list so new items appear at the top
        currentFamily.market.unshift({ id: Date.now(), task: taskValue, loomis: 1 });
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
        loomis: 0
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
        list.innerHTML = `<div style="color:#999; font-size:0.8rem; text-align:center; padding:10px;">אין אירועים</div>`;
        return;
    }

    list.innerHTML = events.map((ev, i) => {
        const child = currentFamily.children.find(c => c.id === ev.target);
        const repeatText = ev.repeat !== false ? ' 🔁' : '';
        
        // Show date for one-time events, day for weekly events
        let dateDisplay;
        if (ev.repeat === false && ev.date) {
            const d = new Date(ev.date);
            dateDisplay = `${d.getDate()}/${d.getMonth() + 1}`;
        } else {
            dateDisplay = DAYS[ev.day] + "'";
        }
        
        return `
            <div class="chore-edit-row" style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;direction:rtl;">
                <span>
                    ${dateDisplay} - <strong>${ev.name}</strong> (<span style="direction:ltr;">${ev.start}-${ev.end}</span>) 
                    ${child ? `- ${child.name}` : ''}${repeatText}
                </span>
                <button class="del-chore-btn" onclick="currentFamily.events.splice(${i},1); saveData(); renderSettings();" style="color:#FA6868;font-size:1.2rem;background:none;border:none;cursor:pointer;">✕</button>
            </div>`;
    }).join('');
}

// Toggle event mode between weekly and one-time
let eventMode = 'weekly'; // 'weekly' or 'once'

function setEventMode(mode) {
    eventMode = mode;
    const btnWeekly = document.getElementById('btn-weekly');
    const btnOnce = document.getElementById('btn-once');
    const daySelect = document.getElementById('event-day');
    const dateInput = document.getElementById('event-date');
    
    if (mode === 'weekly') {
        btnWeekly.classList.add('active');
        btnOnce.classList.remove('active');
        daySelect.style.display = '';
        dateInput.style.display = 'none';
    } else {
        btnWeekly.classList.remove('active');
        btnOnce.classList.add('active');
        daySelect.style.display = 'none';
        dateInput.style.display = '';
    }
}

// Save a new event from the settings form.
function addEvent() {
    const n = document.getElementById('event-name').value;
    const sh = document.getElementById('start-h').value;
    const sm = document.getElementById('start-m').value;
    const eh = document.getElementById('end-h').value;
    const em = document.getElementById('end-m').value;
    const t = document.getElementById('event-target').value;
    
    if(n) { 
        const isWeekly = eventMode === 'weekly';
        const event = {
            name: n,
            start: `${sh}:${sm}`,
            end: `${eh}:${em}`,
            target: t,
            repeat: isWeekly
        };
        
        if (isWeekly) {
            event.day = parseInt(document.getElementById('event-day').value);
        } else {
            const dateVal = document.getElementById('event-date').value;
            if (!dateVal) {
                alert('נא לבחור תאריך');
                return;
            }
            const date = new Date(dateVal);
            event.day = date.getDay(); // Get day of week from date
            event.date = dateVal; // Store the actual date
        }
        
        currentFamily.events.push(event);
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
    const dateInput = document.getElementById('event-date');
    const btnAdd = document.getElementById('btn-add-event');
    const btnUpdate = document.getElementById('btn-update-event');
    
    if (startH) startH.value = '08';
    if (startM) startM.value = '00';
    if (endH) endH.value = '08';
    if (endM) endM.value = '00';
    if (target) target.value = 'family';
    if (editIdx) editIdx.value = '-1';
    if (dateInput) dateInput.value = '';
    if (btnAdd) btnAdd.classList.remove('hidden');
    if (btnUpdate) btnUpdate.classList.add('hidden');
    
    // Reset to weekly mode
    setEventMode('weekly');
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

// Helper function to get color value based on child index
function getChildColorValueByName(childName) {
    const childIndex = currentFamily.children.findIndex(c => c.name === childName);
    return getChildColorValue(childIndex >= 0 ? childIndex : 0);
}

// Helper function to get color class based on child name
function getChildColorByName(childName) {
    if (!childName) return 'kid-color-1';
    const childIndex = currentFamily.children.findIndex(c => c.name === childName);
    return getChildColor(childIndex >= 0 ? childIndex : 0);
}

// Helper function to get event color class based on child name
function getEventColorByName(childName) {
    if (!childName) return 'event-color-1';
    const childIndex = currentFamily.children.findIndex(c => c.name === childName);
    const colorIndex = ((childIndex >= 0 ? childIndex : 0) % 10) + 1;
    return `event-color-${colorIndex}`;
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

function toggleWeek() {
    weekOffset = weekOffset === 0 ? 1 : 0;
    renderWeek();
}

// Get the start date (Sunday) of a week with given offset
function getWeekStart(offset = 0) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek + (offset * 7));
    sunday.setHours(0, 0, 0, 0);
    return sunday;
}

function renderWeek() {
    const grid = document.getElementById('week-grid');
    if (!grid) return;
    const today = new Date().getDay();
    const isNextWeek = weekOffset === 1;
    
    // Get the week's date range for filtering one-time events
    const weekStart = getWeekStart(weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Only highlight today when viewing current week
    const headerRow = DAYS.map((day, i) => `<th class="${!isNextWeek && i === today ? 'today-col' : ''}">${day}</th>`).join('');
    
    // Helper: convert time string to minutes for comparison
    const timeToMinutes = (time) => {
        if (!time) return 0;
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };
    
    // Helper: check if two events overlap
    const eventsOverlap = (ev1, ev2) => {
        const start1 = timeToMinutes(ev1.start);
        const end1 = timeToMinutes(ev1.end);
        const start2 = timeToMinutes(ev2.start);
        const end2 = timeToMinutes(ev2.end);
        return start1 < end2 && start2 < end1;
    };
    
    // Helper: group overlapping events
    const groupOverlappingEvents = (events) => {
        if (events.length === 0) return [];
        
        const groups = [];
        const used = new Set();
        
        for (let i = 0; i < events.length; i++) {
            if (used.has(i)) continue;
            
            const group = [events[i]];
            used.add(i);
            
            for (let j = i + 1; j < events.length; j++) {
                if (used.has(j)) continue;
                // Check if this event overlaps with any in the group
                if (group.some(ev => eventsOverlap(ev, events[j]))) {
                    group.push(events[j]);
                    used.add(j);
                }
            }
            groups.push(group);
        }
        return groups;
    };

    const bodyRow = DAYS.map((day, i) => {
        // Filter events for this day
        let eventsForDay = currentFamily.events.filter(ev => {
            // Weekly events (repeat !== false): show on matching day
            if (ev.repeat !== false) {
                return ev.day === i;
            }
            
            // One-time events: check if date falls in this week AND on this day
            if (ev.date) {
                const eventDate = new Date(ev.date);
                eventDate.setHours(12, 0, 0, 0); // Normalize time
                const isInWeek = eventDate >= weekStart && eventDate <= weekEnd;
                const isCorrectDay = eventDate.getDay() === i;
                return isInWeek && isCorrectDay;
            }
            
            return false;
        });
        
        // Sort events by start time
        eventsForDay.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
        
        // Collect memos with dates for this day from all children
        const memosForDay = [];
        currentFamily.children.forEach(child => {
            if (!child.memos) return;
            child.memos.forEach(memo => {
                if (memo.date) {
                    const memoDate = new Date(memo.date);
                    memoDate.setHours(12, 0, 0, 0);
                    const isInWeek = memoDate >= weekStart && memoDate <= weekEnd;
                    const isCorrectDay = memoDate.getDay() === i;
                    if (isInWeek && isCorrectDay) {
                        memosForDay.push({ ...memo, childName: child.name });
                    }
                }
            });
        });
        
        if (!eventsForDay.length && !memosForDay.length) {
            return `<td class="week-day-cell empty" data-day="${day}"></td>`;
        }

        // Group overlapping events
        const eventGroups = groupOverlappingEvents(eventsForDay);
        
        const eventsMarkup = eventGroups.map(group => {
            const isCollision = group.length > 1;
            const groupHtml = group.map(ev => {
                const isForEveryone = ev.target === 'family' || !ev.target;
                const child = currentFamily.children.find(c => c.id === ev.target);
                const childName = child ? child.name : '';
                const colorClass = isForEveryone ? 'event-everyone' : getEventColorByName(childName);
                return `
                    <div class="event-chip calendar-event ${colorClass} ${isCollision ? 'event-collision' : ''}">
                        <span class="event-title">${ev.name}</span>
                        <span class="event-time">${ev.start}-${ev.end}</span>
                    </div>
                `;
            }).join('');
            
            if (isCollision) {
                return `<div class="event-collision-group">${groupHtml}</div>`;
            }
            return groupHtml;
        }).join('');
        
        const memosMarkup = memosForDay.map(memo => {
            const colorClass = getEventColorByName(memo.childName);
            return `
                <div class="event-chip calendar-event calendar-memo ${colorClass}">
                    <span class="event-title"><span class="material-symbols-rounded memo-icon">sticky_note_2</span>${memo.text}</span>
                </div>
            `;
        }).join('');

        return `<td class="week-day-cell" data-day="${day}">${eventsMarkup}${memosMarkup}</td>`;
    }).join('');

    const buttonText = isNextWeek ? 'חזרה' : 'הצצה לשבוע הבא';

    grid.innerHTML = `
        <div class="week-table-wrapper">
            <table class="week-table">
                <thead><tr>${headerRow}</tr></thead>
                <tbody><tr>${bodyRow}</tr></tbody>
            </table>
        </div>
        <button onclick="toggleWeek()" class="peek-week-btn">${buttonText}</button>
    `;
    
    // Update the regular back button behavior when viewing next week
    const backBtn = document.querySelector('#view-week .back-btn');
    if (backBtn) {
        if (isNextWeek) {
            backBtn.onclick = function() { toggleWeek(); };
        } else {
            backBtn.onclick = function() { showView('home'); };
        }
    }
}

// Market sort state: 'high' = high to low, 'low' = low to high
let marketSortOrder = 'high';

function toggleMarketSort() {
    marketSortOrder = marketSortOrder === 'high' ? 'low' : 'high';
    renderMarket();
}

// Show all market items for purchase selection.
function renderMarket() {
    const container = document.getElementById('market-list');
    if (!container) return;
    if (currentFamily.market.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#64748b;">הבנק ריק כרגע... </div>`;
        return;
    }
    
    const showLoomis = isLoomisEnabled();
    
    // Create sorted copy with original indices
    const sortedItems = currentFamily.market.map((item, i) => ({ ...item, originalIndex: i }));
    if (showLoomis) {
        sortedItems.sort((a, b) => {
            const aLoomis = a.loomis || 1;
            const bLoomis = b.loomis || 1;
            return marketSortOrder === 'high' ? bLoomis - aLoomis : aLoomis - bLoomis;
        });
    }
    
    let html = '';
    if (showLoomis) {
        html += `
            <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
                <button onclick="toggleMarketSort()" class="sort-btn-icon">
                    <i class="material-symbols-rounded">swap_vert</i>
                </button>
            </div>
        `;
    }
    
    html += sortedItems.map(item => {
        const loomisDisplay = showLoomis ? `
            <div style="display: flex; align-items: center; gap: 8px;">
                ${getLoomiIconHtml()}
                <span style="font-weight:bold; font-size:0.9rem; color: #134686;">${item.loomis || 1}</span>
        </div>
        ` : '';
        return `
            <div class="task-bank-item" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; min-height: 70px;" onclick="openMarketSelection(${item.originalIndex})">
                <i class="material-symbols-rounded" style="font-size: 2rem; display: flex; align-items: center;">emoji_events</i>
                <div style="flex: 1; text-align: right; margin-right: 15px;">
                    <span style="font-weight:800; font-size:1.2rem; color: #134686;">${item.task}</span>
                </div>
                ${loomisDisplay}
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
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

// Grant loomis to a child (if enabled) and celebrate the win.
function processMarketWin(itemIndex, childIndex) {
    const item = currentFamily.market[itemIndex];
    const child = currentFamily.children[childIndex];
    
    // Only award loomis if collection is enabled
    if (isLoomisEnabled()) {
    let multiplier = 1;
    if (child.age <= 5) multiplier = 2;
    if (child.age >= 18) multiplier = 0;
    
        const finalLoomis = item.loomis * multiplier;
        if (!child.loomis) child.loomis = 0;
        child.loomis += finalLoomis;
    }

    document.getElementById('market-overlay').remove();
    
    try {
        // Short cute pop sound - same as routine check
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        audio.volume = 0.5;
        audio.play();
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
                        <span class="task-icon">${getTaskIcon(task.task)}</span>
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
            // Short cute pop sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            audio.volume = 0.5;
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