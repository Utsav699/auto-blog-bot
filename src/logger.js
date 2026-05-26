import log4js from "log4js";
import fs from "fs";
import config from "./config.js";
import { getRequestId } from "./utils/request-id.js";

const LOG_DIR = "logs";

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const applicationLogPath = config.logs?.applicationLog || "logs/application.log";
const errorLogPath = config.logs?.errorLog || "logs/error.log";
const maxLogSize = config.logs?.maxLogSize || 5 * 1024 * 1024;
const backups = config.logs?.backups || 5;
const compress = config.logs?.compress ?? true;

log4js.configure({
  appenders: {
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
  },

  categories: {
    default: {
      appenders: ["applicationFile", "console"],
      level: "debug"
    },

    application: {
      appenders: ["applicationFile", "console"],
      level: "debug"
    },

    error: {
      appenders: ["errorFile", "console"],
      level: "error"
    }
  }
});

const appLogger = log4js.getLogger("application");
const errorLogger = log4js.getLogger("error");

function formatError(message, error = null) {
  if (!error) {
    return message;
  }

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

    // application.log stores all logs, including errors
    appLogger.error(finalMessage);

    // error.log stores only errors
    errorLogger.error(finalMessage);
  }
};

process.on("uncaughtException", (error) => {
  // Pass to logger for logging in both logs with full stack trace
  logger.error("Uncaught exception caught", error);
  // Give time for logs to flush before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on("unhandledRejection", (reason) => {
  if (reason instanceof Error) {
    logger.error("Unhandled promise rejection caught", reason);
  } else {
    logger.error(`Unhandled promise rejection caught: ${reason}`);
  }
});

export default logger;