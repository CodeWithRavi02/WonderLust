const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError } = require("./errors");

function jwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new ApiError(503, "Authentication is not configured. Set a JWT_SECRET of at least 32 characters.");
  }
  return process.env.JWT_SECRET;
}

function createToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    jwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d", issuer: "orbit-api", audience: "orbit-web" },
  );
}

async function requireAuth(req, _res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  const sessionToken = scheme === "Bearer" && token ? token : req.cookies?.orbit_session;
  if (!sessionToken) return next(new ApiError(401, "Please log in to continue."));

  try {
    const payload = jwt.verify(sessionToken, jwtSecret(), { issuer: "orbit-api", audience: "orbit-web" });
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      return next(new ApiError(401, "Your session is invalid. Please log in again."));
    }
    const user = await User.findById(payload.sub).select("_id name email role instructorStatus");
    if (!user) return next(new ApiError(401, "Your account could not be found. Please log in again."));
    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Your session has expired. Please log in again."));
    }
    return next(error);
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(new ApiError(403, "You don't have permission to do that."));
    return next();
  };
}

module.exports = { createToken, requireAuth, requireRole };
