/**
 * Database Configuration
 * 
 * Configures SQLite database connection and initializes tables.
 */

const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../', process.env.DATABASE_URL || './data/tickets.db');

let db = null;

/**
 * Initialize database connection and create tables
 */
async function initializeDatabase() {
  try {
    await fs.ensureDir(path.dirname(dbPath));

    db = await sqlite.open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`Database connected: ${dbPath}`);

    // Tickets table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'Open',
        priority TEXT DEFAULT '3',
        category TEXT DEFAULT 'incident',
        impact TEXT,
        urgency TEXT,
        created_at DATETIME,
        resolved_at DATETIME,
        closed_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
      CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
    `);

    console.log('Database tables initialized successfully');

    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

function getDatabase() {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
}

async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
    console.log('Database connection closed');
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};