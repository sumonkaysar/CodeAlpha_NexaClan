const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const cookieToken = req.headers.cookie
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("nexaclan_token="))
    ?.slice("nexaclan_token=".length);
  const authHeader = req.headers.authorization;
  const token =
    cookieToken ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null);
  if (!token) {
    return res.status(401).json({ error: "Sign in to continue" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_error) {
    res.status(401).json({ error: "Your session has expired. Sign in again" });
  }
};

module.exports = authenticateToken;
