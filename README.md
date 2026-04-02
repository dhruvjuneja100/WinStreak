<div align="center">
  <img src="https://via.placeholder.com/150/000000/FFFFFF/?text=WinStreak" alt="WinStreak Logo" width="120" height="120">
  <h1>🚀 WinStreak v5.0</h1>
  <p><strong>A futuristic, hyper-gamified productivity & habit tracking dashboard.</strong></p>
</div>

<br>

**WinStreak** is a beautiful, cutting-edge web application designed to help you build unshakeable habits and achieve your 100-day goals. Built with a sleek 2026-style SaaS aesthetic—featuring deep dark modes, neon indigo/cyan accents, and advanced glassmorphism—WinStreak turns your daily grinds into an engaging, visually rewarding experience.

## ✨ Core Features

*   🎯 **100-Day Streak Tracker:** Commit to long-term goals and visualize your progress on a beautiful 100-day grid. Get visual feedback and celebratory confetti.
*   🔒 **Advanced Focus Mode (Pomodoro):** Custom session durations with quick-select presets, integrated site-blocking, and powerful tab-switch detection that prevents navigation or browsing away.
*   🔥 **Heat Vision (Activity Map):** A GitHub-style, 364-day heatmap tracking your historical activity and overall platform consistency at a glance.
*   ⏱️ **D-Day Exam Countdown:** Supports multiple live countdown chips for hard deadlines across different streaks, turning red during critical approaching dates.
*   🛡️ **Ice Shields (Streak Freezes):** A gamified mechanic granting you freeze tokens to protect a missed day from ruining a long streak.
*   📊 **Analytics & Reporting:** Live bar charts (via Chart.js) and a dynamic mini-grid detailing your weekly activity, completion rates, and historical logs.
*   🏆 **RPG Leveling & Badges:** Earn XP by completing daily tasks and unlocking achievement badges. Progress from *Novice* to *Overlord*.
*   📱 **PWA Support:** Installable as a Progressive Web App (PWA) with push notification reminders.

---

## 🛠️ Technology Stack

**Frontend:**
*   Vanilla HTML5, CSS3, JavaScript (ES6+)
*   Vite (Development & Build Tool)
*   **No heavy frameworks!** Pure CSS custom variables and flex/grid systems ensure an incredibly lightweight and fast experience.
*   **Libraries:** `Chart.js` (Analytics), `canvas-confetti` (Gamification)

**Backend:**
*   Node.js & Express.js
*   SQLite3 (Persistent storage via `sqlite3` driver)
*   REST API Architecture (User profiles, streaks, tasks, badge tracking)

---

## 🚀 Getting Started

To run the full stack locally, follow these steps. You will need Node.js installed.

### 1. Clone the repository
```bash
git clone https://github.com/dhruvjuneja100/WinStreak.git
cd WinStreak
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the Backend API Server
The application relies on the SQLite backend for authentication, streak logic, and task persistence.
```bash
npm run server
# or run specifically via node:
node server/server.cjs
```
*(Runs on `http://localhost:3000`)*

### 4. Start the Frontend Development Server
Open a separate terminal window and start the Vite frontend:
```bash
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🎨 Design Philosophy

Version 5.0 incorporates a "Deep Dark" futuristic aesthetic using a sophisticated color palette (`#6e54f7` / `#00d4ff`), multi-layered ambient lighting, and dynamic interactions:
*   Smooth micro-interactions on hover and click.
*   Complex modal overlays with backdrop blur.
*   Customized focus warnings that overtake the DOM to genuinely prevent distraction.

---
<div align="center">
  <sub>Built with ❤️ | Maintainer: dhruvjuneja100</sub>
</div>
