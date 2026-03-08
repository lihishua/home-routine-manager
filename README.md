# LOOMI™ | Home Routine Manager

**A bilingual Hebrew/English family PWA for managing daily routines, chores, and schedules.**

LOOMI helps kids take ownership of their daily routine through a fun, visual, interactive experience — while giving parents full control behind the scenes. Designed for the whole family: kids use it on the iPad, parents manage it from their phone.

[Visit the Live Site](https://loomi-home.com)

---

## ✨ Features

### 👨‍👩‍👧‍👦 Multi-Child Support
- Each child has a personal page with their own routine, chores, and progress
- Per-child progress bar showing how many tasks are done
- "Done today" badge appears next to the child's name when all tasks are complete
- Stars reward system — kids earn stars (כוכבים) for completing chores

### 📅 Routines
- Three configurable routines: **Morning / Noon / Evening** (בוקר / צהריים / ערב)
- Each routine can be toggled on/off per family in Settings
- Routine cards on the home screen show a completion badge when all tasks are done
- Celebration animation (confetti) + sound when a routine is fully completed
- Automatic reset every midnight so every day starts fresh

### 🗓️ Weekly Calendar
- Family events displayed in a weekly view
- Events can be one-time (specific date) or recurring (day of week)
- Managed from the Settings page

### 🏦 Task Bank
- Shared pool of chore ideas that children can pick from when they're bored
- Add tasks with optional day assignments
- "Add to All" button to assign a task to every child at once

### ⚙️ Settings
- Add/remove children, manage their routines and chores
- Toggle morning / noon / evening routines on or off
- Stars collection toggle per child
- **PIN Lock** — optional per-device lock for the Settings page (so kids can't change settings)
  - PIN recovery by email after 3 failed attempts
- Feedback/suggestion box (registered users only) — sends directly to the LOOMI team

### 👤 Account
- Account chip in the top-right header corner: shows username or "אורח" (guest)
- Click to open dropdown with sign-out button
- Guest mode: full app access without an account (data saved locally only)
- Registered mode: data synced in real-time across all family devices via Firebase

### 🌐 Bilingual
- Full Hebrew (RTL) and English support
- Language toggle available in the app
- All UI text managed via `i18n.js`

---

## 🌐 External Services

| Service | Purpose | Dashboard |
|---|---|---|
| **Firebase Auth** | User login, registration, password reset | [console.firebase.google.com](https://console.firebase.google.com) |
| **Firestore** | Real-time cloud sync of family data across all devices | same Firebase console |
| **Cloudflare** | Domain DNS management for loomi-home.com | [dash.cloudflare.com](https://dash.cloudflare.com) |
| **EmailJS** | Browser-side email sending (no backend needed) — feedback form + PIN recovery | [emailjs.com](https://emailjs.com) |
| **Google Fonts** | Assistant, Fredoka, Varela Round fonts + Material Symbols Rounded icons | CDN |
| **canvas-confetti** | Celebration animation on routine completion | CDN |

### EmailJS Configuration (stored in `app.js`)
| Constant | Value | Purpose |
|---|---|---|
| `EMAILJS_SERVICE_ID` | `service_iri3j9e` | Gmail service connection |
| `EMAILJS_TEMPLATE_ID` | `template_lmmo77s` | Feedback form → sends to Lihi's Gmail |
| `EMAILJS_PIN_TEMPLATE_ID` | `template_ibl2pv6` | PIN recovery → sends to user's email (`To: {{to_email}}`, body: `{{message}}` = PIN) |
| `EMAILJS_PUBLIC_KEY` | `29mo-WXRoen-LIGxf` | Public key for browser SDK |

---

## 📦 Technical Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Auth & Database | Firebase Auth + Firestore (real-time sync) |
| Hosting | loomi-home.com via Cloudflare |
| Email | EmailJS (browser SDK, no server needed) |
| Icons | Material Symbols Rounded (Google CDN) |
| Fonts | Google Fonts — Assistant, Fredoka, Varela Round |
| Animations | Web Audio API (sounds), canvas-confetti (celebrations) |

### Key Files
| File | Role |
|---|---|
| `index.html` | App shell, all views, Firebase SDK setup |
| `app.js` | All logic — rendering, data, auth, PIN, sounds, email |
| `style.css` | All styles (versioned via `?v=N` query param) |
| `i18n.js` | Translations (Hebrew + English) + task icon keyword map |
| `data.js` | Default data structures |

---

## ⚖️ Legal & Privacy
© 2026 LOOMI™. All rights reserved.
Privacy Policy and Terms of Service are accessible via the in-app Settings menu.
