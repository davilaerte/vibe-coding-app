// src/routes/submissions.mjs
import { Router } from "express";
import { QUESTION_ID } from "../config/questionConfig.mjs";
import {
  createSubmission,
  updateFeedback,
  getSubmission,
} from "../storage/submissionsStore.mjs";
import { generateHtmlFromPrompt } from "../services/openaiClient.mjs";

const router = Router();

/**
 * POST /api/submissions
 * Receives: { level, prompt }
 * Calls OpenAI to generate HTML, stores the submission, and returns { submissionId, html }.
 */
router.post("/", async (req, res) => {
  try {
    const { level, prompt } = req.body;

    if (!level || !prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ error: "Campos 'level' e 'prompt' são obrigatórios." });
    }

    const html = await generateHtmlFromPrompt(prompt);

    if (!html || typeof html !== "string") {
      // Fallback: no usable code returned
      const submission = createSubmission({
        level,
        questionId: QUESTION_ID,
        promptText: prompt,
        htmlGenerated: "",
        errorFlag: true,
      });

      return res.status(502).json({
        error:
          "Não foi possível gerar um código válido a partir da descrição fornecida. Tente novamente ou avise o professor.",
        submissionId: submission.id,
      });
    }

    // Basic sanity check: ensure it looks like an HTML document
    const normalized = html.toLowerCase();
    if (!normalized.includes("<html")) {
      const submission = createSubmission({
        level,
        questionId: QUESTION_ID,
        promptText: prompt,
        htmlGenerated: html,
        errorFlag: true,
      });

      return res.status(502).json({
        error:
          "A resposta gerada não parece representar um código coerente para a aplicação solicitada. Tente reformular sua descrição ou avise o professor.",
        submissionId: submission.id,
      });
    }

    const submission = createSubmission({
      level,
      questionId: QUESTION_ID,
      promptText: prompt,
      htmlGenerated: html,
      errorFlag: false,
    });

    return res.json({
      submissionId: submission.id,
      html,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error:
        "Ocorreu um erro interno ao gerar o código da aplicação. Tente novamente mais tarde ou avise o professor.",
    });
  }
});

/**
 * POST /api/submissions/:id/feedback
 * Receives: { match, comment }
 * Updates student's feedback for a given submission.
 */
router.post("/:id/feedback", (req, res) => {
  const { id } = req.params;
  const { match, comment } = req.body;

  if (!match) {
    return res
      .status(400)
      .json({ error: "Campo 'match' é obrigatório (sim/parcial/nao)." });
  }

  const updated = updateFeedback(id, { match, comment });

  if (!updated) {
    return res.status(404).json({ error: "Submissão não encontrada." });
  }

  return res.json({ ok: true });
});

/**
 * (Optional) GET /api/submissions/:id
 * Returns submission details (useful for debugging or later analysis).
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const submission = getSubmission(id);

  if (!submission) {
    return res.status(404).json({ error: "Submissão não encontrada." });
  }

  return res.json(submission);
});

export default router;
