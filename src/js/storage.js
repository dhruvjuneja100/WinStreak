const STORAGE_KEY = 'streaks_tracker_db';
const THEME_KEY = 'streaks_theme';

export function getStreaks() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveStreaks(streaks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(streaks));
}

export function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Theme storage
export function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
