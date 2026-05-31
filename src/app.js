import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";

import logger from "./logger.js";
import { generateBlogFromForm } from "./automation/blog.automation.js";
import { ALLOWED_CATEGORIES } from "./services/blog.service.js";
import { uploadBlogImages } from "./middlewares/upload.middleware.js";
import { requestIdMiddleware } from "./utils/request-id.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { generateBlogLimiter } from "./middlewares/security.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }
  })
);

app.use(requestIdMiddleware);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DG Blog Automation API is running",
    runtime: process.env.VERCEL ? "vercel" : "local",
    requestId: req.requestId
  });
});

app.get("/api/categories", (req, res) => {
  res.json({
    success: true,
    categories: ALLOWED_CATEGORIES,
    requestId: req.requestId
  });
});

app.post(
  "/api/generate-blog",
  generateBlogLimiter,
  uploadBlogImages,
  async (req, res, next) => {
    try {
      const { title, category, customCategory } = req.body;

      if (!title || !title.trim()) {
        logger.warn("Blog generation rejected: title missing");
        return res.status(400).json({
          success: false,
          message: "Blog title is required.",
          requestId: req.requestId
        });
      }

      if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        logger.warn(`Blog generation rejected: invalid category ${category}`);
        return res.status(400).json({
          success: false,
          message: "Valid category is required.",
          allowedCategories: ALLOWED_CATEGORIES,
          requestId: req.requestId
        });
      }

      if (category === "Other" && (!customCategory || !customCategory.trim())) {
        logger.warn("Blog generation rejected: custom category missing");
        return res.status(400).json({
          success: false,
          message: "Custom category is required when Other is selected.",
          requestId: req.requestId
        });
      }

      logger.info("Blog generation request received from form");

      const result = await generateBlogFromForm({
        title: title.trim(),
        category,
        customCategory: customCategory?.trim() || "",
        files: req.files || {}
      });

      return res.status(200).json({
        ...result,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  }
);

app.use(errorMiddleware);

export default app;
