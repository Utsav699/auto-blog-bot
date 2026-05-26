import axios from "axios";
import config from "../config.js";
import logger from "../logger.js";

function validateGithubConfig() {
  if (!config.github.owner) throw new Error("GitHub owner is missing");
  if (!config.github.repo) throw new Error("GitHub repo is missing");
  if (!config.github.branch) throw new Error("GitHub branch is missing");
  if (!config.github.token) throw new Error("GitHub token is missing");
}

async function getExistingFileSha(path) {
  try {
    const url = `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${path}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${config.github.token}`,
        Accept: "application/vnd.github+json"
      },
      params: {
        ref: config.github.branch
      }
    });

    return response.data.sha;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

function toBase64(content) {
  if (Buffer.isBuffer(content)) {
    return content.toString("base64");
  }

  return Buffer.from(String(content), "utf8").toString("base64");
}

export async function pushFileToGitHub(path, content, message) {
  try {
    validateGithubConfig();

    if (!path) {
      throw new Error("GitHub file path is missing");
    }

    logger.info(`GitHub push started: ${path}`);

    const sha = await getExistingFileSha(path);

    const url = `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${path}`;

    const body = {
      message,
      content: toBase64(content),
      branch: config.github.branch
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await axios.put(url, body, {
      headers: {
        Authorization: `Bearer ${config.github.token}`,
        Accept: "application/vnd.github+json"
      }
    });

    logger.info(`GitHub push completed: ${path}`);

    return response.data;
  } catch (error) {
    // Redact sensitive authorization headers from log details
    if (error.config?.headers?.Authorization) {
      error.config.headers.Authorization = "Bearer ***REDACTED***";
    }
    if (error.request?._headers?.authorization) {
      error.request._headers.authorization = "Bearer ***REDACTED***";
    }

    const status = error.response?.status;
    const apiMessage = error.response?.data?.message;

    let userFriendlyMessage = `GitHub push failed: ${apiMessage || error.message}`;
    if (status === 401) {
      userFriendlyMessage = "GitHub authentication failed. Please check if GITHUB_TOKEN is valid.";
    } else if (status === 403) {
      userFriendlyMessage = "GitHub permission denied or rate limit exceeded. Ensure token has proper access.";
    } else if (status === 404) {
      userFriendlyMessage = "GitHub repository, branch, or path not found. Please verify GITHUB_OWNER, GITHUB_REPO, and GITHUB_BRANCH.";
    }

    const wrappedError = new Error(userFriendlyMessage);
    wrappedError.status = status;
    wrappedError.originalMessage = error.message;
    wrappedError.stack = error.stack;

    logger.error(
      `GitHub push failed: ${path} | Status: ${status || "N/A"}`,
      wrappedError
    );

    throw wrappedError;
  }
}
