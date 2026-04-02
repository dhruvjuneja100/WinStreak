const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      freezes INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS streaks (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      topic TEXT NOT NULL,
      targetDays INTEGER NOT NULL,
      deadline TEXT,
      days TEXT NOT NULL,
      icon TEXT DEFAULT '🔥',
      category TEXT DEFAULT 'general',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_key TEXT NOT NULL,
      unlocked_at TEXT NOT NULL,
      UNIQUE(user_id, badge_key),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      streak_id TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (streak_id) REFERENCES streaks (id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id INTEGER NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users (id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      PRIMARY KEY (group_id, user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS streak_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      streak_id TEXT NOT NULL,
      day_index INTEGER NOT NULL,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      FOREIGN KEY (streak_id) REFERENCES streaks (id)
    )
  `);

  // Migrations for existing database
  db.run(`ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN freezes INTEGER DEFAULT 0`, () => {});
  db.run(`ALTER TABLE streaks ADD COLUMN icon TEXT DEFAULT '🔥'`, () => {});
  db.run(`ALTER TABLE streaks ADD COLUMN category TEXT DEFAULT 'general'`, () => {});
});

module.exports = db;
