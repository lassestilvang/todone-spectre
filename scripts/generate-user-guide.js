#!/usr/bin/env node

const fs = require("fs");
// const path = require("path");

console.log("📖 Generating user guide...");

try {
  // Generate user guide content
  const userGuideContent = `# Todone User Guide - Generated

## 🚀 Getting Started

### Installation
1. Clone repository
2. Install dependencies: \`npm install\`
3. Start application: \`npm run dev\`

### Configuration
- Create \`.env\` file
- Set environment variables
- Configure database connection

## 📱 Features

### Task Management
- Create, edit, delete tasks
- Set priorities and due dates
- Organize with projects

### Collaboration
- Share projects with team
- Real-time updates
- Task comments

### Advanced
- Recurring tasks
- Offline support
- Performance monitoring

## ⚙️ Configuration

### Environment Variables
\`\`\`
VITE_API_URL=http://localhost:3000
VITE_AUTH_SECRET=your-secret
\`\`\`

### Settings
- Theme: Light/Dark mode
- Notifications: Email, Desktop
- Privacy: Data sharing options

## 🧪 Testing

### Running Tests
\`\`\`bash
npm test          # Run all tests
npm run test:unit # Unit tests
npm run test:e2e  # End-to-end tests
\`\`\`

### Test Coverage
\`\`\`bash
npm run test:coverage
\`\`\`

## 🚀 Deployment

### Production Build
\`\`\`bash
npm run build
npm run preview
\`\`\`

### Docker Deployment
\`\`\`bash
docker-compose up --build
\`\`\`

## 🤝 Support

### Resources
- Documentation: [docs/](docs/)
- API Reference: [docs/api/](docs/api/)
- Component Guide: [docs/components/](docs/components/)

### Contact
- Email: support@todone.com
- GitHub: https://github.com/your-repo/todone
`;

  // Write to file
  fs.writeFileSync("docs/user-guide-generated.md", userGuideContent);

  console.log("✅ User guide generated successfully!");
  console.log("📄 File: docs/user-guide-generated.md");
} catch (error) {
  console.error("❌ User guide generation failed:", error.message);
  process.exit(1);
}
