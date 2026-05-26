import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";

import config from "./config.js";
import logger from "./logger.js";
import { generateBlogFromForm } from "./automation/blog.automation.js";
import { ALLOWED_CATEGORIES } from "./services/blog.service.js";
import { uploadBlogImages } from "./middlewares/upload.middleware.js";
import { requestIdMiddleware } from "./utils/request-id.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { generateBlogLimiter } from "./middlewares/security.middleware.js";

const app = express();
const PORT = config.app.port || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Global Security & Tracking Middlewares
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
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(requestIdMiddleware);
app.use(cors());

// 2. Payload Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 3. Static Assets Servicers
app.use(express.static(path.join(__dirname, "public")));

// 4. API Endpoints
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DG Blog Automation API is running",
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

      logger.info("======================================");
      logger.info("Blog generation request received from form");
      logger.info(`Requested title: ${title}`);
      logger.info(`Requested category: ${category}`);
      logger.info(`Requested custom category: ${customCategory || "N/A"}`);
      logger.info(`Image 1 uploaded: ${Boolean(req.files?.image1?.[0])}`);
      logger.info(`Image 2 uploaded: ${Boolean(req.files?.image2?.[0])}`);

      const result = await generateBlogFromForm({
        title: title.trim(),
        category,
        customCategory: customCategory?.trim() || "",
        files: req.files || {}
      });

      logger.info("Blog generation request completed successfully");
      logger.info("======================================");

      return res.status(200).json({
        ...result,
        requestId: req.requestId
      });
    } catch (error) {
      next(error);
    }
  }
);

// 5. Centralized Error Middleware (must be registered last)
app.use(errorMiddleware);

app.listen(PORT, () => {
  logger.info(`Blog automation form running at http://localhost:${PORT}`);
});