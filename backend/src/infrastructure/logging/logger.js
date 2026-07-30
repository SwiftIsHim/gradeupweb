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
  // Errors always print — they're the only signal we have that something
  // (e.g. a Resend send) failed in production, where console logs are
  // otherwise silenced by default.
  error: (...args) => console.error(...args),
  debug: createLoggerMethod("debug"),
};

module.exports = logger;
