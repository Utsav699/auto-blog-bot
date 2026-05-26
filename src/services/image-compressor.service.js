import sharp from "sharp";
import config from "../config.js";
import logger from "../logger.js";

export async function compressImageToPng(file, imageLabel = "image") {
  try {
    if (!file?.buffer) {
      throw new Error(`${imageLabel} buffer is missing`);
    }

    logger.info(`${imageLabel} compression started`);

    const outputBuffer = await sharp(file.buffer)
      .rotate()
      .png({
        compressionLevel: config.imageCompression.pngCompressionLevel,
        adaptiveFiltering: config.imageCompression.adaptiveFiltering,
        force: true
      })
      .toBuffer();

    logger.info(
      `${imageLabel} compressed successfully. Original size: ${file.size} bytes, Output size: ${outputBuffer.length} bytes`
    );

    return outputBuffer;
  } catch (error) {
    logger.error(`${imageLabel} compression failed: ${error.message}`, error);
    throw new Error(`${imageLabel} compression failed: ${error.message}`);
  }
}