const isDevelopment = process.env.NODE_ENV === "development";
const enableConsoleLogs =
  process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS === "true";

function shouldLog() {
  return isDevelopment && enableConsoleLogs;
}

function createLoggerMethod(
  method: "log" | "info" | "warn" | "error" | "debug",
) {
  return (...args: unknown[]) => {
    if (!shouldLog()) {
      return;
    }

    console[method](...args);
  };
}

export const logger = {
  log: createLoggerMethod("log"),
  info: createLoggerMethod("info"),
  warn: createLoggerMethod("warn"),
  error: createLoggerMethod("error"),
  debug: createLoggerMethod("debug"),
};
