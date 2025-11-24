// src/middleware/checkAccessToken.mjs

// Simple token-based access control.
// If ACCESS_TOKEN env var is set, every request must send the same value
// in the "x-access-token" header. Otherwise, access is denied.
// If ACCESS_TOKEN is not set, the middleware lets everything pass (useful for local dev).
export function checkAccessToken(req, res, next) {
  const expected = process.env.ACCESS_TOKEN;

  // If there is no ACCESS_TOKEN configured, do not block requests.
  // You can change this behavior later if you want to force the token.
  if (!expected) {
    return next();
  }

  const received = req.header("x-access-token");

  if (!received || received !== expected) {
    return res.status(401).json({ error: "Acesso não autorizado." });
  }

  next();
}
