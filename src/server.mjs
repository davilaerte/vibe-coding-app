import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import submissionsRouter from "./routes/submissions.mjs";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");

app.use(cors());
app.use(express.json());

app.use(express.static(publicDir));

// API Route for submissions
app.use("/api/submissions", submissionsRouter);

// API Route for healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Initialize server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});