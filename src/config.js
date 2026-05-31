import "dotenv/config";

function env(name, fallback = "") {
  return process.env[name] ?? fallback;
}

function numberEnv(name, fallback) {
  const value = Number.parseInt(env(name), 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizePrivateKey(value = "") {
  return String(value).replace(/\\n/g, "\n");
}

export function getMissingGenerationEnv() {
  return [
    "GROQ_API_KEY",
    "GITHUB_OWNER",
    "GITHUB_REPO",
    "GITHUB_TOKEN",
    "GOOGLE_SHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY"
  ].filter((key) => !env(key));
}

export default {
  app: {
    port: numberEnv("APP_PORT", 3000),
    timezone: env("APP_TIMEZONE", "Asia/Kolkata")
  },
  ai: {
    provider: "groq",
    groqApiKey: env("GROQ_API_KEY"),
    groqModel: env("GROQ_MODEL", "llama-3.3-70b-versatile")
  },
  github: {
    owner: env("GITHUB_OWNER"),
    repo: env("GITHUB_REPO"),
    branch: env("GITHUB_BRANCH", "main"),
    token: env("GITHUB_TOKEN")
  },
  google: {
    sheetId: env("GOOGLE_SHEET_ID"),
    sheetName: env("GOOGLE_SHEET_NAME", "Sheet1"),
    serviceAccountEmail: env("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    privateKey: normalizePrivateKey(env("GOOGLE_PRIVATE_KEY"))
  },
  blog: {
    author: "DG"
  },
  allowedCategories: ["Finance", "Health", "Govt Jobs", "Technology", "Cricket", "India", "Other"],
  upload: {
    maxFileSizeMB: 3.5,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  },
  imageCompression: {
    outputFormat: "png",
    pngCompressionLevel: 3,
    adaptiveFiltering: true
  },
  logs: {
    applicationLog: "logs/application.log",
    errorLog: "logs/error.log",
    maxLogSize: 5 * 1024 * 1024,
    backups: 5,
    compress: true
  }
};
