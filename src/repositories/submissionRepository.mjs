// src/repositories/submissionRepository.mjs
import { getDb } from "../db.mjs";

const db = getDb();

// Prepare statements for performance and cleanliness
const insertSubmissionStmt = db.prepare(`
  INSERT INTO submissions (created_at, level, prompt, html)
  VALUES (@created_at, @level, @prompt, @html)
`);

const updateFeedbackStmt = db.prepare(`
  UPDATE submissions
  SET match = @match,
      comment = @comment,
      feedback_at = @feedback_at
  WHERE id = @id
`);

const getSubmissionByIdStmt = db.prepare(`
  SELECT *
  FROM submissions
  WHERE id = ?
`);

/**
 * Creates a new submission record.
 * @param {{ level: string, prompt: string, html: string }} data
 * @returns {{ id: number }}
 */
export function createSubmission({ level, prompt, html }) {
  const created_at = new Date().toISOString();

  const result = insertSubmissionStmt.run({
    created_at,
    level,
    prompt,
    html,
  });

  return { id: result.lastInsertRowid };
}

/**
 * Adds or updates feedback for a submission.
 * @param {{ id: number, match: string, comment?: string }} data
 * @returns {{ ok: boolean }}
 */
export function addFeedback({ id, match, comment }) {
  const feedback_at = new Date().toISOString();

  const result = updateFeedbackStmt.run({
    id,
    match,
    comment: comment || null,
    feedback_at,
  });

  return { ok: result.changes > 0 };
}

/**
 * Optional helper to fetch a submission (if you ever need it).
 */
export function getSubmissionById(id) {
  return getSubmissionByIdStmt.get(id);
}
