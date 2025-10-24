const Database = require('better-sqlite3');
const path = require('path');

// Create database file in backend folder
const dbPath = path.join(__dirname, '..', 'contacts.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

module.exports = db;
