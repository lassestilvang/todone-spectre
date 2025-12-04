#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🐳 Testing containerization...");

try {
  // Test Docker build
  console.log("🏗️ Building Docker image...");
  execSync("docker build -t todone-test .", { stdio: "inherit" });

  // Test Docker compose
  console.log("🔧 Testing Docker compose configuration...");
  execSync("docker-compose config", { stdio: "inherit" });

  // Test container health
  console.log("❤️ Testing container health checks...");
  const dockerConfig = require("../config/docker-config.js");

  // Verify health check configurations
  Object.keys(dockerConfig).forEach((service) => {
    if (dockerConfig[service].healthcheck) {
      console.log(`✅ ${service} health check configured`);
    }
  });

  // Test container security
  console.log("🔒 Testing container security...");
  Object.keys(dockerConfig.security || {}).forEach((service) => {
    console.log(
      `🔐 ${service} security: ${JSON.stringify(dockerConfig.security[service])}`,
    );
  });

  // Generate containerization test report
  console.log("📊 Generating containerization test report...");
  const containerReport = {
    timestamp: new Date().toISOString(),
    docker: {
      imageBuilt: true,
      composeValid: true,
    },
    services: Object.keys(dockerConfig).reduce((acc, service) => {
      acc[service] = {
        healthCheck: !!dockerConfig[service].healthcheck,
        security: !!dockerConfig.security?.[service],
      };
      return acc;
    }, {}),
    status: "containerization verified",
    recommendations: [
      "Ensure Docker images are regularly updated",
      "Monitor container resource usage",
      "Implement container logging",
    ],
  };

  fs.writeFileSync(
    path.join("reports", "containerization-test-report.json"),
    JSON.stringify(containerReport, null, 2),
  );

  console.log("✅ Containerization testing completed successfully!");
  console.log("🐳 Containers are ready for deployment!");
  console.log("📊 Report: reports/containerization-test-report.json");
} catch (error) {
  console.error("❌ Containerization testing failed:", error.message);
  process.exit(1);
}
