import test from "node:test";
import assert from "node:assert";
import { slugify } from "../src/utils/slug.js";

test("slugify utility tests", async (t) => {
  await t.test("should convert characters to lowercase", () => {
    assert.strictEqual(slugify("Hello WORLD"), "hello-world");
  });

  await t.test("should remove single and double quotes without adding dashes", () => {
    assert.strictEqual(slugify("DG's Blog \"Post\""), "dgs-blog-post");
  });

  await t.test("should replace spaces and special characters with single dashes", () => {
    assert.strictEqual(slugify("Finance & Health: Best 2026 Tips!"), "finance-health-best-2026-tips");
  });

  await t.test("should strip leading and trailing dashes", () => {
    assert.strictEqual(slugify("---Tech News---"), "tech-news");
  });

  await t.test("should truncate slugs to maximum 90 characters", () => {
    const longTitle = "a".repeat(120);
    const result = slugify(longTitle);
    assert.strictEqual(result.length, 90);
    assert.strictEqual(result, "a".repeat(90));
  });
});
