# Auto Blog Bot

A production-ready Node.js blog automation system that generates full blog posts from a web form, optionally accepts two uploaded images, converts/compresses images to PNG, pushes content to GitHub, logs publishing status to Google Sheets, and stores detailed rotating logs using Log4js.

---

# Features

- Form-based blog generation
- No automatic RSS searching
- No AI image generation
- User enters blog title manually
- User selects category manually
- Supports custom category using `Other`
- Generates full blog content
- Supports optional Image 1 upload
- Supports optional Image 2 upload
- Converts uploaded images to `.png`
- Compresses PNG images
- Pushes Markdown blog post to GitHub
- Pushes uploaded images to GitHub if provided
- Saves publishing logs to Google Sheets
- Uses Log4js for application/error logging
- Supports rotating compressed logs
- No `.env` required
- Runs on localhost

---

# Current Flow

```text
Open Form
→ Enter Blog Title
→ Select Category
→ If Other selected, enter custom category
→ Optional Upload Image 1
→ Optional Upload Image 2
→ Submit
→ Generate Full Blog Content
→ Convert Uploaded Images To PNG
→ Compress Uploaded Images
→ Push Blog Markdown To GitHub
→ Push Images To GitHub If Provided
→ Save Status To Google Sheet
→ Save Application/Error Logs
```

---

# Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web server and API |
| CORS | API request support |
| Multer | Image upload handling |
| Axios | HTTP requests / AI text API calls |
| Sharp | Image conversion and compression |
| Google APIs | Google Sheets logging |
| Log4js | Application/error logging with rotation |
| GitHub REST API | Push blog and image files |

---

# Compatible Versions

```bash
node --version
v22.12.0

npm --version
10.9.0
```

Recommended:

```text
Node.js >= 22.12.0
npm >= 10.9.0
```

---

# Project Structure

```text
auto-blog-bot/
│
│   package.json
│   README.md
│
├── logs/
│   ├── application.log
│   ├── error.log
│   ├── application.log.1.gz
│   └── error.log.1.gz
│
└── src/
    │
    │   config.js
    │   index.js
    │   logger.js
    │
    ├── automation/
    │   └── blog.automation.js
    │
    ├── middlewares/
    │   └── upload.middleware.js
    │
    ├── public/
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    │
    ├── services/
    │   ├── ai.service.js
    │   ├── blog.service.js
    │   ├── github.service.js
    │   ├── image-compressor.service.js
    │   ├── sheet.service.js
    │   └── upload.service.js
    │
    └── utils/
        └── slug.js
```

---

# Removed Old Files

These files are no longer required:

```text
src/services/rss.service.js
src/services/image.service.js
src/images/daily_ganga_post.png
```

---

# Required Installation Packages

Install all required dependencies:

```bash
npm install express cors multer axios googleapis log4js sharp
npm install groq-sdk dotenv
```

## Package Usage

| Package | Required For |
|---|---|
| `express` | Web server and API routes |
| `cors` | Cross-origin/API request handling |
| `multer` | Handling image uploads from form |
| `axios` | HTTP requests and AI text API calls |
| `googleapis` | Google Sheets logging |
| `log4js` | Application and error logs |
| `sharp` | Image conversion/compression to PNG |

---

# Remove Old Unused Packages

If your project still has old packages, remove them:

```bash
npm uninstall node-cron rss-parser winston winston-daily-rotate-file @google/generative-ai
```

Old packages no longer needed:

| Package | Reason Removed |
|---|---|
| `node-cron` | Auto RSS schedule removed |
| `rss-parser` | RSS search removed |
| `winston` | Replaced by Log4js |
| `winston-daily-rotate-file` | Replaced by Log4js rotation |
| `@google/generative-ai` | Gemini removed / optional |

---

# package.json

Replace your `package.json` with:

```json
{
  "name": "auto-blog-bot",
  "version": "1.0.0",
  "description": "Form-based auto blog generation system using Node.js, GitHub, Google Sheets, optional image uploads, PNG compression and Log4js logging",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node src/index.js"
  },
  "engines": {
    "node": ">=22.12.0",
    "npm": ">=10.9.0"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "googleapis": "^144.0.0",
    "log4js": "^6.9.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.5"
  }
}
```

---

# Configuration

Create:

```text
src/config.js
```

```js
export default {
  app: {
    port: 3000,
    timezone: "Asia/Kolkata"
  },

  github: {
    owner: "Utsav699",
    repo: "blogs",
    branch: "main",

    // GitHub fine-grained token
    // Required permission: Contents Read and Write
    token: "PASTE_FULL_GITHUB_TOKEN_HERE"
  },

  google: {
    sheetId: "PASTE_GOOGLE_SHEET_ID_HERE",

    serviceAccountEmail:
      "PASTE_SERVICE_ACCOUNT_EMAIL_HERE",

    privateKey: `-----BEGIN PRIVATE KEY-----
PASTE_FULL_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----`
  },

  blog: {
    author: "Daily Ganga"
  },

  allowedCategories: [
    "Finance",
    "Health",
    "Govt Jobs",
    "Technology",
    "Cricket",
    "India",
    "Other"
  ],

  upload: {
    maxFileSizeMB: 5,
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ]
  },

  imageCompression: {
    outputFormat: "png",
    pngCompressionLevel: 9,
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
```

---

# Form Fields

The frontend form includes:

```text
Blog Title              required
Category Dropdown       required
Other Category Textbox  shown only if category = Other
Image 1 Upload          optional
Image 2 Upload          optional
Submit Button
```

Allowed categories:

```text
Finance
Health
Govt Jobs
Technology
Cricket
India
Other
```

If `Other` is selected, the custom category textbox value becomes the blog category.

---

# Markdown Output

## If both images are uploaded

```md
---
title: "Blog Title"
date: "2026-05-23"
category: "Technology"
excerpt: "SEO based blog excerpt"
image: "/images/blog-slug.png"
image2: "/images/blog-slug-2.png"
author: "Daily Ganga"
---

# Blog Title

Generated blog content here...
```

## If only Image 1 is uploaded

```md
---
title: "Blog Title"
date: "2026-05-23"
category: "Technology"
excerpt: "SEO based blog excerpt"
image: "/images/blog-slug.png"
image2: ""
author: "Daily Ganga"
---
```

## If no images are uploaded

```md
---
title: "Blog Title"
date: "2026-05-23"
category: "Technology"
excerpt: "SEO based blog excerpt"
image: ""
image2: ""
author: "Daily Ganga"
---
```

Do not generate:

```text
image3
image4
source
```

---

# GitHub Output Paths

## Markdown

```text
posts/blog-slug.md
```

## Optional Uploaded Images

```text
public/images/blog-slug.png
public/images/blog-slug-2.png
```

All uploaded images are converted to `.png` before pushing.

---

# Image Upload Rules

Supported input formats:

```text
.jpg
.jpeg
.png
.webp
```

Output format:

```text
.png
```

Processing:

```text
User uploads image
→ Multer stores image in memory
→ Sharp converts image to PNG
→ Sharp compresses PNG
→ Image buffer pushed directly to GitHub
```

No local temporary upload folder is required.

---

# Logging System

This project uses **Log4js** for industry-standard logging.

## Log Files

```text
logs/application.log
logs/error.log
```

## Rotated Logs

```text
logs/application.log.1.gz
logs/error.log.1.gz
```

## Log Types

| File | Purpose |
|---|---|
| `application.log` | All application logs |
| `error.log` | Error-only logs |

## Rotation Rules

| Rule | Value |
|---|---|
| Max File Size | 5MB |
| Backups | 5 |
| Compression | Enabled |
| Application Logs | `logs/application.log` |
| Error Logs | `logs/error.log` |

---

# Logger Configuration

Create:

```text
src/logger.js
```

```js
import log4js from "log4js";
import fs from "fs";

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

log4js.configure({
  appenders: {
    application: {
      type: "file",
      filename: "logs/application.log",
      maxLogSize: 5 * 1024 * 1024,
      backups: 5,
      compress: true,
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
      }
    },

    errorFile: {
      type: "file",
      filename: "logs/error.log",
      maxLogSize: 5 * 1024 * 1024,
      backups: 5,
      compress: true,
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
      }
    },

    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
      }
    }
  },

  categories: {
    default: {
      appenders: ["application", "console"],
      level: "info"
    },

    error: {
      appenders: ["errorFile", "console"],
      level: "error"
    }
  }
});

const appLogger = log4js.getLogger("application");
const errorLogger = log4js.getLogger("error");

const logger = {
  info(message) {
    appLogger.info(message);
  },

  warn(message) {
    appLogger.warn(message);
  },

  debug(message) {
    appLogger.debug(message);
  },

  error(message) {
    appLogger.error(message);
    errorLogger.error(message);
  }
};

export default logger;
```

---

# Google Sheets Setup

## 1. Create Google Sheet

Create a sheet named:

```text
Blog Logs
```

First tab name:

```text
Sheet1
```

## 2. Add Columns

```text
DateTime
Status
Title
Slug
Category
MarkdownPath
ImagePath
Image2Path
PostDate
ErrorMessage
Author
```

## 3. Enable Google Sheets API

Open Google Cloud Console:

```text
Google Cloud Console
→ APIs & Services
→ Library
→ Google Sheets API
→ Enable
```

## 4. Create Service Account

```text
Google Cloud Console
→ IAM & Admin
→ Service Accounts
→ Create Service Account
```

Download JSON key.

Copy:

```json
client_email
private_key
```

Paste them into:

```text
src/config.js
```

## 5. Share Google Sheet

Share your Google Sheet with the service account email:

```text
service-account-name@project-id.iam.gserviceaccount.com
```

Permission:

```text
Editor
```

---

# GitHub Token Setup

## Create Token

Open GitHub:

```text
Settings
→ Developer Settings
→ Personal Access Tokens
→ Fine-grained tokens
→ Generate new token
```

## Required Repository Access

Select only:

```text
blogs
```

## Required Permission

```text
Contents → Read and Write
Metadata → Read-only
```

Paste token into:

```text
src/config.js
```

---

# API Endpoints

## Health Check

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "Daily Ganga Blog Automation API is running"
}
```

## Categories

```http
GET /api/categories
```

Response:

```json
{
  "success": true,
  "categories": [
    "Finance",
    "Health",
    "Govt Jobs",
    "Technology",
    "Cricket",
    "India",
    "Other"
  ]
}
```

## Generate Blog

```http
POST /api/generate-blog
```

Request type:

```text
multipart/form-data
```

Fields:

```text
title
category
customCategory
image1
image2
```

---

# Run Project

## Start Project

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Development Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Example Successful Output

```text
2026-05-23 18:20:10 [INFO] application - Blog automation form running at http://localhost:3000
2026-05-23 18:21:05 [INFO] application - Blog generation request received
2026-05-23 18:21:05 [INFO] application - Blog generation started
2026-05-23 18:21:22 [INFO] application - Blog generated successfully
2026-05-23 18:21:23 [INFO] application - Image 1 compressed successfully
2026-05-23 18:21:24 [INFO] application - GitHub markdown push completed
2026-05-23 18:21:25 [INFO] application - Google Sheet log completed
```

---

# Example GitHub Result

```text
blogs/
├── posts/
│   └── agentic-automation-digital-wallets-2026.md
│
└── public/
    └── images/
        ├── agentic-automation-digital-wallets-2026.png
        └── agentic-automation-digital-wallets-2026-2.png
```

---

# Security Notes

Important:

```text
Never commit real GitHub token
Never commit real Google private key
Never share service account JSON publicly
Regenerate exposed tokens immediately
Use private repo for automation source code
```

Recommended:

```text
Keep automation project private
Keep output blog repo public if needed
```

---

# Troubleshooting

## 1. GitHub 401 Unauthorized

Cause:

```text
Invalid token
Expired token
```

Fix:

```text
Generate new token with Contents Read and Write
```

## 2. GitHub 404 Not Found

Cause:

```text
Wrong owner
Wrong repo
Wrong branch
```

Fix:

```text
Check config.js GitHub values
```

## 3. Google Sheet Permission Error

Cause:

```text
Sheet not shared with service account
```

Fix:

```text
Share sheet with service account email as Editor
```

## 4. Image Upload Fails

Cause:

```text
Unsupported image format
File too large
```

Fix:

```text
Use JPG, PNG, JPEG, or WEBP
Keep image under configured max size
```

## 5. Logs Not Creating

Cause:

```text
logs folder permission issue
```

Fix:

```text
Create logs folder manually or run app with correct permission
```

---

# Final Result

This system creates a clean manual blog automation pipeline:

```text
Form Input
→ AI Blog Content
→ Optional Image Uploads
→ PNG Conversion + Compression
→ GitHub Publishing
→ Google Sheet Logging
→ Log4js Rotating Logs
```

No RSS automation, no AI image generation, no PM2, and no unnecessary local image storage.