module.exports = {
  // Docker configuration
  app: {
    image: 'todone-app',
    build: {
      context: '.',
      dockerfile: 'Dockerfile',
      args: {
        NODE_ENV: 'production'
      }
    },
    ports: ['3000:3000'],
    environment: {
      NODE_ENV: 'production',
      VITE_API_URL: 'http://api:3001'
    },
    volumes: [
      './logs:/app/logs',
      './uploads:/app/uploads'
    ],
    restart: 'unless-stopped',
    healthcheck: {
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health'],
      interval: '30s',
      timeout: '10s',
      retries: 3
    }
  },

  api: {
    image: 'todone-api',
    build: {
      context: './api',
      dockerfile: 'Dockerfile.api',
      args: {
        NODE_ENV: 'production'
      }
    },
    ports: ['3001:3001'],
    environment: {
      NODE_ENV: 'production',
      DATABASE_URL: 'mongodb://mongo:27017/todone',
      JWT_SECRET: process.env.JWT_SECRET || 'default-secret'
    },
    depends_on: ['mongo'],
    restart: 'unless-stopped',
    healthcheck: {
      test: ['CMD', 'curl', '-f', 'http://localhost:3001/health'],
      interval: '30s',
      timeout: '10s',
      retries: 3
    }
  },

  mongo: {
    image: 'mongo:6',
    ports: ['27017:27017'],
    environment: {
      MONGO_INITDB_ROOT_USERNAME: 'root',
      MONGO_INITDB_ROOT_PASSWORD: process.env.MONGO_ROOT_PASSWORD || 'default-password',
      MONGO_INITDB_DATABASE: 'todone'
    },
    volumes: [
      'mongo-data:/data/db',
      './mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro'
    ],
    restart: 'unless-stopped',
    healthcheck: {
      test: ['CMD', 'mongo', '--eval', 'db.adminCommand(\\'ping\')'],
      interval: '30s',
      timeout: '10s',
      retries: 3
    }
  },

  // Network configuration
  network: {
    name: 'todone-network',
    driver: 'bridge'
  },

  // Volume configuration
  volumes: {
    'mongo-data': {
      driver: 'local'
    }
  },

  // Deployment configuration
  deploy: {
    replicas: 2,
    update_config: {
      parallelism: 1,
      delay: '10s'
    },
    restart_policy: {
      condition: 'on-failure',
      delay: '5s',
      max_attempts: 3,
      window: '120s'
    }
  },

  // Security configuration
  security: {
    app: {
      read_only: false,
      capabilities: ['CHOWN', 'SETGID', 'SETUID']
    },
    api: {
      read_only: false,
      capabilities: ['CHOWN', 'SETGID', 'SETUID']
    },
    mongo: {
      read_only: false,
      capabilities: ['CHOWN', 'SETGID', 'SETUID']
    }
  }
};