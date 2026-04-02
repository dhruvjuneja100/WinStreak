import { Chart } from 'chart.js/auto';
import confetti from 'canvas-confetti';
import { login, register, getStreaks, createStreak, updateStreak, deleteStreak,
         getBadges, unlockBadge, getStats, generateId, getSavedTheme, saveTheme,
         getUserProfile, getActivityLogs, getTasks, addTask, updateTask, deleteTask } from './api.js';

// ====================== BADGE DEFINITIONS ======================
const BADGE_DEFS = [
  { key: 'first_day',    emoji: '🌱', name: 'First Sprout',    desc: 'Complete your very first day',       check: s => s.totalCompleted >= 1 },
  { key: 'week_warrior', emoji: '⚡', name: 'Week Warrior',    desc: 'Complete 7 total days',              check: s => s.totalCompleted >= 7 },
  { key: 'fortnight',    emoji: '🛡️', name: 'Iron Shield',     desc: 'Complete 14 total days',             check: s => s.totalCompleted >= 14 },
  { key: 'month_master', emoji: '🏆', name: 'Month Master',    desc: 'Complete 30 total days',             check: s => s.totalCompleted >= 30 },
  { key: 'fifty_fire',   emoji: '🔥', name: 'Fifty Fire',      desc: 'Complete 50 total days',             check: s => s.totalCompleted >= 50 },
  { key: 'century_club', emoji: '💯', name: 'Century Club',    desc: 'Complete 100 total days',            check: s => s.totalCompleted >= 100 },
  { key: 'multi_track',  emoji: '🎯', name: 'Multi-Tracker',   desc: 'Have 3 or more active streaks',      check: s => s.totalStreaks >= 3 },
  { key: 'five_streaks', emoji: '🌟', name: 'Star Collector',  desc: 'Have 5 or more active streaks',      check: s => s.totalStreaks >= 5 },
  { key: 'finisher',     emoji: '🏁', name: 'The Finisher',    desc: 'Complete an entire streak',          check: (s, streaks) => streaks.some(st => st.days.every(d => d === true || d === 'frozen')) },
  { key: 'two_hundred',  emoji: '👑', name: 'The Crown',       desc: 'Complete 200 total days',            check: s => s.totalCompleted >= 200 },
];

// ====================== TITLE SYSTEM ======================
const TITLES = [
  { min: 0,   label: 'Newbie' },
  { min: 7,   label: 'Apprentice' },
  { min: 30,  label: 'Warrior' },
  { min: 75,  label: 'Champion' },
  { min: 150, label: 'Legend' },
  { min: 300, label: 'Immortal' },
];

function getTitle(totalCompleted) {
  let title = TITLES[0];
  for (const t of TITLES) {
    if (totalCompleted >= t.min) title = t;
  }
  return title.label;
}

// ====================== TEMPLATES ======================
const TEMPLATES = [
  { icon: '💻', name: 'DSA Practice',      days: 100, category: 'coding' },
  { icon: '📖', name: 'Daily Reading',     days: 30,  category: 'learning' },
  { icon: '🧠', name: 'OS Revision',       days: 45,  category: 'study' },
  { icon: '🗄️', name: 'DBMS Mastery',      days: 30,  category: 'study' },
  { icon: '🌐', name: 'CN Concepts',       days: 30,  category: 'study' },
  { icon: '💪', name: 'Gym Streak',        days: 90,  category: 'fitness' },
  { icon: '🧘', name: 'Meditation',        days: 21,  category: 'wellness' },
  { icon: '✍️', name: 'Journaling',        days: 30,  category: 'personal' },
  { icon: '🏃', name: 'Running Habit',     days: 60,  category: 'fitness' },
  { icon: '🎸', name: 'Learn Guitar',      days: 100, category: 'skill' },
  { icon: '🥗', name: 'Healthy Eating',    days: 30,  category: 'wellness' },
  { icon: '📚', name: 'Exam Prep Sprint',  days: 14,  category: 'study' },
];

// ====================== APP ======================
document.addEventListener('DOMContentLoaded', async () => {
  // DOM
  const authView = document.getElementById('auth-view');
  const dashboardView = document.getElementById('dashboard-view');
  const streakView = document.getElementById('streak-view');
  const streaksList = document.getElementById('streaks-list');

  const createModal = document.getElementById('create-modal');
  const congratsModal = document.getElementById('congrats-modal');
  const deleteModal = document.getElementById('delete-modal');
  const trophyModal = document.getElementById('trophy-modal');
  const templatesModal = document.getElementById('templates-modal');

  const authForm = document.getElementById('auth-form');
  const createForm = document.getElementById('create-form');
  const authError = document.getElementById('auth-error');

  const btnCreateNew = document.getElementById('btn-create-new');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCloseCongrats = document.getElementById('btn-close-congrats');
  const btnBack = document.getElementById('btn-back');
  const btnDelete = document.getElementById('btn-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnThemeToggle = document.getElementById('theme-toggle');
  const btnLogout = document.getElementById('btn-logout');
  const linkHome = document.getElementById('link-home');
  const btnShowTrophies = document.getElementById('btn-show-trophies');
  const btnCloseTrophies = document.getElementById('btn-close-trophies');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navRight = document.getElementById('nav-right');
  const btnShowTemplates = document.getElementById('btn-show-templates');
  const btnCloseTemplates = document.getElementById('btn-close-templates');
  const btnDismissDanger = document.getElementById('btn-dismiss-danger');

  const quoteEl = document.getElementById('motivational-quote');

  const QUOTES = [
    "Small disciplines repeated with consistency every day lead to great achievements.",
    "You don't have to be extreme, just consistent.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "It is not what we do once in a while that shapes our lives. It is what we do consistently.",
    "Motivation gets you going, but discipline keeps you growing.",
    "Do something today that your future self will thank you for."
  ];

  // Stats & Nav UI
  const userGreeting = document.getElementById('user-greeting');
  const userTitleBadge = document.getElementById('user-title-badge');
  const userStatsNav = document.getElementById('user-stats');
  const userLevelText = document.getElementById('user-level');
  const xpBarFill = document.getElementById('xp-bar-fill');
  const userFreezesText = document.getElementById('user-freezes');

  // Pomodoro
  const btnFocusFusion = document.getElementById('btn-focus-fusion');
  const pomodoroModal = document.getElementById('pomodoro-modal');
  const btnClosePomodoro = document.getElementById('btn-close-pomodoro');
  const pomodoroDisplay = document.getElementById('pomodoro-display');
  const pomodoroStreakSelect = document.getElementById('pomodoro-streak-select');
  const btnPomodoroStart = document.getElementById('btn-pomodoro-start');
  const btnPomodoroReset = document.getElementById('btn-pomodoro-reset');

  // Heatmap & D-Day
  const heatmapGrid = document.getElementById('heatmap-grid');
  const isDdayCheckbox = document.getElementById('is-dday');


  const dangerBanner = document.getElementById('danger-banner');
  const dangerText = document.getElementById('danger-text');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  const streakTitle = document.getElementById('streak-title');
  const streakSubtitle = document.getElementById('streak-subtitle');
  const streakCount = document.getElementById('streak-count');
  const completedCount = document.getElementById('completed-count');
  const progressBar = document.getElementById('progress-bar');
  const gridContainer = document.getElementById('grid-container');
  const streakDeadlineBadge = document.getElementById('streak-deadline-badge');
  const badgesGrid = document.getElementById('badges-grid');
  const templatesGrid = document.getElementById('templates-grid');
  const emojiPicker = document.getElementById('emoji-picker');

  // Checklist DOM
  const checklistPanel = document.getElementById('checklist-panel');
  const checklistTitle = document.getElementById('checklist-title');
  const checklistProgress = document.getElementById('checklist-progress');
  const checklistList = document.getElementById('checklist-list');
  const newTaskInput = document.getElementById('new-task-input');
  const btnAddTask = document.getElementById('btn-add-task');
  const btnCarryForward = document.getElementById('btn-carry-forward');

  // Focus Mode DOM
  const focusOverlay = document.getElementById('focus-overlay');
  const focusTimerDisplay = document.getElementById('focus-timer-display');
  const focusQuoteEl = document.getElementById('focus-quote');
  const focusBlocklistDisplay = document.getElementById('focus-blocklist-display');
  const btnStartFocus = document.getElementById('btn-start-focus');
  const btnEndFocus = document.getElementById('btn-end-focus');
  const focusSettingsModal = document.getElementById('focus-settings-modal');
  const btnCloseFocusSettings = document.getElementById('btn-close-focus-settings');
  const btnActivateFocus = document.getElementById('btn-activate-focus');
  const focusDurationInput = document.getElementById('focus-duration');
  const focusCategoriesEl = document.getElementById('focus-categories');
  const focusCustomSites = document.getElementById('focus-custom-sites');
  const btnDangerAction = document.getElementById('btn-danger-action');
  const dangerSub = document.getElementById('danger-sub');
  const focusProgressBar = document.getElementById('focus-progress-bar');

  // State
  let streaks = [];
  let userBadges = [];
  let currentUser = null;
  let currentUserProfile = null; // xp, level, freezes
  let currentActiveStreakId = null;
  let currentTasks = [];
  let activeDayIndex = -1;
  let selectedEmoji = '🔥';
  let currentTheme = getSavedTheme();
  let ddayInterval = null;
  let progressChart = null;
  let atRiskStreakId = null;

  // Focus Mode State
  let focusInterval = null;
  let focusTimeLeft = 25 * 60;
  let isFocusActive = false;
  let focusTotalTime = 25 * 60;

  // Pomodoro State
  let pomodoroInterval = null;
  let pomodoroTimeLeft = 25 * 60; // 25 mins
  let isPomodoroRunning = false;

  applyTheme(currentTheme);
  if ('Notification' in window) Notification.requestPermission();

  // ====================== NAVIGATION / HAMBURGER ======================
  hamburgerBtn.addEventListener('click', () => {
    navRight.classList.toggle('mobile-visible');
  });

  // Close mobile menu if clicked outside
  document.addEventListener('click', (e) => {
    if (!hamburgerBtn.contains(e.target) && !navRight.contains(e.target)) {
      navRight.classList.remove('mobile-visible');
    }
  });

  // ====================== THEME ======================
  btnThemeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    saveTheme(currentTheme);
    if(progressChart) loadAll(); // Re-render chart to reflect theme colors
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    sunIcon.classList.toggle('hidden', theme === 'light');
    moonIcon.classList.toggle('hidden', theme === 'dark');
  }

  function showView(v) {
    [authView, dashboardView, streakView].forEach(el => { el.classList.remove('section-active'); el.classList.add('section-hidden'); });
    v.classList.remove('section-hidden'); v.classList.add('section-active');
    btnFocusFusion.classList.toggle('hidden', !currentUser);
  }

  // ====================== POMODORO ======================
  function formatPomodoroTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  btnFocusFusion.addEventListener('click', () => {
    // Populate select
    pomodoroStreakSelect.innerHTML = '<option value="">-- Don\'t link to any streak --</option>';
    streaks.forEach(s => {
      const isComplete = s.days.every(d => d === true || d === 'frozen');
      if (!isComplete) pomodoroStreakSelect.innerHTML += `<option value="${s.id}">${s.icon} ${s.topic}</option>`;
    });
    pomodoroModal.classList.remove('hidden');
  });

  btnClosePomodoro.addEventListener('click', () => pomodoroModal.classList.add('hidden'));

  btnPomodoroReset.addEventListener('click', () => {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    pomodoroTimeLeft = 25 * 60;
    pomodoroDisplay.textContent = formatPomodoroTime(pomodoroTimeLeft);
    btnPomodoroStart.textContent = 'Start Focus';
    btnPomodoroReset.classList.add('hidden');
    btnFocusFusion.classList.remove('timer-active');
  });

  btnPomodoroStart.addEventListener('click', () => {
    if (isPomodoroRunning) {
      clearInterval(pomodoroInterval);
      isPomodoroRunning = false;
      btnPomodoroStart.textContent = 'Resume';
      btnFocusFusion.classList.remove('timer-active');
      return;
    }
    isPomodoroRunning = true;
    btnPomodoroStart.textContent = 'Pause';
    btnPomodoroReset.classList.remove('hidden');
    btnFocusFusion.classList.add('timer-active');

    pomodoroInterval = setInterval(async () => {
      pomodoroTimeLeft--;
      pomodoroDisplay.textContent = formatPomodoroTime(pomodoroTimeLeft);
      if (pomodoroTimeLeft <= 0) {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        btnFocusFusion.classList.remove('timer-active');
        new Notification('Focus Fusion Complete!', { body: 'Great job staying focused.' });
        
        // Auto-complete streak if linked
        const streakId = pomodoroStreakSelect.value;
        if (streakId) {
          const streak = streaks.find(s => s.id === streakId);
          if (streak) {
            const nextIdx = streak.days.findIndex(v => !v);
            if (nextIdx >= 0 && nextIdx < streak.targetDays) {
              streak.days[nextIdx] = true;
              await updateStreak(currentUser.id, streak);
              await loadAll();
              showBadgeToast({ emoji: '🎉', name: 'Pomodoro Logged!' });
            }
          }
        }
        btnPomodoroReset.click(); // Reset timer
      }
    }, 1000);
  });

  // ====================== EMOJI PICKER ======================
  emojiPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('.emoji-btn');
    if (!btn) return;
    emojiPicker.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedEmoji = btn.dataset.emoji;
  });

  // ====================== AUTH ======================
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    try {
      let userRes;
      try { userRes = await login(u, p); }
      catch (err) {
        if (err.message === 'User not found') { userRes = await register(u, p); }
        else throw err;
      }
      currentUser = userRes;
      authError.textContent = '';
      userGreeting.textContent = `Hello, ${u}`;
      userGreeting.classList.remove('hidden');
      btnLogout.classList.remove('hidden');
      
      quoteEl.textContent = `"${QUOTES[Math.floor(Math.random() * QUOTES.length)]}"`;
      quoteEl.classList.remove('hidden');
      
      showView(dashboardView);
      await loadAll();
    } catch (err) { authError.textContent = err.message || 'Authentication failed'; }
  });

  btnLogout.addEventListener('click', () => {
    currentUser = null; currentUserProfile = null; streaks = []; userBadges = [];
    userGreeting.classList.add('hidden');
    btnLogout.classList.add('hidden');
    userTitleBadge.classList.add('hidden');
    userStatsNav.classList.add('hidden');
    dangerBanner.classList.add('hidden');
    // Clear all dday intervals
    Object.values(ddayIntervals).forEach(id => clearInterval(id));
    ddayIntervals = {};
    btnPomodoroReset.click();
    if (isFocusActive) endFocusMode();
    quoteEl.classList.add('hidden');
    showView(authView);
  });


  // ====================== NAVIGATION ======================
  linkHome.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentUser) return;
    currentActiveStreakId = null;
    showView(dashboardView);
    loadAll();
  });
  btnBack.addEventListener('click', () => linkHome.click());

  btnCreateNew.addEventListener('click', () => { createModal.classList.remove('hidden'); });
  btnCloseModal.addEventListener('click', () => { createModal.classList.add('hidden'); createForm.reset(); resetEmojiPicker(); });
  btnCloseCongrats.addEventListener('click', () => congratsModal.classList.add('hidden'));
  btnShowTrophies.addEventListener('click', () => { renderTrophyWall(); trophyModal.classList.remove('hidden'); });
  btnCloseTrophies.addEventListener('click', () => trophyModal.classList.add('hidden'));
  btnShowTemplates.addEventListener('click', () => { renderTemplates(); templatesModal.classList.remove('hidden'); });
  btnCloseTemplates.addEventListener('click', () => templatesModal.classList.add('hidden'));
  btnDismissDanger.addEventListener('click', () => dangerBanner.classList.add('hidden'));

  function resetEmojiPicker() {
    selectedEmoji = '🔥';
    emojiPicker.querySelectorAll('.emoji-btn').forEach(b => b.classList.toggle('selected', b.dataset.emoji === '🔥'));
    isDdayCheckbox.checked = false;
  }

  // ====================== CREATE STREAK ======================
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = document.getElementById('topic').value.trim();
    const targetDays = parseInt(document.getElementById('target-days').value, 10);
    const deadline = document.getElementById('deadline').value;
    const cat = isDdayCheckbox.checked ? 'dday' : 'general';
    const newStreak = { id: generateId(), topic, targetDays, deadline, days: Array(targetDays).fill(false), icon: selectedEmoji, category: cat };
    await createStreak(currentUser.id, newStreak);
    createModal.classList.add('hidden');
    createForm.reset();
    resetEmojiPicker();
    await loadAll();
  });

  // ====================== LOAD ALL DATA ======================
  async function loadAll() {
    [streaks, userBadges, currentUserProfile] = await Promise.all([
      getStreaks(currentUser.id),
      getBadges(currentUser.id),
      getUserProfile(currentUser.id)
    ]);
    const stats = await getStats(currentUser.id);
    const activityLogs = await getActivityLogs(currentUser.id);

    await checkAndUnlockBadges(stats);
    updateNavStats(stats);
    renderDashboard();
    checkDangerBanner();
    checkNotifications();
    setupDDayTimer();
    renderHeatmap(activityLogs);
    renderAnalytics(activityLogs);
  }

  // ====================== STATS UI (XP/LEVEL/TITLE) ======================
  function updateNavStats(stats) {
    const title = getTitle(stats.totalCompleted);
    userTitleBadge.textContent = title;
    userTitleBadge.classList.remove('hidden');

    userLevelText.textContent = currentUserProfile.level;
    userFreezesText.textContent = currentUserProfile.freezes;
    // Calculate % to next level. Level formula in API: L = floor(sqrt(xp/100)) + 1
    // So target for next level (L+1) is (L * 100)^2 / 100? No, api is Math.sqrt(xp/100).
    // xp needed for L = (L-1)^2 * 100
    // L=1 handles xp=0 to 99. L=2 handles xp=100 to 399.
    const currentBase = Math.pow(currentUserProfile.level - 1, 2) * 100;
    const nextBase = Math.pow(currentUserProfile.level, 2) * 100;
    const pct = ((currentUserProfile.xp - currentBase) / (nextBase - currentBase)) * 100;
    
    xpBarFill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    userStatsNav.classList.remove('hidden');
  }

  // ====================== MULTI COUNTDOWN BAR ======================
  const DDAY_DISMISS_KEY = 'winstreak_dismissed_dday';
  let ddayIntervals = {}; // { streakId: intervalId }

  function getDismissed() {
    try { return JSON.parse(localStorage.getItem(DDAY_DISMISS_KEY) || '[]'); } catch { return []; }
  }
  function dismissCountdown(streakId) {
    const list = getDismissed();
    if (!list.includes(streakId)) list.push(streakId);
    localStorage.setItem(DDAY_DISMISS_KEY, JSON.stringify(list));
  }
  function restoreCountdown(streakId) {
    const list = getDismissed().filter(id => id !== streakId);
    localStorage.setItem(DDAY_DISMISS_KEY, JSON.stringify(list));
  }

  function setupDDayTimer() { renderDDayBar(); } // alias kept for compatibility

  function renderDDayBar() {
    // Clear old intervals
    Object.values(ddayIntervals).forEach(id => clearInterval(id));
    ddayIntervals = {};

    const ddayBar = document.getElementById('dday-bar');
    if (!ddayBar) return;
    ddayBar.innerHTML = '';

    const dismissed = getDismissed();
    const deadlineStreaks = streaks.filter(s => s.deadline && !dismissed.includes(s.id));

    if (deadlineStreaks.length === 0) {
      ddayBar.style.display = 'none';
      return;
    }
    ddayBar.style.display = '';

    deadlineStreaks.forEach(streak => {
      const chip = document.createElement('div');
      chip.className = 'dday-chip glass-panel-inner';
      chip.dataset.id = streak.id;

      const targetDate = new Date(streak.deadline);
      targetDate.setHours(23, 59, 59, 999);
      const msLeft = targetDate - new Date();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

      let urgencyClass = '';
      if (daysLeft <= 0) urgencyClass = 'dday-expired';
      else if (daysLeft <= 2) urgencyClass = 'dday-critical';
      else if (daysLeft <= 7) urgencyClass = 'dday-warning';
      if (urgencyClass) chip.classList.add(urgencyClass);

      chip.innerHTML = `
        <div class="dday-chip-top">
          <span class="dday-chip-icon">${streak.icon || '📅'}</span>
          <span class="dday-chip-name">${streak.topic}</span>
          <button class="dday-dismiss-btn" title="Dismiss countdown" data-id="${streak.id}">✕</button>
        </div>
        <div class="dday-chip-value" id="dday-val-${streak.id}">--:--:--</div>
        <div class="dday-chip-label">${daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go` : 'Deadline reached!'}</div>
      `;

      // Dismiss button handler
      chip.querySelector('.dday-dismiss-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        dismissCountdown(streak.id);
        if (ddayIntervals[streak.id]) clearInterval(ddayIntervals[streak.id]);
        chip.style.animation = 'chipOut .25s ease forwards';
        setTimeout(() => renderDDayBar(), 280);
      });

      ddayBar.appendChild(chip);

      // Live tick
      const valEl = document.getElementById(`dday-val-${streak.id}`);
      const tick = () => {
        const now = new Date();
        const diff = targetDate - now;
        if (diff <= 0) {
          if (valEl) valEl.textContent = 'EXPIRED';
          clearInterval(ddayIntervals[streak.id]);
          return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
        const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
        const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        if (valEl) valEl.textContent = d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
      };
      tick();
      ddayIntervals[streak.id] = setInterval(tick, 1000);
    });

    // Show a "Show all" reset link if any are dismissed
    const totalWithDeadline = streaks.filter(s => s.deadline).length;
    const totalDismissed = getDismissed().filter(id => streaks.some(s => s.id === id)).length;
    if (totalDismissed > 0) {
      const resetLink = document.createElement('button');
      resetLink.className = 'dday-restore-btn';
      resetLink.textContent = `+ ${totalDismissed} hidden — show all`;
      resetLink.addEventListener('click', () => {
        localStorage.removeItem(DDAY_DISMISS_KEY);
        renderDDayBar();
      });
      ddayBar.appendChild(resetLink);
    }
  }


  // ====================== HEATVISION HEATMAP ======================
  function renderHeatmap(activityLogs) {
    heatmapGrid.innerHTML = '';
    const logMap = {};
    activityLogs.forEach(l => { logMap[l.date] = l.count; });

    // Check if there's any activity at all
    const hasActivity = activityLogs.length > 0 && activityLogs.some(l => l.count > 0);

    // Render exact 52 weeks (364 days) leading up to today
    const totalDays = 52 * 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = logMap[dateStr] || 0;

      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      if (count > 0) {
        const heatLevel = Math.min(4, Math.ceil(count / 2));
        cell.classList.add(`heat-${heatLevel}`);
        cell.dataset.tooltip = `${count} activities on ${d.toLocaleDateString()}`;
      } else {
        cell.dataset.tooltip = `No activity on ${d.toLocaleDateString()}`;
      }
      heatmapGrid.appendChild(cell);
    }

    // Show empty state message below heatmap if no activity at all
    const existingEmpty = heatmapGrid.parentElement.querySelector('.heatmap-empty');
    if (existingEmpty) existingEmpty.remove();
    if (!hasActivity) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'heatmap-empty';
      emptyMsg.textContent = 'Start completing streak days to see your activity light up here! 🔥';
      heatmapGrid.parentElement.appendChild(emptyMsg);
    }
  }

  // ====================== ANALYTICS CHART ======================
  function renderAnalytics(activityLogs) {
    const weeklyEl = document.getElementById('weekly-report-content');

    // ── Chart: Days completed per streak ──
    const ctx = document.getElementById('progress-chart');
    if (ctx) {
      if (progressChart) { progressChart.destroy(); progressChart = null; }

      const labels = streaks.map(s => s.topic.length > 18 ? s.topic.slice(0, 16) + '…' : s.topic);
      const completed = streaks.map(s => s.days.filter(d => d === true || d === 'frozen').length);
      const targets = streaks.map(s => s.targetDays);

      if (streaks.length === 0) {
        ctx.style.display = 'none';
      } else {
        ctx.style.display = '';
        progressChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Days Completed',
                data: completed,
                backgroundColor: 'rgba(110,84,247,0.7)',
                borderColor: 'rgba(110,84,247,1)',
                borderRadius: 6,
                borderWidth: 1,
              },
              {
                label: 'Target Days',
                data: targets,
                backgroundColor: 'rgba(0,212,255,0.15)',
                borderColor: 'rgba(0,212,255,0.5)',
                borderRadius: 6,
                borderWidth: 1,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'Inter', size: 11 }, boxWidth: 12 }
              },
              tooltip: { mode: 'index', intersect: false }
            },
            scales: {
              x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 } }
              },
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 }, precision: 0 }
              }
            }
          }
        });
      }
    }

    // ── Weekly text report ──
    if (weeklyEl) {
      const now = new Date();
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      const recentLogs = activityLogs.filter(l => new Date(l.date) >= weekAgo);
      const totalThisWeek = recentLogs.reduce((sum, l) => sum + (l.count || 0), 0);
      const activeDays = recentLogs.filter(l => l.count > 0).length;

      const totalCompleted = streaks.reduce((sum, s) => sum + s.days.filter(d => d === true || d === 'frozen').length, 0);
      const activeStreaks = streaks.filter(s => {
        const done = s.days.filter(d => d === true || d === 'frozen').length;
        return done < s.targetDays;
      }).length;

      if (streaks.length === 0) {
        weeklyEl.innerHTML = `<span style="color:var(--t3)">No streaks yet — create one to see your weekly report here!</span>`;
      } else {
        weeklyEl.innerHTML = `
          <div class="report-grid">
            <div class="report-stat"><span class="report-val text-gradient">${totalThisWeek}</span><span class="report-label">Activities this week</span></div>
            <div class="report-stat"><span class="report-val text-gradient">${activeDays}/7</span><span class="report-label">Active days</span></div>
            <div class="report-stat"><span class="report-val text-gradient">${totalCompleted}</span><span class="report-label">Total days completed</span></div>
            <div class="report-stat"><span class="report-val text-gradient">${activeStreaks}</span><span class="report-label">Active streaks</span></div>
          </div>
          <p style="font-size:.78rem;color:var(--t3);margin-top:.85rem;line-height:1.6">
            ${activeDays >= 5
              ? '🔥 Outstanding consistency! You\'re on fire this week.'
              : activeDays >= 3
              ? '💪 Good effort! Try to log activity every day for max gains.'
              : '🌱 Getting started — aim for at least 5 active days this week!'}
          </p>`;
      }
    }
  }

  async function checkAndUnlockBadges(stats) {
    const unlockedKeys = new Set(userBadges.map(b => b.badge_key));
    for (const bd of BADGE_DEFS) {
      if (!unlockedKeys.has(bd.key) && bd.check(stats, streaks)) {
        const result = await unlockBadge(currentUser.id, bd.key);
        if (result.inserted) {
          showBadgeToast({ emoji: bd.emoji, name: `Badge Unlocked: ${bd.name}` });
          userBadges.push({ badge_key: bd.key, unlocked_at: new Date().toISOString() });
        }
      }
    }
  }

  function showBadgeToast(bd) {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:10px;padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem;z-index:9998;box-shadow:0 4px 12px rgba(0,0,0,0.1);font-family:inherit;`;
    toast.innerHTML = `<span style="font-size:1.5rem">${bd.emoji}</span><div><div style="font-weight:600;font-size:0.9rem;color:var(--text-main)">${bd.name}</div></div>`;
    document.body.appendChild(toast);
    toast.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}], {duration:200,fill:'forwards'});
    setTimeout(() => { toast.animate([{opacity:1},{opacity:0}], {duration:300,fill:'forwards'}); setTimeout(() => toast.remove(), 300); }, 3000);
  }

  // ====================== DANGER BANNER (STREAK REMINDER) ======================
  function checkDangerBanner() {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 18) { dangerBanner.classList.add('hidden'); return; }

    const atRisk = streaks.filter(s => {
      const completed = s.days.filter(d => d === true || d === 'frozen').length;
      if (completed >= s.targetDays) return false;
      const nextIndex = s.days.findIndex(v => !v);
      return nextIndex >= 0;
    });

    if (atRisk.length > 0) {
      const longest = atRisk.reduce((a, b) => a.days.filter(d => d === true).length > b.days.filter(d => d === true).length ? a : b);
      const count = longest.days.filter(d => d === true).length;
      atRiskStreakId = longest.id;
      dangerText.textContent = `${longest.icon} "${longest.topic}" — ${count}-day streak at risk!`;
      dangerSub.textContent = `Complete today's progress before midnight to keep your streak alive.`;
      dangerBanner.classList.remove('hidden');
    } else {
      atRiskStreakId = null;
      dangerBanner.classList.add('hidden');
    }
  }

  btnDangerAction.addEventListener('click', () => {
    if (atRiskStreakId) openStreak(atRiskStreakId);
  });

  // ====================== NOTIFICATIONS ======================
  function checkNotifications() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const today = new Date(); today.setHours(0,0,0,0);
    streaks.forEach(streak => {
      if (!streak.deadline) return;
      const targetDate = new Date(streak.deadline);
      const diff = Math.ceil((targetDate - today) / (1000*60*60*24));
      const completed = streak.days.filter(Boolean).length;
      if (completed < streak.targetDays) {
        if (diff === 1 || diff === 0) new Notification('WinStreak Deadline Approaching!', { body: `${streak.topic} is due very soon!` });
        else if (diff < 0) new Notification('WinStreak Deadline Missed!', { body: `${streak.topic} is past due!` });
      }
    });
  }

  // ====================== RENDER DASHBOARD ======================
  function renderDashboard() {
    streaksList.innerHTML = '';
    if (streaks.length === 0) {
      streaksList.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">🎯</div>
          <p style="font-weight:700;font-size:1.1rem;margin-bottom:.4rem;">No streaks yet</p>
          <p class="subtitle">Create a new streak or pick a quick template to get started!</p>
        </div>`;
      return;
    }
    streaks.forEach(streak => {
      const completed = streak.days.filter(d => d === true || d === 'frozen').length;
      const pct = ((completed / streak.targetDays) * 100).toFixed(0);
      const card = document.createElement('div');
      card.className = 'streak-card';
      let footerRight = '';
      if (streak.deadline) {
        const dl = new Date(streak.deadline);
        const isPast = dl < new Date() && completed < streak.targetDays;
        footerRight = isPast
          ? `<span style="color:var(--danger);font-size:.72rem;font-weight:700;">⚠️ Overdue</span>`
          : `<span class="card-days-left">📅 ${dl.toLocaleDateString()}</span>`;
      } else {
        footerRight = `<span class="card-days-left">${streak.targetDays - completed} left</span>`;
      }
      card.innerHTML = `
        <div class="card-header">
          <span class="card-title"><span class="card-icon">${streak.icon || '🔥'}</span>${streak.topic}</span>
          <span class="badge ${streak.category === 'dday' ? 'warning' : ''}">${streak.targetDays}d</span>
        </div>
        <p class="card-progress-text">${completed} / ${streak.targetDays} days completed</p>
        <div class="card-mini-bar"><div class="card-fill" style="width:${pct}%"></div></div>
        <div class="card-footer-row">
          <span class="card-pct">${pct}%</span>
          ${footerRight}
        </div>
      `;
      card.addEventListener('click', () => openStreak(streak.id));
      streaksList.appendChild(card);
    });
  }

  // ====================== RENDER TROPHY WALL ======================
  function renderTrophyWall() {
    badgesGrid.innerHTML = '';
    const unlockedKeys = new Set(userBadges.map(b => b.badge_key));
    BADGE_DEFS.forEach(bd => {
      const unlocked = unlockedKeys.has(bd.key);
      const card = document.createElement('div');
      card.className = `badge-card ${unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="badge-emoji">${bd.emoji}</div>
        <div class="badge-name">${bd.name}</div>
        <div class="badge-desc">${bd.desc}</div>
        ${unlocked ? '<span class="badge-unlocked-tag">✓</span>' : ''}
      `;
      badgesGrid.appendChild(card);
    });
  }

  // ====================== RENDER TEMPLATES ======================
  function renderTemplates() {
    templatesGrid.innerHTML = '';
    TEMPLATES.forEach(t => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.innerHTML = `<div class="template-icon">${t.icon}</div><div class="template-name">${t.name}</div><div class="template-days">${t.days} days</div>`;
      card.addEventListener('click', async () => {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + t.days);
        const newStreak = {
          id: generateId(), topic: t.name, targetDays: t.days,
          deadline: deadline.toISOString().split('T')[0],
          days: Array(t.days).fill(false), icon: t.icon, category: t.category
        };
        await createStreak(currentUser.id, newStreak);
        templatesModal.classList.add('hidden');
        await loadAll();
      });
      templatesGrid.appendChild(card);
    });
  }

  // ====================== STREAK DETAIL ======================
  async function openStreak(id) {
    currentActiveStreakId = id;
    activeDayIndex = -1;
    currentTasks = await getTasks(id);
    showView(streakView);
    renderStreakDetail();
  }

  function renderStreakDetail() {
    const streak = streaks.find(s => s.id === currentActiveStreakId);
    if (!streak) return;
    streakTitle.textContent = `${streak.icon || '🔥'} ${streak.topic}`;
    if (streak.deadline) {
      const today = new Date(); today.setHours(0,0,0,0);
      const targetDate = new Date(streak.deadline);
      const cca = streak.days.filter(d => d === true || d === 'frozen').length;
      if (targetDate < today && cca < streak.targetDays) {
        streakDeadlineBadge.textContent = 'Deadline Passed!';
        streakDeadlineBadge.classList.add('warning');
      } else {
        streakDeadlineBadge.textContent = `Deadline: ${targetDate.toLocaleDateString()}`;
        streakDeadlineBadge.classList.remove('warning');
      }
    } else {
      streakDeadlineBadge.textContent = 'No Deadline';
      streakDeadlineBadge.classList.remove('warning');
    }
    renderGrid(streak);
  }

  function renderGrid(streak) {
    const cd = streak.days.filter(d => d === true || d === 'frozen').length;
    streakSubtitle.textContent = `Commitment to ${streak.targetDays} days.`;
    streakCount.textContent = cd;
    completedCount.textContent = `${cd}/${streak.targetDays}`;
    progressBar.style.width = `${(cd / streak.targetDays) * 100}%`;
    gridContainer.innerHTML = '';

    // Find first incomplete
    const nextIdx = streak.days.findIndex(v => !v);
    if (activeDayIndex === -1) activeDayIndex = (nextIdx !== -1) ? nextIdx : streak.targetDays - 1;

    streak.days.forEach((val, i) => {
      const block = document.createElement('div');
      block.className = 'day-block';
      if (i === activeDayIndex) block.style.outline = '2px solid var(--accent-1)';

      if (val === true) {
        block.textContent = i + 1;
        block.classList.add('completed');

      } else if (val === 'frozen') {
        block.innerHTML = '❄️';
        block.classList.add('completed');
        block.style.background = 'rgba(96, 165, 250, 0.15)';
        block.style.borderColor = 'rgba(96, 165, 250, 0.4)';
        block.style.color = '#60a5fa';
        if (i === activeDayIndex) block.style.outline = '2px solid var(--accent-1)';

      } else if (!val) {
        block.textContent = i + 1;

        if (i === nextIdx) {
          // ── The "active" next day ──
          // NEVER allow manual clicking to complete — tasks must all be done
          const dayTasks = currentTasks.filter(t => t.day_index === i);
          const doneTasks = dayTasks.filter(t => t.completed);
          const allDone = dayTasks.length > 0 && doneTasks.length === dayTasks.length;

          if (allDone) {
            // Edge case: all tasks done but day not yet marked (shouldn't normally happen,
            // but provide a safe fallback — auto-mark now)
            markDayCompleted(streak.id, i, block, false);
            return;
          } else {
            // Locked — no tasks or tasks remaining
            block.classList.add('task-locked');
            const remaining = dayTasks.length - doneTasks.length;
            block.title = dayTasks.length === 0
              ? 'Add tasks for this day first — then complete them all to mark the day done!'
              : `${remaining} task${remaining !== 1 ? 's' : ''} remaining — finish all tasks to complete this day`;
          }

        } else if (i < nextIdx && currentUserProfile && currentUserProfile.freezes > 0) {
          // Missed day — can be frozen with an Ice Shield
          block.classList.add('next-clickable');
          block.title = 'Click to use an Ice Shield (Freeze)!';
          block.style.borderColor = 'rgba(96, 165, 250, 0.5)';
          block.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Consume 1 Ice Shield to freeze this missed day?')) {
              markDayCompleted(streak.id, i, block, true);
            }
          });
        }
      }

      // Clicking any block always selects it to view its checklist
      block.addEventListener('click', () => {
        activeDayIndex = i;
        renderStreakDetail();
      });

      gridContainer.appendChild(block);
    });

    renderChecklist();
  }


  // ====================== CHECKLIST LOGIC ======================
  function renderChecklist() {
    if (activeDayIndex === -1) { checklistPanel.classList.add('hidden'); return; }
    checklistPanel.classList.remove('hidden');
    checklistTitle.textContent = `Day ${activeDayIndex + 1} Tasks`;
    
    // Carry Forward Logic
    if (activeDayIndex > 0) {
      const prevTasks = currentTasks.filter(t => t.day_index === activeDayIndex - 1 && !t.completed);
      // Remove prevTasks that are already carried forward (same text)
      const currentDayTexts = new Set(currentTasks.filter(t => t.day_index === activeDayIndex).map(t => t.text));
      const carryable = prevTasks.filter(t => !currentDayTexts.has(t.text));
      
      if (carryable.length > 0) {
        btnCarryForward.classList.remove('hidden');
        btnCarryForward.onclick = async () => {
          btnCarryForward.disabled = true;
          for (const pt of carryable) {
            const nt = await addTask(currentActiveStreakId, activeDayIndex, pt.text);
            currentTasks.push(nt);
          }
          btnCarryForward.disabled = false;
          renderChecklist();
        };
      } else {
        btnCarryForward.classList.add('hidden');
      }
    } else {
      btnCarryForward.classList.add('hidden');
    }
    
    const dayTasks = currentTasks.filter(t => t.day_index === activeDayIndex);
    checklistList.innerHTML = '';
    
    if (dayTasks.length === 0) {
      checklistList.innerHTML = '<p class="subtitle" style="font-size:0.9rem">No tasks listed for this day.</p>';
    }

    let completed = 0;
    dayTasks.forEach(task => {
      if (task.completed) completed++;
      const item = document.createElement('div');
      item.className = `task-item ${task.completed ? 'completed' : ''}`;
      
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'task-checkbox';
      cb.checked = task.completed;
      cb.addEventListener('change', async () => {
        task.completed = cb.checked;
        await updateTask(task.id, { completed: task.completed });
        renderChecklist();
        
        // Auto-mark day as complete when ALL tasks are done
        const allDayTasks = currentTasks.filter(t => t.day_index === activeDayIndex);
        if (allDayTasks.length > 0 && allDayTasks.every(t => t.completed)) {
          const streak = streaks.find(s => s.id === currentActiveStreakId);
          if (streak && !streak.days[activeDayIndex]) {
            showBadgeToast({ emoji: '✅', name: 'All Tasks Done! Day Completed!' });
            await markDayCompleted(currentActiveStreakId, activeDayIndex, cb.closest('.day-block') || document.createElement('div'), false);
          }
        }
      });

      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-button';
      delBtn.innerHTML = '✕';
      delBtn.style.color = 'var(--text-muted)';
      delBtn.addEventListener('click', async () => {
        await deleteTask(task.id);
        currentTasks = currentTasks.filter(t => t.id !== task.id);
        renderChecklist();
      });

      item.appendChild(cb);
      item.appendChild(span);
      item.appendChild(delBtn);
      checklistList.appendChild(item);
    });

    checklistProgress.textContent = `${completed}/${dayTasks.length}`;
    if (dayTasks.length > 0 && completed === dayTasks.length) checklistProgress.classList.add('completed-badge');
    else checklistProgress.classList.remove('completed-badge');
  }

  btnAddTask.addEventListener('click', async () => {
    const text = newTaskInput.value.trim();
    if (!text || activeDayIndex === -1) return;
    try {
      const nt = await addTask(currentActiveStreakId, activeDayIndex, text);
      currentTasks.push(nt);
      newTaskInput.value = '';
      renderChecklist();
      
      // Auto carry-forward past unfinished tasks to this active day? (Simple impl: ask user)
    } catch(e) { console.error(e); }
  });
  
  newTaskInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') btnAddTask.click(); });

  async function markDayCompleted(streakId, index, element, isFreeze) {
    const streak = streaks.find(s => s.id === streakId);
    if (!streak) return;
    streak.days[index] = isFreeze ? 'frozen' : true;
    
    // Call server to update, apply XP/Level logic and use tokens
    const result = await updateStreak(currentUser.id, streak, isFreeze);
    element.classList.remove('next-clickable');
    
    if (isFreeze) {
       showBadgeToast({ emoji: '❄️', name: 'Streak Frozen!' });
    } else {
       if (result.levelUp) showBadgeToast({ emoji: '⭐', name: `Level Up! Level ${result.newLevel}` });
       if (result.earnedFreeze) showBadgeToast({ emoji: '🛡️', name: `Gained 1 Ice Shield!` });
    }

    // Refresh everything
    await loadAll();

    if (streak.days.every(d => d === true || d === 'frozen')) {
      triggerConfetti();
      setTimeout(() => congratsModal.classList.remove('hidden'), 1000);
    }
    renderStreakDetail();
  }

  function triggerConfetti() {
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#3B82F6', '#60A5FA', '#ffffff'] });
      confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#3B82F6', '#60A5FA', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }

  // ====================== DELETE ======================
  btnDelete.addEventListener('click', () => deleteModal.classList.remove('hidden'));
  btnCancelDelete.addEventListener('click', () => deleteModal.classList.add('hidden'));
  btnConfirmDelete.addEventListener('click', async () => {
    deleteModal.classList.add('hidden');
    const id = currentActiveStreakId;
    currentActiveStreakId = null;
    try { await deleteStreak(id); streaks = streaks.filter(s => s.id !== id); } catch (e) { console.error(e); }
    showView(dashboardView);
    await loadAll();
  });


  // ====================== FOCUS MODE ======================
  const FOCUS_QUOTES = [
    "The successful warrior is the average man, with laser-like focus.",
    "Concentrate all your thoughts upon the work at hand.",
    "Starve your distractions. Feed your focus.",
    "It's not always that we need to do more but rather that we need to focus on less.",
    "Focus on being productive instead of busy.",
    "The key to success is to focus on goals, not obstacles.",
    "Where focus goes, energy flows.",
  ];

  const BLOCKED_SITES = {
    social: ['Facebook', 'Instagram', 'Twitter/X', 'TikTok', 'Snapchat', 'Reddit'],
    entertainment: ['YouTube', 'Netflix', 'Twitch', 'Disney+', 'Spotify'],
    gaming: ['Steam', 'Discord', 'Epic Games', 'Roblox'],
    shopping: ['Amazon', 'eBay', 'Flipkart', 'AliExpress'],
    news: ['CNN', 'BBC', 'Reddit News', 'Google News'],
  };

  btnStartFocus.addEventListener('click', () => {
    const savedDuration = localStorage.getItem('winstreak_focus_duration');
    if (savedDuration) {
      focusDurationInput.value = savedDuration;
      // Sync preset button highlight
      document.querySelectorAll('.focus-preset-btn').forEach(btn => {
        btn.classList.toggle('focus-preset-active', btn.dataset.min === savedDuration);
      });
    }
    const savedCustom = localStorage.getItem('winstreak_focus_custom');
    if (savedCustom) focusCustomSites.value = savedCustom;
    focusSettingsModal.classList.remove('hidden');
  });

  // Duration preset chips
  document.getElementById('focus-presets').addEventListener('click', (e) => {
    const btn = e.target.closest('.focus-preset-btn');
    if (!btn) return;
    document.querySelectorAll('.focus-preset-btn').forEach(b => b.classList.remove('focus-preset-active'));
    btn.classList.add('focus-preset-active');
    focusDurationInput.value = btn.dataset.min;
  });

  // Typing custom duration deselects presets
  focusDurationInput.addEventListener('input', () => {
    document.querySelectorAll('.focus-preset-btn').forEach(b => {
      b.classList.toggle('focus-preset-active', b.dataset.min === focusDurationInput.value);
    });
  });

  btnCloseFocusSettings.addEventListener('click', () => focusSettingsModal.classList.add('hidden'));

  btnActivateFocus.addEventListener('click', () => {
    const duration = parseInt(focusDurationInput.value, 10) || 25;
    localStorage.setItem('winstreak_focus_duration', duration);
    localStorage.setItem('winstreak_focus_custom', focusCustomSites.value);

    // Gather blocked categories
    const checkedCats = [];
    focusCategoriesEl.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      checkedCats.push(cb.value);
    });

    // Build blocklist display
    let blockedNames = [];
    checkedCats.forEach(cat => {
      if (BLOCKED_SITES[cat]) blockedNames.push(...BLOCKED_SITES[cat]);
    });
    const customLines = focusCustomSites.value.split('\n').map(s => s.trim()).filter(Boolean);
    blockedNames.push(...customLines);

    focusBlocklistDisplay.innerHTML = blockedNames.map(s =>
      `<span class="focus-blocked-tag">🚫 ${s}</span>`
    ).join('');

    focusSettingsModal.classList.add('hidden');
    startFocusMode(duration, blockedNames);
  });

  // ====================== FOCUS MODE ENGINE ======================
  let focusBlockedList = [];
  let tabWarnOverlay = null;

  function startFocusMode(durationMinutes, blockedNames = []) {
    isFocusActive = true;
    focusBlockedList = blockedNames;
    focusTotalTime = durationMinutes * 60;
    focusTimeLeft = focusTotalTime;
    focusQuoteEl.textContent = `"${FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)]}"`;
    focusOverlay.classList.remove('hidden');
    focusProgressBar.style.width = '100%';
    document.title = `🔒 ${formatMins(durationMinutes)} Focus — WinStreak`;

    updateFocusTimerDisplay();
    focusInterval = setInterval(() => {
      focusTimeLeft--;
      updateFocusTimerDisplay();
      document.title = `🔒 ${focusTimerDisplay.textContent} — WinStreak`;

      if (focusTimeLeft % 60 === 0 && focusTimeLeft > 0) {
        focusQuoteEl.textContent = `"${FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)]}"`;
      }

      if (focusTimeLeft <= 0) {
        endFocusMode(true);
        showBadgeToast({ emoji: '🎯', name: 'Focus Session Complete!' });
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('WinStreak Focus Mode', { body: `Great job! ${durationMinutes} min session done.` });
        }
      }
    }, 1000);

    // Tab-switch detection
    document.addEventListener('visibilitychange', handleTabSwitch);
    // Prevent accidental navigation away
    window.addEventListener('beforeunload', handleBeforeUnload);
  }

  function formatMins(m) {
    return m >= 60 ? `${Math.floor(m/60)}h${m%60 ? `${m%60}m` : ''}` : `${m}m`;
  }

  function handleTabSwitch() {
    if (!isFocusActive) return;
    if (document.hidden) {
      showTabWarnOverlay();
    } else {
      hideTabWarnOverlay();
    }
  }

  function handleBeforeUnload(e) {
    if (!isFocusActive) return;
    e.preventDefault();
    e.returnValue = 'You are in Focus Mode! Are you sure you want to leave?';
  }

  function showTabWarnOverlay() {
    if (tabWarnOverlay) return;
    tabWarnOverlay = document.createElement('div');
    tabWarnOverlay.className = 'tab-warn-overlay';
    tabWarnOverlay.innerHTML = `
      <div class="tab-warn-icon">🚨</div>
      <div class="tab-warn-title text-gradient">Hey! Stay Focused!</div>
      <div class="tab-warn-sub">You switched away during your focus session. Come back and keep going — you're capable of this!</div>
      <div class="tab-warn-timer" id="tab-warn-timer-display">${focusTimerDisplay.textContent} remaining</div>
      <button class="tab-warn-btn" id="tab-warn-resume">↩ Resume Focus</button>
    `;
    document.body.appendChild(tabWarnOverlay);
    document.getElementById('tab-warn-resume').addEventListener('click', () => {
      hideTabWarnOverlay();
      window.focus();
    });
  }

  function hideTabWarnOverlay() {
    if (tabWarnOverlay) {
      tabWarnOverlay.remove();
      tabWarnOverlay = null;
    }
  }

  function updateFocusTimerDisplay() {
    const m = Math.floor(focusTimeLeft / 60).toString().padStart(2, '0');
    const s = (focusTimeLeft % 60).toString().padStart(2, '0');
    focusTimerDisplay.textContent = `${m}:${s}`;
    const pct = (focusTimeLeft / focusTotalTime) * 100;
    focusProgressBar.style.width = `${pct}%`;
    // Update tab-warn overlay timer if visible
    const tw = document.getElementById('tab-warn-timer-display');
    if (tw) tw.textContent = `${m}:${s} remaining`;
  }

  function endFocusMode(completed = false) {
    isFocusActive = false;
    clearInterval(focusInterval);
    focusOverlay.classList.add('hidden');
    document.title = 'WinStreak';
    document.removeEventListener('visibilitychange', handleTabSwitch);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    hideTabWarnOverlay();
    // Reset end button state
    btnEndFocus.dataset.confirming = '0';
    btnEndFocus.textContent = '🔓 End Focus Mode';
    btnEndFocus.style.borderColor = '';
    btnEndFocus.style.color = '';
    if (!completed) {
      showBadgeToast({ emoji: '⏹', name: 'Focus session ended early.' });
    }
  }

  btnEndFocus.addEventListener('click', () => {
    if (btnEndFocus.dataset.confirming === '1') {
      endFocusMode(false);
    } else {
      btnEndFocus.dataset.confirming = '1';
      btnEndFocus.textContent = '⚠️ Tap again to end';
      btnEndFocus.style.borderColor = 'var(--danger)';
      btnEndFocus.style.color = 'var(--danger)';
      setTimeout(() => {
        if (btnEndFocus.dataset.confirming === '1') {
          btnEndFocus.dataset.confirming = '0';
          btnEndFocus.textContent = '🔓 End Focus Mode';
          btnEndFocus.style.borderColor = '';
          btnEndFocus.style.color = '';
        }
      }, 3000);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFocusActive) endFocusMode(false);
  });


  // ====================== MOBILE NAV AUTO-CLOSE ======================
  navRight.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a');
    if (btn && window.innerWidth <= 768) {
      setTimeout(() => navRight.classList.remove('mobile-visible'), 150);
    }
  });

  // ====================== PWA SETUPS ======================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('Service Worker registered: ', reg);
      }).catch(err => {
        console.log('Service Worker registration failed: ', err);
      });
    });
  }

});
