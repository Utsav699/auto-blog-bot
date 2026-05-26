import multer from "multer";
import config from "../config.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
    files: 2
  },

  fileFilter(req, file, cb) {
    const allowedFields = ["image1", "image2"];

    if (!allowedFields.includes(file.fieldname)) {
      return cb(
        new Error(
          "Only image1 and image2 are allowed. Extra image fields are not allowed."
        )
      );
    }

    if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Unsupported file type. Allowed formats: JPG, JPEG, PNG, WEBP."
        )
      );
    }

    cb(null, true);
  }
});

export const uploadBlogImages = upload.fields([
  {
    name: "image1",
    maxCount: 1
  },
  {
    name: "image2",
    maxCount: 1
  }
]);