const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "fallbackSecret";

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

/**
 * Middleware to allow only Admin2 and Admin3
 */
const allowOnlyAdmin2AndAdmin3 = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  const { role } = req.user;
  if (role !== "admin2" && role !== "admin3") {
    return res.status(403).json({ message: "Access denied. Insufficient permissions." });
  }

  next();
};

module.exports = { verifyToken, allowOnlyAdmin2AndAdmin3 };
