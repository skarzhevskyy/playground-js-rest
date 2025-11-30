import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabaseConfig {
  filename: string;
  inMemory?: boolean;
}

let db: Database.Database | null = null;

export function initDatabase(config?: DatabaseConfig): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = config?.inMemory
    ? ':memory:'
    : config?.filename || path.join(__dirname, '../../data/tasks.db');

  // Ensure data directory exists for file-based database
  if (!config?.inMemory && dbPath !== ':memory:') {
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetDatabase(): void {
  closeDatabase();
}

