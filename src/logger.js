import log4js from "log4js";
import fs from "fs";
import path from "path";
import config from "./config.js";
import { getRequestId } from "./utils/request-id.js";

const isVercel = Boolean(process.env.VERCEL);
const LOG_DIR = isVercel ? "/tmp/logs" : "logs";

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const applicationLogPath = isVercel
  ? path.join(LOG_DIR, "application.log")
  : config.logs?.applicationLog || "logs/application.log";
const errorLogPath = isVercel
  ? path.join(LOG_DIR, "error.log")
  : config.logs?.errorLog || "logs/error.log";
const maxLogSize = config.logs?.maxLogSize || 5 * 1024 * 1024;
const backups = config.logs?.backups || 5;
const compress = config.logs?.compress ?? true;

const appenders = isVercel
  ? {
      console: {
        type: "console",
        layout: {
          type: "pattern",
          pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
        }
      }
    }
  : {
      applicationFile: {
        type: "file",
        filename: applicationLogPath,
        maxLogSize,
        backups,
        compress,
        layout: {
          type: "pattern",
          pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
        }
      },
      errorFile: {
        type: "file",
        filename: errorLogPath,
        maxLogSize,
        backups,
        compress,
        layout: {
          type: "pattern",
          pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
        }
      },
      console: {
        type: "console",
        layout: {
          type: "pattern",
          pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
        }
      }
    };

log4js.configure({
  appenders,
  categories: isVercel
    ? {
        default: { appenders: ["console"], level: "debug" },
        application: { appenders: ["console"], level: "debug" },
        error: { appenders: ["console"], level: "error" }
      }
    : {
        default: { appenders: ["applicationFile", "console"], level: "debug" },
        application: { appenders: ["applicationFile", "console"], level: "debug" },
        error: { appenders: ["errorFile", "console"], level: "error" }
      }
});

const appLogger = log4js.getLogger("application");
const errorLogger = log4js.getLogger("error");

function formatError(message, error = null) {
  if (!error) return message;
  const errorStack = error.stack || error.message || "";
  return `${message}\n${errorStack}`;
}

function prefixRequestId(message) {
  const rid = getRequestId();
  return rid ? `[ReqID: ${rid}] ${message}` : message;
}

const logger = {
  info(message) {
    appLogger.info(prefixRequestId(message));
  },
  warn(message) {
    appLogger.warn(prefixRequestId(message));
  },
  debug(message) {
    appLogger.debug(prefixRequestId(message));
  },
  error(message, error = null) {
    const finalMessage = prefixRequestId(formatError(message, error));
    appLogger.error(finalMessage);
    errorLogger.error(finalMessage);
  }
};

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception caught", error);
  if (!isVercel) {
    setTimeout(() => process.exit(1), 1000);
  }
});

process.on("unhandledRejection", (reason) => {
  if (reason instanceof Error) {
    logger.error("Unhandled promise rejection caught", reason);
  } else {
    logger.error(`Unhandled promise rejection caught: ${reason}`);
  }
});

export default logger;
