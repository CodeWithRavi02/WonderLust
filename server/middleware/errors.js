class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireDatabase(_req, _res, next) {
  const mongoose = require("mongoose");
  if (mongoose.connection.readyState !== 1) {
    return next(new ApiError(503, "The database is unavailable. Configure MONGODB_URI and try again."));
  }
  return next();
}

function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;

  if (error.code === 11000) {
    return res.status(409).json({ message: "An account or record with those details already exists." });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "The submitted data is invalid." });
  }

  const expectedApiError = error instanceof ApiError;
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500 && !expectedApiError) console.error("API request failed:", error.message);
  return res.status(status).json({
    message: expectedApiError ? error.message : "Something went wrong. Please try again later.",
  });
}

module.exports = { ApiError, errorHandler, requireDatabase };
