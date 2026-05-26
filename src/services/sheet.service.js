import { google } from "googleapis";
import config from "../config.js";
import logger from "../logger.js";
import { getRequestId } from "../utils/request-id.js";

const REQUIRED_HEADERS = [
  "DateTime",
  "RequestId",
  "Status",
  "Title",
  "Slug",
  "Category",
  "MarkdownPath",
  "ImagePath",
  "Image2Path",
  "PostDate",
  "ErrorMessage",
  "Author"
];

const DEFAULT_SHEET_NAME = "Sheet1";

function getPrivateKey() {
  if (!config.google.privateKey) {
    throw new Error("Google privateKey is missing");
  }

  return config.google.privateKey.includes("\\n")
    ? config.google.privateKey.replace(/\\n/g, "\n")
    : config.google.privateKey;
}

function validateGoogleConfig() {
  if (!config.google.sheetId) {
    throw new Error("Google sheetId is missing");
  }

  if (!config.google.serviceAccountEmail) {
    throw new Error("Google serviceAccountEmail is missing");
  }

  if (!config.google.privateKey) {
    throw new Error("Google privateKey is missing");
  }
}

function getSheetName() {
  return config.google.sheetName || DEFAULT_SHEET_NAME;
}

async function getSheetsClient() {
  validateGoogleConfig();

  const auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: getPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({
    version: "v4",
    auth
  });
}

async function getSpreadsheetInfo(sheets) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: config.google.sheetId
  });

  return response.data;
}

async function ensureSheetExists(sheets, sheetName) {
  const spreadsheet = await getSpreadsheetInfo(sheets);

  const existingSheet = spreadsheet.sheets?.find(
    (sheet) => sheet.properties?.title === sheetName
  );

  if (existingSheet) {
    logger.info(`Google Sheet tab found: ${sheetName}`);
    return;
  }

  logger.warn(`Google Sheet tab missing. Creating tab: ${sheetName}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: config.google.sheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName
            }
          }
        }
      ]
    }
  });

  logger.info(`Google Sheet tab created: ${sheetName}`);
}

async function getCurrentHeaders(sheets, sheetName) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.sheetId,
    range: `${sheetName}!1:1`
  });

  const rows = response.data.values || [];
  return rows[0] || [];
}

async function ensureHeaders(sheets, sheetName) {
  const currentHeaders = await getCurrentHeaders(sheets, sheetName);

  if (!currentHeaders.length) {
    logger.warn("Google Sheet headers missing. Creating all required headers.");

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.google.sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [REQUIRED_HEADERS]
      }
    });

    logger.info("Google Sheet headers created successfully");
    return REQUIRED_HEADERS;
  }

  const finalHeaders = [...currentHeaders];

  for (const header of REQUIRED_HEADERS) {
    if (!finalHeaders.includes(header)) {
      logger.warn(`Missing Google Sheet field detected. Adding: ${header}`);
      finalHeaders.push(header);
    }
  }

  if (finalHeaders.length !== currentHeaders.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.google.sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [finalHeaders]
      }
    });

    logger.info("Missing Google Sheet headers added successfully");
  } else {
    logger.info("Google Sheet headers already valid");
  }

  return finalHeaders;
}

function buildRowByHeaders(headers, blog = {}, status = "Published", errorMessage = "") {
  const rowData = {
    DateTime: new Date().toISOString(),
    RequestId: getRequestId(),
    Status: status,
    Title: blog.title || "",
    Slug: blog.slug || "",
    Category: blog.category || "",
    MarkdownPath: blog.mdPath || "",
    ImagePath: blog.imagePath || "",
    Image2Path: blog.image2Path || "",
    PostDate: blog.date || "",
    ErrorMessage: errorMessage || "",
    Author: blog.author || config.blog.author || ""
  };

  return headers.map((header) => rowData[header] ?? "");
}

export async function logToSheet(blog = {}, status = "Published", errorMessage = "") {
  try {
    logger.info("Google Sheet log started");

    const sheetName = getSheetName();
    const sheets = await getSheetsClient();

    await ensureSheetExists(sheets, sheetName);

    const headers = await ensureHeaders(sheets, sheetName);

    const row = buildRowByHeaders(headers, blog, status, errorMessage);

    await sheets.spreadsheets.values.append({
      spreadsheetId: config.google.sheetId,
      range: `${sheetName}!A:${String.fromCharCode(64 + headers.length)}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row]
      }
    });

    logger.info("Google Sheet log completed");
  } catch (error) {
    logger.error(`Google Sheet log failed: ${error.message}`, error);
    throw error;
  }
}
