import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  GROQ_API_KEY: z.string({
    required_error: "GROQ_API_KEY is required"
  }).min(1, "GROQ_API_KEY cannot be empty"),
  
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  
  GITHUB_OWNER: z.string({
    required_error: "GITHUB_OWNER is required"
  }).min(1, "GITHUB_OWNER cannot be empty"),
  
  GITHUB_REPO: z.string({
    required_error: "GITHUB_REPO is required"
  }).min(1, "GITHUB_REPO cannot be empty"),
  
  GITHUB_BRANCH: z.string().default("main"),
  
  GITHUB_TOKEN: z.string({
    required_error: "GITHUB_TOKEN is required"
  }).min(1, "GITHUB_TOKEN cannot be empty"),
  
  GOOGLE_SHEET_ID: z.string({
    required_error: "GOOGLE_SHEET_ID is required"
  }).min(1, "GOOGLE_SHEET_ID cannot be empty"),
  
  GOOGLE_SHEET_NAME: z.string().default("Sheet1"),
  
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string({
    required_error: "GOOGLE_SERVICE_ACCOUNT_EMAIL is required"
  }).email("GOOGLE_SERVICE_ACCOUNT_EMAIL must be a valid email address"),
  
  GOOGLE_PRIVATE_KEY: z.string({
    required_error: "GOOGLE_PRIVATE_KEY is required"
  }).min(1, "GOOGLE_PRIVATE_KEY cannot be empty"),
  
  APP_PORT: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : undefined),
    z.number().int().positive().default(3000)
  ),
  
  APP_TIMEZONE: z.string().default("Asia/Kolkata")
});

// Validate all environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid application configuration:");
  parsedEnv.error.errors.forEach((err) => {
    console.error(`  - ${err.path.join(".")}: ${err.message}`);
  });
  process.exit(1);
}

const env = parsedEnv.data;

export default {
  app: {
    port: env.APP_PORT,
    timezone: env.APP_TIMEZONE,
  },

  ai: {
    provider: "groq",
    groqApiKey: env.GROQ_API_KEY,
    groqModel: env.GROQ_MODEL,
  },

  github: {
    owner: env.GITHUB_OWNER,
    repo: env.GITHUB_REPO,
    branch: env.GITHUB_BRANCH,
    token: env.GITHUB_TOKEN,
  },

  google: {
    sheetId: env.GOOGLE_SHEET_ID,
    sheetName: env.GOOGLE_SHEET_NAME,
    serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },

  blog: {
    author: "DG",
  },

  allowedCategories: [
    "Finance",
    "Health",
    "Govt Jobs",
    "Technology",
    "Cricket",
    "India",
    "Other",
  ],

  upload: {
    maxFileSizeMB: 5,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  },

  imageCompression: {
    outputFormat: "png",
    // Level 0-9 png compression (lossless). Balanced at 3 for speed / size
    pngCompressionLevel: 3,
    adaptiveFiltering: true,
  },

  logs: {
    applicationLog: "logs/application.log",
    errorLog: "logs/error.log",
    maxLogSize: 5 * 1024 * 1024,
    backups: 5,
    compress: true,
  },
};
