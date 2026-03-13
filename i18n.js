// Internationalization - Language translations
const TRANSLATIONS = {
    he: {
        // Days
        days: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
        daysFull: ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "שבת"],
        
        // Stars
        loomiSingular: 'כוכב',
        loomiPlural: 'כוכבים',
        collectLoomis: 'איסוף כוכבים',
        resetLoomis: 'איפוס',
        
        // Home page
        morning: 'בוקר',
        noon: 'צהריים',
        evening: 'ערב',
        taskBank: 'בנק משימות',
        weekView: 'מה קורה השבוע?',
        settingsBtn: 'ניהול והגדרות',
        
        // Routine
        morningRoutine: 'שגרת בוקר',
        noonRoutine: 'שגרת צהריים',
        eveningRoutine: 'שגרת ערב',
        back: 'חזרה',
        wellDoneMorning: 'כל הכבוד {name}! <br> שיהיה יום נהדר!',
        wellDoneNoon: 'כל הכבוד {name}! <br> כל המטלות של הצהריים בוצעו!',
        wellDoneEvening: 'כל הכבוד {name}! <br> שיהיה לך לילה טוב, וחלומות מתוקים',
        
        // Routine toggles
        morningToggle: 'שגרת בוקר',
        noonToggle: 'שגרת צהריים',
        eveningToggle: 'שגרת ערב',
        
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
        addDateOptional: 'תאריך (אופציונלי)',
        
        // Settings
        saveAndClose: 'שמור וסגור',
        addEvent: 'הוספת אירוע',
        weekly: 'שבועי',
        specificDate: 'תאריך ספציפי',
        whatsHappening: 'מה קורה?',
        everyone: 'כולם',
        add: 'הוספה',
        update: 'עדכון',
        updateAll: 'עדכון לכולם',
        edit: 'עריכה',
        cancel: 'ביטול',
        noEvents: 'אין אירועים',
        savePastEventsLabel: 'שמור אירועים ישנים',
        tooltipSavePastEvents: 'כשמופעל — אירועים חד-פעמיים שתאריכם עבר לא יימחקו',
        addTask: 'הוספת משימה לבנק משימות',
        whatToDo: 'מה שעושים?',
        noTasks: 'אין משימות',
        addChild: 'הוספת ילד',
        childrenSection: 'ילדים ומשימות שיגרה',
        name: 'שם...',
        copyFrom: 'העתק מ...',
        noName: 'ללא שם',
        deleteChild: 'מחיקה',
        confirmDeleteChild: 'אתה בטוח שברצונך למחוק את {name}?',
        newTask: 'מטלה חדשה...',
        morningOption: 'בוקר',
        noonOption: 'צהריים',
        eveningOption: 'ערב',
        addToAll: 'הוספה לכולם',
        noChores: 'אין מטלות',
        nameExists: 'שם זה כבר קיים! אנא בחר שם אחר.',
        pleaseSelectDate: 'נא לבחור תאריך',
        logout: 'התנתק',
        guest: 'אורח',
        loading: 'טוען...',
        
        // Auth
        login: 'התחברות',
        signUp: 'הרשמה',
        forgotPassword: 'שכחתי סיסמא',
        guestEntry: 'כניסה כאורח',
        guestTooltip: 'השתמשו באפליקציה ללא הרשמה. כמה זמן שתרצו. כל המידע יישמר. אבל במכשיר זה בלבד. על מנת לסנכרן בין מכשירים (להוסיף משימות מהטלפון בדרך לעבודה, כשהילדים מסמנים משימות על האייפד בבית) - יש צורך בהרשמה.',
        tooltipAddToAll: 'מוסיף את המשימה הזו לכל הילדים בו זמנית',
        tooltipRoutineToggles: 'שגרות הן רשימות משימות לפי שעות היום — בוקר, צהריים וערב. הפעילו רק את השגרות הרלוונטיות למשפחה שלכם',
        tooltipEvents: 'אירועים הם פעילויות מתוזמנות כמו חוגים. הם מופיעים בלוח השבועי של כל ילד',
        tooltipAddChild: 'הוסיפו את בני המשפחה שעוקבים אחרי השגרות. ניתן להעתיק משימות מילד קיים',
        tooltipProgress: 'מציג כמה משימות הושלמו היום מתוך הסה"כ',
        tooltipPinLock: 'נועל את ההגדרות במכשיר זה בלבד — שימושי כשהילדים משתמשים בטאבלט',
        tooltipBank: 'הכסף שקיבלתי בחגים ובימי הולדת, שאמא שומרת לי',
        tooltipMemo: 'הוסיפו תזכורת שתופיע כאן. אם תוסיפו תאריך — היא תופיע גם בשבוע הרלוונטי בלוח השנה',
        tooltipEventWeekly: 'אירוע שחוזר על עצמו כל שבוע — למשל חוג קבוע ביום מסוים',
        tooltipEventOnce: 'יופיע בלוח השנה בשבוע הנכון, כשיגיע הזמן :-)',
        tooltipAddTask: 'הוסיפו משימות לבנק המשימות, כדי שיהיה לילדים מה לעשות כשהם משתעממים :-)',
        tooltipCollectStars: 'כשמופעל — כל משימה שמסומנת כבוצעה מעניקה לילד את מספר הכוכבים שהיא שווה. הכוכבים נצברים וניתן לראות כמה יש לכל ילד בעמודו האישי. ניתן לאפס בכרטיס הגדרות ילד.',
        routinesSection: 'שגרות',
        feedbackTitle: 'שלחו לנו משוב',
        feedbackBug: 'באג',
        feedbackFeature: 'רעיון',
        feedbackGeneral: 'כללי',
        feedbackSent: '✓ תודה! המשוב נשלח בהצלחה',
        feedbackError: 'שגיאה בשליחה. אנא נסו שוב.',
        feedbackEmptyError: 'אנא כתבו הודעה לפני השליחה',
        feedbackPlaceholder: 'כתבו כאן את המשוב שלכם...',
        emailPlaceholder: 'אימייל',
        passwordPlaceholder: 'סיסמה',
        loginFailed: 'ההתחברות נכשלה. בדוק אימייל/סיסמה.',
        enterEmailFirst: 'נא להזין כתובת אימייל קודם.',
        resetEmailSent: 'נשלח! בדוק את תיבת המייל שלך.',

        // Settings PIN lock
        settingsLock: 'נעילת הגדרות',
        enterPin: 'הזן קוד גישה',
        setPin: 'בחר קוד 4 ספרות',
        confirmPin: 'הזן שוב לאישור',
        pinMismatch: 'הקודים לא תואמים, נסה שוב',
        wrongPin: 'קוד שגוי, נסה שוב',
        forgotPin: 'שכחתי קוד',
        pinForgotSent: 'נשלח מייל לאיפוס סיסמה',
        pinForgotGuest: 'לא ניתן לאפס קוד במצב אורח',
        disablePin: 'הזן קוד לכיבוי הנעילה',
        pinSendEmail: 'שלח את הקוד למייל שלי',
        pinEmailSent: 'נשלח! בדוק את המייל שלך',
        pinEmailError: 'שגיאה בשליחה, נסה שוב',
        pinEmailNoUser: 'לא זמין במצב אורח',
        
        // Task icon keywords (Hebrew)
        taskKeywords: [
            { keywords: ['תיק', 'ביה"ס', 'בית ספר', 'ילקוט'], icon: 'backpack' },
            { keywords: ['קופסת אוכל', 'אוכל', 'סנדוויץ', 'כריך'], icon: 'lunch_dining' },
            { keywords: ['בקבוק', 'מים', 'שתייה'], icon: 'water_drop' },
            { keywords: ['שיניים', 'צחצוח', 'לצחצח'], icon: 'dentistry' },
            { keywords: ['פנים', 'לשטוף', 'לרחוץ'], icon: 'wash' },
            { keywords: ['ארוחת בוקר', 'בוקר', 'לאכול'], icon: 'coffee' },
            { keywords: ['להתלבש', 'בגדים', 'ללבוש'], icon: 'checkroom' },
            { keywords: ['לילה טוב', 'שינה', 'לישון'], icon: 'bedtime' },
            { keywords: ['מקלחת', 'אמבטיה', 'להתרחץ'], icon: 'shower' },
            { keywords: ['שיער', 'להסתרק', 'מברשת', 'תסרוקת'], icon: 'face' },
            { keywords: ['שיעורי בית', 'לימודים', 'ללמוד'], icon: 'menu_book' },
            { keywords: ['ניקוי', 'לנקות'], icon: 'cleaning_services' },
            { keywords: ['נעליים', 'לנעול'], icon: 'steps' },
            { keywords: ['חיבוק'], icon: 'favorite' },
            { keywords: ['מיטה', 'שמיכה', 'כרית'], icon: 'bed' },
            { keywords: ['חלון', 'לאוורר', 'וילון'], icon: 'window' },
        ]
    },
    en: {
        // Days
        days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        daysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        
        // Stars
        loomiSingular: 'Star',
        loomiPlural: 'Stars',
        collectLoomis: 'Collect Stars',
        resetLoomis: 'Reset',
        
        // Home page
        morning: 'Morning',
        noon: 'Noon',
        evening: 'Evening',
        taskBank: 'Task Bank',
        weekView: "What's this week?",
        settingsBtn: 'Manager & Settings',
        
        // Routine
        morningRoutine: 'Morning Routine',
        noonRoutine: 'Noon Routine',
        eveningRoutine: 'Evening Routine',
        back: 'Back',
        wellDoneMorning: 'Well done {name}! <br> Have an amazing day!',
        wellDoneNoon: 'Well done {name}! <br> All noon chores completed!',
        wellDoneEvening: 'Well done {name}! <br> Good night & sweet dreams',
        
        // Routine toggles
        morningToggle: 'Morning Routine',
        noonToggle: 'Noon Routine',
        eveningToggle: 'Evening Routine',
        
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
        addDateOptional: 'Add date (optional)',
        
        // Settings
        saveAndClose: 'Save & Close',
        addEvent: 'Add Event',
        weekly: 'Weekly',
        specificDate: 'Specific Date',
        whatsHappening: "What's happening?",
        everyone: 'Everyone',
        add: 'Add',
        update: 'Update',
        updateAll: 'Update All',
        edit: 'Edit',
        cancel: 'Cancel',
        noEvents: 'No events',
        savePastEventsLabel: 'Keep old events',
        tooltipSavePastEvents: 'When on — one-time events past their date will not be deleted',
        addTask: 'Add Task',
        whatToDo: 'What to do?',
        noTasks: 'No tasks',
        addChild: 'Add Child',
        childrenSection: 'Children & Home Routine Chores',
        name: 'Name...',
        copyFrom: 'Copy from...',
        noName: 'No name',
        deleteChild: 'Delete',
        confirmDeleteChild: 'Delete {name}?',
        newTask: 'New task...',
        morningOption: 'Morning',
        noonOption: 'Noon',
        eveningOption: 'Evening',
        addToAll: 'Add to all',
        noChores: 'No chores',
        nameExists: 'This name already exists! Please choose a different name.',
        pleaseSelectDate: 'Please select a date',
        logout: 'Logout',
        guest: 'Guest',
        loading: 'Loading...',
        
        // Auth
        login: 'Login',
        signUp: 'Sign Up',
        forgotPassword: 'Forgot Password?',
        guestEntry: 'Enter as Guest',
        guestTooltip: 'Explore the app without entering anything! For as long as you like. All data will be saved on your device. if you wish to sync between devices - sign up',
        tooltipAddToAll: 'Adds this task to all kids at once',
        tooltipRoutineToggles: 'Routines are task lists for different times of day — morning, noon and evening. Enable the ones relevant to your family',
        tooltipEvents: 'Events are scheduled activities like classes. They appear on each child\'s weekly schedule',
        tooltipAddChild: 'Add family members who follow routines. You can copy tasks from an existing child',
        tooltipProgress: 'Shows how many tasks have been completed today out of the total',
        tooltipPinLock: 'Locks the settings on this device only — useful when kids use the tablet',
        tooltipBank: 'The money I got on holidays and birthdays, that mom is keeping for me',
        tooltipMemo: 'Add a reminder that will appear here. Add a date and it will also show up in the relevant week on the calendar',
        tooltipEventWeekly: 'A recurring event that repeats every week — like a regular class on a fixed day',
        tooltipEventOnce: 'Will appear on the calendar in the right week, when the moment comes :-)',
        tooltipAddTask: 'Add tasks to the tasks bank, so kids will have an idea of what to do when bored :-)',
        tooltipCollectStars: 'When enabled — every completed task earns the child a star. Stars accumulate and can be redeemed in the store',
        routinesSection: 'Routines',
        feedbackTitle: 'Send Feedback',
        feedbackBug: 'Bug',
        feedbackFeature: 'Feature',
        feedbackGeneral: 'General',
        feedbackSent: '✓ Thank you! Feedback sent successfully',
        feedbackError: 'Error sending. Please try again.',
        feedbackEmptyError: 'Please write a message before sending',
        feedbackPlaceholder: 'Write your feedback here...',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        loginFailed: 'Login failed. Check email/password.',
        enterEmailFirst: 'Please enter your email address first.',
        resetEmailSent: 'Reset email sent.. Check your inbox.',

        // Settings PIN lock
        settingsLock: 'Lock Settings',
        enterPin: 'Enter PIN',
        setPin: 'Choose a 4-digit PIN',
        confirmPin: 'Confirm PIN',
        pinMismatch: "PINs don't match, try again",
        wrongPin: 'Wrong PIN, try again',
        forgotPin: 'Forgot PIN?',
        pinForgotSent: 'Password reset email sent',
        pinForgotGuest: 'Cannot reset PIN in guest mode',
        disablePin: 'Enter PIN to disable lock',
        pinSendEmail: 'Send PIN to my email',
        pinEmailSent: 'Sent! Check your email',
        pinEmailError: 'Failed to send, try again',
        pinEmailNoUser: 'Not available in guest mode',
        
        // Task icon keywords (English)
        taskKeywords: [
            { keywords: ['backpack', 'school', 'bag'], icon: 'backpack' },
            { keywords: ['lunch', 'food', 'sandwich'], icon: 'lunch_dining' },
            { keywords: ['bottle', 'water', 'drink'], icon: 'water_drop' },
            { keywords: ['teeth', 'brush teeth', 'dental'], icon: 'dentistry' },
            { keywords: ['face', 'wash face'], icon: 'wash' },
            { keywords: ['breakfast', 'eat', 'meal'], icon: 'coffee' },
            { keywords: ['dress', 'clothes', 'get dressed'], icon: 'checkroom' },
            { keywords: ['goodnight', 'sleep', 'bedtime'], icon: 'bedtime' },
            { keywords: ['shower', 'bath', 'bathe'], icon: 'shower' },
            { keywords: ['hair', 'comb', 'brush'], icon: 'face' },
            { keywords: ['homework', 'study', 'learn'], icon: 'menu_book' },
            { keywords: ['room', 'clean', 'tidy'], icon: 'cleaning_services' },
            { keywords: ['shoes', 'put on shoes'], icon: 'steps' },
            { keywords: ['hug', 'love'], icon: 'favorite' },
            { keywords: ['bed', 'blanket', 'pillow'], icon: 'bed' },
            { keywords: ['window', 'air', 'curtains'], icon: 'window' },
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
    const guestTooltip = document.getElementById('guest-tooltip');
    if (guestTooltip) guestTooltip.textContent = t('guestTooltip');
    // routine toggles label removed — ? is now inline with morning toggle label
    
    // Home page menu (use data attributes for reliable translation)
    document.querySelectorAll('.menu-card[data-i18n-key]').forEach(card => {
        const key = card.getAttribute('data-i18n-key');
        const textEl = card.querySelector('.menu-text');
        if (textEl && key) textEl.textContent = t(key);
    });
    
    const homeSettingsBtn = document.querySelector('.home-settings-btn');
    if (homeSettingsBtn) homeSettingsBtn.textContent = t('settingsBtn');
    
    // Routine view
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => btn.textContent = t('back'));
    
    // View titles - update routine title based on current routine type
    const routineTitle = document.querySelector('#view-routine h2');
    if (routineTitle && window.currentRoutineType) {
        const titleMap = { morning: 'morningRoutine', noon: 'noonRoutine', evening: 'eveningRoutine' };
        routineTitle.textContent = ' ' + t(titleMap[window.currentRoutineType] || 'morningRoutine') + ' ';
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
    if (addEventTitle) addEventTitle.innerHTML = '<i class="material-symbols-rounded" style="color:#5A9CB5;">event</i> ' + t('addEvent');
    
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
    
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    if (btnCancelEdit) btnCancelEdit.textContent = t('cancel');
    
    // Refresh day checkboxes with translated day names
    if (typeof renderDayCheckboxes === 'function') renderDayCheckboxes();
    
    // Loomis toggle (tasks card only)
    const loomisLabel = document.querySelector('#settings-market-section .loomis-toggle-label');
    if (loomisLabel) loomisLabel.innerHTML = t('collectLoomis') + ' <span class="info-icon" data-tooltip-key="tooltipCollectStars">?</span>';

    // Save past events toggle (events card)
    const savePastLabel = document.querySelector('.add-event-card .loomis-toggle-label');
    if (savePastLabel) savePastLabel.innerHTML = t('savePastEventsLabel') + ' <span class="info-icon" data-tooltip-key="tooltipSavePastEvents">?</span>';
    
    // Task card
    const taskCardTitle = document.querySelector('#settings-market-section h3');
    if (taskCardTitle) taskCardTitle.innerHTML = '<i class="material-symbols-rounded" style="color:#5A9CB5;">checklist</i> ' + t('addTask') + ' <span class="info-icon" data-tooltip-key="tooltipAddTask">?</span>';
    
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

    // Feedback section
    const feedbackTextarea = document.getElementById('feedback-message');
    if (feedbackTextarea) feedbackTextarea.placeholder = t('feedbackPlaceholder');
    
    // Children section title
    const childrenTitle = document.querySelector('.settings-section-title');
    if (childrenTitle) childrenTitle.textContent = t('childrenSection');

    // Settings lock label
    const lockLabel = document.querySelector('.settings-lock-label');
    if (lockLabel) lockLabel.innerHTML = t('settingsLock') + ' <span class="info-icon" data-tooltip-key="tooltipPinLock">?</span>';
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
