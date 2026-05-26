const form = document.getElementById("blogForm");
const statusBox = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
const categorySelect = document.getElementById("category");
const customCategoryBox = document.getElementById("customCategoryBox");
const customCategoryInput = document.getElementById("customCategory");

const image1Input = document.getElementById("image1");
const image2Input = document.getElementById("image2");

const image1PreviewBox = document.getElementById("image1PreviewBox");
const image2PreviewBox = document.getElementById("image2PreviewBox");
const image1Preview = document.getElementById("image1Preview");
const image2Preview = document.getElementById("image2Preview");
const removeImage1 = document.getElementById("removeImage1");
const removeImage2 = document.getElementById("removeImage2");

const image1Error = document.getElementById("image1Error");
const image2Error = document.getElementById("image2Error");

const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressMessage = document.getElementById("progressMessage");

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

let progress = 0;
let progressInterval = null;

function setStatus(type, message) {
  const baseClass =
    "mt-6 rounded-xl px-4 py-4 text-sm leading-relaxed break-words";

  const classes = {
    success: `${baseClass} bg-green-100 text-green-800 border border-green-200`,
    error: `${baseClass} bg-red-100 text-red-800 border border-red-200`,
    loading: `${baseClass} bg-blue-100 text-blue-800 border border-blue-200`
  };

  statusBox.className = classes[type] || baseClass;
  statusBox.innerHTML = message;
}

function showImageError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

function clearImageError(errorElement) {
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
}

function clearImage(input, previewBox, previewImage, errorElement) {
  input.value = "";
  previewImage.src = "";
  previewBox.classList.add("hidden");
  clearImageError(errorElement);
}

function validateImageFile(input, label, errorElement) {
  const file = input.files[0];

  clearImageError(errorElement);

  if (!file) return true;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    clearImage(
      input,
      label === "Image 1" ? image1PreviewBox : image2PreviewBox,
      label === "Image 1" ? image1Preview : image2Preview,
      errorElement
    );

    showImageError(
      errorElement,
      `${label} format is not supported. Allowed formats: JPG, JPEG, PNG, WEBP.`
    );

    return false;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const selectedSize = (file.size / 1024 / 1024).toFixed(2);

    clearImage(
      input,
      label === "Image 1" ? image1PreviewBox : image2PreviewBox,
      label === "Image 1" ? image1Preview : image2Preview,
      errorElement
    );

    showImageError(
      errorElement,
      `${label} is too large. Maximum allowed size is ${MAX_IMAGE_SIZE_MB}MB. Selected file size: ${selectedSize}MB.`
    );

    return false;
  }

  return true;
}

function previewImage(input, previewBox, previewImage, errorElement, label) {
  const isValid = validateImageFile(input, label, errorElement);

  if (!isValid) return;

  const file = input.files[0];

  if (!file) {
    previewBox.classList.add("hidden");
    previewImage.src = "";
    return;
  }

  const imageUrl = URL.createObjectURL(file);
  previewImage.src = imageUrl;
  previewBox.classList.remove("hidden");
}

image1Input.addEventListener("change", () => {
  previewImage(image1Input, image1PreviewBox, image1Preview, image1Error, "Image 1");
});

image2Input.addEventListener("change", () => {
  previewImage(image2Input, image2PreviewBox, image2Preview, image2Error, "Image 2");
});

removeImage1.addEventListener("click", () => {
  clearImage(image1Input, image1PreviewBox, image1Preview, image1Error);
});

removeImage2.addEventListener("click", () => {
  clearImage(image2Input, image2PreviewBox, image2Preview, image2Error);
});

function updateProgress(value, message = "") {
  progress = Math.max(0, Math.min(value, 100));

  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${progress}%`;

  if (message) {
    progressMessage.textContent = message;
  }
}

function getProgressMessage(currentProgress) {
  if (currentProgress < 15) return "Validating form data...";
  if (currentProgress < 35) return "Generating blog content...";
  if (currentProgress < 50) return "Preparing markdown file...";
  if (currentProgress < 65) return "Processing uploaded images...";
  if (currentProgress < 82) return "Publishing files to GitHub...";
  if (currentProgress < 95) return "Saving log to Google Sheet...";
  return "Finalizing...";
}

function startProgress() {
  clearInterval(progressInterval);

  progressBox.classList.remove("hidden");

  progressBar.classList.remove("bg-red-600", "bg-green-600");
  progressBar.classList.add("bg-blue-600");

  updateProgress(1, "Starting blog generation...");

  progressInterval = setInterval(() => {
    if (progress < 95) {
      updateProgress(progress + 1, getProgressMessage(progress + 1));
    }
  }, 500);
}

function finishProgressSuccess() {
  clearInterval(progressInterval);

  progressBar.classList.remove("bg-blue-600", "bg-red-600");
  progressBar.classList.add("bg-green-600");

  updateProgress(100, "Blog published successfully.");
}

function finishProgressError() {
  clearInterval(progressInterval);

  progressBar.classList.remove("bg-blue-600", "bg-green-600");
  progressBar.classList.add("bg-red-600");

  updateProgress(100, "Process stopped due to error.");
}

function resetProgress() {
  clearInterval(progressInterval);

  progress = 0;
  progressBox.classList.add("hidden");

  progressBar.style.width = "0%";
  progressText.textContent = "0%";
  progressMessage.textContent = "Waiting to start...";

  progressBar.classList.remove("bg-red-600", "bg-green-600");
  progressBar.classList.add("bg-blue-600");
}

function validateImageCountAndSize() {
  const totalImages = image1Input.files.length + image2Input.files.length;

  if (totalImages > 2) {
    throw new Error("Maximum 2 images are allowed.");
  }

  if (!validateImageFile(image1Input, "Image 1", image1Error)) {
    throw new Error(`Image 1 must be valid and under ${MAX_IMAGE_SIZE_MB}MB.`);
  }

  if (!validateImageFile(image2Input, "Image 2", image2Error)) {
    throw new Error(`Image 2 must be valid and under ${MAX_IMAGE_SIZE_MB}MB.`);
  }
}

categorySelect.addEventListener("change", () => {
  if (categorySelect.value === "Other") {
    customCategoryBox.classList.remove("hidden");
    customCategoryInput.required = true;
  } else {
    customCategoryBox.classList.add("hidden");
    customCategoryInput.required = false;
    customCategoryInput.value = "";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = categorySelect.value;
  const customCategory = customCategoryInput.value.trim();

  if (!title || !category) {
    setStatus("error", "Please enter title and select category.");
    return;
  }

  if (category === "Other" && !customCategory) {
    setStatus("error", "Please enter custom category.");
    return;
  }

  try {
    validateImageCountAndSize();
  } catch (error) {
    setStatus("error", error.message);
    return;
  }

  const formData = new FormData(form);

  submitBtn.disabled = true;
  submitBtn.textContent = "Generating...";

  resetProgress();
  startProgress();

  setStatus(
    "loading",
    "Blog generation started. Please wait. This may take 1-3 minutes."
  );

  try {
    const response = await fetch("/api/generate-blog", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Blog generation failed.");
    }

    finishProgressSuccess();

    setStatus(
      "success",
      `
      <strong>Blog published successfully.</strong><br/>
      Title: ${data.blog.title}<br/>
      Category: ${data.blog.category}<br/>
      Slug: ${data.blog.slug}<br/>
      Markdown: ${data.blog.mdPath}<br/>
      Image 1: ${data.blog.imagePath || "Not provided"}<br/>
      Image 2: ${data.blog.image2Path || "Not provided"}
      `
    );

    form.reset();

    image1Preview.src = "";
    image2Preview.src = "";
    image1PreviewBox.classList.add("hidden");
    image2PreviewBox.classList.add("hidden");

    clearImageError(image1Error);
    clearImageError(image2Error);

    customCategoryBox.classList.add("hidden");
    customCategoryInput.required = false;
  } catch (error) {
    finishProgressError();
    setStatus("error", error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Generate Blog";
  }
});