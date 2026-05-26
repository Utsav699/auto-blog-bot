import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const srcDir = path.join(projectRoot, "src");

async function build() {
  console.log("Starting production build...");

  try {
    // 1. Clean dist/ directory
    console.log(`Cleaning target directory: ${distDir}`);
    await fs.rm(distDir, { recursive: true, force: true });

    // 2. Re-create dist/ directory
    await fs.mkdir(distDir, { recursive: true });

    // 3. Copy src/ to dist/
    console.log("Copying 'src' contents recursively to 'dist'...");
    await copyDir(srcDir, distDir);

    // 4. Copy package.json and package-lock.json
    console.log("Copying package files...");
    await copyFileIfExists(
      path.join(projectRoot, "package.json"),
      path.join(distDir, "package.json")
    );
    await copyFileIfExists(
      path.join(projectRoot, "package-lock.json"),
      path.join(distDir, "package-lock.json")
    );

    console.log("Build successfully completed!");
  } catch (error) {
    console.error("Build failed with error:", error);
    process.exit(1);
  }
}

async function copyFileIfExists(src, dest) {
  try {
    await fs.copyFile(src, dest);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

build();
