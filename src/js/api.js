const API_URL = 'http://localhost:3000/api';
const THEME_KEY = 'streaks_theme';

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function getUserProfile(userId) {
  const res = await fetch(`${API_URL}/user/${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function getStreaks(userId) {
  const res = await fetch(`${API_URL}/streaks?userId=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get streaks');
  return data;
}

export async function createStreak(userId, streak) {
  await fetch(`${API_URL}/streaks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, streak })
  });
}

export async function updateStreak(userId, streak, isFreeze = false) {
  const res = await fetch(`${API_URL}/streaks/${streak.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ streak, userId, isFreeze })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update streak');
  return data;
}

export async function deleteStreak(streakId) {
  await fetch(`${API_URL}/streaks/${streakId}`, { method: 'DELETE' });
}

// ====================== TASKS ======================
export async function getTasks(streakId) {
  const res = await fetch(`${API_URL}/streaks/${streakId}/tasks`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch tasks');
  return data;
}

export async function addTask(streakId, dayIndex, text) {
  const res = await fetch(`${API_URL}/streaks/${streakId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dayIndex, text })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add task');
  return data;
}

export async function updateTask(taskId, updates) {
  // updates: { text?: string, completed?: boolean }
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update task');
  return data;
}

export async function deleteTask(taskId) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete task');
  return data;
}

// ====================== LEADERBOARD & GROUPS ======================
export async function getLeaderboard() {
  const res = await fetch(`${API_URL}/leaderboard`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch leaderboard');
  return data;
}

export async function getGroups(userId) {
  const res = await fetch(`${API_URL}/groups?userId=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch groups');
  return data;
}

export async function createGroup(id, name, ownerId) {
  const res = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, ownerId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create group');
  return data;
}

export async function joinGroup(groupId, userId) {
  const res = await fetch(`${API_URL}/groups/${groupId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to join group');
  return data;
}

export async function getGroupMembers(groupId) {
  const res = await fetch(`${API_URL}/groups/${groupId}/members`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch group members');
  return data;
}

// Badges
export async function getBadges(userId) {
  const res = await fetch(`${API_URL}/badges?userId=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get badges');
  return data;
}

export async function unlockBadge(userId, badgeKey) {
  const res = await fetch(`${API_URL}/badges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, badgeKey })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to unlock badge');
  return data;
}

// Stats & Activity
export async function getActivityLogs(userId) {
  const res = await fetch(`${API_URL}/activity/${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch activity logs');
  return data;
}

export async function getStats(userId) {
  const res = await fetch(`${API_URL}/stats?userId=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
  return data;
}

export function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
