// src/routes/submissions.mjs
import { Router } from "express";
import {
  createSubmission,
  addFeedback,
  getSubmissionById,
} from "../repositories/submissionRepository.mjs";
import { generateHtmlFromPrompt } from "../services/openaiClient.mjs";
import { checkAccessToken } from "../middleware/checkAccessToken.mjs";

const MAX_PROMPT_LENGTH = 1500;

const router = Router();

/**
 * POST /api/submissions
 * Receives: { level, prompt }
 * Calls OpenAI to generate HTML, stores the submission, and returns { submissionId, html }.
 */
router.post("/", checkAccessToken, async (req, res) => {
  try {
    const { level, prompt } = req.body;

    if (!level || !prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ error: "Campos 'level' e 'prompt' são obrigatórios." });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res
        .status(400)
        .json({ error: "Descrição muito longa!" });
    }

    const html = await generateHtmlFromPrompt(prompt);

    if (!html || typeof html !== "string") {
      return res.status(502).json({
        error:
          "Não foi possível gerar um código válido a partir da descrição fornecida. Tente novamente ou avise o professor.",
        submissionId: submission.id,
      });
    }

    // Basic sanity check: ensure it looks like an HTML document
    const normalized = html.toLowerCase();
    if (!normalized.includes("<html")) {
      return res.status(502).json({
        error:
          "A resposta gerada não parece representar um código coerente para a aplicação solicitada. Tente reformular sua descrição ou avise o professor.",
        submissionId: submission.id,
      });
    }

    const { id } = createSubmission({ level, prompt, html });

    return res.json({
      submissionId: id,
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
router.post("/:id/feedback", checkAccessToken, (req, res) => {
  try {
    const submissionId = Number(req.params.id);
    const { match, comment } = req.body || {};

    if (!submissionId || Number.isNaN(submissionId)) {
      return res.status(400).json({ error: "ID de submissão inválido." });
    }

    if (!match) {
      return res.status(400).json({
        error:
          "Campo 'match' é obrigatório (por exemplo: 'sim', 'parcial' ou 'nao').",
      });
    }

    const { ok } = addFeedback({
      id: submissionId,
      match,
      comment: comment || "",
    });

    if (!ok) {
      return res
        .status(404)
        .json({ error: "Submissão não encontrada para registrar feedback." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao registrar feedback:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao registrar a avaliação." });
  }
});

/**
 * (Optional) GET /api/submissions/:id
 * Returns submission details (useful for debugging or later analysis).
 */
router.get("/:id", checkAccessToken, (req, res) => {
  const submissionId = Number(req.params.id);
  const submission = getSubmissionById(submissionId);

  if (!submission) {
    return res.status(404).json({ error: "Submissão não encontrada." });
  }

  return res.json(submission);
});

export default router;
