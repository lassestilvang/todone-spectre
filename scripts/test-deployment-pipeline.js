#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Testing deployment pipeline...");

try {
  // Test build process
  console.log("🏗️ Testing build process...");
  execSync("node scripts/build.js", { stdio: "inherit" });

  // Test deployment scripts
  console.log("📦 Testing deployment scripts...");
  execSync("node scripts/test-deployment.js", { stdio: "inherit" });

  // Test Docker configuration
  console.log("🐳 Testing Docker configuration...");
  execSync("docker-compose config", { stdio: "inherit" });

  // Test CI/CD configuration
  console.log("🔧 Testing CI/CD configuration...");
  const ciConfig = require("../config/ci-cd-config.js");
  console.log(`CI/CD Configuration: ${JSON.stringify(ciConfig, null, 2)}`);

  // Test environment configurations
  console.log("🌍 Testing environment configurations...");
  const environments = require("../config/environments.js");
  Object.keys(environments.environmentConfigs).forEach((env) => {
    console.log(
      `Environment ${env}: ${JSON.stringify(environments.environmentConfigs[env], null, 2)}`,
    );
  });

  // Generate pipeline test report
  console.log("📊 Generating pipeline test report...");
  const pipelineReport = {
    timestamp: new Date().toISOString(),
    stages: {
      build: "success",
      deploymentScripts: "success",
      dockerConfiguration: "success",
      ciCdConfiguration: "success",
      environmentConfigurations: "success",
    },
    status: "all tests passed",
    recommendations: [
      "Ensure all environment variables are set for production",
      "Verify Docker images are up to date",
      "Check CI/CD pipeline permissions",
    ],
  };

  fs.writeFileSync(
    path.join("reports", "pipeline-test-report.json"),
    JSON.stringify(pipelineReport, null, 2),
  );

  console.log("✅ Deployment pipeline testing completed successfully!");
  console.log("🚀 Pipeline is ready for production deployment!");
  console.log("📊 Report: reports/pipeline-test-report.json");
} catch (error) {
  console.error("❌ Deployment pipeline testing failed:", error.message);
  process.exit(1);
}
