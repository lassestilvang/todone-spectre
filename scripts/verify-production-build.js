#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Verifying production build...");

try {
  // Check build directory
  console.log("📁 Checking build directory...");
  if (!fs.existsSync("dist")) {
    throw new Error("Production build directory not found");
  }

  // Check build artifacts
  console.log("📦 Checking build artifacts...");
  const requiredFiles = [
    "dist/index.html",
    "dist/assets/index.css",
    "dist/assets/index.js",
    "dist/config/production.js",
    "dist/build-info.json",
  ];

  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file));
  if (missingFiles.length > 0) {
    throw new Error(`Missing build files: ${missingFiles.join(", ")}`);
  }

  // Check build info
  console.log("ℹ️ Checking build information...");
  const buildInfo = JSON.parse(fs.readFileSync("dist/build-info.json", "utf8"));
  console.log(
    `📋 Build Info: Version ${buildInfo.version}, ${buildInfo.environment}`,
  );

  // Check configuration
  console.log("⚙️ Checking production configuration...");
  const config = require("../dist/config/production.js");
  if (config.debug) {
    console.warn("⚠️  Debug mode is enabled in production configuration");
  }

  // Run build verification tests
  console.log("🧪 Running build verification tests...");
  execSync("npm run test:build", { stdio: "inherit" });

  // Generate verification report
  console.log("📊 Generating verification report...");
  const verificationReport = {
    timestamp: new Date().toISOString(),
    build: {
      version: buildInfo.version,
      environment: buildInfo.environment,
      timestamp: buildInfo.timestamp,
    },
    artifacts: {
      indexHtml: fs.existsSync("dist/index.html"),
      mainJs: fs.existsSync("dist/assets/index.js"),
      mainCss: fs.existsSync("dist/assets/index.css"),
      config: fs.existsSync("dist/config/production.js"),
      buildInfo: fs.existsSync("dist/build-info.json"),
    },
    configuration: {
      debugMode: config.debug,
      apiUrl: config.apiUrl,
      environment: config.app.environment,
    },
    status: "verified",
  };

  fs.writeFileSync(
    path.join("reports", "build-verification-report.json"),
    JSON.stringify(verificationReport, null, 2),
  );

  console.log("✅ Production build verification completed successfully!");
  console.log("🚀 Build is ready for deployment!");
  console.log("📊 Report: reports/build-verification-report.json");
} catch (error) {
  console.error("❌ Production build verification failed:", error.message);
  process.exit(1);
}
