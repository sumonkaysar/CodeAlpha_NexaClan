const jwt = require("jsonwebtoken");

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.headers.cookie
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("nexaclan_token="))
    ?.slice("nexaclan_token=".length);
  const token =
    cookieToken ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null);
  if (!token && !authHeader) return next();
  if (!token) {
    return res.status(401).json({ error: "Invalid authorization header" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_error) {
    res.status(401).json({ error: "Your session has expired. Sign in again" });
  }
};

module.exports = optionalAuthMiddleware;
