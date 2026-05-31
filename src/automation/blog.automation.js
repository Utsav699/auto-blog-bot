import config, { getMissingGenerationEnv } from "../config.js";
import logger from "../logger.js";
import { createBlogPost } from "../services/blog.service.js";
import { processUploadedImages } from "../services/upload.service.js";
import { pushFileToGitHub } from "../services/github.service.js";
import { logToSheet } from "../services/sheet.service.js";

let isRunning = false;

export async function generateBlogFromForm({
  title,
  category,
  customCategory = "",
  files = {}
}) {
  if (isRunning) {
    throw new Error("Automation is already running. Please wait.");
  }

  isRunning = true;
  let blog = {};

  try {
    const missingEnv = getMissingGenerationEnv();
    if (missingEnv.length) {
      const error = new Error(`Missing required Vercel environment variables: ${missingEnv.join(", ")}`);
      error.status = 500;
      throw error;
    }

    logger.info("======================================");
    logger.info("Manual blog generation started");
    logger.info(`Input title: ${title}`);
    logger.info(`Input category: ${category}`);
    logger.info(`Input custom category: ${customCategory || "N/A"}`);

    const hasImage1 = Boolean(files?.image1?.[0]);
    const hasImage2 = Boolean(files?.image2?.[0]);

    logger.info(`Image 1 provided: ${hasImage1}`);
    logger.info(`Image 2 provided: ${hasImage2}`);

    blog = await createBlogPost({
      title,
      category,
      customCategory,
      hasImage1,
      hasImage2,
      author: config.blog.author
    });

    logger.info(`Generated title: ${blog.title}`);
    logger.info(`Generated category: ${blog.category}`);
    logger.info(`Generated slug: ${blog.slug}`);
    logger.info(`Markdown path: ${blog.mdPath}`);
    logger.info(`Image 1 path: ${blog.imagePath || "N/A"}`);
    logger.info(`Image 2 path: ${blog.image2Path || "N/A"}`);

    const uploadedImages = await processUploadedImages(files, blog);

    await pushFileToGitHub(
      blog.mdPath,
      blog.markdown,
      `Add blog post: ${blog.title}`
    );

    if (uploadedImages.image1Buffer && blog.imagePath) {
      await pushFileToGitHub(
        blog.imagePath,
        uploadedImages.image1Buffer,
        `Add blog image 1: ${blog.slug}`
      );
    } else {
      logger.info("Image 1 not uploaded. Skipping GitHub image 1 push.");
    }

    if (uploadedImages.image2Buffer && blog.image2Path) {
      await pushFileToGitHub(
        blog.image2Path,
        uploadedImages.image2Buffer,
        `Add blog image 2: ${blog.slug}`
      );
    } else {
      logger.info("Image 2 not uploaded. Skipping GitHub image 2 push.");
    }

    let sheetErrorOccurred = false;
    try {
      await logToSheet(blog, "Published");
    } catch (sheetError) {
      logger.error(
        `Google Sheet logging failed but GitHub publish succeeded: ${sheetError.message}`,
        sheetError
      );
      sheetErrorOccurred = true;
    }

    logger.info(`Manual blog published successfully: ${blog.title}`);
    logger.info("Manual blog generation completed");
    logger.info("======================================");

    return {
      success: true,
      message: sheetErrorOccurred
        ? "Blog generated and published to GitHub successfully, but Google Sheet logging failed."
        : "Blog generated and published successfully.",
      warning: sheetErrorOccurred ? "Google Sheet logging failed." : null,
      blog
    };
  } catch (error) {
    logger.error(`Manual blog generation failed: ${error.message}`, error);

    if (blog?.title) {
      try {
        await logToSheet(blog, "Failed", error.message);
      } catch (sheetError) {
        logger.error(
          `Failed to log error in Google Sheet: ${sheetError.message}`,
          sheetError
        );
      }
    }

    throw error;
  } finally {
    isRunning = false;
  }
}
