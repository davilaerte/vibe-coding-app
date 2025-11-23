// public/main.js

// Base URL for the API. Since front and back are served by the same server,
// we can use a relative path.
const apiBase = "";

// Keeps track of the current submission id (for feedback).
let currentSubmissionId = null;

// Cache DOM elements
const levelEl = document.getElementById("level");
const promptEl = document.getElementById("prompt");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const previewFrame = document.getElementById("preview-frame");

const feedbackSection = document.getElementById("feedback-section");
const feedbackBtn = document.getElementById("feedback-btn");
const feedbackStatusEl = document.getElementById("feedback-status");
const commentEl = document.getElementById("comment");

/**
 * Simple client-side sanitization:
 * - remove any <script> tags to avoid running arbitrary JS.
 * This is not a full sanitizer, but is enough for this controlled scenario.
 */
function sanitizeHtml(html) {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Remove only external script tags (with src), keep inline scripts
  return html.replace(
    /<script[^>]*src=("[^"]*"|'[^']*')[^>]*>\s*<\/script>/gi,
    ""
  );
}

/**
 * Helper to set status text with color.
 */
function setStatus(message, color = "black") {
  statusEl.textContent = message;
  statusEl.style.color = color;
}

/**
 * Helper to set feedback status text with color.
 */
function setFeedbackStatus(message, color = "black") {
  feedbackStatusEl.textContent = message;
  feedbackStatusEl.style.color = color;
}

/**
 * Handles the click on "Gerar página".
 */
async function handleSubmitClick() {
  const MAX_PROMPT_LENGTH = 1500;

  console.log("Aqui foi!!")

  const level = levelEl.value;
  const prompt = promptEl.value.trim();

  if (!level || !prompt) {
    setStatus("Preencha o nível e a sua descrição (prompt) antes de continuar.", "red");
    return;
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    setStatus(
      `Sua descrição está muito longa. Tente resumir para até ${MAX_PROMPT_LENGTH} caracteres, focando no que a aplicação deve mostrar e fazer.`,
      "red"
    );
    return;
  }

  setStatus("Gerando a página a partir da sua descrição...", "black");
  previewFrame.srcdoc = "";
  feedbackSection.style.display = "none";
  setFeedbackStatus("");

  console.log("Aqui foi!!  - 2")

  submitBtn.disabled = true;

  try {
    console.log("Aqui foi!!  - request")
    const resp = await fetch(apiBase + "/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ level, prompt }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      // Backend returned an error message
      const msg =
        data && data.error
          ? data.error
          : "Ocorreu um erro ao gerar o código da aplicação.";
      setStatus(msg, "red");
      currentSubmissionId = data && data.submissionId ? data.submissionId : null;
      return;
    }

    // On success, we expect { submissionId, html }
    currentSubmissionId = data.submissionId || null;

    let html = data.html || "";
    html = sanitizeHtml(html);

    previewFrame.srcdoc = html;
    setStatus(
      "Página gerada. Observe o resultado abaixo e depois faça a avaliação.",
      "green"
    );

    // Show feedback section
    feedbackSection.style.display = "block";
    // Clear previous feedback
    document
      .querySelectorAll("input[name='match']")
      .forEach((el) => (el.checked = false));
    commentEl.value = "";
    setFeedbackStatus("");
  } catch (err) {
    console.error(err);
    setStatus(
      "Erro de conexão ao tentar gerar o código da aplicação. Tente novamente.",
      "red"
    );
  } finally {
    submitBtn.disabled = false;
  }
}

/**
 * Handles the click on "Enviar avaliação".
 */
async function handleFeedbackClick() {
  if (!currentSubmissionId) {
    setFeedbackStatus(
      "Nenhuma submissão encontrada para avaliar. Gere a página primeiro.",
      "red"
    );
    return;
  }

  const matchRadio = document.querySelector("input[name='match']:checked");
  if (!matchRadio) {
    setFeedbackStatus(
      "Selecione se a página correspondeu ou não ao que você imaginava.",
      "red"
    );
    return;
  }

  const match = matchRadio.value; // "sim" | "parcial" | "nao"
  const comment = commentEl.value.trim();

  setFeedbackStatus("Enviando sua avaliação...", "black");
  feedbackBtn.disabled = true;

  try {
    const resp = await fetch(
      apiBase + `/api/submissions/${currentSubmissionId}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ match, comment }),
      }
    );

    const data = await resp.json();

    if (!resp.ok || !data.ok) {
      const msg =
        data && data.error
          ? data.error
          : "Ocorreu um erro ao registrar a avaliação.";
      setFeedbackStatus(msg, "red");
      return;
    }

    setFeedbackStatus("Avaliação registrada com sucesso. Obrigado!", "green");
  } catch (err) {
    console.error(err);
    setFeedbackStatus(
      "Erro de conexão ao enviar a avaliação. Tente novamente.",
      "red"
    );
  } finally {
    feedbackBtn.disabled = false;
  }
}

// Attach event listeners
submitBtn.addEventListener("click", handleSubmitClick);
feedbackBtn.addEventListener("click", handleFeedbackClick);