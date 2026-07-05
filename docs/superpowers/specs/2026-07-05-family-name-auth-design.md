# Family-Name Auth — Design

**Date:** 2026-07-05
**Status:** Approved, pending implementation plan

## Context

The **live** app authenticates with plain **email + password**. Every existing
account has a real email.

An unpushed local change (working tree: `app.js`, `index.html`, `i18n.js`,
`style.css`, plus untracked `functions/`, `.firebaserc`, `firebase.json`)
introduced a **family-name** login system. That change also added machinery to
cope with users who signed up *without* an email:

- a synthetic `@loomi-users.com` email generated at signup, and
- a Firebase Cloud Function (`functions/index.js`) + a `passwordResets`
  Firestore collection + a second "enter a contact email" step in the
  forgot-password flow, to attach a real email later.

Because email is (and always was) required, that entire fallback path solves a
problem that does not exist. This spec finalizes the family-name system and
removes the dead complexity.

## Goal

A family logs in the way a household naturally thinks about it:

- **Family name** — e.g. `The Shuas` (the login identifier, unique)
- **Email** — one real email per family, entered once at signup, used **only**
  for password recovery — never typed to log in
- **Password** — one shared family password, e.g. `daddyisawsome` (min 6 chars)

## Design

### 1. Signup — three required fields

Fields: family name, email, password. All required.

- Validate: non-empty family name, valid-looking email (`indexOf('@') !== -1`),
  password length ≥ 6.
- Family-name uniqueness is checked against `usernames/{normalized}` as today;
  taken names still surface suggestion chips.
- Create the Firebase auth account with the **real email** and password.
- Write `usernames/{normalized}` → `{ uid, displayName, email, createdAt }`.
- **Remove** the synthetic `@loomi-users.com` email generation. There is no code
  path that produces a fake email anymore.
- Email field UI: change the hint from "for recovery only — optional" to a
  required "for password recovery" label; remove the optional styling.

### 2. Login — family name + password

- User types family name + password only.
- Normalize the family name, look up `usernames/{normalized}` to get the stored
  email, then `signInWithEmailAndPassword(email, password)`.
- **Email-login fallback (also the migration path):** if the login input
  contains `@`, treat it as an email and sign in with it directly. See §4.

### 3. Forgot password — one step

- User types family name → look up `usernames/{normalized}` → read the stored
  email → `sendPasswordResetEmail(email)` → show "reset link sent".
- **Remove** the second "enter contact email" step, the `passwordResets`
  Firestore writes, the `onSnapshot` wait, and the safety timeout.
- **Delete** `functions/` (the Cloud Function was only there to attach an email
  to synthetic-email accounts). In `firebase.json`, remove the `functions` block
  but **keep** the `hosting` block — it is still needed to deploy the site.
  `.firebaserc` (project alias) stays.

### 4. Old accounts — auto-migrate on first login

Old accounts exist in Firebase Auth with a real email + password but have **no**
`usernames/{...}` doc, so family-name login can't find them yet.

- Keep the email-login fallback in `handleLogin` (§2). When the input contains
  `@`, sign in by email directly.
- On successful email login, if no `usernames` doc exists for that account,
  create one with:
  - `displayName` / family name = the **local part of the email** (the text
    before `@`, e.g. `lihishua@gmail.com` → `lihishua`),
  - `email` = the account email,
  - `uid` = the signed-in user's uid.
- After this one-time migration the account can log in with its family name like
  any other. No migration script, no manual UID handling.

## Non-goals

- No data migration script; migration happens lazily on login.
- No change to how routine/family data is stored or synced.
- No re-signup required for existing accounts.

## Files touched

- `index.html` — signup form (email required, updated hint), inline auth
  handlers `handleSignUp` / `handleLogin` / `handleForgotPassword`, remove the
  forgot step-2 markup.
- `i18n.js` — update/remove strings for the "optional email" hint and the
  removed step-2 / Cloud-Function flow; ensure required-email + recovery strings
  read correctly in Hebrew and English.
- `app.js` — anything referencing synthetic `@loomi-users.com` (e.g. the profile
  "add email" / `isSynthetic` logic) simplified now that emails are always real.
- Delete `functions/`; remove the `functions` block from `firebase.json` (keep
  `hosting`). `.firebaserc` stays.
