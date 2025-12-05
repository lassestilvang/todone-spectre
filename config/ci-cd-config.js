module.exports = {
  // CI/CD Pipeline Configuration
  ci: {
    test: {
      command: "npm test",
      timeout: 10 * 60 * 1000, // 10 minutes
      retries: 2,
    },
    lint: {
      command: "npm run lint",
      timeout: 5 * 60 * 1000, // 5 minutes
    },
    build: {
      command: "npm run build",
      timeout: 15 * 60 * 1000, // 15 minutes
      artifacts: ["dist/**/*"],
    },
  },

  cd: {
    staging: {
      environment: "staging",
      branch: "main",
      deployment: {
        method: "docker",
        registry: "ghcr.io",
        image: "todone-app",
        tag: "staging",
      },
      approval: {
        required: true,
        reviewers: ["team-lead", "qa-lead"],
      },
    },
    production: {
      environment: "production",
      branch: "main",
      deployment: {
        method: "docker",
        registry: "ghcr.io",
        image: "todone-app",
        tag: "latest",
      },
      approval: {
        required: true,
        reviewers: ["team-lead", "qa-lead", "security-team"],
      },
      rollback: {
        enabled: true,
        strategy: "blue-green",
      },
    },
  },

  // Environment-specific configurations
  environments: {
    staging: {
      url: "https://staging.todone.com",
      database: "mongodb://staging-db:27017/todone",
      cache: {
        enabled: true,
        ttl: 300, // 5 minutes
      },
    },
    production: {
      url: "https://todone.com",
      database: "mongodb://prod-db:27017/todone",
      cache: {
        enabled: true,
        ttl: 3600, // 1 hour
      },
      monitoring: {
        enabled: true,
        services: ["prometheus", "grafana", "sentry"],
      },
    },
  },

  // Notification configuration
  notifications: {
    slack: {
      enabled: true,
      channel: "#deployments",
      events: ["deployment_started", "deployment_success", "deployment_failed"],
    },
    email: {
      enabled: true,
      recipients: ["team@todone.com", "devops@todone.com"],
      events: ["deployment_failed", "deployment_rollback"],
    },
  },

  // Security configuration
  security: {
    vulnerabilityScanning: {
      enabled: true,
      tools: ["snyk", "trivy"],
      schedule: "daily",
    },
    secretDetection: {
      enabled: true,
      tools: ["gitleaks", "trufflehog"],
    },
    containerScanning: {
      enabled: true,
      tools: ["anchore", "clair"],
    },
  },
};
