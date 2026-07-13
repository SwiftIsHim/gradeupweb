const config = require("../config/env");

function shouldLog() {
  return config.env === "development" && config.enableConsoleLogs;
}

function createLoggerMethod(method) {
  return (...args) => {
    if (!shouldLog()) {
      return;
    }

    console[method](...args);
  };
}

const logger = {
  log: createLoggerMethod("log"),
  info: createLoggerMethod("info"),
  warn: createLoggerMethod("warn"),
  error: createLoggerMethod("error"),
  debug: createLoggerMethod("debug"),
};

module.exports = logger;
