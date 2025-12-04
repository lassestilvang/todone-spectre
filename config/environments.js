const { merge } = require('lodash');

const baseConfig = {
  app: {
    name: 'Todone',
    version: require('../package.json').version,
    environment: process.env.NODE_ENV || 'development',
  },
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  },
  logging: {
    level: 'info',
    file: './logs/app.log',
    maxSize: '10m',
    maxFiles: '7d',
  },
};

const environmentConfigs = {
  development: {
    debug: true,
    database: {
      url: 'mongodb://localhost:27017/todone-dev',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    cache: {
      enabled: false,
    },
  },

  staging: {
    debug: false,
    database: {
      url:
        process.env.DATABASE_URL || 'mongodb://localhost:27017/todone-staging',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
      },
    },
    cache: {
      enabled: true,
      ttl: 300, // 5 minutes
    },
  },

  production: {
    debug: false,
    database: {
      url: process.env.DATABASE_URL || 'mongodb://localhost:27017/todone',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        retryReads: true,
      },
    },
    cache: {
      enabled: true,
      ttl: 3600, // 1 hour
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  test: {
    debug: false,
    database: {
      url: 'mongodb://localhost:27017/todone-test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    cache: {
      enabled: false,
    },
  },
};

function getConfig(env = 'development') {
  const envConfig = environmentConfigs[env] || environmentConfigs.development;
  return merge({}, baseConfig, envConfig);
}

module.exports = {
  getConfig,
  environmentConfigs,
};
