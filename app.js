// DAYS is now provided by i18n.js via getDays()
let currentFamily = JSON.parse(localStorage.getItem('myFamilyConfig')) || FAMILY_DATA;
window.currentFamily = currentFamily; // Make globally accessible for Firebase
let currentRoutineType = null; // Track which routine view is active (morning/evening)
let weekOffset = 0; // 0 = current week, 1 = next week

// Splash screen is now controlled by Firebase auth
// It stays visible as login background until user is authenticated

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
function saveData() {
    localStorage.setItem('myFamilyConfig', JSON.stringify(currentFamily));
    window.currentFamily = currentFamily; // This is vital for your renderer
    if (window.saveToFirebase) window.saveToFirebase();
}

// Global render function for Firebase real-time sync
window.renderAll = function() {
    currentFamily = window.currentFamily; // Update local from global
    if (typeof renderHeaderNav === 'function') renderHeaderNav();
    if (typeof renderWeek === 'function') renderWeek();
    if (typeof renderMemos === 'function') renderMemos();
    if (typeof renderDayCheckboxes === 'function') renderDayCheckboxes();
    // Re-render routine view if active (for Firebase sync)
    if (currentRoutineType && typeof renderRoutine === 'function') {
        renderRoutine(currentRoutineType);
    }
};

// Loomi icon and helpers
function getLoomiIconHtml() {
    return `<span class="loomi-icon"></span>`;
}

function getLoomiText(count) {
    return count === 1 ? t('loomiSingular') : t('loomiPlural');
}

// Icon cache - stores fetched SVG icons as data URIs in localStorage
const iconCache = JSON.parse(localStorage.getItem('loomi-icon-cache') || '{}');

function saveIconCache() {
    try {
        localStorage.setItem('loomi-icon-cache', JSON.stringify(iconCache));
    } catch (e) {
        console.warn('Could not save icon cache:', e);
    }
}

// Fetch an SVG icon from Iconify API (works from browser, no CORS issues)
async function fetchIconFromIconify(keyword) {
    // Try multiple icon sets in order of preference
    const searchTerms = [
        `material-symbols:${keyword}`,
        `mdi:${keyword}`,
        `fluent:${keyword}-24-regular`,
        `ion:${keyword}`,
        `ph:${keyword}`
    ];

    for (const term of searchTerms) {
        try {
            const response = await fetch(`https://api.iconify.design/${term}.svg?color=%235A9CB5&width=40&height=40`);
            if (response.ok) {
                const svg = await response.text();
                if (svg && svg.includes('<svg')) {
                    // Convert to data URI for persistent caching
                    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
                }
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// Download and cache an icon by keyword
async function downloadAndCacheIcon(keyword, cacheKey) {
    if (iconCache[cacheKey]) return iconCache[cacheKey];

    const dataUri = await fetchIconFromIconify(keyword);
    if (dataUri) {
        iconCache[cacheKey] = dataUri;
        saveIconCache();
        return dataUri;
    }
    return null;
}

// Map task names to Material Symbol icon names
function getTaskIcon(taskName) {
    const name = (taskName || '').toLowerCase();

    // Build keyword-to-icon mapping from both language translations
    const heKeywords = TRANSLATIONS.he.taskKeywords || [];
    const enKeywords = TRANSLATIONS.en.taskKeywords || [];
    const iconMap = [];
    for (let i = 0; i < heKeywords.length; i++) {
        iconMap.push({
            keywords: [...heKeywords[i].keywords, ...(enKeywords[i] ? enKeywords[i].keywords : [])],
            icon: heKeywords[i].icon
        });
    }

    // Find matching Material Symbol icon name
    let matchedIcon = 'task_alt'; // Default
    for (const mapping of iconMap) {
        for (const keyword of mapping.keywords) {
            if (name.includes(keyword)) {
                matchedIcon = mapping.icon;
                break;
            }
        }
        if (matchedIcon !== 'task_alt') break;
    }

    // For known icons, use Material Symbols font directly (already loaded)
    if (matchedIcon !== 'task_alt') {
        return `<span class="material-symbols-rounded chore-icon-material">${matchedIcon}</span>`;
    }

    // For unknown tasks, show default Material Symbol + attempt dynamic load
    const uniqueId = `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Extract a meaningful search keyword from the task name
    const words = name.split(/\s+/).filter(w => w.length > 2);
    const searchKeyword = words.length > 0 ? words[0] : '';

    return `<span class="material-symbols-rounded chore-icon-material" id="${uniqueId}" data-search-keyword="${searchKeyword}">task_alt</span>`;
}

// After rendering routine, try to fetch better icons for unknown tasks
function loadDynamicIcons() {
    document.querySelectorAll('.chore-icon-material[data-search-keyword]').forEach(el => {
        const keyword = el.getAttribute('data-search-keyword');
        if (!keyword) return;

        // Check cache first
        if (iconCache[keyword]) {
            // Replace Material Symbol span with cached <img>
            const img = document.createElement('img');
            img.src = iconCache[keyword];
            img.alt = '';
            img.className = 'chore-icon';
            el.replaceWith(img);
            return;
        }

        // Fetch from Iconify in the background
        downloadAndCacheIcon(keyword, keyword).then(dataUri => {
            if (dataUri && el.isConnected) {
                const img = document.createElement('img');
                img.src = dataUri;
                img.alt = '';
                img.className = 'chore-icon';
                el.replaceWith(img);
            }
        });
    });
}

// Make loadDynamicIcons available globally
window.loadDynamicIcons = loadDynamicIcons;

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
    if (viewId === 'settings') { sortEvents(); sortChores(); renderSettings(); }
    if (viewId === 'market') renderMarket();
    if (isRoutine) {
        // Update the routine page title based on type
        const routineTitle = document.querySelector('#view-routine h2');
        if (routineTitle) {
            routineTitle.textContent = viewId === 'morning' ? t('morningRoutine') : t('eveningRoutine');
        }
        currentRoutineType = viewId; // Track current routine type for Firebase sync
        renderRoutine(viewId);
    } else {
        currentRoutineType = null; // Not in routine view
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
            <h2 style="margin:0;">${getLang() === 'he' ? t('childPageOf') + ' ' + child.name : child.name + t('childPageOf')}</h2>
            ${loomisHtml}
            <button onclick="showView('home')" class="back-btn">${t('back')}</button>
        `;
    }
    
    contentEl.innerHTML = `
        <div class="child-page-grid">
            <!-- Virtual Bank Card -->
            <div class="child-page-card bank-card ${colorClass}">
                <h3><span class="material-symbols-rounded">savings</span> ${t('bank')}<br><span class="card-subtitle">${t('bankSubtitle')}</span></h3>
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
                <h3><span class="material-symbols-rounded">sticky_note_2</span> ${t('reminders')}</h3>
                <div class="memo-input-row">
                    <input type="text" id="new-memo-text" placeholder="${t('whatToRemember')}" class="memo-input">
                    <div class="memo-date-wrapper">
                        <input type="date" id="new-memo-date" class="memo-date-input" onchange="updateMemoDatePlaceholder(this);" onfocus="updateMemoDatePlaceholder(this);" onblur="updateMemoDatePlaceholder(this);">
                        <span class="memo-date-placeholder">${t('addDateOptional')}</span>
                </div>
                </div>
                <button onclick="addMemo(${childIndex})" class="memo-add-btn">${t('add')}</button>
                <div class="memos-list">
                    ${renderMemosList(child, childIndex)}
                </div>
            </div>
        </div>
    `;
    
    // Initialize placeholder visibility for date input
    setTimeout(() => {
        const dateInput = document.getElementById('new-memo-date');
        if (dateInput) {
            updateMemoDatePlaceholder(dateInput);
        }
    }, 0);
}

// Render the list of memos for a child
function renderMemosList(child, childIndex) {
    if (!child.memos || child.memos.length === 0) {
        return '<div class="no-memos">' + t('noReminders') + '</div>';
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
            const dateLocale = getLang() === 'he' ? 'he-IL' : 'en-US';
            const dateStr = memo.date ? new Date(memo.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'numeric' }) : '';
            return `
                <div class="memo-item">
                    ${memo.date ? `<span class="memo-date-side">${dateStr}</span>` : ''}
                    <span class="memo-text">${memo.text}</span>
                    <button onclick="deleteMemo(${childIndex}, ${index})" class="del-chore-btn"></button>
            </div>
            `;
        }).join('');
    } else if (overdueMemos.length === 0) {
        html += '<div class="no-memos">' + t('noReminders') + '</div>';
    }
    
    // Render overdue memos section
    if (overdueMemos.length > 0) {
        html += `<div class="overdue-section">
            <div class="overdue-header">${t('overdue')}</div>
            ${overdueMemos.map(({ memo, index }) => {
                const overdueLocale = getLang() === 'he' ? 'he-IL' : 'en-US';
                const dateStr = new Date(memo.date).toLocaleDateString(overdueLocale, { day: 'numeric', month: 'numeric' });
                return `
                    <div class="memo-item overdue">
                        <span class="memo-date-side overdue-date">${dateStr}</span>
                        <span class="memo-text">${memo.text}</span>
                        <div class="overdue-actions">
                            <div class="date-picker-wrapper">
                                <input type="date" id="update-memo-date-${index}" class="memo-date-update" 
                                       onchange="updateMemoDate(${childIndex}, ${index}, this.value)">
                                <span class="date-placeholder">${t('pickNewDate')}</span>
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

// Update memo date placeholder visibility
window.updateMemoDatePlaceholder = function(input) {
    const placeholder = input.parentElement.querySelector('.memo-date-placeholder');
    if (placeholder) {
        placeholder.style.display = input.value ? 'none' : 'block';
    }
};

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
window.renderSettings = renderSettings;
function renderSettings() {
    const targetSelect = document.getElementById('event-target');
    if (targetSelect) {
        targetSelect.innerHTML = `<option value="family">${t('everyone')}</option>` + 
            currentFamily.children.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        targetSelect.value = 'family';
        if (typeof resetEventForm === 'function') resetEventForm();
    }

    updateLoomisToggleUI();
    renderEventsList();
    renderMarketSection();
    renderChildList();
    
    // Ensure children section title is translated
    const childrenTitle = document.querySelector('.settings-section-title');
    if (childrenTitle) {
        childrenTitle.textContent = t('childrenSection');
    }
}

function renderMarketSection() {
    const listContainer = document.getElementById('market-items-list');
    if (!listContainer) return;
    
    const marketItems = currentFamily.market || [];

    if (marketItems.length === 0) {
        listContainer.innerHTML = '<div style="color:#999; font-size:0.8rem; text-align:center; padding:10px;">' + t('noTasks') + '</div>';
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
    
    // CRITICAL: Always read from window.currentFamily first (it's the source of truth)
    // Then fall back to currentFamily, then empty array
    const familyData = window.currentFamily || currentFamily;
    const children = (familyData && familyData.children) ? familyData.children : [];

    let html = '';
    children.forEach((c, ci) => {
        const color = c.color || '#ccc';
        const name = c.name || t('noName');
        const loomis = c.loomis || 0;
        
        // Build chores list - combine tasks that appear in both morning and evening
        let choresHtml = '';
        // CRITICAL: Read directly from the child object, not from a cached reference
        // This ensures we get the latest data even if arrays were modified
        const morningTasks = (c.morning && Array.isArray(c.morning)) ? c.morning : [];
        const eveningTasks = (c.evening && Array.isArray(c.evening)) ? c.evening : [];
        
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
            
            // Get days from morning task (if exists) or evening task
            const taskObj = occurrences.morning ? occurrences.morning.task : (occurrences.evening ? occurrences.evening.task : null);
            const days = taskObj && taskObj.days ? taskObj.days : null;
            
            let icon = '';
            if (hasMorning && hasEvening) {
                icon = '☀️🌙'; // Both icons
            } else if (hasMorning) {
                icon = '☀️';
            } else if (hasEvening) {
                icon = '🌙';
            }
            
            // Build days display if exists
            let daysDisplay = '';
            if (days && days.length > 0 && days.length < 7) {
                const daysShort = getDays();
                const dayLetters = days.sort((a, b) => a - b).map(d => daysShort[d]).join(',');
                daysDisplay = ' <span style="color:#94a3b8;font-size:0.7rem;">(' + dayLetters + ')</span>';
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
            
            // Create edit function
            const editFunc = `editChore(${ci}, '${taskTextEscaped}')`;
            
            choresHtml += '<div class="chore-edit-row event-list-row" style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9;">';
            choresHtml += '<span class="event-list-actions">';
            choresHtml += '<button onclick="' + editFunc + '" style="color:#5A9CB5;font-size:1.2rem;background:none;border:none;cursor:pointer;" title="' + t('edit') + '">✎</button>';
            choresHtml += '<button class="del-chore-btn" onclick="' + deleteFunc + '" style="color:#FA6868;font-size:1.2rem;background:none;border:none;cursor:pointer;">✕</button>';
            choresHtml += '</span>';
            choresHtml += '<span class="event-list-info" style="display:flex;align-items:center;gap:8px;text-align:right;flex:1;">' + icon + ' ' + taskText + daysDisplay + '</span>';
            choresHtml += '</div>';
        });

        html += '<div class="settings-child-card">';
        
        // Header with name, loomis count beneath name (if enabled), delete button
        html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
        html += '<div style="display:flex;flex-direction:column;gap:4px">';
        html += '<span style="font-weight:800;font-size:1.1rem">' + name + '</span>';
        if (isLoomisEnabled()) {
            html += '<div class="loomi-display-row">';
            html += '<span class="loomi-number">' + loomis + '</span>';
            html += getLoomiIconHtml();
            html += '<span class="reset-loomi-text" onclick="currentFamily.children[' + ci + '].loomis=0;saveData();renderSettings()">' + t('resetLoomis') + '</span>';
            html += '</div>';
        }
        html += '</div>';
        html += '<button onclick="currentFamily.children.splice(' + ci + ',1);saveData();renderSettings();renderHeaderNav()" class="delete-child-pill">' + t('deleteChild') + '</button>';
        html += '</div>';
        
        // Add chore input
        html += '<div style="display:flex;gap:4px;margin-bottom:8px;align-items:center;flex-wrap:nowrap">';
        html += '<input type="text" id="chore-in-' + ci + '" placeholder="' + t('newTask') + '" style="flex:1;min-width:80px;padding:4px 6px;border-radius:6px;border:1px solid #e2e8f0;font-size:0.75rem">';
        html += '<div class="chore-time-buttons" style="display:flex;gap:2px;align-items:center;flex-shrink:0;">';
        html += `<button type="button" id="chore-morning-${ci}" class="chore-time-btn active" onclick="setChoreTime(${ci}, 'morning')" title="${t('morningOption')}"><i class="material-symbols-rounded">wb_sunny</i></button>`;
        html += `<button type="button" id="chore-evening-${ci}" class="chore-time-btn" onclick="setChoreTime(${ci}, 'evening')" title="${t('eveningOption')}"><i class="material-symbols-rounded">dark_mode</i></button>`;
        html += `<button type="button" id="chore-both-${ci}" class="chore-time-btn" onclick="setChoreTime(${ci}, 'both')" title="${t('both')}"><i class="material-symbols-rounded">wb_sunny</i><i class="material-symbols-rounded">dark_mode</i></button>`;
        html += '</div>';
        html += '</div>';
        // Hidden input to track current selection
        html += '<input type="hidden" id="chore-time-' + ci + '" value="morning">';
        // Day selection for chores
        html += '<div id="chore-days-' + ci + '" class="day-checkboxes" style="margin-bottom:8px;"></div>';
        html += '<div style="display:flex;gap:5px;margin-bottom:8px;align-items:stretch;">';
        html += '<button onclick="addChore(' + ci + ')" class="settings-card-btn add-btn-row" style="flex:1;">' + t('add') + '</button>';
        html += '<button onclick="addChoreToAll(' + ci + ')" class="settings-card-btn add-btn-row add-btn-orange" style="flex:1;">' + t('addToAll') + '</button>';
        html += '</div>';
        
        // Chores list
        html += '<div style="max-height:150px;overflow-y:auto;font-size:0.8rem">';
        html += choresHtml || '<div style="color:#999;text-align:center;padding:10px">' + t('noChores') + '</div>';
        html += '</div>';
        
        html += '</div>';
    });
    
    // Render day checkboxes for all children after HTML is set
    setTimeout(() => {
        children.forEach((c, ci) => {
            renderChoreDayCheckboxes(ci);
        });
    }, 0);
    
    // Add the "Add Child" card at the end
    html += '<div class="settings-child-card" style="display:flex;flex-direction:column;justify-content:flex-start;align-items:stretch;">';
    html += '<h3>' +
        '<i class="material-symbols-rounded" style="font-size:1.2rem;">family_restroom</i> ' +
        t('addChild') + '</h3>';
    html += '<input type="text" id="new-child-name" placeholder="' + t('name') + '" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0;font-size:0.9rem;margin-bottom:10px;box-sizing:border-box;">';
    if (children.length > 0) {
        html += '<select id="copy-from-child" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e2e8f0;font-size:0.9rem;margin-bottom:10px;box-sizing:border-box;background:#F8FAFC;">';
        html += '<option value="">' + t('copyFrom') + '</option>';
        children.forEach((c, ci) => {
            html += '<option value="' + ci + '">' + (c.name || t('noName')) + '</option>';
        });
        html += '</select>';
    }
    html += '<button onclick="addChild()" class="settings-card-btn" style="width:100%;padding:10px;font-size:0.9rem;">' + t('add') + '</button>';
    html += '</div>';
    
    // CRITICAL: Force DOM update by setting innerHTML
    if (childList) {
        childList.innerHTML = html;
        // Force a reflow to ensure the browser processes the change
        void childList.offsetHeight;
    }
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

// Toggle chore time selection (morning/evening)
window.setChoreTime = function(childIndex, selection) {
    const morningBtn = document.getElementById(`chore-morning-${childIndex}`);
    const eveningBtn = document.getElementById(`chore-evening-${childIndex}`);
    const bothBtn = document.getElementById(`chore-both-${childIndex}`);
    const hiddenInput = document.getElementById(`chore-time-${childIndex}`);

    if (!morningBtn || !eveningBtn || !bothBtn || !hiddenInput) return;

    // 1. Reset all buttons to inactive
    morningBtn.classList.remove('active');
    eveningBtn.classList.remove('active');
    bothBtn.classList.remove('active');

    // 2. Activate only the selected button
    if (selection === 'morning') morningBtn.classList.add('active');
    if (selection === 'evening') eveningBtn.classList.add('active');
    if (selection === 'both') bothBtn.classList.add('active');

    // 3. Update the hidden input that your addChore functions read
    hiddenInput.value = selection;
};

// Edit a chore - populate the form
window.editChore = function(childIndex, taskText) {
    const input = document.getElementById(`chore-in-${childIndex}`);
    if (!input) return;

    const child = currentFamily.children[childIndex];
    if (!child) return;

    const morningTask = child.morning.find(t => t.task === taskText);
    const eveningTask = child.evening.find(t => t.task === taskText);
    if (!morningTask && !eveningTask) return;

    input.value = taskText;
    input.dataset.editingTask = taskText; // Crucial for removal logic
    input.dataset.editingChildIndex = childIndex;

    // Set buttons to "Update" mode
    const card = input.closest('.settings-child-card');
    const addBtn = card.querySelector('button.settings-card-btn:not(.add-btn-orange)');
    const allBtn = card.querySelector('button.add-btn-orange');

    if (addBtn) {
        addBtn.textContent = t('update');
        addBtn.setAttribute('onclick', `updateChore(${childIndex})`);
        addBtn.classList.add('update-mode-btn');
        // Keep add-btn-row for size properties
    }
    if (allBtn) {
        allBtn.textContent = t('updateAll');
        allBtn.setAttribute('onclick', `updateChoreToAll(${childIndex})`);
        allBtn.classList.add('update-mode-btn');
        // Keep add-btn-orange for size properties
    }

    // Populate Time Buttons & Checkboxes...
    const hasMorning = !!morningTask;
    const hasEvening = !!eveningTask;
    const timeSelection = (hasMorning && hasEvening) ? 'both' : (hasMorning ? 'morning' : 'evening');
    
    // Use setChoreTime to properly set the active button (single selection)
    setChoreTime(childIndex, timeSelection);

    const taskWithDays = morningTask || eveningTask;
    document.querySelectorAll(`#chore-days-${childIndex} .chore-day-checkbox`).forEach(cb => {
        cb.checked = taskWithDays?.days?.includes(parseInt(cb.value, 10)) || false;
    });
};

// Update a task for a specific child and reset UI
function updateChore(childIndex) {
    const input = document.getElementById(`chore-in-${childIndex}`);
    if (!input || !input.value.trim()) return;

    const oldTaskText = input.dataset.editingTask;
    const newTaskText = input.value.trim();
    const timeVal = document.getElementById(`chore-time-${childIndex}`).value;
    const selectedDays = getSelectedChoreDays(childIndex);
    const days = selectedDays.length > 0 ? selectedDays : undefined;

    const child = currentFamily.children[childIndex];
    if (!child) return;

    // 1. Filter out old task
    child.morning = child.morning.filter(t => t.task !== oldTaskText);
    child.evening = child.evening.filter(t => t.task !== oldTaskText);

    // 2. Add new task
    const taskData = { id: Date.now(), task: newTaskText };
    if (days) taskData.days = days;

    if (timeVal === 'both') {
        child.morning.unshift({ ...taskData });
        child.evening.unshift({ ...taskData, id: Date.now() + 1 });
    } else {
        child[timeVal].unshift(taskData);
    }

    // 3. Clear Metadata IMMEDIATELY to exit Edit Mode
    input.value = '';
    input.removeAttribute('data-editing-task');
    input.removeAttribute('data-editing-child-index');
    // Reset time buttons to default (morning)
    setChoreTime(childIndex, 'morning');

    // 4. Save and full UI refresh
    saveData();
    renderSettings(); // Calls renderChildList internally in your app.js
}

// Add a single chore to one child's routine.
function addChore(ci) {
    const input = document.getElementById(`chore-in-${ci}`);
    const v = input ? input.value.trim() : '';
    const t = document.getElementById(`chore-time-${ci}`).value;
    const selectedDays = getSelectedChoreDays(ci);
    // If no days selected, show every day (days = undefined or empty array means all days)
    const days = selectedDays.length > 0 ? selectedDays : undefined;
    
    if (v) {
        const taskData = {id: Date.now(), task: v};
        if (days) taskData.days = days;
        
        if (t === 'both') {
            currentFamily.children[ci].morning.unshift({...taskData});
            currentFamily.children[ci].evening.unshift({...taskData, id: Date.now() + 1});
        } else {
            currentFamily.children[ci][t].unshift(taskData);
        }
        input.value = '';
        // Clear day checkboxes
        document.querySelectorAll(`#chore-days-${ci} .chore-day-checkbox`).forEach(cb => cb.checked = false);
        // Reset time buttons to default (morning)
        setChoreTime(ci, 'morning');
        saveData();
        renderChildList();
    }
}

// Copy a chore to every child's routine list.
function addChoreToAll(ci) {
    const input = document.getElementById(`chore-in-${ci}`);
    const v = input ? input.value.trim() : '';
    const t = document.getElementById(`chore-time-${ci}`).value;
    const selectedDays = getSelectedChoreDays(ci);
    const days = selectedDays.length > 0 ? selectedDays : undefined;
    
    if (v) {
        // CRITICAL: Ensure we're modifying the same object that window.currentFamily points to
        const familyToModify = window.currentFamily || currentFamily;
        
        let addedToAny = false;
        familyToModify.children.forEach(c => {
            // Check if this child already has this task
            const hasTask = c.morning.some(t => t.task === v) || c.evening.some(t => t.task === v);
            if (hasTask) return; // Skip if already exists
            
            const taskData = {id: Date.now() + Math.random(), task: v};
            if (days) taskData.days = days;
            
            if (t === 'both') {
                c.morning.unshift({...taskData});
                c.evening.unshift({...taskData, id: Date.now() + Math.random() + 1});
            } else {
                c[t].unshift(taskData);
            }
            addedToAny = true;
        });
        
        // CRITICAL: Sync currentFamily to match window.currentFamily
        currentFamily = familyToModify;
        
        if (!addedToAny) {
            // Task already exists in all children, don't do anything but still clear form
            input.value = '';
            return;
        }
        
        input.value = '';
        // Clear day checkboxes
        document.querySelectorAll(`#chore-days-${ci} .chore-day-checkbox`).forEach(cb => cb.checked = false);
        // Reset time buttons to default (morning)
        setChoreTime(ci, 'morning');
        saveData();
        renderChildList();
    }
}

// Copy a chore to every child's routine list.
function updateChoreToAll(childIndex) {
    const input = document.getElementById(`chore-in-${childIndex}`);
    if (!input || !input.value.trim()) return;

    const oldTaskText = input.dataset.editingTask;
    const newTaskText = input.value.trim();
    const timeVal = document.getElementById(`chore-time-${childIndex}`).value;
    const selectedDays = getSelectedChoreDays(childIndex);
    const days = selectedDays.length > 0 ? selectedDays : undefined;

    // CRITICAL: Use window.currentFamily if available to ensure we modify the right object
    const familyToModify = window.currentFamily || currentFamily;

    // Apply to every child
    familyToModify.children.forEach(c => {
        c.morning = c.morning.filter(t => t.task !== oldTaskText);
        c.evening = c.evening.filter(t => t.task !== oldTaskText);

        const taskData = { id: Date.now() + Math.random(), task: newTaskText };
        if (days) taskData.days = days;

        if (timeVal === 'both') {
            c.morning.unshift({ ...taskData, id: Date.now() + Math.random() });
            c.evening.unshift({ ...taskData, id: Date.now() + Math.random() + 1 });
        } else {
            c[timeVal].unshift(taskData);
        }
    });

    // Sync currentFamily to match
    currentFamily = familyToModify;

    // Reset Input
    input.value = '';
    input.removeAttribute('data-editing-task');
    input.removeAttribute('data-editing-child-index');
    // Reset time buttons to default (morning)
    setChoreTime(childIndex, 'morning');

    saveData();
    renderSettings(); // Triggers the full UI rebuild
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
        alert(t('nameExists'));
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
            // Deep copy morning tasks (including days property)
            newChild.morning = sourceChild.morning.map(t => {
                const newTask = {
                    id: Date.now() + Math.random(),
                    task: t.task
                };
                if (t.days) newTask.days = [...t.days]; // Copy days array if it exists
                return newTask;
            });
            // Deep copy evening tasks (including days property)
            newChild.evening = sourceChild.evening.map(t => {
                const newTask = {
                    id: Date.now() + Math.random() + 1000,
                    task: t.task
                };
                if (t.days) newTask.days = [...t.days]; // Copy days array if it exists
                return newTask;
            });
        }
    }
    
    currentFamily.children.push(newChild);
    
    nameInput.value = '';
    if (copyFromSelect) copyFromSelect.value = '';
    saveData();
    renderSettings();
    renderHeaderNav();
}

// Sort events array in-place: weekly by day (Sun first), then one-time by date
function sortEvents() {
    if (!currentFamily.events) return;
    currentFamily.events.sort((a, b) => {
        const aWeekly = a.repeat !== false;
        const bWeekly = b.repeat !== false;
        if (aWeekly && !bWeekly) return -1;
        if (!aWeekly && bWeekly) return 1;
        if (aWeekly && bWeekly) return a.day - b.day;
        return (a.date || '').localeCompare(b.date || '');
    });
}

// Sort chores for each child (by task text alphabetically)
function sortChores() {
    if (!currentFamily.children) return;
    currentFamily.children.forEach(child => {
        if (child.morning) {
            child.morning.sort((a, b) => (a.task || '').localeCompare(b.task || ''));
        }
        if (child.evening) {
            child.evening.sort((a, b) => (a.task || '').localeCompare(b.task || ''));
        }
    });
}

// Rebuild the list of scheduled events in settings.
function renderEventsList() {
    const list = document.getElementById('settings-event-list');
    if (!list) return;
    
    const events = currentFamily.events || [];

    if (events.length === 0) {
        list.innerHTML = `<div style="color:#999; font-size:0.8rem; text-align:center; padding:10px;">${t('noEvents')}</div>`;
        return;
    }

    list.innerHTML = events.map((ev, i) => {
        const child = currentFamily.children.find(c => c.id === ev.target);
        
        // Show date for one-time events, day for weekly events
        let dateDisplay;
        if (ev.repeat === false && ev.date) {
            const d = new Date(ev.date);
            dateDisplay = `${d.getDate()}/${d.getMonth() + 1}`;
        } else {
            dateDisplay = getDays()[ev.day] + "'";
        }
        
        return `
            <div class="chore-edit-row event-list-row">
                <span class="event-list-info">
                    ${dateDisplay} - <strong>${ev.name}</strong> (<span style="direction:ltr;">${ev.start}-${ev.end}</span>)${child ? ` - ${child.name}` : ''}
                </span>
                <span class="event-list-actions">
                    <button onclick="editEvent(${i})" style="color:#5A9CB5;font-size:1.2rem;background:none;border:none;cursor:pointer;" title="${t('edit')}">✎</button>
                    <button onclick="currentFamily.events.splice(${i},1); saveData(); renderSettings();" class="del-chore-btn"></button>
                </span>
            </div>`;
    }).join('');
}

// Toggle event mode between weekly and one-time
let eventMode = 'weekly'; // 'weekly' or 'once'

// Render the day checkboxes for multi-day selection
function renderDayCheckboxes() {
    const container = document.getElementById('event-day-checkboxes');
    if (!container) return;
    const daysShort = getDays();
    container.innerHTML = daysShort.map((dayLetter, i) => `
        <label class="day-checkbox-label">
            <input type="checkbox" class="day-checkbox" value="${i}">
            <span class="day-checkbox-pill">${dayLetter}</span>
        </label>
    `).join('');
}

// Render day checkboxes for chore selection
function renderChoreDayCheckboxes(childIndex) {
    const container = document.getElementById('chore-days-' + childIndex);
    if (!container) return;
    const daysShort = getDays();
    container.innerHTML = daysShort.map((dayLetter, i) => `
        <label class="day-checkbox-label">
            <input type="checkbox" class="chore-day-checkbox" value="${i}">
            <span class="day-checkbox-pill">${dayLetter}</span>
        </label>
    `).join('');
}

// Get selected days for a chore
function getSelectedChoreDays(childIndex) {
    const checkboxes = document.querySelectorAll(`#chore-days-${childIndex} .chore-day-checkbox:checked`);
    return Array.from(checkboxes).map(cb => parseInt(cb.value, 10));
}

function getSelectedDays() {
    const checkboxes = document.querySelectorAll('.day-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function setSelectedDays(days) {
    const checkboxes = document.querySelectorAll('.day-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = days.includes(parseInt(cb.value));
    });
}

function setEventMode(mode) {
    eventMode = mode;
    const btnWeekly = document.getElementById('btn-weekly');
    const btnOnce = document.getElementById('btn-once');
    const dayCheckboxes = document.getElementById('event-day-checkboxes');
    const dateInput = document.getElementById('event-date');
    
    if (mode === 'weekly') {
        btnWeekly.classList.add('active');
        btnOnce.classList.remove('active');
        if (dayCheckboxes) dayCheckboxes.style.display = '';
        if (dateInput) dateInput.style.display = 'none';
    } else {
        btnWeekly.classList.remove('active');
        btnOnce.classList.add('active');
        if (dayCheckboxes) dayCheckboxes.style.display = 'none';
        if (dateInput) dateInput.style.display = '';
    }
}

// Save a new event from the settings form.
function addEvent() {
    const n = document.getElementById('event-name').value;
    const sh = document.getElementById('start-h').value;
    const sm = document.getElementById('start-m').value;
    const eh = document.getElementById('end-h').value;
    const em = document.getElementById('end-m').value;
    const tgt = document.getElementById('event-target').value;
    
    if(n) { 
        const isWeekly = eventMode === 'weekly';
        
        if (isWeekly) {
            const selectedDays = getSelectedDays();
            if (selectedDays.length === 0) {
                alert(getLang() === 'he' ? 'בחר לפחות יום אחד' : 'Select at least one day');
                return;
            }
            // Create one event per selected day (add to top)
            selectedDays.reverse().forEach(day => {
                currentFamily.events.unshift({
                    name: n,
                    start: `${sh}:${sm}`,
                    end: `${eh}:${em}`,
                    target: tgt,
                    repeat: true,
                    day: day
                });
            });
        } else {
            const dateVal = document.getElementById('event-date').value;
            if (!dateVal) {
                alert(getLang() === 'he' ? 'בחר תאריך' : 'Please select a date');
                return;
            }
            const date = new Date(dateVal);
            currentFamily.events.unshift({
                name: n,
                start: `${sh}:${sm}`,
                end: `${eh}:${em}`,
                target: tgt,
                repeat: false,
                day: date.getDay(),
                date: dateVal
            });
        }
        
        saveData();
        resetEventForm();
        renderSettings(); 
    }
}

function editEvent(index) {
    const ev = currentFamily.events[index];
    if (!ev) return;
    
    const nameEl = document.getElementById('event-name');
    const startH = document.getElementById('start-h');
    const startM = document.getElementById('start-m');
    const endH = document.getElementById('end-h');
    const endM = document.getElementById('end-m');
    const targetEl = document.getElementById('event-target');
    const editIdx = document.getElementById('edit-event-idx');
    const btnAdd = document.getElementById('btn-add-event');
    const btnUpdate = document.getElementById('btn-update-event');
    const btnCancel = document.getElementById('btn-cancel-edit');
    
    // Set the mode (weekly or once)
    if (ev.repeat === false) {
        setEventMode('once');
        const dateInput = document.getElementById('event-date');
        if (dateInput) dateInput.value = ev.date || '';
    } else {
        setEventMode('weekly');
        setSelectedDays([ev.day]);
    }
    
    if (nameEl) nameEl.value = ev.name;
    if (startH) startH.value = ev.start.split(':')[0];
    if (startM) startM.value = ev.start.split(':')[1];
    updateEndHourOptions();
    if (endH) endH.value = ev.end.split(':')[0];
    if (endM) endM.value = ev.end.split(':')[1];
    if (targetEl) targetEl.value = ev.target;
    if (editIdx) editIdx.value = index;
    if (btnAdd) {
        btnAdd.classList.add('hidden');
    }
    if (btnUpdate) {
        btnUpdate.classList.remove('hidden');
        btnUpdate.classList.add('update-mode-btn');
    }
    if (btnCancel) btnCancel.classList.remove('hidden');
    
    // Scroll to the event form
    const form = document.querySelector('.add-event-card');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateEvent() {
    const idx = parseInt(document.getElementById('edit-event-idx').value, 10);
    if (isNaN(idx) || idx < 0) return;

    const n = document.getElementById('event-name').value;
    const sh = document.getElementById('start-h').value;
    const sm = document.getElementById('start-m').value;
    const eh = document.getElementById('end-h').value;
    const em = document.getElementById('end-m').value;
    const tgt = document.getElementById('event-target').value;
    const isWeekly = eventMode === 'weekly';

    if (n) {
        if (isWeekly) {
            const selectedDays = getSelectedDays();
            if (selectedDays.length === 0) {
                alert(getLang() === 'he' ? 'בחר לפחות יום אחד' : 'Select at least one day');
                return;
            }
            // Update the original event with the first selected day
            currentFamily.events[idx] = { 
                ...currentFamily.events[idx], 
                name: n, day: selectedDays[0], 
                start: `${sh}:${sm}`, end: `${eh}:${em}`, 
                target: tgt, repeat: true, date: undefined 
            };
            // Add new events for additional selected days
            for (let i = 1; i < selectedDays.length; i++) {
                currentFamily.events.push({
                    name: n, day: selectedDays[i],
                    start: `${sh}:${sm}`, end: `${eh}:${em}`,
                    target: tgt, repeat: true
                });
            }
        } else {
            const dateVal = document.getElementById('event-date').value;
            if (!dateVal) {
                alert(getLang() === 'he' ? 'בחר תאריך' : 'Please select a date');
                return;
            }
            const date = new Date(dateVal);
            currentFamily.events[idx] = { 
                ...currentFamily.events[idx], 
                name: n, day: date.getDay(), 
                start: `${sh}:${sm}`, end: `${eh}:${em}`, 
                target: tgt, repeat: false, date: dateVal 
            };
        }
        saveData();
        resetEventForm();
        renderSettings();
    }
}

function cancelEditEvent() {
    resetEventForm();
}

function resetEventForm() {
    document.getElementById('event-name').value = '';
    // Uncheck all day checkboxes
    document.querySelectorAll('.day-checkbox').forEach(cb => cb.checked = false);
    
    const startH = document.getElementById('start-h');
    const startM = document.getElementById('start-m');
    const endH = document.getElementById('end-h');
    const endM = document.getElementById('end-m');
    const target = document.getElementById('event-target');
    const editIdx = document.getElementById('edit-event-idx');
    const dateInput = document.getElementById('event-date');
    const btnAdd = document.getElementById('btn-add-event');
    const btnUpdate = document.getElementById('btn-update-event');
    const btnCancel = document.getElementById('btn-cancel-edit');
    
    if (startH) startH.value = '00';
    if (startM) startM.value = '00';
    resetEndHourOptions();
    if (endH) endH.value = '00';
    if (endM) endM.value = '00';
    if (target) target.value = 'family';
    if (editIdx) editIdx.value = '-1';
    if (dateInput) dateInput.value = '';
    if (btnAdd) {
        btnAdd.classList.remove('hidden');
    }
    if (btnUpdate) {
        btnUpdate.classList.add('hidden');
        btnUpdate.classList.remove('update-mode-btn');
    }
    if (btnCancel) btnCancel.classList.add('hidden');
    
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
    const headerRow = getDays().map((day, i) => `<th class="${!isNextWeek && i === today ? 'today-col' : ''}">${day}</th>`).join('');
    
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

    const bodyRow = getDays().map((day, i) => {
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
                    <div class="event-chip calendar-event ${colorClass} ${isCollision ? 'event-collision' : ''}" onclick="toggleEventExpanded(this, event)">
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
                <div class="event-chip calendar-event calendar-memo ${colorClass}" onclick="toggleEventExpanded(this, event)">
                    <span class="event-title"><span class="material-symbols-rounded memo-icon">sticky_note_2</span>${memo.text}</span>
                </div>
            `;
        }).join('');

        return `<td class="week-day-cell" data-day="${day}">${eventsMarkup}${memosMarkup}</td>`;
    }).join('');

    const buttonText = isNextWeek ? t('backToThisWeek') : t('peekNextWeek');

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

// Toggle event expanded state - closes other events and handles outside clicks
window.toggleEventExpanded = function(element, event) {
    // Stop event propagation to prevent immediate closing
    if (event) {
        event.stopPropagation();
    }
    
    // Close all other expanded events first
    const allExpanded = document.querySelectorAll('.event-chip.expanded');
    allExpanded.forEach(expanded => {
        if (expanded !== element) {
            expanded.classList.remove('expanded');
        }
    });
    
    // Toggle the clicked event
    element.classList.toggle('expanded');
    
    // If we just expanded, set up a click listener to close when clicking outside
    if (element.classList.contains('expanded')) {
        // Use setTimeout to avoid immediate trigger from the current click
        setTimeout(() => {
            const closeOnOutsideClick = (e) => {
                // If click is not on this element or its children, close it
                if (!element.contains(e.target)) {
                    element.classList.remove('expanded');
                    document.removeEventListener('click', closeOnOutsideClick);
                }
            };
            // Add listener after a short delay to avoid immediate trigger
            setTimeout(() => {
                document.addEventListener('click', closeOnOutsideClick, { once: true });
            }, 100);
        }, 10);
    }
};

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
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#64748b;">${t('bankEmpty')}</div>`;
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
                <div style="flex: 1; text-align: start; margin-inline-start: 15px;">
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
            <h2 style="margin-bottom:10px;">${t('whoDidTask')}</h2>
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
            <button onclick="document.getElementById('market-overlay').remove()" class="back-btn" style="margin-top:20px; padding:10px 30px;">${t('cancel')}</button>
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
    const allHours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(x => `<option value="${x}">${x}</option>`).join('');
    const m = ["00", "15", "30", "45"].map(x => `<option value="${x}">${x}</option>`).join('');
    ['start-h', 'end-h'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerHTML = allHours; });
    ['start-m', 'end-m'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerHTML = m; });
    
    // When start hour changes, filter end hour to only show from start hour onwards
    const startH = document.getElementById('start-h');
    if (startH) {
        startH.addEventListener('change', updateEndHourOptions);
    }
}

function updateEndHourOptions() {
    const startH = document.getElementById('start-h');
    const endH = document.getElementById('end-h');
    if (!startH || !endH) return;
    
    const startVal = parseInt(startH.value);
    const currentEndVal = endH.value;
    
    // Rebuild end hour options from start hour to 23
    endH.innerHTML = Array.from({length: 24 - startVal}, (_, i) => (startVal + i).toString().padStart(2, '0'))
        .map(x => `<option value="${x}">${x}</option>`).join('');
    
    // Keep previous end hour selection if still valid, otherwise default to start hour
    if (parseInt(currentEndVal) >= startVal) {
        endH.value = currentEndVal;
    } else {
        endH.value = startVal.toString().padStart(2, '0');
    }
}

// Reset end hour options back to full range (called after adding/editing an event)
function resetEndHourOptions() {
    const endH = document.getElementById('end-h');
    if (!endH) return;
    endH.innerHTML = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'))
        .map(x => `<option value="${x}">${x}</option>`).join('');
}

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
                ${child[type].map((task, originalIdx) => {
                    // Filter tasks by current day if they have days specified
                    if (task.days && task.days.length > 0) {
                        const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
                        if (!task.days.includes(today)) return ''; // Skip but preserve original index
                    }
                    const taskId = `task-${ci}-${type}-${originalIdx}`;
                    const isCompleted = task.completed ? 'completed' : '';
                    return `
                    <div class="routine-item ${isCompleted}" id="${taskId}" onclick="toggleTask(${ci}, '${type}', ${originalIdx}, this)">
                        <span class="task-icon">${getTaskIcon(task.task)}</span>
                        <span class="task-text">${task.task}</span>
                    </div>
                `;
                }).join('')}
            </div>
        </div>
        `;
    }).join('');
    
    // Load dynamic icons after rendering
    setTimeout(loadDynamicIcons, 100);
}

// Mark a routine task as completed and show effects.
function toggleTask(childIdx, type, taskIdx, element) {
    element.classList.toggle('completed');
    
    // Save the completion state to data
    const isCompleted = element.classList.contains('completed');
    if (currentFamily.children[childIdx] && currentFamily.children[childIdx][type][taskIdx]) {
        currentFamily.children[childIdx][type][taskIdx].completed = isCompleted;
        saveData(); // This will sync to Firebase
    }
    
    // Add the sound and confetti if checked
    if (isCompleted) {
        try {
            // Short cute pop sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            audio.volume = 0.5;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => console.log('Audio play failed:', error));
            }
            confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#FAAC68', '#FACE68', '#E77F1A']
            });
        } catch(e) {
            console.log('Sound error:', e);
        }
        
        // Award Loomis if enabled
        if (isLoomisEnabled()) {
            currentFamily.children[childIdx].loomis = (currentFamily.children[childIdx].loomis || 0) + 1;
            saveData();
        }

        // Check if ALL visible tasks for this child are now completed
        checkAllTasksDone(childIdx, type);
    }
}

// Check if all visible tasks are done and show big celebration
function checkAllTasksDone(childIdx, type) {
    const child = currentFamily.children[childIdx];
    if (!child) return;

    const today = new Date().getDay();
    // Get only the tasks visible today (same filter logic as renderRoutine)
    const visibleTasks = child[type].filter(task => {
        if (task.days && task.days.length > 0) {
            return task.days.includes(today);
        }
        return true;
    });

    if (visibleTasks.length === 0) return;
    const allDone = visibleTasks.every(task => task.completed);
    if (!allDone) return;

    // All tasks completed — big celebration!
    setTimeout(() => {
        // Multi-burst confetti shower
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = ['#FAAC68', '#FACE68', '#E77F1A', '#5A9CB5', '#134686', '#ff6b6b', '#48dbfb', '#feca57'];

        (function frame() {
            confetti({
                particleCount: 8,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: colors
            });
            confetti({
                particleCount: 8,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors: colors
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();

        // Show celebration popup
        const msgKey = type === 'morning' ? 'wellDoneMorning' : 'wellDoneEvening';
        const message = t(msgKey).replace('{name}', child.name);
        showCelebrationPopup(message, type);

        // Play a celebration sound
        try {
            const cheerAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
            cheerAudio.volume = 0.6;
            const playPromise = cheerAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }
        } catch(e) {}
    }, 400);
}

// Show a beautiful celebration popup
function showCelebrationPopup(message, type) {
    // Remove any existing popup
    const existing = document.getElementById('celebration-popup');
    if (existing) existing.remove();

    const isMorning = type === 'morning';
    const popup = document.createElement('div');
    popup.id = 'celebration-popup';
    popup.innerHTML = `
        <div class="celebration-content">
            <div class="celebration-icon">
                <span class="material-symbols-rounded">${isMorning ? 'emoji_events' : 'stars'}</span>
            </div>
            <div class="celebration-message">${message}</div>
            <button class="celebration-close" onclick="this.closest('#celebration-popup').remove()">
                <span class="material-symbols-rounded celebration-btn-icon">${isMorning ? 'rocket_launch' : 'bedtime'}</span>
                ${t('back')}
            </button>
        </div>
    `;
    document.body.appendChild(popup);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
        if (popup.isConnected) {
            popup.style.animation = 'celebrationFadeOut 0.5s ease forwards';
            setTimeout(() => { if (popup.isConnected) popup.remove(); }, 500);
        }
    }, 6000);
}

initTimeSelectors();
renderDayCheckboxes();

// Wait for Firebase auth to determine what to show
// The main content visibility is controlled by Firebase onAuthStateChanged in index.html
window.showAppContent = function() {
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
    // Apply language to dynamic content after rendering
    if (typeof applyLanguage === 'function') applyLanguage();
showView('home');
};

window.showPolicy = (type) => {
    const content = type === 'privacy' 
        ? "LOOMI collects your email for login and saves your routine data securely in Google Firebase. We do not share your data."
        : "LOOMI is a tool for personal and family use. Users are responsible for their own account security and passwords.";
    alert(content);
};