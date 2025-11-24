// src/db.mjs
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll keep the database file in a "data" folder in the project root
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, "vibe_coding.sqlite");


// Open database
const db = new Database(dbPath);

// Some sane defaults for SQLite
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS submissions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at      TEXT NOT NULL,
  level           TEXT NOT NULL,
  prompt          TEXT NOT NULL,
  html            TEXT NOT NULL,
  match           TEXT,       -- "sim" | "parcial" | "nao" (nullable until feedback)
  comment         TEXT,
  feedback_at     TEXT
);
`);

export function getDb() {
  return db;
}
