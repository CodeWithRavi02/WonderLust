const express = require("express");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { createToken, requireAuth } = require("../middleware/auth");
const { ApiError, requireDatabase } = require("../middleware/errors");

const router = express.Router();
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." },
});

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    instructorStatus: user.instructorStatus,
    avatarUrl: user.avatarUrl,
  };
}

router.post("/logout", (_req, res) => {
  res.clearCookie("orbit_session", cookieOptions);
  return res.json({ data: { signedOut: true } });
});

router.use(requireDatabase);

router.post("/register", authLimiter, async (req, res) => {
  const { name, email, password, role = "student" } = req.body;
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new ApiError(503, "Authentication is not configured. Set a JWT_SECRET of at least 32 characters.");
  }
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
    throw new ApiError(400, "Please enter a name between 2 and 80 characters.");
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new ApiError(400, "Please enter a valid email address.");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new ApiError(400, "Your password must be between 8 and 128 characters.");
  }
  if (!["student", "instructor"].includes(role)) {
    throw new ApiError(400, "Choose a valid account type.");
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
    instructorStatus: role === "instructor" ? "pending" : "not_applicable",
  });
  const token = createToken(user);
  res.cookie("orbit_session", token, cookieOptions);
  return res.status(201).json({ data: { user: publicUser(user) } });
});

router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Email or password is incorrect.");
  }
  const token = createToken(user);
  res.cookie("orbit_session", token, cookieOptions);
  return res.json({ data: { user: publicUser(user) } });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ data: { user: publicUser(req.user) } });
});

module.exports = router;
