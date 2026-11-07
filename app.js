require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("./server/models");
const authRoutes = require("./server/routes/auth");
const courseRoutes = require("./server/routes/courses");
const enrollmentRoutes = require("./server/routes/enrollments");
const { ApiError, errorHandler } = require("./server/middleware/errors");

const app = express();
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 180,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:"],
    },
  },
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.use("/api", (_req, _res, next) => {
  next(new ApiError(404, "API route not found."));
});

const clientBuild = path.join(__dirname, "dist");
app.use(express.static(clientBuild));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientBuild, "index.html"), (error) => {
    if (error) next();
  });
});

app.use(errorHandler);

async function startServer() {
  const port = Number(process.env.PORT) || 4000;
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    mongoose.set("strictQuery", true);
    mongoose.connect(mongoUri)
      .then(() => console.info("MongoDB connected."))
      .catch((error) => console.error("MongoDB connection failed:", error.message));
  } else {
    console.warn("MONGODB_URI is not configured. Data and authentication endpoints will return 503.");
  }

  return app.listen(port, () => {
    console.info(`Orbit API listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
