# Todone - Comprehensive Productivity Application

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation
```bash
git clone https://github.com/your-repo/todone.git
cd todone
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 📖 Documentation

### API Documentation
Comprehensive API documentation is available in [`docs/api`](docs/api) with detailed service descriptions and usage examples.

### Component Documentation
All UI components are documented in [`docs/components`](docs/components) with props, usage examples, and implementation details.

### Architecture Documentation
System architecture and design patterns are documented in [`docs/architecture`](docs/architecture) with component hierarchy and data flow diagrams.

### User Guide
Complete setup instructions and feature documentation in [`docs/user-guide`](docs/user-guide).

## 🧪 Testing

### Test Structure
- **Unit Tests**: [`src/__tests__/unit`](src/__tests__/unit) - Component-level tests
- **Integration Tests**: [`src/__tests__/integration`](src/__tests__/integration) - Feature-level tests
- **E2E Tests**: [`src/__tests__/e2e`](src/__tests__/e2e) - User flow tests
- **Performance Tests**: [`src/__tests__/performance`](src/__tests__/performance) - Critical path performance

### Running Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 🛠 Configuration

### Environment Variables
Create `.env` file in root directory:
```
VITE_API_URL=http://localhost:3000
VITE_AUTH_SECRET=your-secret-key
```

### Configuration Files
- **Development**: [`config/development.js`](config/development.js)
- **Production**: [`config/production.js`](config/production.js)
- **Test**: [`config/test.config.js`](config/test.config.js)

## 🚀 Deployment

### CI/CD Pipeline
Automated pipeline configuration in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

### Docker Configuration
- **Dockerfile**: Production container configuration
- **docker-compose.yml**: Full stack with database and services

### Deployment Commands
```bash
# Build and run with Docker
docker-compose up --build

# Production deployment
npm run build
npm run preview
```

## 🗂 Project Structure

The Todone application has been consolidated into a single, unified source directory structure:

```
src/
├── App.tsx                  # Main application component
├── main.tsx                 # Application entry point
├── router.tsx               # Application routing configuration
├── index.css                # Global CSS styles
├── config/                  # Application configuration
├── constants/               # Application constants
├── database/                # Database and sync functionality
├── features/                # Feature modules
├── hooks/                   # React hooks
├── pages/                   # Page components
├── services/                # Business logic services
├── store/                   # State management
├── styles/                  # CSS and styling
├── types/                   # TypeScript types
├── utils/                   # Utility functions
├── __tests__/               # Test suites
```

## 📦 Features
## 📦 Features

### Task Management
- Create, edit, and organize tasks
- Priority and status tracking
- Due dates and reminders

### Project Collaboration
- Team project sharing
- Real-time updates
- Task comments and discussions

### Offline Support
- Work offline with automatic sync
- Queue management
- Conflict resolution

### Performance Monitoring
- Real-time metrics
- Performance alerts
- Optimization tools

## 🔧 Development Tools

### Testing Utilities
- Test data generators: [`src/utils/test-data-generators.ts`](src/utils/test-data-generators.ts)
- Mock services: [`src/services/__mocks__/`](src/services/__mocks__)
- Test helpers: [`src/utils/test-helpers.ts`](src/utils/test-helpers.ts)

### Documentation Generation
- API docs generation scripts
- Component docs generation
- Architecture diagrams

## 🤝 Contributing

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript type checking

### Pull Requests
- Follow existing code patterns
- Include tests for new features
- Update documentation

## 📝 License

MIT License - See LICENSE file for details.

## 📬 Contact

For support or questions, please open an issue on GitHub.