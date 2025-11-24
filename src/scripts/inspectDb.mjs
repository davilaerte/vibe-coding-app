// scripts/inspectDb.mjs
import { getDb } from "../db.mjs";

const db = getDb();

const rows = db
  .prepare(`
    SELECT id, created_at, level, prompt, match, comment, feedback_at
    FROM submissions
    ORDER BY created_at DESC
    LIMIT 20
  `)
  .all();

console.log(rows);