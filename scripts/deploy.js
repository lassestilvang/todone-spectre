#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getConfig } = require("../config/environments");

console.log("🚀 Starting Todone deployment...");

try {
  const env = process.env.NODE_ENV || "production";
  const config = getConfig(env);

  console.log(`📋 Environment: ${config.app.environment}`);
  console.log(`🌐 Server: ${config.server.host}:${config.server.port}`);

  // Build the application
  console.log("🏗️ Building application...");
  execSync("node scripts/build.js", { stdio: "inherit" });

  // Run tests
  console.log("🧪 Running tests...");
  execSync("npm test", { stdio: "inherit" });

  // Deployment based on environment
  if (env === "production") {
    console.log("🚀 Deploying to production...");

    // Docker deployment
    console.log("🐳 Building Docker image...");
    execSync("docker build -t todone-app .", { stdio: "inherit" });

    console.log("🐳 Starting containers...");
    execSync("docker-compose up -d", { stdio: "inherit" });

    console.log("🔧 Running database migrations...");
    // Add migration commands here
  } else if (env === "staging") {
    console.log("🎯 Deploying to staging...");
    // Add staging deployment commands
  } else {
    console.log("🧪 Development deployment - starting local server...");
    execSync("npm run preview", { stdio: "inherit" });
  }

  console.log("✅ Deployment completed successfully!");
  console.log(
    `🌐 Application available at: http://${config.server.host}:${config.server.port}`,
  );
} catch (error) {
  console.error("❌ Deployment failed:", error.message);
  process.exit(1);
}
