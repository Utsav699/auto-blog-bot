import rateLimit from "express-rate-limit";

// Rate limit on blog generation to avoid abusive API calls to Groq or GitHub
export const generateBlogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit each IP to 25 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many blog generation requests from this IP. Please try again after 15 minutes."
  }
});
