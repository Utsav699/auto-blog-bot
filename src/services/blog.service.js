import { slugify } from "../utils/slug.js";
import { generateBlogContent } from "./ai.service.js";

const BASE_CATEGORIES = [
  "Finance",
  "Health",
  "Govt Jobs",
  "Technology",
  "Cricket",
  "India"
];

const ALLOWED_CATEGORIES = [
  ...BASE_CATEGORIES,
  "Other"
];

export function cleanTitle(title = "") {
  return String(title)
    .replace(/ - .+$/, "")
    .replace(/\|.+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanCategory(category = "") {
  return String(category)
    .replace(/\s+/g, " ")
    .trim();
}

function escapeYaml(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ");
}

function cleanAiBody(content = "") {
  return String(content)
    .replace(/^---[\s\S]*?---/g, "")
    .replace(/^title\s*:\s*.*$/gim, "")
    .replace(/^date\s*:\s*.*$/gim, "")
    .replace(/^category\s*:\s*.*$/gim, "")
    .replace(/^excerpt\s*:\s*.*$/gim, "")
    .replace(/^author\s*:\s*.*$/gim, "")
    .replace(/^image\s*:\s*.*$/gim, "")
    .replace(/^image2\s*:\s*.*$/gim, "")
    .replace(/^image3\s*:\s*.*$/gim, "")
    .replace(/^image4\s*:\s*.*$/gim, "")
    .replace(/^source\s*:\s*.*$/gim, "")
    .replace(/\[cite:\s*\d+\]/gi, "")
    .replace(/\[source:\s*\d+\]/gi, "")
    .replace(/【.*?】/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function countWords(text = "") {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function buildExcerpt(title, category) {
  return `A clear and practical explanation of ${title}, covering key context, important details, reader impact, and what to watch next in ${category}.`;
}

function ensureConclusion(content = "", title = "", category = "") {
  if (/##\s*Conclusion/i.test(content)) {
    return content;
  }

  return `${content}

## Conclusion

${title} matters because it connects directly with current reader interest in ${category}. The most useful approach is to understand the context, avoid unsupported assumptions, and follow future updates carefully.`;
}

function buildFallbackBody(title, category, excerpt) {
  return `# ${title}

## Overview

${excerpt}

This article explains the topic in a simple, useful, and reader-focused way.

## Why This Matters

${title} is important because it is connected with current interest in ${category}. Readers need clear context, practical explanation, and reliable understanding instead of repeated or confusing information.

## Key Details

The topic needs proper attention because it may influence public discussion, professional decisions, business movement, awareness, or future planning depending on the category.

## What Readers Should Watch Next

Readers should watch for reliable updates, expert explanations, official information where applicable, and practical impact.

## Conclusion

${title} is worth understanding because it reflects a relevant development in ${category}. A clear view of the topic can help readers make better sense of what may happen next.`;
}

function resolveFinalCategory(category, customCategory = "") {
  const selectedCategory = cleanCategory(category);
  const custom = cleanCategory(customCategory);

  if (selectedCategory === "Other") {
    if (!custom) {
      throw new Error("Custom category is required when category is Other");
    }

    return custom;
  }

  if (!BASE_CATEGORIES.includes(selectedCategory)) {
    throw new Error("Invalid category selected");
  }

  return selectedCategory;
}

export async function createBlogPost({
  title,
  category,
  customCategory = "",
  hasImage1 = false,
  hasImage2 = false,
  author
}) {
  const finalTitle = cleanTitle(title);

  if (!finalTitle) {
    throw new Error("Blog title is required");
  }

  const finalCategory = resolveFinalCategory(category, customCategory);
  const slug = slugify(finalTitle);

  if (!slug) {
    throw new Error("Blog slug generation failed");
  }

  const date = new Date().toISOString().split("T")[0];
  const excerpt = buildExcerpt(finalTitle, finalCategory);

  const image = hasImage1 ? `/images/${slug}.png` : "";
  const image2 = hasImage2 ? `/images/${slug}-2.png` : "";

  const aiBody = await generateBlogContent({
    title: finalTitle,
    category: finalCategory
  });

  let cleanBody = cleanAiBody(aiBody);
  cleanBody = ensureConclusion(cleanBody, finalTitle, finalCategory);

  if (!cleanBody || countWords(cleanBody) < 500) {
    cleanBody = buildFallbackBody(finalTitle, finalCategory, excerpt);
  }

  const markdown = `---
title: "${escapeYaml(finalTitle)}"
date: "${date}"
category: "${escapeYaml(finalCategory)}"
excerpt: "${escapeYaml(excerpt)}"
image: "${image}"
image2: "${image2}"
author: "${escapeYaml(author)}"
---

${cleanBody}
`;

  return {
    title: finalTitle,
    slug,
    date,
    category: finalCategory,
    excerpt,
    image,
    image2,
    author,
    mdPath: `posts/${slug}.md`,
    imagePath: hasImage1 ? `public/images/${slug}.png` : "",
    image2Path: hasImage2 ? `public/images/${slug}-2.png` : "",
    markdown
  };
}

export { ALLOWED_CATEGORIES };