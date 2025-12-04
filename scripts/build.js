#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Todone production build...");

try {
  // Clean previous build
  console.log("🧹 Cleaning previous build...");
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
  }

  // Install dependencies
  console.log("📦 Installing dependencies...");
  execSync("npm install --production", { stdio: "inherit" });

  // TypeScript compilation
  console.log("🔧 Compiling TypeScript...");
  execSync("tsc -b", { stdio: "inherit" });

  // Vite build
  console.log("🏗️ Building with Vite...");
  execSync("vite build", { stdio: "inherit" });

  // Copy configuration files
  console.log("📄 Copying configuration files...");
  fs.mkdirSync(path.join("dist", "config"), { recursive: true });
  fs.copyFileSync(
    "config/production.js",
    path.join("dist", "config", "production.js"),
  );

  // Create build info
  console.log("ℹ️ Creating build information...");
  const buildInfo = {
    version: require("../package.json").version,
    timestamp: new Date().toISOString(),
    environment: "production",
    nodeVersion: process.version,
    os: process.platform,
  };

  fs.writeFileSync(
    path.join("dist", "build-info.json"),
    JSON.stringify(buildInfo, null, 2),
  );

  console.log("✅ Build completed successfully!");
  console.log(`📁 Output directory: ${path.resolve("dist")}`);
  console.log("🚀 Ready for deployment!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
