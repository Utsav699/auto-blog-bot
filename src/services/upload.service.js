import { compressImageToPng } from "./image-compressor.service.js";
import logger from "../logger.js";

function validateOnlyTwoImages(files = {}) {
  const allowedFields = ["image1", "image2"];
  const receivedFields = Object.keys(files);

  const invalidFields = receivedFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new Error(
      `Only image1 and image2 are allowed. Invalid fields: ${invalidFields.join(", ")}`
    );
  }

  const image1Count = files?.image1?.length || 0;
  const image2Count = files?.image2?.length || 0;
  const totalImages = image1Count + image2Count;

  if (image1Count > 1) {
    throw new Error("Only one file is allowed for image1.");
  }

  if (image2Count > 1) {
    throw new Error("Only one file is allowed for image2.");
  }

  if (totalImages > 2) {
    throw new Error("Maximum 2 images are allowed.");
  }
}

export async function processUploadedImages(files = {}, blog = {}) {
  validateOnlyTwoImages(files);

  const result = {
    image1Buffer: null,
    image2Buffer: null
  };

  const image1 = files?.image1?.[0];
  const image2 = files?.image2?.[0];

  if (image1 && blog.imagePath) {
    logger.info("Image 1 upload detected");
    result.image1Buffer = await compressImageToPng(image1, "Image 1");
  } else {
    logger.info("Image 1 not provided");
  }

  if (image2 && blog.image2Path) {
    logger.info("Image 2 upload detected");
    result.image2Buffer = await compressImageToPng(image2, "Image 2");
  } else {
    logger.info("Image 2 not provided");
  }

  return result;
}