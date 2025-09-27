const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create database file in backend folder
const dbPath = path.join(__dirname, '..', 'contacts.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Seed default admin user if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin', 'admin@example.com', hashedPassword, 'admin');
}

module.exports = db;
