// Internationalization - Language translations
const TRANSLATIONS = {
    he: {
        // Days
        days: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
        daysFull: ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "שבת"],
        
        // Loomi
        loomiSingular: 'לומי',
        loomiPlural: 'לומים',
        collectLoomis: 'איסוף לומים',
        resetLoomis: 'איפוס',
        
        // Home page
        morning: 'בוקר',
        evening: 'ערב',
        taskBank: 'בנק משימות',
        weekView: 'מה קורה השבוע?',
        settingsBtn: 'ניהול והגדרות',
        
        // Routine
        morningRoutine: 'שגרת בוקר',
        eveningRoutine: 'שגרת ערב',
        back: 'חזרה',
        
        // Market / Task bank
        taskBankTitle: 'בנק המטלות',
        bankEmpty: 'הבנק ריק כרגע...',
        whoDidTask: 'מי ביצע את המטלה?',
        cancel: 'ביטול',
        
        // Week view
        weekTitle: 'מה קורה השבוע?',
        peekNextWeek: 'הצצה לשבוע הבא',
        backToThisWeek: 'חזרה',
        
        // Child page
        myPage: 'העמוד שלי',
        childPageOf: 'העמוד של',
        bank: 'בנק',
        bankSubtitle: '(כמה כסף יש לי אצל אמא ואבא)',
        reminders: 'תזכורות',
        whatToRemember: 'מה לזכור?',
        noReminders: 'אין תזכורות עדיין',
        overdue: 'עבר התאריך',
        pickNewDate: 'בחר תאריך חדש',
        
        // Settings
        saveAndClose: 'שמור וסגור',
        addEvent: 'הוסף אירוע',
        weekly: 'שבועי',
        specificDate: 'תאריך ספציפי',
        whatsHappening: 'מה קורה?',
        everyone: 'כולם',
        add: 'הוספה',
        update: 'עדכון',
        noEvents: 'אין אירועים',
        addTask: 'הוסף משימה',
        whatToDo: 'מה שעושים?',
        noTasks: 'אין משימות',
        addChild: 'הוסף ילד',
        name: 'שם...',
        copyFrom: 'העתק מ...',
        noName: 'ללא שם',
        deleteChild: 'מחיקה',
        newTask: 'מטלה חדשה...',
        morningOption: '☀️ בוקר',
        eveningOption: '🌙 ערב',
        bothOption: '🌤️ שניהם',
        addToAll: 'הוסף לכולם',
        noChores: 'אין מטלות',
        nameExists: 'שם זה כבר קיים! אנא בחר שם אחר.',
        pleaseSelectDate: 'נא לבחור תאריך',
        logout: 'התנתק',
        loading: 'טוען...',
        
        // Auth
        login: 'התחברות',
        signUp: 'הרשמה',
        forgotPassword: 'שכחתי סיסמא',
        guestEntry: 'כניסה כאורח',
        emailPlaceholder: 'אימייל',
        passwordPlaceholder: 'סיסמה',
        loginFailed: 'ההתחברות נכשלה. בדוק אימייל/סיסמה.',
        enterEmailFirst: 'נא להזין כתובת אימייל קודם.',
        resetEmailSent: 'נשלח! בדוק את תיבת המייל שלך.',
        
        // Task icon keywords (Hebrew)
        taskKeywords: [
            { keywords: ['תיק', 'ביה"ס', 'בית ספר', 'ילקוט'], icon: 'backpack' },
            { keywords: ['קופסת אוכל', 'אוכל', 'סנדוויץ', 'כריך'], icon: 'lunch_dining' },
            { keywords: ['בקבוק', 'מים', 'שתייה'], icon: 'water_drop' },
            { keywords: ['שיניים', 'צחצוח', 'לצחצח'], icon: 'dentistry' },
            { keywords: ['פנים', 'לשטוף', 'רחצה'], icon: 'wash' },
            { keywords: ['ארוחת בוקר', 'בוקר', 'לאכול'], icon: 'breakfast_dining' },
            { keywords: ['להתלבש', 'בגדים', 'ללבוש'], icon: 'checkroom' },
            { keywords: ['לילה טוב', 'שינה', 'לישון'], icon: 'bedtime' },
            { keywords: ['מקלחת', 'אמבטיה', 'להתרחץ'], icon: 'shower' },
            { keywords: ['שיער', 'להסתרק', 'מברשת'], icon: 'face' },
            { keywords: ['שיעורי בית', 'לימודים', 'ללמוד'], icon: 'menu_book' },
            { keywords: ['חדר', 'לסדר', 'ניקיון'], icon: 'cleaning_services' },
            { keywords: ['נעליים', 'לנעול'], icon: 'steps' },
            { keywords: ['חיבוק'], icon: 'favorite' },
        ]
    },
    en: {
        // Days
        days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        daysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        
        // Loomi
        loomiSingular: 'Loomi',
        loomiPlural: 'Loomis',
        collectLoomis: 'Collect Loomis',
        resetLoomis: 'Reset',
        
        // Home page
        morning: 'Morning',
        evening: 'Evening',
        taskBank: 'Task Bank',
        weekView: "What's this week?",
        settingsBtn: 'Manager & Settings',
        
        // Routine
        morningRoutine: 'Morning Routine',
        eveningRoutine: 'Evening Routine',
        back: 'Back',
        
        // Market / Task bank
        taskBankTitle: 'Task Bank',
        bankEmpty: 'The bank is empty...',
        whoDidTask: 'Who completed the task?',
        cancel: 'Cancel',
        
        // Week view
        weekTitle: "What's this week?",
        peekNextWeek: 'Peek at next week',
        backToThisWeek: 'Back',
        
        // Child page
        myPage: 'My Page',
        childPageOf: "'s Page",
        bank: 'Bank',
        bankSubtitle: '(How much do I have saved?)',
        reminders: 'Reminders',
        whatToRemember: 'What to remember?',
        noReminders: 'No reminders yet',
        overdue: 'Overdue',
        pickNewDate: 'Pick a new date',
        
        // Settings
        saveAndClose: 'Save & Close',
        addEvent: 'Add Event',
        weekly: 'Weekly',
        specificDate: 'Specific Date',
        whatsHappening: "What's happening?",
        everyone: 'Everyone',
        add: 'Add',
        update: 'Update',
        noEvents: 'No events',
        addTask: 'Add Task',
        whatToDo: 'What to do?',
        noTasks: 'No tasks',
        addChild: 'Add Child',
        name: 'Name...',
        copyFrom: 'Copy from...',
        noName: 'No name',
        deleteChild: 'Delete',
        newTask: 'New task...',
        morningOption: '☀️ Morning',
        eveningOption: '🌙 Evening',
        bothOption: '🌤️ Both',
        addToAll: 'Add to all',
        noChores: 'No chores',
        nameExists: 'This name already exists! Please choose a different name.',
        pleaseSelectDate: 'Please select a date',
        logout: 'Logout',
        loading: 'Loading...',
        
        // Auth
        login: 'Login',
        signUp: 'Sign Up',
        forgotPassword: 'Forgot Password?',
        guestEntry: 'Enter as Guest',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        loginFailed: 'Login failed. Check email/password.',
        enterEmailFirst: 'Please enter your email address first.',
        resetEmailSent: 'Reset email sent.. Check your inbox.',
        
        // Task icon keywords (English)
        taskKeywords: [
            { keywords: ['backpack', 'school', 'bag'], icon: 'backpack' },
            { keywords: ['lunch', 'food', 'sandwich'], icon: 'lunch_dining' },
            { keywords: ['bottle', 'water', 'drink'], icon: 'water_drop' },
            { keywords: ['teeth', 'brush teeth', 'dental'], icon: 'dentistry' },
            { keywords: ['face', 'wash face'], icon: 'wash' },
            { keywords: ['breakfast', 'eat', 'meal'], icon: 'breakfast_dining' },
            { keywords: ['dress', 'clothes', 'get dressed'], icon: 'checkroom' },
            { keywords: ['goodnight', 'sleep', 'bedtime'], icon: 'bedtime' },
            { keywords: ['shower', 'bath', 'bathe'], icon: 'shower' },
            { keywords: ['hair', 'comb', 'brush'], icon: 'face' },
            { keywords: ['homework', 'study', 'learn'], icon: 'menu_book' },
            { keywords: ['room', 'clean', 'tidy'], icon: 'cleaning_services' },
            { keywords: ['shoes', 'put on shoes'], icon: 'steps' },
            { keywords: ['hug', 'love'], icon: 'favorite' },
        ]
    }
};

// Get/set current language
function getLang() {
    return localStorage.getItem('loomi-lang') || 'he';
}

function setLang(lang) {
    localStorage.setItem('loomi-lang', lang);
    // Update direction
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'he' ? 'he' : 'en';
}

// Get a translation string
function t(key) {
    const lang = getLang();
    return TRANSLATIONS[lang][key] || TRANSLATIONS['he'][key] || key;
}

// Get the DAYS array for current language
function getDays() {
    return TRANSLATIONS[getLang()].days;
}

function getDaysFull() {
    return TRANSLATIONS[getLang()].daysFull;
}

function getTaskKeywords() {
    return TRANSLATIONS[getLang()].taskKeywords;
}

// Toggle language and refresh
function toggleLanguage() {
    const newLang = getLang() === 'he' ? 'en' : 'he';
    setLang(newLang);
    applyLanguage();
    updateLangToggleUI();
    // Re-render dynamic content if the app is loaded
    if (window.renderAll) window.renderAll();
    if (window.renderSettings) window.renderSettings();
}

// Apply language to all static HTML elements
function applyLanguage() {
    const lang = getLang();
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'he' ? 'he' : 'en';
    
    // Update the language toggle labels (active/inactive styling)
    const labelHe = document.getElementById('lang-label-he');
    const labelEn = document.getElementById('lang-label-en');
    if (labelHe && labelEn) {
        if (lang === 'he') {
            labelHe.classList.add('lang-active');
            labelHe.classList.remove('lang-inactive');
            labelEn.classList.add('lang-inactive');
            labelEn.classList.remove('lang-active');
        } else {
            labelEn.classList.add('lang-active');
            labelEn.classList.remove('lang-inactive');
            labelHe.classList.add('lang-inactive');
            labelHe.classList.remove('lang-active');
        }
    }
    
    // Login page
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    if (emailInput) emailInput.placeholder = t('emailPlaceholder');
    if (passInput) passInput.placeholder = t('passwordPlaceholder');
    
    const loginBtn = document.querySelector('.auth-buttons button:first-child');
    const signupBtn = document.querySelector('.auth-buttons button:last-child');
    if (loginBtn) loginBtn.textContent = t('login');
    if (signupBtn) signupBtn.textContent = t('signUp');
    
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) forgotLink.textContent = t('forgotPassword');
    
    const guestLink = document.querySelector('.guest-link');
    if (guestLink) guestLink.textContent = t('guestEntry');
    
    // Home page menu
    const menuTexts = document.querySelectorAll('.menu-text');
    const menuKeys = ['morning', 'evening', 'taskBank', 'weekView'];
    menuTexts.forEach((el, i) => {
        if (menuKeys[i]) el.textContent = t(menuKeys[i]);
    });
    
    const homeSettingsBtn = document.querySelector('.home-settings-btn');
    if (homeSettingsBtn) homeSettingsBtn.textContent = t('settingsBtn');
    
    // Routine view
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => btn.textContent = t('back'));
    
    // View titles
    const routineTitle = document.querySelector('#view-routine h2');
    if (routineTitle) {
        // Keep whichever routine title is currently shown
        const isMorning = routineTitle.textContent.trim().includes('בוקר') || routineTitle.textContent.trim().includes('Morning');
        routineTitle.textContent = ' ' + (isMorning ? t('morningRoutine') : t('eveningRoutine')) + ' ';
    }
    
    const marketTitle = document.querySelector('#view-market h2');
    if (marketTitle) marketTitle.textContent = ' ' + t('taskBankTitle') + ' ';
    
    const weekTitle = document.querySelector('#view-week h2');
    if (weekTitle) weekTitle.textContent = ' ' + t('weekTitle') + ' ';
    
    const childPageTitle = document.querySelector('#view-child-page h2');
    if (childPageTitle) childPageTitle.textContent = t('myPage');
    
    // Settings view
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) saveBtn.textContent = t('saveAndClose');
    
    const logoutBtn = document.querySelector('.logout-btn-small');
    if (logoutBtn) logoutBtn.textContent = t('logout');
    
    const addEventTitle = document.querySelector('.add-event-card h3');
    if (addEventTitle) addEventTitle.textContent = t('addEvent');
    
    const weeklyBtn = document.getElementById('btn-weekly');
    const onceBtn = document.getElementById('btn-once');
    if (weeklyBtn) weeklyBtn.textContent = t('weekly');
    if (onceBtn) onceBtn.textContent = t('specificDate');
    
    const eventNameInput = document.getElementById('event-name');
    if (eventNameInput) eventNameInput.placeholder = t('whatsHappening');
    
    const btnAddEvent = document.getElementById('btn-add-event');
    if (btnAddEvent) btnAddEvent.textContent = t('add');
    
    const btnUpdateEvent = document.getElementById('btn-update-event');
    if (btnUpdateEvent) btnUpdateEvent.textContent = t('update');
    
    // Day selector options
    const daySelect = document.getElementById('event-day');
    if (daySelect) {
        const daysFull = getDaysFull();
        Array.from(daySelect.options).forEach((opt, i) => {
            opt.textContent = daysFull[i];
        });
    }
    
    // Loomis toggle (in settings, not the lang toggle on login page)
    const loomisLabel = document.querySelector('.loomis-toggle-container .loomis-toggle-label');
    if (loomisLabel) loomisLabel.textContent = t('collectLoomis');
    
    // Task card
    const taskCardTitle = document.querySelector('#settings-market-section h3');
    if (taskCardTitle) taskCardTitle.innerHTML = '<i class="material-symbols-rounded" style="color:#5A9CB5;">checklist</i> ' + t('addTask');
    
    const taskInput = document.getElementById('new-market-name');
    if (taskInput) taskInput.placeholder = t('whatToDo');
    
    // Market section add button
    const marketAddBtn = document.querySelector('#settings-market-section .settings-card-btn');
    if (marketAddBtn) marketAddBtn.textContent = t('add');
    
    // Add child card title
    const addChildCard = document.querySelector('.settings-card-red h3');
    if (addChildCard) {
        addChildCard.innerHTML = '<i class="material-symbols-rounded" style="color: #5A9CB5;">group_add</i> ' + t('addChild');
    }
    
    const childNameInput = document.getElementById('new-child-name');
    if (childNameInput) childNameInput.placeholder = t('name');
    
    // Loading text
    const loadingText = document.getElementById('settings-loading-text');
    if (loadingText) loadingText.textContent = t('loading');
}

// Update the language toggle button visual (active/right = Hebrew side)
function updateLangToggleUI() {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) {
        if (getLang() === 'he') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

// Initialize language on page load
function initLanguage() {
    const lang = getLang();
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'he' ? 'he' : 'en';
    applyLanguage();
    updateLangToggleUI();
}

// Auto-init when this script loads
initLanguage();
