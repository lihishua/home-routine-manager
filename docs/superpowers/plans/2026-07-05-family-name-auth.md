# Family-Name Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize the family-name login system (family name + password to log in, one required email per family for recovery) and delete every part of the abandoned optional-email / synthetic-email / Cloud-Function experiment.

**Architecture:** Firebase Auth stays the backend, keyed on a real email + password. A `usernames/{normalized-family-name}` Firestore doc maps a family name → `{ uid, displayName, email }`. Login normalizes the typed family name, looks up the email, and signs in. Legacy email-only accounts (no `usernames` doc) are migrated lazily: logging in with the email backfills a `usernames` doc whose family name is the email's local part.

**Tech Stack:** Vanilla JS (no build, no bundler), inline ES-module `<script>` in `index.html` using the Firebase v9 modular SDK, `i18n.js` for Hebrew/English strings, `app.js` for the app shell.

## Global Constraints

- **No automated test harness exists.** Every task is verified **manually in a browser** with the steps given. There is no `npm test`.
- **Email is required** at signup and is always a real address — no `@loomi-users.com` synthetic emails anywhere.
- **Login is family name + password only** (email input is accepted solely as the legacy-migration path).
- **Bilingual:** every user-facing string goes through `t('key')`; add keys to **both** `he` and `en` blocks in `i18n.js`. Hebrew is primary, layout is RTL.
- **Keep** `firebase.json`'s `hosting` block; only the `functions` block is removed.
- **Commit after each task.** Do not push (the user pushes manually).
- Baseline for "unpushed work" audits is the last pushed commit `1ee52f6`.

---

### Task 1: Signup requires a real email; drop synthetic fallback

**Files:**
- Modify: `index.html` — `handleSignUp` (~lines 243-309) and the signup form (~lines 561-573)
- Modify: `i18n.js` — add `invalidEmail` and `emailInUse` keys to both language blocks (~lines 138-142 `he`, ~lines 320-323 `en`)

**Interfaces:**
- Produces: `usernames/{normalized}` docs shaped `{ uid, displayName, email, createdAt }` where `email` is always a real address. Task 2 and Task 3 read `.email` from these docs.

- [ ] **Step 1: Add the two new i18n strings**

In `i18n.js`, in the **Hebrew** block near the other auth errors (after `passwordTooShort`):

```js
invalidEmail: 'נא להזין כתובת אימייל תקינה',
emailInUse: 'האימייל הזה כבר בשימוש',
```

In the **English** block near the matching errors (after `passwordTooShort`):

```js
invalidEmail: 'Please enter a valid email',
emailInUse: 'This email is already in use',
```

- [ ] **Step 2: Rewrite `handleSignUp` to require email and use it as the auth email**

Replace the whole `window.handleSignUp = async () => { ... };` block in `index.html` with:

```js
window.handleSignUp = async () => {
    var displayName = document.getElementById('auth-username-signup').value.trim();
    var pass = document.getElementById('auth-password-signup').value;
    var email = document.getElementById('auth-recovery-email').value.trim();
    var errorEl = document.getElementById('auth-error');
    var btn = document.getElementById('signup-confirm-btn');
    errorEl.style.color = 'red';

    if (!displayName || !pass || !email) {
        errorEl.innerText = typeof t === 'function' ? t('fillAllFields') : 'Please fill in all fields';
        return;
    }
    if (email.indexOf('@') === -1) {
        errorEl.innerText = typeof t === 'function' ? t('invalidEmail') : 'Please enter a valid email';
        return;
    }
    if (pass.length < 6) {
        errorEl.innerText = typeof t === 'function' ? t('passwordTooShort') : 'Password must be at least 6 characters';
        return;
    }

    var normalized = normalizeUsername(displayName);
    if (btn) btn.disabled = true;

    try {
        var usernameSnap = await getDoc(doc(db, 'usernames', normalized));
        if (usernameSnap.exists()) {
            var suggestions = generateUsernameSuggestions(normalized);
            var takenText = typeof t === 'function' ? t('usernameTaken') : 'This name is taken. Try:';
            var suggEl = document.getElementById('username-suggestions');
            suggEl.innerHTML =
                '<p class="suggestions-label">' + takenText + '</p>' +
                '<div class="suggestions-chips">' +
                suggestions.map(function(s) {
                    return '<button class="suggestion-chip" onclick="selectSuggestion(\'' + s.replace(/'/g, "\\'") + '\')">' + s + '</button>';
                }).join('') +
                '</div>';
            suggEl.style.display = 'block';
            if (btn) btn.disabled = false;
            return;
        }

        var userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        var user = userCredential.user;
        await updateProfile(user, { displayName: displayName });
        await setDoc(doc(db, 'usernames', normalized), {
            uid: user.uid,
            displayName: displayName,
            email: email,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        if (btn) btn.disabled = false;
        if (error.code === 'auth/email-already-in-use') {
            errorEl.innerText = typeof t === 'function' ? t('emailInUse') : 'This email is already in use';
        } else {
            errorEl.innerText = error.message;
        }
    }
};
```

Note the behavior change: `auth/email-already-in-use` now means the **email** is taken (family-name collisions are caught earlier by the `usernames` doc lookup and still show suggestion chips).

- [ ] **Step 3: Make the signup email field read as required (remove "optional")**

In the signup form, replace the recovery-email block:

```html
<div class="auth-optional-email">
    <input type="email" id="auth-recovery-email" autocomplete="email" oninput="document.getElementById('auth-error').innerText=''">
    <span id="recovery-hint" class="recovery-hint">לשחזור סיסמה בלבד — אופציונלי</span>
</div>
```

with:

```html
<div class="auth-optional-email">
    <input type="email" id="auth-recovery-email" autocomplete="email" required oninput="document.getElementById('auth-error').innerText=''">
    <span id="recovery-hint" class="recovery-hint">לשחזור סיסמה בלבד</span>
</div>
```

(The `recovery-hint` text is overwritten on load by `applyLanguage` via the `recoveryEmailHint` key, which already reads "for password recovery only" with no "optional"; this just removes the flash of the old hardcoded word.)

- [ ] **Step 4: Verify in the browser**

Open `index.html` (or the local dev URL). Click "הרשמה" to reach signup.
1. Fill family name + password, leave email empty, submit → expect the "fill all fields" error.
2. Fill a malformed email (`abc`) → expect the invalid-email error.
3. Fill a real test email + name + 6+ char password → expect account created and app loads. In Firebase console, confirm the auth user's email is the real one (no `@loomi-users.com`) and `usernames/{name}` has `email` = the real address.

- [ ] **Step 5: Commit**

```bash
git add index.html i18n.js
git commit -m "feat(auth): require real email at signup, drop synthetic fallback"
```

---

### Task 2: Login by family name; migrate legacy email accounts on login

**Files:**
- Modify: `index.html` — `handleLogin` (~lines 311-340); add a small `ensureUsernameDoc` helper near it

**Interfaces:**
- Consumes: `usernames/{normalized}` docs from Task 1 (reads `.email`).
- Produces: `ensureUsernameDoc(user)` — backfills a `usernames` doc for a legacy account, family name = email local part.

- [ ] **Step 1: Replace `handleLogin` and add the migration helper**

Replace the whole `window.handleLogin = async () => { ... };` block in `index.html` with:

```js
// Backfill a usernames doc for a legacy email-only account (family name = email local part).
async function ensureUsernameDoc(user) {
    var localPart = (user.email || '').split('@')[0];
    if (!localPart) return;
    var familyName = user.displayName || localPart;
    var normalized = normalizeUsername(familyName);
    var existing = await getDoc(doc(db, 'usernames', normalized));
    if (existing.exists()) return;
    if (!user.displayName) {
        try { await updateProfile(user, { displayName: familyName }); } catch (e) {}
    }
    await setDoc(doc(db, 'usernames', normalized), {
        uid: user.uid,
        displayName: familyName,
        email: user.email,
        createdAt: new Date().toISOString()
    });
}

window.handleLogin = async () => {
    var displayName = document.getElementById('auth-username').value.trim();
    var pass = document.getElementById('auth-password').value;
    var errorEl = document.getElementById('auth-error');
    var btn = document.getElementById('login-btn');
    errorEl.style.color = 'red';

    if (!displayName || !pass) {
        errorEl.innerText = typeof t === 'function' ? t('fillAllFields') : 'Please fill in all fields';
        return;
    }
    if (btn) btn.disabled = true;

    try {
        // Legacy email-only account: sign in by email, then backfill a family name.
        if (displayName.indexOf('@') !== -1) {
            var cred = await signInWithEmailAndPassword(auth, displayName, pass);
            await ensureUsernameDoc(cred.user);
            return;
        }
        // Normal path: look up the real email by family name.
        var normalized = normalizeUsername(displayName);
        var snap = await getDoc(doc(db, 'usernames', normalized));
        if (!snap.exists() || !snap.data().email) {
            if (btn) btn.disabled = false;
            errorEl.innerText = typeof t === 'function' ? t('loginFailed') : 'Login failed. Check family name/password.';
            return;
        }
        await signInWithEmailAndPassword(auth, snap.data().email, pass);
    } catch (e) {
        if (btn) btn.disabled = false;
        errorEl.innerText = typeof t === 'function' ? t('loginFailed') : 'Login failed. Check family name/password.';
    }
};
```

- [ ] **Step 2: Verify normal family-name login**

Reload the app, log out if needed. In the login form type the **family name + password** from Task 1's signup → expect successful login into the app.

- [ ] **Step 3: Verify legacy-account migration**

Using an existing pre-family-name account (real email + password, no `usernames` doc), type the **email + password** in the login form → expect login succeeds. In Firebase console confirm a new `usernames/{email-local-part}` doc now exists with the account's uid and email, and that the auth user's `displayName` is set to the local part. Then log out and log back in using that **family name** (the email local part) + password → expect success.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(auth): family-name login with lazy migration for legacy email accounts"
```

---

### Task 3: Collapse forgot-password to a single step

**Files:**
- Modify: `index.html` — `handleForgotPassword` (~lines 342-447), `switchAuthMode` forgot-mode cleanup (~lines 213-231), remove step-2 markup (~lines 578-582), remove the `_forgotUid` var (~line 187)
- Modify: `index.html` — Firestore import line (remove `onSnapshot` if now unused)

**Interfaces:**
- Consumes: `usernames/{normalized}.email` from Task 1.

- [ ] **Step 1: Replace `handleForgotPassword` with the one-step version**

Replace the whole `window.handleForgotPassword = async () => { ... };` block with:

```js
window.handleForgotPassword = async () => {
    var username = document.getElementById('auth-forgot-username').value.trim();
    var errorEl = document.getElementById('auth-error');
    var btn = document.getElementById('send-forgot-btn');
    errorEl.style.color = 'red';

    if (!username) {
        errorEl.innerText = typeof t === 'function' ? t('fillAllFields') : 'Please enter your family name';
        return;
    }
    if (btn) btn.disabled = true;

    try {
        var normalized = normalizeUsername(username);
        var snap = await getDoc(doc(db, 'usernames', normalized));
        if (!snap.exists() || !snap.data().email) {
            if (btn) btn.disabled = false;
            errorEl.innerText = typeof t === 'function' ? t('usernameNotFound') : 'Family name not found.';
            return;
        }
        await sendPasswordResetEmail(auth, snap.data().email);
        errorEl.style.color = 'green';
        errorEl.innerText = typeof t === 'function' ? t('resetEmailSent') : 'Reset link sent! Check your inbox.';
    } catch (e) {
        if (btn) btn.disabled = false;
        errorEl.innerText = (e && e.message) || 'Failed. Try again.';
    }
};
```

- [ ] **Step 2: Remove the `_forgotUid` variable**

Delete this line (~line 187):

```js
var _forgotUid = null; // uid cached between forgot-password step 1 → step 2
```

- [ ] **Step 3: Clean step-2 references out of `switchAuthMode`**

In `switchAuthMode`, delete these now-dead lines:

```js
var forgotEmailStep = document.getElementById('auth-forgot-email-step');
if (forgotEmailStep) forgotEmailStep.style.display = 'none';
```

and

```js
var forgotContactEmail = document.getElementById('auth-forgot-contact-email');
if (forgotContactEmail) forgotContactEmail.value = '';
```

Also fix the forgot-mode focus target (the id `auth-forgot-email` does not exist) — change:

```js
} else if (mode === 'forgot') {
    setTimeout(function() { var el = document.getElementById('auth-forgot-email'); if (el) el.focus(); }, 50);
}
```

to:

```js
} else if (mode === 'forgot') {
    setTimeout(function() { var el = document.getElementById('auth-forgot-username'); if (el) el.focus(); }, 50);
}
```

- [ ] **Step 4: Remove the step-2 markup from the forgot form**

Delete this block from the `auth-forgot-section` (~lines 578-582):

```html
<!-- Step 2: shown only when no recovery email on file -->
<div id="auth-forgot-email-step" style="display:none">
    <p id="forgot-email-hint" class="auth-forgot-hint" style="margin-top:10px;font-size:0.82rem;">הזינו מייל ליצירת קשר ונחזור אליכם</p>
    <input type="email" id="auth-forgot-contact-email" autocomplete="email" oninput="document.getElementById('auth-error').innerText=''">
</div>
```

- [ ] **Step 5: Drop the now-unused `onSnapshot` import**

Find the Firestore import in `index.html`:

```bash
grep -n "onSnapshot" index.html
```

If the only remaining hit is the import statement, remove `onSnapshot,` from that `import { ... } from ".../firebase-firestore.js";` line. If other code still uses it, leave it.

- [ ] **Step 6: Verify in the browser**

Reload, click "שכחתי סיסמא". 
1. Submit empty → expect the fill-fields error.
2. Type a family name that does not exist → expect "family name not found".
3. Type a real family name from Task 1 → expect the green "reset link sent" message and an actual Firebase reset email in that inbox. Confirm no second email-input field ever appears.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat(auth): one-step forgot-password via stored family email"
```

---

### Task 4: Delete the Cloud Function and its Firebase config

**Files:**
- Delete: `functions/` (whole directory: `index.js`, `package.json`)
- Modify: `firebase.json` (remove the `functions` block, keep `hosting`)

- [ ] **Step 1: Delete the functions directory**

```bash
git rm -r --cached functions 2>/dev/null; rm -rf functions
```

(The `git rm --cached` is harmless if `functions/` was never tracked; it is currently untracked, so `rm -rf` is what actually removes it.)

- [ ] **Step 2: Remove the `functions` block from `firebase.json`**

Edit `firebase.json` to:

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**", "functions/**"]
  }
}
```

- [ ] **Step 3: Verify config is valid and nothing references the function**

```bash
python3 -c "import json; json.load(open('firebase.json')); print('firebase.json OK')"
grep -rn "passwordResets\|processPasswordReset" index.html app.js i18n.js
```

Expected: `firebase.json OK`, and the grep returns **no** hits.

- [ ] **Step 4: Commit**

```bash
git add firebase.json
git commit -m "chore(auth): remove password-reset Cloud Function and its config"
```

---

### Task 5: Purge synthetic-email traces from i18n, profile, and account chip

**Files:**
- Modify: `i18n.js` — remove dead keys and dead `applyLanguage` bindings
- Modify: `app.js` — `showProfileSettings` (~3054-3056), `updateAccountChip` (~3144); check `sendForgotPasswordEmail` (~3122)

- [ ] **Step 1: Remove dead i18n keys**

In `i18n.js`, delete these keys from **both** the `he` and `en` blocks (they were only used by the removed step-2 / Cloud-Function flow):

- `forgotContactEmailPlaceholder`
- `forgotEmailStepHint`
- `noRecoveryEmail` (English block only — it exists there)

- [ ] **Step 2: Remove dead `applyLanguage` bindings**

In `i18n.js` `applyLanguage`, delete these two lines (their elements no longer exist):

```js
setPlaceholder('auth-forgot-contact-email', 'forgotContactEmailPlaceholder');
setText('forgot-email-hint', 'forgotEmailStepHint');
```

- [ ] **Step 3: Simplify `showProfileSettings` (no synthetic emails anymore)**

In `app.js`, replace:

```js
var currentEmail = user.email || '';
var isSynthetic = currentEmail.indexOf('@loomi-users.com') !== -1;
var displayEmail = isSynthetic ? '' : currentEmail;
```

with:

```js
var displayEmail = user.email || '';
```

- [ ] **Step 4: Simplify the username fallback in `updateAccountChip`**

In `app.js`, replace:

```js
username = (u && u.displayName) || (u && u.email && u.email.indexOf('@loomi-users.com') === -1 && u.email.split('@')[0]) || (u && u.email && u.email.split('@')[0]) || 'user';
```

with:

```js
username = (u && u.displayName) || (u && u.email && u.email.split('@')[0]) || 'user';
```

- [ ] **Step 5: Check whether `sendForgotPasswordEmail` is still called**

```bash
grep -rn "sendForgotPasswordEmail" index.html app.js
```

If the only hit is its definition in `app.js` (~line 3122) with no caller, delete the whole `window.sendForgotPasswordEmail = async function(...) { ... };` block. If it still has a caller, leave it.

- [ ] **Step 6: Verify in the browser**

Reload the app and log in. 
1. Toggle Hebrew/English on the login screen → no console errors, all auth fields still labeled.
2. Open the account dropdown → the chip shows the family name (not a raw email/synthetic string).
3. Open Profile Settings → the linked email shows the real address.

- [ ] **Step 7: Commit**

```bash
git add i18n.js app.js
git commit -m "chore(auth): purge synthetic-email traces from i18n, profile, and chip"
```

---

### Task 6: Final audit — no leftover unused unpushed work

**Files:** none changed unless the audit finds something.

- [ ] **Step 1: Grep the whole repo for abandoned-approach identifiers**

```bash
grep -rn "loomi-users\.com\|passwordResets\|processPasswordReset\|_forgotUid\|forgot-email-step\|auth-forgot-contact-email\|contactEmail\|isSynthetic\|forgotEmailStepHint\|forgotContactEmailPlaceholder" \
  index.html app.js i18n.js style.css firebase.json
```

Expected: **no hits.** (Hits inside `docs/superpowers/` are fine and expected — exclude them mentally.) If anything shows up in the code files, remove it and note why it was left.

- [ ] **Step 2: Diff every touched file against the last pushed commit for stray dead code**

```bash
git diff 1ee52f6 -- index.html app.js i18n.js style.css | grep -n "loomi-users\|passwordReset\|onSnapshot\|optional" 
ls functions 2>/dev/null && echo "functions still present — remove it" || echo "functions removed OK"
```

Review the diff hunks: confirm no orphaned CSS rule (e.g. an `.auth-optional-email` rule that is now meaningless — if the class is unused, remove the rule from `style.css`), no unused i18n key, no dead handler. Remove anything abandoned.

- [ ] **Step 3: Full manual smoke test of all three flows**

In the browser, end to end:
1. **Signup** a brand-new family (name + email + password) → lands in app.
2. **Log out**, **log in** with that family name + password → lands in app.
3. **Forgot password** with that family name → green "sent" + reset email arrives.
4. **Legacy migration**: log in with an old account's email + password → succeeds and creates its `usernames` doc.

- [ ] **Step 4: Commit any audit fixes**

```bash
git add -A
git commit -m "chore(auth): final cleanup of abandoned optional-email experiment"
```

(If the audit found nothing to change, skip this commit.)

---

## Notes for the implementer

- All auth handlers (`handleSignUp`, `handleLogin`, `handleForgotPassword`, `switchAuthMode`, `normalizeUsername`, `generateUsernameSuggestions`) live in an **inline ES-module `<script>`** in `index.html`, roughly lines 187-457. `doc`, `getDoc`, `setDoc`, `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `updateProfile`, `sendPasswordResetEmail`, `auth`, `db` are already imported/available in that scope — no new imports needed (Task 3 only *removes* `onSnapshot`).
- To run the app locally, serve the folder (e.g. `python3 -m http.server`) and open it; Firebase Auth needs the page served over `http://localhost`, not `file://`.
- Do not bump the `style.css?v=` cache-buster unless you actually change `style.css` (only Task 6 might).
