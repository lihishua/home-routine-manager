# LOOMI™ | Home Routine Manager 🏠
**The ultimate family synchronization tool for morning and evening routines.**

LOOMI is designed to empower children through involvement, independence, and responsibility. By turning the "daily grind" into a visual, interactive experience, families can stay organized across all devices in real-time.

[Visit the Live Site](https://lihishua.github.io/home-routine-manager/)

---

## 🛠️ Project Evolution & Features
We have transitioned from a local static list to a full-scale cloud-synced web application.

- **Multi-User Cloud Sync:** Powered by **Firebase & Firestore**, allowing multiple family members to check off tasks on iPhones and iPads simultaneously.
- **Secure Authentication:** Private accounts for every family with "Forgot Password" functionality.
- **Versatile UI/UX:** A responsive "Mobile-First" design with a custom-designed splash screen and nested branding.
- **Celebratory UI:** Integrated `canvas-confetti` to celebrate when the routine is complete.
- **Automatic Midnight Reset:** Logic to clear tasks every night so every morning starts fresh.

---

## 📅 The Routine Structure
The app is currently split into two primary phases, optimized for the Israeli family schedule:

### ☀️ Morning Routine (בוקר)
* Organized tasks for school/work preparation.
* High-visibility checkboxes for easy use on mobile.
* Integrated "Yom Tov" greeting logic (optional/customizable).

### 🌙 Evening Routine (ערב)
* Calming dark-mode aesthetics for the end of the day.
* Step-by-step bedtime and organization tasks.

---

## 🌐 External Services

| Service | Purpose | Dashboard |
|---|---|---|
| **Firebase Auth** | User login, registration, password reset | [console.firebase.google.com](https://console.firebase.google.com) |
| **Firestore** | Real-time cloud sync of family data across devices | same Firebase console |
| **Cloudflare** | Domain DNS management for loomi-home.com | [dash.cloudflare.com](https://dash.cloudflare.com) |
| **EmailJS** | Sending emails from the browser (no backend needed) — used for: feedback form → Lihi's Gmail, PIN recovery → user's email | [emailjs.com](https://emailjs.com) |
| **Google Fonts** | Assistant, Fredoka, Varela Round + Material Symbols Rounded icons | auto-loaded via CDN |
| **canvas-confetti** | Celebration animation when routine is fully completed | auto-loaded via CDN |

### EmailJS Configuration
| Constant | Value | Used for |
|---|---|---|
| `EMAILJS_SERVICE_ID` | `service_iri3j9e` | Gmail service connection |
| `EMAILJS_TEMPLATE_ID` | `template_lmmo77s` | Feedback form → sends to Lihi |
| `EMAILJS_PIN_TEMPLATE_ID` | `template_ibl2pv6` | PIN recovery → sends to user |
| `EMAILJS_PUBLIC_KEY` | `29mo-WXRoen-LIGxf` | Public key for browser SDK |

---

## 📦 Technical Architecture
This project is built with a minimalist, high-performance stack:
* **Frontend:** HTML5, CSS3, JavaScript (ES6+).
* **Backend:** Google Firebase (Auth + Firestore NoSQL Database).
* **Typography:** Assistant, Fredoka, and Varela Round (optimizing Hebrew/English readability).
* **Legal:** Includes TM (Trademark) notice and privacy policy accessible via the in-app Settings menu.

---

## 🚀 How to Customize
1. **Clone & Install:**
   ```bash
   git clone [https://github.com/lihishua/home-routine-manager.git](https://github.com/lihishua/home-routine-manager.git)

2. Update Tasks: Edit the task IDs and labels in index.html to fit your specific family needs.

3. Deploy: Push to GitHub Pages for instant hosting.

⚖️ Legal & Privacy
© 2026 LOOMI™ Home Routine. This project is protected under common law trademark. The Privacy Policy and Terms of Service are accessible via the in-app Settings menu.

---