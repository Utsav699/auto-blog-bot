import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Get the request ID for the current execution context.
 * @returns {string} The active request ID or an empty string.
 */
export function getRequestId() {
  return asyncLocalStorage.getStore() || "";
}

/**
 * Execute a callback within an async storage context with a specific request ID.
 * @param {string} requestId 
 * @param {Function} callback 
 */
export function runWithRequestId(requestId, callback) {
  return asyncLocalStorage.run(requestId, callback);
}

/**
 * Express middleware to assign a unique request ID to each request.
 * Automatically checks for an existing X-Request-ID header, otherwise generates a new UUID.
 */
export function requestIdMiddleware(req, res, next) {
  const requestId = req.headers["x-request-id"] || req.headers["X-Request-ID"] || randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  asyncLocalStorage.run(requestId, () => {
    next();
  });
}
