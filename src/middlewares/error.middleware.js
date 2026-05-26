import multer from "multer";
import logger from "../logger.js";

/**
 * Centralized error handling middleware.
 * Ensures all uncaught route errors or upload validations are formatted cleanly and return JSON responses.
 */
export function errorMiddleware(err, req, res, next) {
  const requestId = req.requestId || "";

  // Log error with request ID
  logger.error(`Express error handler caught exception: ${err.message}`, err);

  // 1. Handle Multer-specific errors
  if (err instanceof multer.MulterError) {
    let userMessage = `Upload validation failed: ${err.message}`;

    if (err.code === "LIMIT_FILE_SIZE") {
      userMessage = "Image size must be maximum 5MB. Please upload a smaller image.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      userMessage = "Maximum 2 images are allowed.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      userMessage = "Only image1 and image2 are allowed. Extra image fields are not allowed.";
    }

    return res.status(400).json({
      success: false,
      message: userMessage,
      requestId
    });
  }

  // 2. Handle Custom Upload Service / File Filter Errors
  if (err.message && (
    err.message.includes("Only image1 and image2 are allowed") ||
    err.message.includes("Unsupported file type") ||
    err.message.includes("Image size must be maximum") ||
    err.message.includes("Maximum 2 images are allowed") ||
    err.message.includes("Only one file is allowed")
  )) {
    return res.status(400).json({
      success: false,
      message: err.message,
      requestId
    });
  }

  // 3. Fallback for generic errors
  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  return res.status(status).json({
    success: false,
    message,
    requestId
  });
}
