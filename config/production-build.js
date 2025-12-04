module.exports = {
  // Production build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['lodash', 'date-fns'],
        },
      },
    },
  },

  // Server configuration
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },

  // Optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },

  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://api.todone.com',
    ),
    'process.env.VITE_AUTH_SECRET': JSON.stringify(
      process.env.VITE_AUTH_SECRET || 'default-secret',
    ),
  },

  // Performance budget
  performance: {
    chunks: 'warn',
    assetFilter: function (assetFilename) {
      return assetFilename.endsWith('.js');
    },
  },
};
