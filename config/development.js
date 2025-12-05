module.exports = {
  // Development configuration
  apiUrl: process.env.VITE_API_URL || "http://localhost:3000",
  authSecret: "dev-secret-key",
  debug: true,
  logging: {
    level: "debug",
    file: "./logs/todone-development.log",
  },
  database: {
    url: "mongodb://localhost:27017/todone-dev",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  cache: {
    enabled: false,
  },
  hotReload: true,
  devServer: {
    port: 3000,
    host: "localhost",
  },
};
