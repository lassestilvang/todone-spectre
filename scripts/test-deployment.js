#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🧪 Testing Todone deployment...");

try {
  // Check if build exists
  console.log("🔍 Checking build artifacts...");
  if (!fs.existsSync("dist")) {
    throw new Error("Build directory not found. Run build script first.");
  }

  // Check configuration
  console.log("📋 Checking configuration...");
  const configPath = path.join("dist", "config", "production.js");
  if (!fs.existsSync(configPath)) {
    throw new Error("Configuration file not found in build.");
  }

  // Check build info
  console.log("ℹ️ Checking build information...");
  const buildInfoPath = path.join("dist", "build-info.json");
  if (!fs.existsSync(buildInfoPath)) {
    throw new Error("Build info file not found.");
  }

  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, "utf8"));
  console.log(
    `📦 Build Info: Version ${buildInfo.version}, ${buildInfo.timestamp}`,
  );

  // Test Docker configuration
  console.log("🐳 Testing Docker configuration...");
  if (!fs.existsSync("Dockerfile")) {
    throw new Error("Dockerfile not found.");
  }

  if (!fs.existsSync("docker-compose.yml")) {
    throw new Error("docker-compose.yml not found.");
  }

  // Test environment variables
  console.log("🌍 Testing environment variables...");
  const requiredVars = ["VITE_API_URL", "VITE_AUTH_SECRET"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn("⚠️  Missing environment variables:", missingVars.join(", "));
  }

  // Run integration tests
  console.log("🔗 Running integration tests...");
  execSync("npm run test:integration", { stdio: "inherit" });

  // Run performance tests
  console.log("⚡ Running performance tests...");
  execSync("npm run test:performance", { stdio: "inherit" });

  console.log("✅ Deployment testing completed successfully!");
  console.log("🚀 Application is ready for deployment!");
} catch (error) {
  console.error("❌ Deployment testing failed:", error.message);
  process.exit(1);
}
