module.exports = {
  // Production build configuration
  apiUrl: process.env.VITE_API_URL || "https://api.todone.com",
  authSecret: process.env.VITE_AUTH_SECRET || "default-secret-key",
  debug: false,
  logging: {
    level: "error",
    file: "/var/log/todone/production.log",
  },
  database: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/todone",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
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
};
