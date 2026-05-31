# 🚀 Auto Blog Bot

Production-ready blog automation platform built with Node.js that generates SEO-friendly blog content, processes uploaded images, publishes content directly to GitHub, logs publishing activity to Google Sheets, and provides enterprise-grade monitoring and logging.

---

## 📖 Overview

Auto Blog Bot streamlines blog publishing by combining content generation, image processing, repository publishing, and activity tracking into a single workflow.

Designed for developers, content teams, marketers, publishers, and automation engineers who need a reliable blog publishing pipeline.

---

## ✨ Key Features

### Content Generation

* AI-powered blog content generation
* SEO-friendly article structure
* Automatic slug generation
* Category-based publishing
* Custom category support

### Image Processing

* Upload up to two images
* JPG, JPEG, PNG, WEBP support
* Automatic PNG conversion
* Image compression and optimization
* GitHub image publishing

### Publishing

* Direct GitHub repository publishing
* Markdown generation
* Frontmatter generation
* Automatic content organization

### Monitoring & Logging

* Structured application logs
* Error tracking
* Rotating compressed logs
* Google Sheets publishing records
* Health monitoring endpoints

### Developer Experience

* Modular architecture
* Environment-based configuration
* REST API support
* Vercel deployment support
* Docker deployment ready

---

# 🏗 Architecture

```text
┌─────────────────────┐
│     User Form       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Express API      │
└──────────┬──────────┘
           │
 ┌─────────┼─────────┐
 │         │         │
 ▼         ▼         ▼

AI      Image      Logging
Service Service    Service

 │         │
 ▼         ▼

GitHub   Google
Service  Sheets

 │         │
 └────┬────┘
      ▼

 Published Blog
```

---

# ⚙️ Technology Stack

| Technology        | Purpose              |
| ----------------- | -------------------- |
| Node.js           | Runtime Environment  |
| Express.js        | Backend Framework    |
| Multer            | File Upload Handling |
| Sharp             | Image Processing     |
| Axios             | HTTP Requests        |
| GitHub API        | Blog Publishing      |
| Google Sheets API | Activity Tracking    |
| Log4js            | Logging System       |
| Vercel            | Cloud Deployment     |

---

# 📂 Project Structure

```text
auto-blog-bot/

├── src/
│
├── api/
│
├── logs/
│
├── public/
│
├── uploads/
│
├── package.json
├── README.md
├── vercel.json
└── .env
```

---

# 🔄 Workflow

```text
User Creates Blog
        │
        ▼
Enter Title & Category
        │
        ▼
Upload Optional Images
        │
        ▼
Generate Blog Content
        │
        ▼
Convert Images to PNG
        │
        ▼
Compress Images
        │
        ▼
Push Blog to GitHub
        │
        ▼
Store Activity in Sheets
        │
        ▼
Save Logs
        │
        ▼
Publishing Complete
```

---

# 🔐 Environment Variables

Create a `.env` file:

```env
PORT=3000

GROQ_API_KEY=

GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
GITHUB_TOKEN=

GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

APP_TIMEZONE=Asia/Kolkata
```

---

# 🚀 Local Development

## Install Dependencies

```bash
npm install
```

## Start Application

```bash
npm run dev
```

or

```bash
npm start
```

Application:

```text
http://localhost:3000
```

---

# 📡 API Endpoints

## Health Check

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "Auto Blog Bot API Running"
}
```

---

## Categories

```http
GET /api/categories
```

---

## Generate Blog

```http
POST /api/generate-blog
```

Request Type:

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

# 🖼 Image Processing

Supported Formats:

```text
JPG
JPEG
PNG
WEBP
```

Output Format:

```text
PNG
```

Processing Pipeline:

```text
Upload
 ↓
Validation
 ↓
PNG Conversion
 ↓
Compression
 ↓
GitHub Upload
```

---

# 📁 GitHub Publishing Structure

```text
repository/

├── posts/
│   └── blog-post.md
│
└── public/
    └── images/
        ├── image-1.png
        └── image-2.png
```

---

# 📊 Google Sheets Integration

Logs every publishing event:

| Field        |
| ------------ |
| DateTime     |
| Status       |
| Title        |
| Slug         |
| Category     |
| MarkdownPath |
| ImagePath    |
| ErrorMessage |

---

# 📝 Logging System

## Application Logs

```text
logs/application.log
```

## Error Logs

```text
logs/error.log
```

## Rotation Policy

| Setting       | Value   |
| ------------- | ------- |
| Max File Size | 5 MB    |
| Backups       | 5       |
| Compression   | Enabled |

---

# ☁️ Vercel Deployment

## Install Vercel CLI

```bash
npm install -g vercel
```

## Deploy

```bash
vercel
```

## Production Deploy

```bash
vercel --prod
```

## Required Environment Variables

```text
GROQ_API_KEY
GITHUB_TOKEN
GOOGLE_SHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
```

---

# 🐳 Docker Deployment

## Build Image

```bash
docker build -t auto-blog-bot .
```

## Run Container

```bash
docker run -p 3000:3000 auto-blog-bot
```

---

# 🔒 Security Best Practices

* Never commit secrets to GitHub
* Store credentials in environment variables
* Use private repositories for source code
* Rotate GitHub tokens regularly
* Restrict Google Service Account permissions
* Enable repository branch protection

---

# ❗ Troubleshooting

## GitHub Authentication Failed

Cause:

```text
Invalid or expired GitHub token
```

Solution:

```text
Generate a new token with Contents Read & Write permission
```

---

## Google Sheets Access Denied

Cause:

```text
Service account not shared on sheet
```

Solution:

```text
Share sheet as Editor with service account email
```

---

## Internal Server Error (500)

Cause:

```text
Missing environment variable
Invalid credentials
Deployment configuration issue
```

Solution:

```text
Check application logs
Verify environment variables
Validate GitHub and Google credentials
```

---

# 🛣 Roadmap

### Current

* Blog Generation
* Image Upload
* PNG Compression
* GitHub Publishing
* Google Sheets Logging
* Vercel Deployment

### Planned

* Multi-language Content
* Scheduled Publishing
* AI Category Detection
* Analytics Dashboard
* Multiple Repository Support
* Docker Compose
* GitHub Actions CI/CD
* Admin Dashboard

---

# 🤝 Contributing

Contributions are welcome.

```bash
Fork Repository
Create Feature Branch
Commit Changes
Open Pull Request
```

---

## 👨‍💻 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Utsav699">
        <img src="https://github.com/Utsav699.png" width="120px;" alt="Utsav699"/>
        <br />
        <sub><b>Utsav699</b></sub>
      </a>
    </td>
    <td align="center" margin-left="20px">
      <a href="https://github.com/UtsavBhanderi24">
        <img src="https://github.com/UtsavBhanderi24.png" width="120px;" alt="UtsavBhanderi24"/>
        <br />
        <sub><b>UtsavBhanderi24</b></sub>
      </a>
    </td>
  </tr>
</table>

---

# ⭐ Support

If this project helps you, consider:

* Starring the repository
* Reporting issues
* Contributing improvements
* Sharing with the community

---