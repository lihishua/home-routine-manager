# 🍊 LOOMI - Home Routine Manager

A dedicated home kiosk app designed for a touchscreen display. 
Focuses on helping children manage morning/evening routines and family collaboration.

## 🚀 Vision
1. **Dynamic Dashboard:** Switches context based on Morning, Evening, or All-Day chores.
2. **Kid-Centric:** Swipeable interface where each child has their own color-coded space.
3. **The Market:** A shared area for family chores where children "claim" tasks to earn Loomis.
4. **Accessibility:** Large touch targets, Hebrew RTL support, and Voice Feedback for pre-readers.

## 📂 File Map
- `index.html`: The skeleton. Contains the "Settings", "Morning", and "Market" views.
- `style.css`: Modern Hebrew styling (Assistant font) and CSS Snap-Scrolling for kids.
- `app.js`: The "Brain." Handles:
    - User switching (swiping).
    - Speech synthesis (Hebrew).
    - Saving progress to LocalStorage.
- `data.js`: The source of truth. Edit this to add/remove kids and chores.

## 🛠 Tech Stack
- **HTML5/CSS3**: Custom Grid & Flexbox.
- **JavaScript (Vanilla)**: No frameworks needed for high performance.
- **Web Speech API**: For Hebrew voice feedback.
- **LocalStorage**: To persist chore completion status.

## 📝 How to use
1. Open `index.html` in any modern browser (Chrome/Edge recommended).
2. Set browser to **F11 (Full Screen)** for the kiosk experience.
3. Use the "Settings" button (top left) to manage children and tasks.