const express = require('express');
const cors = require('cors');
const db = require('./db.cjs');

const app = express();
app.use(cors());
app.use(express.json());

// ======================== USERS ========================
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  db.run(`INSERT INTO users (username, password, xp, level, freezes) VALUES (?, ?, 0, 1, 0)`, [username, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Username taken' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, username, xp: 0, level: 1, freezes: 0 });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT id, username, password, xp, level, freezes FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    if (row.password !== password) return res.status(401).json({ error: 'Invalid password' });
    res.json({ id: row.id, username: row.username, xp: row.xp, level: row.level, freezes: row.freezes });
  });
});

app.get('/api/user/:id', (req, res) => {
  db.get(`SELECT id, username, xp, level, freezes FROM users WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

// ======================== STREAKS ========================
app.get('/api/streaks', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  db.all(`SELECT * FROM streaks WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const streaks = rows.map(r => ({
      id: r.id, topic: r.topic, targetDays: r.targetDays,
      deadline: r.deadline, days: JSON.parse(r.days),
      icon: r.icon || '🔥', category: r.category || 'general'
    }));
    res.json(streaks);
  });
});

app.post('/api/streaks', (req, res) => {
  const { userId, streak } = req.body;
  db.run(`INSERT INTO streaks (id, user_id, topic, targetDays, deadline, days, icon, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [streak.id, userId, streak.topic, streak.targetDays, streak.deadline, JSON.stringify(streak.days), streak.icon || '🔥', streak.category || 'general'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
  });
});

// Marking a day complete (Awards XP, potentially Freezes)
app.put('/api/streaks/:id', (req, res) => {
  const { streak, userId, isFreeze } = req.body;
  db.run(`UPDATE streaks SET days = ? WHERE id = ?`,
    [JSON.stringify(streak.days), req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // If it's a freeze, consume a token and don't log activity/xp
      if (isFreeze) {
        db.run(`UPDATE users SET freezes = MAX(0, freezes - 1) WHERE id = ?`, [userId]);
        return res.json({ success: true, frozed: true });
      }

      // Log activity
      const today = new Date().toISOString().split('T')[0];
      db.run(`INSERT INTO activity_logs (user_id, streak_id, date) VALUES (?, ?, ?)`, [userId, req.params.id, today]);

      // Award XP
      const xpGain = 10;
      db.get(`SELECT xp, level, freezes FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err || !user) return res.json({ success: true });
        
        let newXp = user.xp + xpGain;
        let newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1; // Basic leveling formula
        
        // Award a freeze token every time user completes 7 days natively on a streak
        const completedDays = streak.days.filter(d => d === true).length; // Note: 'frozen' might be stored as 'frozen' not true, so filter true
        let newFreezes = user.freezes;
        if (completedDays > 0 && completedDays % 7 === 0) {
          newFreezes += 1;
        }

        db.run(`UPDATE users SET xp = ?, level = ?, freezes = ? WHERE id = ?`, [newXp, newLevel, newFreezes, userId], function(err) {
           res.json({ success: true, xpEarned: xpGain, levelUp: newLevel > user.level, newLevel, earnedFreeze: newFreezes > user.freezes });
        });
      });
  });
});

app.delete('/api/streaks/:id', (req, res) => {
  db.run(`DELETE FROM streaks WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    // Also delete associated activity logs
    db.run(`DELETE FROM activity_logs WHERE streak_id = ?`, [req.params.id]);
    db.run(`DELETE FROM streak_tasks WHERE streak_id = ?`, [req.params.id]);
    res.json({ success: true });
  });
});

// ======================== TASKS ========================
app.get('/api/streaks/:streakId/tasks', (req, res) => {
  db.all(`SELECT * FROM streak_tasks WHERE streak_id = ?`, [req.params.streakId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/streaks/:streakId/tasks', (req, res) => {
  const { dayIndex, text } = req.body;
  db.run(`INSERT INTO streak_tasks (streak_id, day_index, text, completed) VALUES (?, ?, ?, false)`,
    [req.params.streakId, dayIndex, text], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, streak_id: req.params.streakId, day_index: dayIndex, text, completed: false });
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const { text, completed } = req.body;
  if (text !== undefined) {
    db.run(`UPDATE streak_tasks SET text = ? WHERE id = ?`, [text, req.params.id], err => {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ success: true });
    });
  } else if (completed !== undefined) {
    db.run(`UPDATE streak_tasks SET completed = ? WHERE id = ?`, [completed ? 1 : 0, req.params.id], err => {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ success: true });
    });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  db.run(`DELETE FROM streak_tasks WHERE id = ?`, [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ======================== LEADERBOARD & COMMUNITY ========================
app.get('/api/leaderboard', (req, res) => {
  db.all(`SELECT id, username, xp, level, title_index FROM users ORDER BY xp DESC LIMIT 50`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Remove sensitive info (like passwords, which aren't selected anyway)
    res.json(rows || []);
  });
});

app.get('/api/groups', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  
  db.all(`
    SELECT g.* FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ?
  `, [userId], (err, rows) => {
     if (err) return res.status(500).json({ error: err.message });
     res.json(rows || []);
  });
});

app.post('/api/groups', (req, res) => {
  const { id, name, ownerId } = req.body;
  db.run(`INSERT INTO groups (id, name, owner_id) VALUES (?, ?, ?)`, [id, name, ownerId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`, [id, ownerId], err2 => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

app.post('/api/groups/:id/join', (req, res) => {
  const { userId } = req.body;
  db.run(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`, [req.params.id, userId], err => {
    if (err) {
       if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: 'Already a member' });
       return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.get('/api/groups/:id/members', (req, res) => {
  db.all(`
    SELECT u.id, u.username, u.xp, u.level FROM users u
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = ?
    ORDER BY u.xp DESC
  `, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// ======================== HEATMAP ========================
app.get('/api/activity/:userId', (req, res) => {
  db.all(`SELECT date, COUNT(*) as count FROM activity_logs WHERE user_id = ? GROUP BY date`, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// ======================== BADGES ========================
app.get('/api/badges', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  db.all(`SELECT badge_key, unlocked_at FROM badges WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/badges', (req, res) => {
  const { userId, badgeKey } = req.body;
  const now = new Date().toISOString();
  db.run(`INSERT OR IGNORE INTO badges (user_id, badge_key, unlocked_at) VALUES (?, ?, ?)`,
    [userId, badgeKey, now], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, inserted: this.changes > 0 });
  });
});

// ======================== STATS (for title system) ========================
app.get('/api/stats', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  db.all(`SELECT days FROM streaks WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    let totalCompleted = 0;
    rows.forEach(r => {
      const days = JSON.parse(r.days);
      totalCompleted += days.filter(d => d === true).length; // Only count authentic completed days, not frozen
    });
    res.json({ totalCompleted, totalStreaks: rows.length });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
