const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  enableConsoleLogs: process.env.ENABLE_CONSOLE_LOGS === "true",

  // MongoDB connection string (accounts are persisted here).
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gradeup",

  // Civilpromo GraphQL API — the real source of truth for accounts/auth.
  // Services should call this (Bearer <accessToken>) instead of the in-memory stub.
  graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || "",

  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 900,
};

module.exports = config;
