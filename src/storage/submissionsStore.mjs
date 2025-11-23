import { randomUUID } from "crypto";

const submissions = new Map();

export function createSubmission({ level, questionId, promptText, htmlGenerated, errorFlag }) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  const submission = {
    id,
    level,
    questionId,
    promptText,
    htmlGenerated,
    errorFlag: !!errorFlag,
    createdAt,
    feedbackMatch: null,
    feedbackComment: null,
    feedbackCreatedAt: null,
  };

  submissions.set(id, submission);
  return submission;
}

export function updateFeedback(id, { match, comment }) {
  const submission = submissions.get(id);
  if (!submission) return null;

  submission.feedbackMatch = match ?? null;
  submission.feedbackComment = comment ?? null;
  submission.feedbackCreatedAt = new Date().toISOString();

  submissions.set(id, submission);
  return submission;
}

export function getSubmission(id) {
  return submissions.get(id) || null;
}

export function listSubmissions() {
  return Array.from(submissions.values());
}
