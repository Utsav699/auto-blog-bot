import app from "./app.js";
import config from "./config.js";
import logger from "./logger.js";

const PORT = config.app.port || 3000;

app.listen(PORT, () => {
  logger.info(`Blog automation form running at http://localhost:${PORT}`);
});
