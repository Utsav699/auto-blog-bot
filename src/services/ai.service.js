import Groq from "groq-sdk";
import config from "../config.js";
import logger from "../logger.js";

function getGroqClient() {
  if (!config.ai?.groqApiKey) {
    throw new Error("GROQ_API_KEY is missing. Add it in .env file.");
  }

  return new Groq({
    apiKey: config.ai.groqApiKey
  });
}

function getCategoryStyle(category) {
  const styles = {
    Finance: `
Write like a practical Indian finance explainer.
Focus on fuel price impact, household budgets, inflation, transport costs, business impact, and public relevance.
Do not give guaranteed investment advice.
`,

    Health: `
Write like a responsible health educator.
Use safe educational language.
Do not diagnose.
Do not give dangerous medical advice.
Add a short health disclaimer near the end.
`,

    "Govt Jobs": `
Write like a government jobs information article.
Explain preparation, eligibility-style context, important checks, and candidate awareness.
Do not invent fake vacancies, dates, official links, or notifications.
`,

    Technology: `
Write like a professional technology journalist.
Explain industry impact, real-world use cases, opportunities, risks, and future direction.
`,

    Cricket: `
Write like a cricket analysis writer.
Use cricket context only when the topic is truly about cricket.
Avoid fake scores, fake statistics, and invented quotes.
`,

    India: `
Write like an India current affairs and public-interest writer.
Explain background, public relevance, practical impact, and what readers should watch next.
`
  };

  return styles[category] || `
Write like a professional blog writer.
Explain the topic clearly with useful context, impact, and practical reader value.
`;
}

function cleanOutput(content = "") {
  return String(content)
    .replace(/^---[\s\S]*?---/g, "")
    .replace(/\[cite:\s*\d+\]/gi, "")
    .replace(/\[source:\s*\d+\]/gi, "")
    .replace(/^image\s*:\s*.*$/gim, "")
    .replace(/^image2\s*:\s*.*$/gim, "")
    .replace(/^image3\s*:\s*.*$/gim, "")
    .replace(/^image4\s*:\s*.*$/gim, "")
    .replace(/^source\s*:\s*.*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function countWords(content = "") {
  return String(content)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function hasConclusion(content = "") {
  return /##\s*Conclusion/i.test(content);
}

function buildPrompt(title, category) {
  return `
Write a complete, unique, genuine, SEO-friendly blog post.

Title:
${title}

Category:
${category}

Writing Style:
${getCategoryStyle(category)}

Strict Requirements:
- Write the full blog completely.
- Target 900 to 1300 words.
- Use clean Markdown.
- Start with "# ${title}".
- Use topic-specific headings.
- Do not use the same heading format for every article.
- Do not include markdown frontmatter.
- Do not include image fields.
- Do not include image, image2, image3, image4.
- Do not include source.
- Do not include citation markers.
- Do not copy content from websites.
- Do not invent fake facts, fake numbers, fake dates, fake jobs, fake scores, or fake quotes.
- If exact facts are uncertain, use cautious wording.
- Must include "## Conclusion".
- Conclusion must be dynamic and directly related to the article topic.
`;
}

async function requestGroqContent(title, category, attempt = 1) {
  const client = getGroqClient();
  const prompt = buildPrompt(title, category);

  logger.info(`Groq blog content request started. Attempt: ${attempt}`);

  const completion = await client.chat.completions.create({
    model: config.ai.groqModel,
    temperature: 0.6,
    max_tokens: 2500,
    messages: [
      {
        role: "system",
        content:
          "You are a professional SEO blog writer. Always follow the requested markdown structure and finish with ## Conclusion."
      },
      {
        role: "user",
        content:
          attempt === 1
            ? prompt
            : `${prompt}\n\nThe previous response was incomplete. Now generate a complete article with a proper ## Conclusion.`
      }
    ]
  });

  const content = cleanOutput(completion.choices?.[0]?.message?.content || "");

  logger.info(
    `Groq response received. Attempt: ${attempt}, Words: ${countWords(content)}, Has conclusion: ${hasConclusion(content)}`
  );

  return content;
}

export async function generateBlogContent({ title, category }) {
  if (process.env.NODE_ENV === "test") {
    logger.info(`Running in test environment. Returning mock AI content for: ${title}`);
    return `# ${title}\n\nThis is a mock blog post content generated for the category ${category}. It contains multiple paragraphs discussing the details of ${title}.\n\n## Conclusion\n\nThis is a dynamic, mock conclusion about ${title} for the category ${category}. It wraps up the ideas successfully.`;
  }

  logger.info(`AI blog content generation started using Groq: ${title}`);

  try {
    let content = await requestGroqContent(title, category, 1);

    if (!content || countWords(content) < 500 || !hasConclusion(content)) {
      logger.warn("Groq returned weak/incomplete content. Retrying once.");
      const retryContent = await requestGroqContent(title, category, 2);

      if (retryContent && countWords(retryContent) > countWords(content)) {
        content = retryContent;
      }
    }

    if (!content) {
      logger.warn("Groq returned empty content. Blog service fallback will be used.");
      return "";
    }

    if (countWords(content) < 500) {
      logger.warn(
        `Groq returned short content with ${countWords(content)} words. Blog service fallback may be used.`
      );
    }

    if (!hasConclusion(content)) {
      logger.warn("Groq content missing conclusion. Blog service will add conclusion.");
    }

    logger.info(`AI blog content generated successfully using Groq: ${title}`);

    return content;
  } catch (error) {
    logger.error(`Groq blog content generation failed: ${error.message}`, error);

    // Do not break whole automation.
    // blog.service.js fallback will handle content.
    return "";
  }
}
