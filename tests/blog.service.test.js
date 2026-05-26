import test from "node:test";
import assert from "node:assert";

// Define mock env variables so configuration parsed successfully during test
process.env.NODE_ENV = "test";
process.env.GROQ_API_KEY = "mock_groq_key";
process.env.GITHUB_OWNER = "mock_github_owner";
process.env.GITHUB_REPO = "mock_github_repo";
process.env.GITHUB_TOKEN = "mock_github_token";
process.env.GOOGLE_SHEET_ID = "mock_sheet_id";
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "mock-sa@auto-blog-bot.iam.gserviceaccount.com";
process.env.GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nmock_key\\n-----END PRIVATE KEY-----";

import { cleanTitle, createBlogPost } from "../src/services/blog.service.js";

test("blog service tests", async (t) => {
  await t.test("cleanTitle should strip trailing dashes, suffixes, pipes, and excessive spaces", () => {
    assert.strictEqual(cleanTitle("My Amazing Title - Daily News"), "My Amazing Title");
    assert.strictEqual(cleanTitle("Tech Update | Gadgets"), "Tech Update");
    assert.strictEqual(cleanTitle("   Multiple    Spaces  "), "Multiple Spaces");
  });

  await t.test("createBlogPost should process category Other and fallback correctly", async () => {
    const blog = await createBlogPost({
      title: "Exploring New Horizons - Travel",
      category: "Other",
      customCategory: "Travel & Leisure",
      hasImage1: true,
      hasImage2: false,
      author: "DG"
    });

    assert.strictEqual(blog.title, "Exploring New Horizons");
    assert.strictEqual(blog.category, "Travel & Leisure");
    assert.strictEqual(blog.slug, "exploring-new-horizons");
    assert.strictEqual(blog.imagePath, "public/images/exploring-new-horizons.png");
    assert.strictEqual(blog.image2Path, ""); // None uploaded
  });

  await t.test("createBlogPost markdown frontmatter should contain only allowed keys", async () => {
    const blog = await createBlogPost({
      title: "Modern Financial Budgets",
      category: "Finance",
      hasImage1: true,
      hasImage2: true,
      author: "Finance Expert"
    });

    const markdown = blog.markdown;
    
    // Frontmatter block between ---
    const frontmatterMatch = markdown.match(/^---([\s\S]*?)---/);
    assert.ok(frontmatterMatch, "Markdown should contain frontmatter block");
    
    const frontmatterLines = frontmatterMatch[1]
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    const keys = frontmatterLines.map(line => line.split(":")[0].trim());
    
    // Check that exactly the 7 expected keys are in the frontmatter
    const expectedKeys = ["title", "date", "category", "excerpt", "image", "image2", "author"];
    assert.strictEqual(keys.length, expectedKeys.length);
    for (const key of expectedKeys) {
      assert.ok(keys.includes(key), `Frontmatter should include ${key}`);
    }

    // Verify absolutely no image3 or image4, or source fields are in markdown
    assert.ok(!markdown.includes("image3"), "Markdown must not contain image3");
    assert.ok(!markdown.includes("image4"), "Markdown must not contain image4");
    assert.ok(!markdown.includes("source:"), "Markdown must not contain source");
    assert.ok(!markdown.includes("[cite:"), "Markdown must not contain citations");
  });

  await t.test("createBlogPost should fail when other category is missing customCategory value", async () => {
    await assert.rejects(
      async () => {
        await createBlogPost({
          title: "My Title",
          category: "Other",
          customCategory: "",
          author: "Author"
        });
      },
      /Custom category is required when category is Other/
    );
  });
});
